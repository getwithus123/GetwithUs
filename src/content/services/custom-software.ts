import type { ServiceContent } from "@/content/types";

export const customSoftware: ServiceContent = {
  slug: "custom-software",
  seoDescription:
    "Custom software development in India: internal tools, system integrations, cloud setup on AWS, Google Cloud, or Azure. Fixed scope.",
  lead: "Internal tools, integrations, data pipelines, and the cloud setup underneath them. For the work that does not fit a category but still needs to ship.",
  summary:
    "Internal tools, integrations, data pipelines, and the cloud setup underneath them. For the work that does not fit a category but still needs to ship.",
  highlights: [
    "Internal dashboards and admin tools",
    "Integrations between systems that do not talk to each other",
    "Cloud setup or migration on AWS, Google Cloud, Azure, or Vercel",
  ],
  whatYouGet: [
    "Internal dashboards and admin tools",
    "Integrations between systems that do not talk to each other",
    "Data pipelines and reporting",
    "Cloud setup or migration on AWS, Google Cloud, Azure, or Vercel",
    "CI/CD, monitoring, and alerting",
    "Technical audits of existing systems",
    "Maintenance and support retainers",
  ],
  howWeWork: [
    "Audit or scope",
    "Build in increments",
    "Document and hand over, or operate under a retainer",
  ],
  tools: [
    "TypeScript and Node.js",
    "Python where it fits",
    "Postgres",
    "Redis",
    "Docker",
    "GitHub Actions",
    "Terraform",
    "AWS",
    "Google Cloud",
    "Azure",
    "Vercel",
  ],
  pricing:
    "Fixed price for defined scopes. Time and materials, with a weekly cap you set, for audits and open-ended work.",
  faqs: [
    {
      question: "Can you work inside our existing codebase?",
      answer: "Yes. We start with a read-only review and a short written assessment.",
    },
    {
      question: "Do you offer ongoing support?",
      answer: "Yes, under a monthly retainer with defined response times.",
    },
    { question: "Will you sign an NDA?", answer: "Yes." },
  ],
  updated: "2026-10-31",
};
