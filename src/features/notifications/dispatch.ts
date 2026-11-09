import { env } from "@/config/env";
import { flags } from "@/config/flags";
import { statusLabels } from "@/features/leads/status";
import { leadDetails, leadKind } from "@/features/leads/summary";
import type { Lead, LeadStatus } from "@/features/leads/types";
import { emailChannel } from "@/features/notifications/channels/email";
import { createInAppNotification } from "@/features/notifications/channels/inApp";
import { slackChannel } from "@/features/notifications/channels/slack";
import { whatsappChannel } from "@/features/notifications/channels/whatsapp";
import { recordDelivery } from "@/features/notifications/repository";
import type {
  Channel,
  DeliveryChannel,
  NewNotification,
  NotificationKind,
  NotificationPayload,
} from "@/features/notifications/types";
import { isAppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { ok, type Result } from "@/lib/result";

type DispatchOptions = { requestId?: string; channels?: Channel[] };

type DispatchResult = {
  notificationId: string;
  deliveries: { channel: DeliveryChannel; status: "sent" | "failed" }[];
};

/**
 * Channels turned on by configuration. Email and WhatsApp carry new verified
 * leads only (the WhatsApp template is written for new leads, and the team does
 * not need an email about its own status changes). Slack carries both kinds.
 */
function configuredChannels(kind: NotificationKind): Channel[] {
  const channels: Channel[] = [];
  if (kind === "lead_verified") channels.push(emailChannel(env.TEAM_NOTIFY_EMAILS));
  if (flags.slack && env.SLACK_WEBHOOK_URL) channels.push(slackChannel(env.SLACK_WEBHOOK_URL));
  if (
    kind === "lead_verified" &&
    flags.whatsapp &&
    env.WHATSAPP_PHONE_NUMBER_ID &&
    env.WHATSAPP_ACCESS_TOKEN &&
    env.WHATSAPP_NOTIFY_TO &&
    env.WHATSAPP_TEMPLATE_NAME
  ) {
    channels.push(
      whatsappChannel({
        phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
        accessToken: env.WHATSAPP_ACCESS_TOKEN,
        to: env.WHATSAPP_NOTIFY_TO,
        template: env.WHATSAPP_TEMPLATE_NAME,
      }),
    );
  }
  return channels;
}

function describeFailure(reason: unknown): string {
  const error = isAppError(reason) ? (reason.cause ?? reason) : reason;
  return (error instanceof Error ? error.message : String(error)).slice(0, 500);
}

/**
 * Creates the in-app notification, then fans out to every channel at once. Each
 * channel's outcome is recorded as a delivery and a lead event; one channel
 * failing never stops the others, and nothing here throws.
 */
async function dispatch(
  notification: NewNotification,
  payload: NotificationPayload,
  channels: Channel[],
  requestId?: string,
): Promise<Result<DispatchResult>> {
  const created = await createInAppNotification(notification);
  if (!created.ok) {
    logger.error("In-app notification failed", {
      requestId,
      leadId: notification.leadId,
      error: created.error,
    });
    return created;
  }

  const settled = await Promise.allSettled(channels.map((channel) => channel.send(payload)));
  const deliveries: DispatchResult["deliveries"] = [];
  for (const [index, outcome] of settled.entries()) {
    const channel = channels[index].name;
    const failure =
      outcome.status === "rejected"
        ? describeFailure(outcome.reason)
        : outcome.value.ok
          ? null
          : describeFailure(outcome.value.error);
    const status = failure === null ? "sent" : "failed";
    deliveries.push({ channel, status });
    if (failure) logger.warn("Notification channel failed", { requestId, channel, error: failure });
    const recorded = await recordDelivery({
      notificationId: created.data.id,
      leadId: notification.leadId,
      channel,
      status,
      error: failure ?? undefined,
    });
    if (!recorded.ok)
      logger.error("Delivery not recorded", { requestId, channel, error: recorded.error });
  }
  return ok({ notificationId: created.data.id, deliveries });
}

function adminPath(lead: Lead): string {
  return `/admin/leads/${lead.id}`;
}

/**
 * The admin page on the deployment that took the lead. A preview or local copy
 * has its own database, so its links must not point at the production admin.
 */
function deploymentUrl(path: string): string {
  return new URL(path, env.NEXT_PUBLIC_SITE_URL).href;
}

/** Tells the team about a newly verified lead: in-app, email, and Slack or WhatsApp when configured. */
export function notifyLeadVerified(
  lead: Lead,
  options: DispatchOptions = {},
): Promise<Result<DispatchResult>> {
  const title = `New ${leadKind(lead)} from ${lead.name}${lead.company ? ` (${lead.company})` : ""}`;
  const body = (lead.message ?? "").slice(0, 280);
  const href = adminPath(lead);
  return dispatch(
    { kind: "lead_verified", title, body, href, leadId: lead.id },
    {
      kind: "lead_verified",
      title,
      body,
      adminUrl: deploymentUrl(href),
      lead,
      details: leadDetails(lead, "team"),
    },
    options.channels ?? configuredChannels("lead_verified"),
    options.requestId,
  );
}

/** Records a status change for the team feed, and posts it to Slack when configured. */
export function notifyLeadStatusChanged(
  lead: Lead,
  from: LeadStatus,
  to: LeadStatus,
  actor: string,
  options: DispatchOptions = {},
): Promise<Result<DispatchResult>> {
  const title = `${lead.name}: ${statusLabels[from]} to ${statusLabels[to]}`;
  const body = `Changed by ${actor}.`;
  const href = adminPath(lead);
  return dispatch(
    { kind: "lead_status_changed", title, body, href, leadId: lead.id },
    {
      kind: "lead_status_changed",
      title,
      body,
      adminUrl: deploymentUrl(href),
      lead,
      details: leadDetails(lead, "team"),
    },
    options.channels ?? configuredChannels("lead_status_changed"),
    options.requestId,
  );
}
