/**
 * Content for the About page (/about).
 *
 * Every field marked [OWNER] must be filled in before launch.
 * Fields that are empty or null cause the section that depends on them to be
 * hidden automatically - nothing renders as a raw placeholder on the live site.
 *
 * Run `pnpm guard:strict` to see every [OWNER] line that still needs a value.
 */

// ---------------------------------------------------------------------------
// Our story
// Two paragraphs explaining why GetWithUs exists.
// Leave both as empty strings to hide the section entirely.
// [OWNER: write two short paragraphs - why you started the business, what
// problem you kept seeing, and the specific way you set out to fix it]
// ---------------------------------------------------------------------------
export const story: readonly string[] = [
  // Example (replace with your own words):
  // "We started GetwithUs after spending years inside other agencies and watching
  //  the same problems repeat. Budgets were agreed over email and quietly extended.
  //  Source code sat in the agency repository. Clients received status updates, not
  //  working software.",
  //
  // "We decided to run things differently: a written scope before anything is built,
  //  a staging link every Friday, and every account in the client name from day one.",
];

// ---------------------------------------------------------------------------
// "The problem we solve" section
// Three short beats: Problem, Effect, Solution.
// Each beat needs a title and one or two sentences.
// Leave the array empty to hide the section.
// [OWNER: write three beats that describe the pain your ideal client has
// experienced with other agencies, and how you solve it]
// ---------------------------------------------------------------------------
export type ProblemBeat = {
  /** Short label, two to four words. */
  label: string;
  /** One sentence naming the pain. */
  problem: string;
  /** One sentence on the knock-on effect that hurts the business. */
  effect: string;
  /** One sentence on how GetWithUs removes it. */
  solution: string;
};

export const problemBeats: readonly ProblemBeat[] = [
  {
    label: "Unclear pricing",
    problem: "Most agency quotes are estimates. The real number appears on the final invoice.",
    effect: "Budgets overrun, finance teams push back, and the scope gets cut to fit what is left.",
    solution:
      "Every project starts with a written scope and a fixed price. Changes are priced before they are built.",
  },
  {
    label: "No visibility",
    problem:
      "Progress is reported as a percentage. You do not see the actual work until it is finished.",
    effect: "Problems surface late, revisions pile up, and the launch date moves.",
    solution:
      "Every Friday you get a staging link and a written note of what changed. You can open it on your own phone.",
  },
  {
    label: "Lock-in",
    problem:
      "Code, domain, and hosting live in the agency accounts. Leaving means starting from scratch.",
    effect: "You are tied to the relationship even when it stops working.",
    solution:
      "Every account is in your name from day one. Documentation and a handover session are part of every project.",
  },
];

// ---------------------------------------------------------------------------
// "Who we work with" - ideal client description
// One to three sentences describing the kinds of businesses and situations you
// work best with. Leave as an empty string to hide the paragraph.
// [OWNER: describe your ideal client - size, stage, or situation - in plain terms]
// ---------------------------------------------------------------------------
export const idealClient: string = "";
// Example:
// "We work with founders and product teams who need software built and shipped,
//  not managed. Typically that is a business that has validated an idea and needs
//  a reliable team to build the next version, or an internal team that wants to add
//  capability without hiring."

// ---------------------------------------------------------------------------
// Industries
// Short labels only. Leave the array empty to omit the list.
// [OWNER: list the industries you have built for or want to be known for]
// ---------------------------------------------------------------------------
export const industries: readonly string[] = [];
// Example: ["Retail and e-commerce", "Healthcare", "Fintech", "Logistics", "Professional services"]

// ---------------------------------------------------------------------------
// Client logos
// Only real, approved logos. File must exist at public/logos/<filename>.
// The guard script requires every file in public/logos/ to be listed in
// src/content/tools.ts with a source URL. For the About page, add the logo
// filename and the brand website as the source.
// Leave the array empty to omit the logo strip.
// [OWNER: add real client logos only, with written permission]
// ---------------------------------------------------------------------------
export type ClientLogo = {
  /** Display name, used as alt text. */
  name: string;
  /** Filename under public/logos/, e.g. "acme.svg". */
  file: string;
  /** Width in pixels of the logo asset. */
  width: number;
  /** Height in pixels of the logo asset. */
  height: number;
};

export const clientLogos: readonly ClientLogo[] = [];

// ---------------------------------------------------------------------------
// Client quotes
// Only real, attributed quotes with written permission.
// Leave the array empty to show the "How we prove it" block instead.
// [OWNER: add real client quotes only, with name, role, and company]
// ---------------------------------------------------------------------------
export type ClientQuote = {
  quote: string;
  name: string;
  role: string;
  /** Optional - only include if the client approves naming their company. */
  company?: string;
};

export const clientQuotes: readonly ClientQuote[] = [];

// ---------------------------------------------------------------------------
// Result figures
// Only real, verifiable numbers you can back up.
// Leave the array empty to omit the figures strip.
// [OWNER: add real project results only, with a source you can point to]
// ---------------------------------------------------------------------------
export type ResultFigure = {
  value: string;
  label: string;
};

export const resultFigures: readonly ResultFigure[] = [];
