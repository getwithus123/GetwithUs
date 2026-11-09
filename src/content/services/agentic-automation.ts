import type { ServiceContent } from "@/content/types";

/** Pricing shared by the agentic automation page and its two product pages. */
export const agenticPricing =
  "Setup as a fixed-price project, then a monthly fee for operation and changes. Platform costs (WhatsApp messages, telephony minutes, model usage) are billed to your own accounts at cost.";

export const agenticAutomation: ServiceContent = {
  slug: "agentic-automation",
  seoDescription:
    "WhatsApp bots, calling agents, and workflow automation with clear limits, a path to a person, and logs you can read.",
  lead: "Agents that handle the repetitive conversations and handoffs in a business: answering on WhatsApp, taking and making calls, and moving data between your tools. Every agent ships with clear limits, a path to a person, and logs you can read.",
  summary:
    "Agents that answer on WhatsApp, take and make phone calls, and move work between your tools. Each one has clear limits, a human one tap away, and logs you can read.",
  highlights: [
    "WhatsApp bots on the official Business Platform",
    "Inbound and outbound calling agents",
    "Workflows across CRM, calendar, sheets, and support",
  ],
  products: [
    {
      name: "WhatsApp bot",
      description:
        "Answers, qualifies, books, and updates customers on the official Business Platform.",
      href: "/services/agentic-automation/whatsapp-bot",
    },
    {
      name: "Calling agent",
      description:
        "Picks up inbound calls or makes outbound ones, follows your rules, and writes a summary to your CRM.",
      href: "/services/agentic-automation/calling-agent",
    },
    {
      name: "Workflow automation",
      description: "Moves records, documents, and approvals between the tools you already use.",
    },
  ],
  whatYouGet: [
    "Conversation design with explicit limits and escalation rules",
    "Integration with your CRM, calendar, spreadsheets, or helpdesk",
    "Human handoff to a shared inbox or phone line",
    "A log of every conversation and every action the agent took",
    "Monitoring, and changes as you learn what customers ask",
  ],
  note: {
    title: "What agents should not do",
    body: "They should not issue refunds, legal commitments, or medical and financial decisions on their own. We design the limits with you, write them down, and test them before anything goes live.",
    placement: "afterWhatYouGet",
  },
  howWeWork: [
    "Map the conversations you handle today",
    "Pilot in a limited scope with real traffic",
    "Widen the scope as the logs justify it",
    "Operate with monitoring and monthly review",
  ],
  tools: [
    "WhatsApp Business Cloud API",
    "Telephony providers (Twilio, Vonage, or Plivo)",
    "Language models from OpenAI, Anthropic, and Google",
    "Speech-to-text and text-to-speech providers",
    "Node.js workers",
    "Postgres",
  ],
  pricing: agenticPricing,
  faqs: [
    {
      question: "Which model do you use?",
      answer:
        "The one that fits the task and your data rules; we document the choice and the fallback.",
    },
    {
      question: "What happens when the agent does not know?",
      answer: "It says so, offers the human handoff, and the conversation is flagged for review.",
    },
    {
      question: "Where does the data live?",
      answer:
        "In your accounts and your database. We do not keep customer conversations after a project unless you ask us to operate the agent.",
    },
    {
      question: "Can we start small?",
      answer: "Yes. Pilots usually cover one conversation type, one channel, and one integration.",
    },
  ],
  updated: "2026-10-31",
};
