// public-env, not env: client components render the logo, and the validator stays out of their bundle.
import { publicEnv } from "@/config/public-env";
import { siteContent } from "@/content/site";

export type SocialLink = { label: string; href: string };

/** How every owner placeholder starts. The one place in code that spells it, so `pnpm guard:strict` flags it once. */
const OWNER_MARK = "[OWNER:";

/**
 * Site-wide facts. Every owner placeholder below is a fact only the business owner
 * can supply; `pnpm guard:strict` fails until all of them are replaced.
 */
export const site = {
  // The name as the logo writes it: capital G, small "with", capital U (docs/brand/README.md).
  name: publicEnv.siteName,
  wordmark: "GetwithUs",
  /** The brand line from the brief. */
  tagline: siteContent.tagline,
  url: siteContent.url,
  description:
    "GetwithUs is a software development agency in India. We build websites, mobile apps, WhatsApp bots, AI calling agents, and run digital marketing. Fixed price, weekly demos, accounts you own.",
  footerDescription: "Websites, apps, agents, and marketing for businesses that need them to work.",
  contact: {
    email: siteContent.email,
    phone: "[OWNER: phone or WhatsApp number]",
    city: siteContent.city,
    address: siteContent.address,
  },
  legalEntity: "[OWNER: legal entity name]",
  responseTime: "one business day",
  fixWindow: "30-day",
  bookingMonth: "[OWNER: month you are booking projects for, for example March]",
  whatsAppMessage: "Hi GetwithUs, I would like to talk about a project.",
  payment: {
    schedule: "50% on signing, 50% on delivery",
    currency: "INR or USD",
    tax: "Prices exclude GST where applicable",
    methods: "bank transfer, UPI, and card",
  },
  copyrightYear: 2026,
  // Real profile URLs only. Empty means no social links are rendered anywhere.
  social: [
    ...(siteContent.social.instagram ? [{ label: "Instagram", href: siteContent.social.instagram }] : []),
    ...(siteContent.social.linkedin ? [{ label: "LinkedIn", href: siteContent.social.linkedin }] : []),
  ] as SocialLink[],
  schedulingUrl: publicEnv.schedulingUrl,
} as const;

/** A site fact, or undefined while it is still an owner placeholder, so whatever shows it can be left out. */
export function known(value: string | undefined): string | undefined {
  return value && !value.startsWith(OWNER_MARK) ? value : undefined;
}

/** False while a sentence still carries an owner placeholder anywhere in it, so lists can leave it out. */
export function isFilled(text: string): boolean {
  return !text.includes(OWNER_MARK);
}

/** How soon we reply, for promises on the page. Undefined until the owner supplies it. */
export const RESPONSE_TIME = known(site.responseTime);

type NavLink = {
  label: string;
  href: string;
  /** Shown only while a published case study exists. */ needsWork?: boolean;
};

/** Header links after "Services". The footer's Company column reuses them. */
const primaryNav: readonly NavLink[] = [
  { label: "Process", href: "/process" },
  { label: "Work", href: "/work", needsWork: true },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/** Drops the Work link while there is no published case study. */
export function visibleNav(hasWork: boolean): NavLink[] {
  return primaryNav.filter((link) => hasWork || !link.needsWork);
}
