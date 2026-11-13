import { isFilled, known, site } from "@/config/site";
import type { FaqItem, ServicePage } from "@/content/types";
import { absoluteUrl } from "@/lib/seo";

type Thing = { "@context"?: "https://schema.org"; "@type": string } & Record<string, unknown>;

export type JsonLdData = Thing | readonly Thing[];

/**
 * The organization behind the site. Owner facts (legal name, email, phone) are
 * included only once known; `sameAs` lists only real profiles from site config.
 */
export function organizationJsonLd(): Thing {
  const legalName = known(site.legalEntity);
  const email = known(site.contact.email);
  const telephone = known(site.contact.phone);
  const address = known(site.contact.address);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    ...(legalName ? { legalName } : {}),
    url: site.url,
    logo: absoluteUrl("/icon.svg"),
    ...(address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: address,
            addressLocality: "Dehradun",
            addressRegion: "Uttarakhand",
            addressCountry: "IN",
          },
        }
      : {}),
    ...(email || telephone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            ...(email ? { email } : {}),
            ...(telephone ? { telephone } : {}),
          },
        }
      : {}),
    ...(site.social.length ? { sameAs: site.social.map((link) => link.href) } : {}),
  };
}

/** The website itself. */
export function websiteJsonLd(): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
  };
}

/** A service page, offered by the organization. */
export function serviceJsonLd(page: ServicePage): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.name,
    description: page.summary,
    url: absoluteUrl(page.href),
    serviceType: page.name,
    provider: { "@type": "Organization", name: site.name, url: site.url },
  };
}

/** FAQPage built from the same question list the page renders, leaving out answers still waiting on the owner. */
export function faqJsonLd(faqs: readonly FaqItem[]): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs
      .filter((faq) => isFilled(faq.question) && isFilled(faq.answer))
      .map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
  };
}

/** Breadcrumbs for nested pages. The first item should be the home page. */
export function breadcrumbJsonLd(items: readonly { name: string; path: string }[]): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** AboutPage + Organization schema for /about, with founder entries only when supplied. */
export function aboutPageJsonLd(
  founders: readonly { name: string; role?: string; linkedin?: string; portfolio?: string }[],
): Thing[] {
  const org = organizationJsonLd();
  const founderNodes =
    founders.length > 0
      ? {
          founder: founders.map((f) => ({
            "@type": "Person",
            name: f.name,
            jobTitle: f.role ?? "Co-founder",
            ...(f.portfolio ? { url: f.portfolio } : {}),
            ...(f.linkedin ? { sameAs: f.linkedin } : {}),
          })),
        }
      : {};

  const aboutPage: Thing = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About",
    url: absoluteUrl("/about"),
    description: site.description,
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };

  return [{ ...org, ...founderNodes }, aboutPage];
}
