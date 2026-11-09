/** Slugs of every service page. The five lines plus the two agentic automation products. */
export type ServiceSlug =
  | "web-development"
  | "app-development"
  | "agentic-automation"
  | "whatsapp-bot"
  | "calling-agent"
  | "digital-marketing"
  | "custom-software";

/** What the navigation, footer, and forms need to know about a service. */
export type ServiceSummary = {
  slug: ServiceSlug;
  name: string;
  href: string;
  /** One line for the mega menu. */
  menuDescription: string;
  /** The agentic automation products listed under their line. */
  children?: readonly ServiceSummary[];
};

type CaseStudyMetric = { label: string; value: string; source: string };

type CaseStudyImage = { src: string; alt: string; width: number; height: number };

/**
 * A case study. Rendered only when `published` and `permission` are both true;
 * metrics render only when `metricsApproved` is true.
 */
export type CaseStudy = {
  slug: string;
  title: string;
  /** `null` renders as "Confidential [industry] client". */
  client: string | null;
  industry: string;
  services: readonly ServiceSlug[];
  summary: string;
  problem: string;
  work: string;
  outcome: string;
  metrics: readonly CaseStudyMetric[];
  metricsApproved: boolean;
  stack: readonly string[];
  images: readonly CaseStudyImage[];
  published: boolean;
  permission: boolean;
  /** ISO date, for example "2026-03-01". */
  date: string;
};

/** One block of legal text: a paragraph or a bulleted list. */
type LegalBlock = { type: "p"; text: string } | { type: "ul"; items: readonly string[] };

type LegalSection = { id: string; title: string; blocks: readonly LegalBlock[] };

/** A legal page: privacy policy or terms. Rendered by the legal page layout with a table of contents. */
export type LegalDocument = {
  title: string;
  /** Meta description, under 160 characters. */
  description: string;
  /** ISO date shown as "Last updated". */
  updated: string;
  sections: readonly LegalSection[];
};

export type FaqItem = { question: string; answer: string };

/** A short titled paragraph some service pages carry (limits, platform rules, consent). */
type ServiceNote = { title: string; body: string; placement: "afterWhatYouGet" | "afterTools" };

/** An entry in the list directly under a page lead (the agentic automation products). */
type ServiceProduct = { name: string; description: string; href?: string };

/** Everything a service page renders beyond its catalog entry. */
export type ServiceContent = {
  slug: ServiceSlug;
  /** Meta description, under 160 characters. */
  seoDescription: string;
  lead: string;
  /** Two sentences used on the home page and the services index. */
  summary: string;
  /** Three deliverables used on the home page and the services index (service lines only). */
  highlights?: readonly string[];
  products?: readonly ServiceProduct[];
  whatYouGet: readonly string[];
  note?: ServiceNote;
  howWeWork: readonly string[];
  tools: readonly string[];
  pricing: string;
  faqs: readonly FaqItem[];
  /** ISO date of the last content change, used by the sitemap. */
  updated: string;
};

/** A service page: catalog entry plus content. */
export type ServicePage = ServiceSummary & ServiceContent & { parent?: ServiceSummary };

/** One step of how a project runs. Numbered wherever it appears, because it is a sequence. */
export type ProcessStep = {
  title: string;
  /** One or two sentences for the home page and the services index. */
  short: string;
  /** The long-form paragraph on /process. */
  detail: string;
  needFromYou: readonly string[];
  youGet: readonly string[];
};

/** A promise the business can be held to. */
export type Commitment = {
  text: string;
  /** One more sentence, used on the About page. */
  expanded: string;
};

type FounderLinks = {
  readonly linkedin?: string;
  readonly portfolio?: string;
  readonly instagram?: string;
};

export type TeamMember = {
  readonly name: string;
  readonly role: string;
  /** Path to a real photo under public/. Without one, an initials panel is shown. */
  readonly photo?: string;
  /** One short line: area of focus. Hidden if empty. */
  readonly focus?: string;
  /** Short biography paragraph. Hidden if empty. */
  readonly bio?: string;
  readonly shortBio?: string;
  readonly links?: FounderLinks;
};
