import { createElement } from "react";
import { confirmedHeadline } from "@/content/forms";
import { verifiedLeadFacts } from "@/features/leads/analytics";
import { issueFormToken, verifyFormToken, verifyTurnstile } from "@/features/leads/bot-checks";
import {
  countLeadsByStatus,
  createLeadWithVerification,
  createVerifiedLead,
  findLeadById,
  listLeadEvents,
  listLeads,
  recordLeadEvent,
  updateLeadStatus,
} from "@/features/leads/repository";
import type { IntegrationLead, LeadSubmission } from "@/features/leads/schema";
import { leadDetails } from "@/features/leads/summary";
import type { Lead, LeadEvent, LeadSource, LeadStatus, NewLead } from "@/features/leads/types";
import { notifyLeadVerified } from "@/features/notifications/dispatch";
import { listDeliveriesForLead } from "@/features/notifications/repository";
import type { NotificationDelivery } from "@/features/notifications/types";
import { CODE_TTL_MS } from "@/features/verification/code";
import { newCode, resendAvailableAt, sendCodeEmail } from "@/features/verification/service";
import { logger, maskEmail } from "@/lib/logger";
import { notFound } from "@/lib/errors";
import { err, ok, type Result } from "@/lib/result";
import { captureServerEvent } from "@/server/analytics";
import { sendEmail } from "@/server/email/client";
import { renderEmail } from "@/server/email/render";
import LeadConfirmed from "@/server/email/templates/LeadConfirmed";
import { checkRateLimits } from "@/server/rate-limit";
import { hashKey } from "@/server/request";

export type SubmitContext = {
  ip: string;
  ipHash: string;
  userAgent?: string;
  locale?: string;
  requestId: string;
};

export type SubmitLeadResult = { leadId: string; email: string; resendAvailableAt: string };

/** A signed form token for a form that has just been opened. */
export function formToken(): { token: string } {
  return { token: issueFormToken() };
}

function toNewLead(input: LeadSubmission, context: SubmitContext, turnstile: boolean): NewLead {
  const meta = {
    ipHash: context.ipHash,
    userAgent: context.userAgent,
    locale: context.locale,
    utm: input.utm,
    turnstile,
  };
  if (input.source === "contact") {
    return {
      source: "contact",
      name: input.name,
      email: input.email,
      company: input.company,
      services: input.services,
      message: input.message,
      meta,
    };
  }
  return {
    source: "brief",
    name: input.name,
    email: input.email,
    company: input.company,
    phone: input.phone,
    services: input.services,
    message: input.description,
    existingUrl: input.existingUrl,
    budgetRange: input.budgetRange,
    timeline: input.timeline,
    referral: input.referral,
    meta,
  };
}

/**
 * Accepts a contact message or project brief: runs the bot checks and rate
 * limits, stores the lead awaiting verification with its first code, and emails
 * the code. A filled honeypot gets a convincing success and nothing is stored.
 */
export async function submitLead(
  input: LeadSubmission,
  context: SubmitContext,
  now = new Date(),
): Promise<Result<SubmitLeadResult>> {
  if (input.website?.trim()) {
    logger.info("Honeypot submission ignored", {
      requestId: context.requestId,
      ipHash: context.ipHash,
    });
    return ok({
      leadId: crypto.randomUUID(),
      email: input.email,
      resendAvailableAt: resendAvailableAt(now),
    });
  }

  const token = verifyFormToken(input.formToken, now);
  if (!token.ok) return token;

  const limited = await checkRateLimits([
    { key: `lead_create:ip:${context.ipHash}`, limit: 5, windowSeconds: 3600 },
    { key: `lead_create:email:${hashKey(input.email)}`, limit: 3, windowSeconds: 3600 },
  ]);
  if (!limited.ok) return limited;

  const turnstile = await verifyTurnstile(input.turnstileToken, context.ip);
  if (!turnstile.ok) return turnstile;

  const { code, codeHash } = newCode();
  const created = await createLeadWithVerification(
    toNewLead(input, context, turnstile.data.checked),
    {
      codeHash,
      expiresAt: new Date(now.getTime() + CODE_TTL_MS),
    },
  );
  if (!created.ok) return created;
  const lead = created.data;

  const sent = await sendCodeEmail(lead.email, code);
  if (!sent.ok) return sent;
  await recordLeadEvent(lead.id, "verification_sent", "system");

  logger.info("Lead created, code sent", {
    requestId: context.requestId,
    leadId: lead.id,
    email: maskEmail(lead.email),
  });
  return ok({ leadId: lead.id, email: lead.email, resendAvailableAt: resendAvailableAt(now) });
}

