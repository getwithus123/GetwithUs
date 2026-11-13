import Link from "next/link";
import type { ComponentType } from "react";
import { InstagramIcon, LinkedInIcon } from "@/components/icons/BrandIcons";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import TrackedLink from "@/components/layout/TrackedLink";
import { known, site, visibleNav } from "@/config/site";
import { serviceLines } from "@/content/services/catalog";
import { getPublishedCaseStudies } from "@/features/case-studies/getPublishedCaseStudies";

// Taller tap targets on phones; the underline stays on the text (content box), not the padding.
const linkClasses =
  "link-draw inline-block bg-clip-content bg-origin-content py-2.5 text-body transition-colors duration-150 ease-out hover:text-ink sm:py-0";
const listClasses = "grid type-small sm:gap-2";
const socialIcons: Record<string, ComponentType<{ className?: string }>> = {
  Instagram: InstagramIcon,
  LinkedIn: LinkedInIcon,
};
const headingClasses = "mb-4 text-sm font-bold text-ink";

/** Site footer: brand, tagline, and contact details (each only once known), then service, company, and legal links. */
export default function Footer() {
  const email = known(site.contact.email);
  const phone = known(site.contact.phone);
  const address = known(site.contact.address);
  const city = known(site.contact.city);
  const owner = known(site.legalEntity) ?? site.name;
  const companyLinks = [
    ...visibleNav(getPublishedCaseStudies().length > 0),
    { label: "Start a project", href: "/start" },
  ];

  return (
    <footer className="border-t border-line bg-bg-soft pt-16 pb-28 text-body sm:pb-10">
      <Container>
        {/* Brand on its own row until lg, so the link columns are not squeezed at tablet width. */}
        <div className="grid gap-10 sm:grid-cols-3 sm:gap-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="grid content-start gap-4 sm:col-span-3 lg:col-span-1">
            <Logo />
            <p className="font-display text-lg font-bold text-ink">{site.tagline}</p>
            <p className="max-w-[36ch]">{site.footerDescription}</p>
            {email || phone || address || city ? (
              <address className="grid type-small not-italic sm:gap-1">
                {email ? (
                  <TrackedLink kind="email" href={`mailto:${email}`} className={linkClasses}>
                    {email}
                  </TrackedLink>
                ) : null}
                {phone ? <span>{phone}</span> : null}
                {address ? <span>{address}</span> : city ? <span>Based in {city}</span> : null}
              </address>
            ) : null}
            {site.social.length ? (
              <ul className="mt-1 flex flex-wrap gap-2">
                {site.social.map((item) => {
                  const SocialIcon = socialIcons[item.label];
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-pill"
                        aria-label={`${site.name} on ${item.label}`}
                      >
                        {SocialIcon ? <SocialIcon className="size-[1.0625rem] shrink-0" /> : null}
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
          <nav aria-labelledby="footer-services">
            <h2 id="footer-services" className={headingClasses}>
              Services
            </h2>
            <ul className={listClasses}>
              {serviceLines.map((service) => (
                <li key={service.slug}>
                  <Link href={service.href} className={linkClasses}>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-labelledby="footer-company">
            <h2 id="footer-company" className={headingClasses}>
              Company
            </h2>
            <ul className={listClasses}>
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClasses}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-labelledby="footer-legal">
            <h2 id="footer-legal" className={headingClasses}>
              Legal
            </h2>
            <ul className={listClasses}>
              <li>
                <Link href="/privacy" className={linkClasses}>
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={linkClasses}>
                  Terms and conditions
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className="mt-12 border-t border-line pt-6 type-small text-muted">
          © {site.copyrightYear} {owner}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
