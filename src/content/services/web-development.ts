import { site } from "@/config/site";
import type { ServiceContent } from "@/content/types";

export const webDevelopment: ServiceContent = {
  slug: "web-development",
  seoDescription:
    "Marketing sites, web apps, and online stores on Next.js and React. Fast on real phones, accessible by default, and editable by your team.",
  lead: "Marketing sites, web apps, and online stores built on Next.js and React. Fast on real phones, accessible by default, indexable by search engines, and editable by your team after launch.",
  summary:
    "Marketing sites, web apps, and online stores on Next.js. Fast on real phones, accessible by default, indexable by search engines, and editable by your team after launch.",
  highlights: [
    "Marketing sites and landing pages",
    "Web apps, dashboards, and customer portals",
    "Headless CMS and e-commerce",
  ],
  whatYouGet: [
    "A design system and responsive layouts designed in the browser, reviewed on a staging link",
    "A Next.js build with server rendering, caching, and image optimization",
    "A CMS your team can use (Sanity, Payload, or the one you already have)",
    "Forms, transactional email, and third-party integrations",
    "Hosting, domain, DNS, and analytics set up in your accounts",
    "Documentation and a recorded handover session",
  ],
  howWeWork: [
    "Discovery and sitemap",
    "Design in components, reviewed on staging",
    "Build and content load",
    `QA on real devices, launch, and a ${site.fixWindow} fix window`,
  ],
  tools: [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Postgres",
    "Vercel or your own cloud",
    "Sanity or Payload",
    "Plausible or GA4",
  ],
  pricing: "Fixed price for a defined scope. Retainer for ongoing changes.",
  faqs: [
    {
      question: "Can you work on our existing site?",
      answer:
        "Yes. We start with an audit of performance, accessibility, and code, then propose either targeted fixes or a rebuild with reasons for each.",
    },
    {
      question: "Who owns the code?",
      answer: "You do. The repository, hosting, and domain are in your accounts from day one.",
    },
    {
      question: "Do you build on WordPress?",
      answer:
        "We build on Next.js and can migrate existing WordPress sites, keeping your URLs and setting up redirects so search traffic carries over.",
    },
    {
      question: "How long does a website take?",
      answer:
        "It depends on pages and integrations. We give a dated timeline in the written scope before you commit.",
    },
  ],
  updated: "2026-10-31",
};
