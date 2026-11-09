/**
 * Source of truth for site-wide identity, contact, and official web links.
 * All pages and metadata read from here.
 */
export const siteContent = {
  name: "GetwithUs",
  tagline: "Build with us. Grow with us.",
  // The canonical production address, used for canonicals, the sitemap and
  // structured data on every deployment. Links that must reach the deployment
  // itself (such as admin links in lead notifications) use NEXT_PUBLIC_SITE_URL.
  url: "https://getwithus.in",
  email: "connect@getwithus.in",
  description:
    "Software development and digital technology agency. Websites, mobile apps, custom software, and agentic automation built by real engineers.",
  social: {
    instagram: "https://www.instagram.com/getwithus__/",
    // Optional company LinkedIn page. Leave empty if none exists.
    linkedin: "",
  },
} as const;

