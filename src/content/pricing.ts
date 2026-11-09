import { known } from "@/config/site";
import { agenticPricing } from "@/content/services/agentic-automation";
import type { ServiceSlug } from "@/content/types";

/** One part of a price, for example "from" + an owner fact. The value is shown only once it is known. */
type PriceLine = { before?: string; value: string; after?: string };

export type PricingCard = {
  /** The service the "Get a quote for this" button preselects on /start. */
  slug: ServiceSlug;
  name: string;
  /** Every line must be known before any is shown; otherwise the card shows `fallback`. */
  price: readonly PriceLine[];
  fallback: string;
  model: string;
  included: readonly string[];
  timeline: string;
  /** Drawn as the dark card. */
  featured?: boolean;
};

const FIXED_AFTER_CALL = "Fixed price after a short scoping call";

/**
 * The pricing cards on the home page and /services (docs/build-final-prompt.md,
 * section 8). Prices and timelines are the owner's; until they are filled in,
 * each card shows its fallback and no raw placeholder ever renders.
 */
export const pricingCards: readonly PricingCard[] = [
  {
    slug: "web-development",
    name: "Website",
    price: [{ before: "from ", value: "[OWNER: starting price for a website]" }],
    fallback: FIXED_AFTER_CALL,
    model: "Fixed price for a defined scope. Retainer for ongoing changes.",
    included: [
      "Marketing sites and landing pages",
      "Web apps, dashboards, and customer portals",
      "Headless CMS and e-commerce",
    ],
    timeline: "[OWNER: typical timeline for a website]",
    featured: true,
  },
  {
    slug: "app-development",
    name: "Mobile app",
    price: [{ before: "from ", value: "[OWNER: starting price for an app]" }],
    fallback: FIXED_AFTER_CALL,
    model: "Fixed price for a defined scope. Retainer for ongoing changes.",
    included: [
      "React Native (Expo) or Flutter",
      "APIs, authentication, payments, and push",
      "App Store and Google Play release",
    ],
    timeline: "[OWNER: typical timeline for an app]",
  },
  {
    slug: "agentic-automation",
    name: "WhatsApp bot or calling agent",
    price: [
      { before: "setup from ", value: "[OWNER: setup price for an agent]" },
      { before: "then ", value: "[OWNER: monthly fee for an agent]", after: " per month" },
    ],
    fallback: FIXED_AFTER_CALL,
    model: agenticPricing,
    included: [
      "WhatsApp bots on the official Business Platform",
      "Inbound and outbound calling agents",
      "Workflows across CRM, calendar, sheets, and support",
    ],
    timeline: "[OWNER: typical timeline for an agent]",
  },
  {
    slug: "digital-marketing",
    name: "Digital marketing",
    price: [{ value: "[OWNER: monthly retainer]", after: " per month" }],
    fallback: "Monthly retainer, priced after a short scoping call",
    model:
      "Monthly retainer for our work. Ad spend goes from your card to the platforms; we never hold your budget.",
    included: [
      "Technical and content SEO",
      "Google Ads and Meta Ads",
      "Landing pages and conversion tracking",
    ],
    timeline: "[OWNER: typical time to first results for marketing]",
  },
  {
    slug: "custom-software",
    name: "Custom software",
    price: [],
    fallback: "Priced after a short scoping call",
    model:
      "Fixed price for defined scopes. Time and materials, with a weekly cap you set, for audits and open-ended work.",
    included: [
      "Internal dashboards and admin tools",
      "Integrations between systems that do not talk to each other",
      "Cloud setup or migration on AWS, Google Cloud, Azure, or Vercel",
    ],
    timeline: "[OWNER: typical timeline for custom software]",
  },
];

/** The price as one line, or undefined while any part of it is still a placeholder (or there is none). */
export function priceText(card: PricingCard): string | undefined {
  if (card.price.length === 0) return undefined;
  if (card.price.some((line) => !known(line.value))) return undefined;
  return card.price
    .map((line) => `${line.before ?? ""}${line.value}${line.after ?? ""}`)
    .join(", ");
}

/** The line about platform costs under the cards: always true, so always shown. */
export const platformCosts =
  "Platform costs (WhatsApp messages, telephony minutes, model usage, ad spend) are billed to your own accounts at cost.";
