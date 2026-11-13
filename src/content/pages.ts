import { known, RESPONSE_TIME, site } from "@/config/site";

type Action = { label: string; href: string };

/**
 * Copy for the pages that are not service pages. Each entry has the page heading,
 * lead, meta description (under 160 characters), and the date its copy last changed.
 */
export const homePage = {
  path: "/",
  updated: "2026-11-06",
  hero: {
    title: "We build the software your business runs on.",
    lead: "Websites, mobile apps, WhatsApp bots and calling agents, and the marketing that fills them. Scoped in writing, shipped in weekly demos, and handed over with you owning every account.",
    primary: { label: "Start a project", href: "/start" } satisfies Action,
    secondary: { label: "See how a project runs", href: "/process" } satisfies Action,
    /** Three commitments in a few words each, beside the hero buttons. */
    proof: ["Scope and price in writing", "Weekly demos", "Accounts in your name"],
  },
  services: { title: "Five things we build, all in accounts you own" },
  process: {
    title: "How a project runs",
    link: { label: "The process in detail", href: "/process" },
  },
  commitments: { title: "What you can hold us to" },
  work: { title: "Selected work", link: { label: "All work", href: "/work" } },
} as const;

const contactEmail = known(site.contact.email);

export const closingCta = {
  title: "Tell us what you need",
  text: RESPONSE_TIME
    ? `Answer a few questions about your project and we reply within ${RESPONSE_TIME} with next steps and, where possible, a price range.`
    : "Answer a few questions about your project and we reply with next steps and, where possible, a price range.",
  primary: { label: "Start a project", href: "/start" } satisfies Action,
  /** Left out until the owner's email address is known. */
  secondary: contactEmail
    ? ({ label: "Email us", href: `mailto:${contactEmail}` } satisfies Action)
    : undefined,
} as const;

export const servicesPage = {
  path: "/services",
  updated: "2026-11-06",
  title: "Software Development Services",
  description:
    "Website development, mobile app development, WhatsApp bots, AI automation, digital marketing and custom software in India. Fixed price, weekly demos.",
  lead: "Five lines of work, one way of working: a written scope, weekly demos, and accounts you own.",
  listTitle: "Service lines",
  processTitle: "How a project runs",
} as const;

export const processPage = {
  path: "/process",
  updated: "2026-11-06",
  title: "How a project runs",
  description:
    "How GetwithUs delivers software projects: written scope, fixed price, weekly staging demos, and accounts in your name. Four steps, no surprises.",
  lead: "The same four steps on every project, written down, priced in advance, and visible from day one. No surprises.",
  needFromYouTitle: "What we need from you",
  youGetTitle: "What you get",
  workingTogetherTitle: "How we work together",
} as const;

export const workPage = {
  path: "/work",
  updated: "2026-11-06",
  title: "Selected work",
  description: "Software projects built by GetwithUs. Case studies published with client permission. Ask us for a walkthrough of recent work.",
  lead: "Work we have permission to show. Ask us for a walkthrough of the rest.",
  emptyLead:
    "Case studies appear here once clients agree to them being shown. Ask us for a walkthrough of recent work.",
  emptyTitle: "No published case studies yet",
  emptyText: "We publish work when clients give permission. Ask us for a walkthrough on a call.",
  emptyAction: { label: "Contact us", href: "/contact" } satisfies Action,
} as const;

export const aboutPage = {
  path: "/about",
  updated: "2026-11-06",
  title: `About ${site.name}`,
  description:
    "GetwithUs is a software development agency in India. Founded by Priyanshu Bansal, Pranav Maheshwari, and Rajat Sisodia. Apps, AI agents, and marketing.",
  /** Shown once the owner writes it; until then the page uses `leadFallback`. */
  lead: "GetwithUs is a software development agency built by three founders who work directly on every project. We build websites, apps, AI agents, and the marketing that fills them.",
  leadFallback: site.footerDescription,
  beliefsTitle: "What we believe about this work",
  teamTitle: "Meet the founders",
  contactTitle: "Contact",
} as const;

export const contactPage = {
  path: "/contact",
  updated: "2026-11-06",
  title: "Contact GetwithUs",
  description:
    "Start a software project with GetwithUs. Tell us what you are building and we reply with next steps and a price range. connect@getwithus.in",
  lead: RESPONSE_TIME
    ? `Tell us what you are working on. We read every message and reply within ${RESPONSE_TIME} with next steps and, where possible, a price range.`
    : "Tell us what you are working on. We read every message and reply with next steps and, where possible, a price range.",
  detailsTitle: "Other ways to reach us",
  bookCall: "Book a call",
  formNote:
    "You do not need a sales call to get an answer. Fill in the form and we reply by email.",
} as const;

export const startPage = {
  path: "/start",
  updated: "2026-11-06",
  title: "Start a project",
  description:
    "Start a software project with GetwithUs. Four short steps, then confirm your email. We reply with next steps and a price range.",
  lead: RESPONSE_TIME
    ? `Four short steps, then confirm your email. We read every brief and reply within ${RESPONSE_TIME}.`
    : "Four short steps, then confirm your email. We read every brief and reply with next steps.",
} as const;
