import { budgetOptions, timelineOptions } from "@/content/brief";
import { serviceSlugs } from "@/content/services/catalog";
import type { Lead } from "@/features/leads/types";

/**
 * What analytics may know about a lead: which form, and the answers picked from
 * fixed lists. Never anything typed: no name, email, phone, company, message,
 * or website. A value outside the lists (the integrations API takes free text)
 * is left out rather than sent.
 */
type LeadFacts = {
  form?: string;
  services?: string[];
  budget_range?: string;
  timeline?: string;
};

const budgets = new Set<string>(budgetOptions.map((option) => option.value));
const timelines = new Set<string>(timelineOptions.map((option) => option.value));
const services = new Set<string>(serviceSlugs);

function facts(input: {
  form: unknown;
  services: unknown;
  budgetRange: unknown;
  timeline: unknown;
}): LeadFacts {
  const out: LeadFacts = {};
  if (typeof input.form === "string") out.form = input.form;
  if (Array.isArray(input.services)) {
    out.services = input.services.filter(
      (slug): slug is string => typeof slug === "string" && services.has(slug),
    );
  }
  if (typeof input.budgetRange === "string" && budgets.has(input.budgetRange)) {
    out.budget_range = input.budgetRange;
  }
  if (typeof input.timeline === "string" && timelines.has(input.timeline)) {
    out.timeline = input.timeline;
  }
  return out;
}

/** Facts about a form submission, from the fields the browser sends. */
export function submissionFacts(fields: Record<string, unknown>): LeadFacts {
  return facts({
    form: fields.source,
    services: fields.services,
    budgetRange: fields.budgetRange,
    timeline: fields.timeline,
  });
}

/** Facts about a confirmed lead, for the server-side event. */
export function verifiedLeadFacts(lead: Lead): LeadFacts {
  return facts({
    form: lead.source,
    services: lead.services,
    budgetRange: lead.budgetRange,
    timeline: lead.timeline,
  });
}
