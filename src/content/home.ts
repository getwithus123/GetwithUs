import { known, site } from "@/config/site";

const month = known(site.bookingMonth);

/**
 * Copy for the home page sections of the final design, in page order. The
 * hero's title, lead, buttons, and proof items stay in `homePage`
 * (content/pages.ts); this file holds the new sections.
 */
export const home = {
  hero: {
    /** The h1 reads "We build the [word] your business runs on." */
    before: "We build the",
    after: "your business runs on.",
    words: ["websites", "mobile apps", "WhatsApp bots", "calling agents", "software"],
    /** What screen readers hear in place of the rotating word. */
    spoken: "websites, mobile apps, WhatsApp bots, calling agents, and software",
    /** Shown only once the owner sets the month. */
    booking: month ? `Now booking projects for ${month}` : undefined,
  },
  tools: { caption: "Built on tools any team can maintain after us" },
  services: {
    lead: "One way of working across all five: a written scope, a demo every week, and every account in your name.",
  },
  demos: {
    title: "See it working",
    lead: "Example conversations with two of the agents we build: a WhatsApp bot that books a call, and a calling agent that writes a summary to your CRM.",
    whatsapp: {
      tab: "WhatsApp bot",
      title: "A WhatsApp bot that answers, qualifies, and books",
      link: { label: "About the WhatsApp bot", href: "/services/agentic-automation/whatsapp-bot" },
    },
    calling: {
      tab: "Calling agent",
      title: "A calling agent that takes the call and writes it down",
      link: {
        label: "About the calling agent",
        href: "/services/agentic-automation/calling-agent",
      },
    },
  },
  code: {
    title: "Real code, in your repo, from week one",
    lead: "We pick the language that fits the job, not the one we happen to like. Every commit lands in a repository you own, so you can read the work as it happens.",
  },
  stack: {
    title: "The stack behind your project",
    lead: "Mainstream, well-documented tools, so any developer you hire later can pick up where we left off. Choose a group to light it up.",
  },
  process: {
    lead: "Four steps, the same on every project. Select any step for detail.",
    youGet: "You get",
  },
  pricing: {
    title: "What it costs",
    lead: "Every project starts with a written scope and an agreed price. These are the models we price on; a short scoping call turns them into a number.",
    quote: "Get a quote for this",
    timeline: "Typical timeline",
    paymentTitle: "How payment works",
  },
  commitments: {
    lead: "Four promises in writing, on every project.",
  },
  industries: {
    title: "Industries we build for",
    lead: "Different businesses, the same problems: answering customers, taking bookings, getting found.",
  },
  faq: { title: "Questions people ask first" },
} as const;
