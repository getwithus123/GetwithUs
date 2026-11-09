import { known, site } from "@/config/site";
import type { ProcessStep } from "@/content/types";

/** The same four steps on every project. */
export const processSteps: readonly ProcessStep[] = [
  {
    title: "Scope",
    short:
      "A 30-minute call, then a written document with fixed deliverables, dates, and a price. Nothing starts until you sign it.",
    detail:
      "We spend 30 minutes on a call understanding the problem and the constraints. Then we write it down: what we will build, what we will not build, a milestone plan with calendar dates, the price, and the payment schedule. You decide with the document in your hands. No pressure to sign on the call.",
    needFromYou: [
      "The decision-makers on the call, not just a gatekeeper",
      "Access to any existing systems we need to understand",
      "The date you need to go live by, if there is one",
      "Brand assets and content drafts if they already exist",
    ],
    youGet: [
      "A written scope document you keep",
      "A milestone plan with calendar dates",
      "A fixed price and payment schedule",
    ],
  },
  {
    title: "Build",
    short:
      "Weekly increments. Every Friday: a live staging link, a short note of what changed, and a slot to give feedback.",
    detail:
      "We work in one-week cycles. Every Friday you get a staging link you can open on your own phone, a written note of what changed, and a short slot to give feedback or ask questions. If you need something outside the scope, we price it in writing before we touch it. You approve it, or we skip it. Nothing appears on your invoice as a surprise.",
    needFromYou: [
      "One named person who can answer a question within a business day",
      "Feedback before the following Monday so the next week can start clean",
      "Content, approved copy, and account credentials when the plan says so",
    ],
    youGet: [
      "A staging link from week one, on your own devices",
      "A written note every Friday of what changed",
      "Any scope changes priced in writing before they are built",
    ],
  },
  {
    title: "Launch",
    short:
      "Domain, hosting, analytics, and monitoring in accounts you own. We run a launch checklist and stay on call on launch day.",
    detail:
      "Launch is a checklist, not a coin-flip. We set up the domain, hosting, analytics, error monitoring, and automated backups in accounts registered to you, not to us. We run through the list together, fix anything that needs fixing, and are reachable for the whole of launch day. The fix window starts the moment the site goes live.",
    needFromYou: [
      "Domain registrar access or the ability to update DNS records",
      "Accounts for hosting, analytics, and any third-party services the build needs",
      "Sign-off on the launch checklist before we push live",
    ],
    youGet: [
      "Every account in your name. You can leave us at any time.",
      "A launch report: what went live and how to monitor it",
      `A ${site.fixWindow} fix window for anything we built that breaks`,
    ],
  },
  {
    title: "Run",
    short:
      "A support retainer with defined response times, or a clean handover with docs and a recorded walkthrough. Your choice.",
    detail:
      "Once you are live you choose how to continue. A monthly retainer gives you a defined number of change hours and a response-time commitment for urgent issues. A handover gives you documentation, a recorded walkthrough of the codebase and admin panel, and the keys to everything. After that, the work is entirely yours. Both options are in writing before launch.",
    needFromYou: [
      "A decision on retainer or full handover before launch day",
      "A nominated person to receive the handover materials",
    ],
    youGet: [
      "A handover document and a recorded walkthrough session",
      "All repository, hosting, and third-party account access",
      "Optional retainer terms in writing, priced before launch",
    ],
  },
];

/** Where day-to-day conversation happens; left out of the sentence until the owner sets it. */
const channel = known("[OWNER: Slack, WhatsApp, or email]");

/** The closing "Working together" section on /process. */
export const workingTogether: readonly {
  title: string;
  text: string;
  icon: string;
}[] = [
  {
    icon: "message",
    title: "One channel, every week",
    text: channel
      ? `We work on ${channel}. Every week ends with a short written note of what changed and what is next. No status meetings, no chasing for updates.`
      : "One shared channel, one written update every Friday. No status meetings, no chasing for updates. You always know where things stand.",
  },
  {
    icon: "eye",
    title: "Full visibility",
    text: "Code in a repository you own. Staging on a link you can open on any device. Tasks on a board you can see. Nothing is hidden behind 'we're working on it'.",
  },
  {
    icon: "pencil",
    title: "Changes in writing",
    text: "Anything outside the written scope gets a written estimate before we build it. You approve it, or we skip it. Your invoice matches what you agreed to, line by line.",
  },
  {
    icon: "key",
    title: "Your accounts, your code",
    text: "Domain, hosting, analytics, the code repository, and third-party accounts are registered in your name from day one. We work in your accounts, not ours, and the code is yours once the project is paid for.",
  },
  {
    icon: "clock",
    title: "Predictable timelines",
    text: "The scope document has calendar dates, not vague estimates. If something changes the timeline, we tell you in writing before it slips, not after.",
  },
  {
    icon: "shield",
    title: "A fix window in writing",
    text: `Every project ships with a ${site.fixWindow} fix window. Anything we built that breaks after launch gets fixed at no extra charge. In writing, in your project agreement.`,
  },
];

/**
 * "A sample week" on /process: how a build week runs, restating the Build
 * step (weekly increments, questions answered within a day, a Friday demo on
 * staging with a written note).
 */
export const sampleWeek: readonly { day: string; label: string; text: string }[] = [
  {
    day: "Mon",
    label: "Plan",
    text: "We agree in writing what this week will deliver and what success looks like.",
  },
  {
    day: "Tue",
    label: "Build",
    text: "Building starts. Questions go to your named contact and are answered within a business day.",
  },
  {
    day: "Wed",
    label: "Build",
    text: "Continued development. Any scope question gets a written estimate before we act on it.",
  },
  {
    day: "Thu",
    label: "Test",
    text: "We test on real devices and browsers, not just a local machine, and fix what we find.",
  },
  {
    day: "Fri",
    label: "Demo",
    text: "Staging link updated. Written note of what changed. Feedback window open until Monday.",
  },
];

/** Headline stats shown above the steps section. */
export const processStats: readonly { value: string; label: string }[] = [
  { value: "4", label: "Steps, the same on every project" },
  { value: "1 week", label: "From agreement to first staging link" },
  { value: "Written", label: "Scope, price, and every change" },
  { value: "Yours", label: "Every account, from day one" },
];
