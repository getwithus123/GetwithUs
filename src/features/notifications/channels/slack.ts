import { postJson } from "@/server/post-json";
import type { Channel } from "@/features/notifications/types";

/** Slack incoming webhook with a Block Kit message: title, every field, and a button to the lead. */
export function slackChannel(webhookUrl: string): Channel {
  return {
    name: "slack",
    send: (payload) =>
      postJson("Slack", webhookUrl, {
        text: payload.title,
        blocks: [
          { type: "header", text: { type: "plain_text", text: payload.title.slice(0, 150) } },
          {
            type: "section",
            fields: payload.details.slice(0, 10).map((detail) => ({
              type: "mrkdwn",
              text: `*${detail.label}*\n${detail.value.slice(0, 1900)}`,
            })),
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "Open in admin" },
                url: payload.adminUrl,
              },
            ],
          },
        ],
      }),
  };
}
