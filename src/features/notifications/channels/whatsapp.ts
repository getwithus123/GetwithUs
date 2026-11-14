import { serviceName } from "@/content/services/catalog";
import { postJson } from "@/server/post-json";
import type { Channel } from "@/features/notifications/types";

/** Graph API version for the WhatsApp Cloud API. Meta supports each version for about two years. */
const GRAPH_API_VERSION = "v26.0";
/** Language of the approved template; must match the template submitted to Meta. */
const TEMPLATE_LANGUAGE = "en";

type WhatsAppConfig = { phoneNumberId: string; accessToken: string; to: string; template: string };

/**
 * A pre-approved template message to the owner's WhatsApp. Never free-form:
 * outside the 24-hour window Meta rejects anything but templates. Parameters,
 * in order: name, company, services, admin link (see docs/notifications.md).
 */
export function whatsappChannel(config: WhatsAppConfig): Channel {
  return {
    name: "whatsapp",
    send: (payload) =>
      postJson(
        "WhatsApp",
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${config.phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to: config.to,
          type: "template",
          template: {
            name: config.template,
            language: { code: TEMPLATE_LANGUAGE },
            components: [
              {
                type: "body",
                parameters: [
                  payload.lead.name,
                  payload.lead.company ?? "No company given",
                  payload.lead.services.map(serviceName).join(", ") || "Not specified",
                  payload.adminUrl,
                ].map((text) => ({ type: "text", text: text.slice(0, 200) })),
              },
            ],
          },
        },
        { authorization: `Bearer ${config.accessToken}` },
      ),
  };
}