/** Stores a lead from the agency's own systems; the caller already verified the contact. */
export async function createIntegrationLead(
  input: IntegrationLead,
  now = new Date(),
): Promise<Result<Lead>> {
  return createVerifiedLead(
    {
      source: "api",
      name: input.name,
      email: input.email,
      company: input.company,
      phone: input.phone,
      services: input.services,
      message: input.message,
      budgetRange: input.budgetRange,
      timeline: input.timeline,
      meta: { integration: input.integration },
    },
    now,
  );
}

/** Emails the person a copy of what they sent, after their address is confirmed. */
async function sendLeadConfirmation(lead: Lead, requestId: string): Promise<void> {
  const { html, text } = await renderEmail(
    createElement(LeadConfirmed, { name: lead.name, details: leadDetails(lead, "client") }),
  );
  const sent = await sendEmail({
    to: lead.email,
    subject: confirmedHeadline,
    html,
    text,
  });
  if (!sent.ok)
    logger.error("Confirmation email failed", { requestId, leadId: lead.id, error: sent.error });
}

/**
 * Work that follows a newly verified lead, run after the response is sent: the
 * client's confirmation email (not for API leads), the team notifications, and
 * the analytics event. Failures are logged and never reach the client.
 */
export async function handleLeadVerified(lead: Lead, requestId: string): Promise<void> {
  if (lead.source !== "api") await sendLeadConfirmation(lead, requestId);
  await notifyLeadVerified(lead, { requestId });
  await captureServerEvent("lead_verified", lead.id, verifiedLeadFacts(lead));
}

/** Leads per page in the admin table. */
const LEADS_PAGE_SIZE = 25;

export type LeadFilters = { status?: LeadStatus; source?: LeadSource; q?: string; page: number };

/** One page of the admin leads table. */
export async function listLeadsPage(
  filters: LeadFilters,
): Promise<Result<{ leads: Lead[]; total: number; page: number; pageCount: number }>> {
  const page = Math.max(1, filters.page);
  const result = await listLeads({
    status: filters.status,
    source: filters.source,
    search: filters.q,
    offset: (page - 1) * LEADS_PAGE_SIZE,
    limit: LEADS_PAGE_SIZE,
  });
  if (!result.ok) return result;
  const pageCount = Math.max(1, Math.ceil(result.data.total / LEADS_PAGE_SIZE));
  return ok({ ...result.data, page, pageCount });
}

/** Dashboard numbers: real counts per status and the five newest confirmed leads. */
export async function leadOverview(): Promise<
  Result<{ counts: Partial<Record<LeadStatus, number>>; recent: Lead[] }>
> {
  const [counts, recent] = await Promise.all([
    countLeadsByStatus(),
    listLeads({ offset: 0, limit: 5 }),
  ]);
  if (!counts.ok) return counts;
  if (!recent.ok) return recent;
  return ok({ counts: counts.data, recent: recent.data.leads });
}

/** Everything the lead detail page shows: the lead, its events, and notification deliveries. */
export async function leadWithTimeline(
  leadId: string,
): Promise<Result<{ lead: Lead; events: LeadEvent[]; deliveries: NotificationDelivery[] } | null>> {
  const found = await findLeadById(leadId);
  if (!found.ok) return found;
  if (!found.data) return ok(null);
  const [events, deliveries] = await Promise.all([
    listLeadEvents(leadId),
    listDeliveriesForLead(leadId),
  ]);
  if (!events.ok) return events;
  if (!deliveries.ok) return deliveries;
  return ok({ lead: found.data, events: events.data, deliveries: deliveries.data });
}

/** Changes a lead's status on behalf of an admin. The caller notifies the team after responding. */
export async function changeLeadStatus(
  leadId: string,
  to: LeadStatus,
  actor: string,
): Promise<Result<{ lead: Lead; from: LeadStatus }>> {
  const updated = await updateLeadStatus(leadId, to, actor);
  if (!updated.ok) return updated;
  if (!updated.data) return err(notFound("That lead no longer exists."));
  return ok(updated.data);
}

/** Adds an internal note, stored as a `note_added` event on the lead's timeline. */
export async function addLeadNote(
  leadId: string,
  body: string,
  actor: string,
): Promise<Result<null>> {
  const found = await findLeadById(leadId);
  if (!found.ok) return found;
  if (!found.data) return err(notFound("That lead no longer exists."));
  return recordLeadEvent(leadId, "note_added", actor, { body });
}
