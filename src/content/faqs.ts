import type { FaqItem } from "@/content/types";

/**
 * "Questions people ask first" on the home page. Every answer restates facts
 * already in the content (commitments, process steps, service pricing); none
 * adds a new promise.
 */
export const homeFaqs: readonly FaqItem[] = [
  {
    question: "Who owns the code and the accounts?",
    answer:
      "You do, once the project is paid for. Repositories, domains, cloud, and ad accounts are in your name from day one, so the work already lives in accounts you control.",
  },
  {
    question: "Is the price really fixed?",
    answer:
      "Yes, for a defined scope. The written scope lists the deliverables, what is excluded, a dated timeline, the price, and the payment schedule. Anything outside it is estimated in writing before we build it, and you approve it or we skip it.",
  },
  {
    question: "How will I know how the work is going?",
    answer:
      "Every week ends with a demo on a staging link you can open on your own devices, and a short written note of what changed. If you have not seen it working on staging, it is not done.",
  },
  {
    question: "What happens after launch?",
    answer:
      "You choose: a monthly retainer with defined response times, or a handover with documentation and a recorded walkthrough, after which the work is fully yours.",
  },
  {
    question: "Who pays for WhatsApp, calls, AI models, and ads?",
    answer:
      "You do, directly. Platform costs such as WhatsApp messages, telephony minutes, model usage, and ad spend are billed to your own accounts at cost. We never hold your ad budget.",
  },
];
