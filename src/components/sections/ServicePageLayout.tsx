import { ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import JsonLd from "@/components/layout/JsonLd";
import Reveal from "@/components/motion/Reveal";
import ClosingCta from "@/components/sections/ClosingCta";
import PageHero from "@/components/sections/PageHero";
import { PriceCard } from "@/components/sections/Pricing";
import { serviceColors, serviceIcons } from "@/components/sections/serviceIcons";
import ServiceDemo from "@/components/services/ServiceDemo";
import WhatsAppWindow from "@/components/services/WhatsAppWindow";
import type { ModelKey } from "@/components/three/models/keys";
import ModelStill from "@/components/three/ModelStill";
import WebGLModel from "@/components/three/WebGLModel";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Icon from "@/components/ui/Icon";
import TechLogo from "@/components/ui/TechLogo";
import { isFilled } from "@/config/site";
import { pricingCards } from "@/content/pricing";
import { allServicePages, serviceLinePages } from "@/content/services";
import { toolsIn } from "@/content/tools";
import type { ServicePage, ServiceSlug } from "@/content/types";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/json-ld";
import { cn } from "@/lib/cn";

/** Each service's signature model in the page header. */
const MODELS: Record<ServiceSlug, ModelKey> = {
  "web-development": "glass-browser",
  "app-development": "phone-screens",
  "agentic-automation": "node-graph",
  "whatsapp-bot": "phone-bubbles",
  "calling-agent": "handset-rings",
  "digital-marketing": "funnel",
  "custom-software": "server-hub",
};

/** A section of the page body with its heading. */
function Block({
  id,
  title,
  children,
  soft = false,
}: {
  id: string;
  title: string;
  children: ReactNode;
  soft?: boolean;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn("py-16 md:py-20", soft && "border-y border-line bg-bg-soft")}
    >
      <Container>
        <Reveal as="h2" id={id} className="type-h2 text-ink">
          {title}
        </Reveal>
        <div className="mt-10">{children}</div>
      </Container>
    </section>
  );
}

/** "What you get": two columns of items whose checks draw in as the list enters. */
function TickList({ items }: { items: readonly string[] }) {
  return (
    <Reveal as="ul" className="tick-list grid gap-x-10 gap-y-4 md:grid-cols-2">
      {items.map((item, index) => (
        <li
          key={item}
          className="flex gap-3.5 text-[1.0625rem] text-ink"
          style={{ "--i": index } as CSSProperties}
        >
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" focusable="false">
              <path
                className="tick-path"
                d="M5 12.5l4.5 4.5L19 7.5"
                pathLength={1}
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {item}
        </li>
      ))}
    </Reveal>
  );
}

/** "How we work": numbered steps on a track that fills as it enters. */
function MiniStepper({ steps }: { steps: readonly string[] }) {
  return (
    <Reveal
      as="ol"
      className="mini-steps"
      style={{ "--n": steps.length } as CSSProperties}
    >
      {steps.map((step, index) => (
        <li
          key={step}
          className="relative z-10 flex items-start gap-4 md:flex-col md:items-center md:text-center"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-accent bg-card font-display text-lg font-extrabold text-accent shadow-soft">
            {index + 1}
          </span>
          <span className="pt-2 font-semibold text-ink md:max-w-[22ch] md:pt-0">{step}</span>
        </li>
      ))}
    </Reveal>
  );
}

function Note({ page }: { page: ServicePage }) {
  if (!page.note) return null;
  return (
    <section
      aria-labelledby="note-title"
      // After "What you get" the next section is a tinted band, so the note needs its own space below.
      className={page.note.placement === "afterWhatYouGet" ? "pb-16 md:pb-20" : "pb-4"}
    >
      <Container>
        <div className="rounded-card border border-line bg-card p-7 shadow-soft md:p-9">
          <h2 id="note-title" className="flex items-center gap-3 type-h3 text-ink">
            <span className="grid size-10 place-items-center rounded-[12px] bg-accent-soft text-accent">
              <Icon icon={Info} size={20} />
            </span>
            {page.note.title}
          </h2>
          <p className="mt-4 max-w-[68ch] text-body">{page.note.body}</p>
          {page.slug === "whatsapp-bot" ? <WhatsAppWindow /> : null}
        </div>
      </Container>
    </section>
  );
}

/** The tools a service lists, as chips with the official marks of the tools each line names. */
function ToolChips({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-3">
      {items.filter(isFilled).map((item) => {
        const marks = toolsIn(item).filter((tool) => tool.logo);
        return (
          <li
            key={item}
            className="flex min-h-12 items-center gap-2.5 rounded-[14px] border border-line bg-card py-2 pr-4 pl-2 font-semibold text-ink"
          >
            {marks.length ? (
              <span className="flex gap-1">
                {marks.slice(0, 3).map((tool) => (
                  <span
                    key={tool.name}
                    className="grid size-8 place-items-center rounded-[10px] bg-bg-soft"
                  >
                    <TechLogo slug={tool.logo as string} size={18} />
                  </span>
                ))}
              </span>
            ) : (
              <span className="w-1.5" />
            )}
            {item}
          </li>
        );
      })}
    </ul>
  );
}

/** Other services to look at next: the siblings for a product, the other lines for a line. */
function related(page: ServicePage): ServicePage[] {
  if (page.parent) {
    return allServicePages.filter(
      (other) =>
        other.slug !== page.slug &&
        (other.slug === page.parent?.slug || other.parent?.slug === page.parent?.slug),
    );
  }
  return serviceLinePages.filter((other) => other.slug !== page.slug).slice(0, 4);
}

/**
 * The shared layout of every service page in the final design: header with
 * the page's 3D model, the contextual demo, what you get, the note, how we
 * work, tools, pricing, questions, related services, and the closing band.
 * Content comes from src/content/services; JSON-LD, metadata, Open Graph
 * images, and sitemap entries are unchanged.
 */
export default function ServicePageLayout({ page }: { page: ServicePage }) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    ...(page.parent ? [{ name: page.parent.name, path: page.parent.href }] : []),
    { name: page.name, path: page.href },
  ];
  const priceSlug = page.parent?.slug ?? page.slug;
  const card = pricingCards.find((entry) => entry.slug === priceSlug);
  const pricing = page.pricing
    .split(/(?<=\.)\s+/)
    .filter(isFilled)
    .join(" ");
  const faqs = page.faqs.filter((faq) => isFilled(faq.question) && isFilled(faq.answer));
  const model = MODELS[page.slug];
  const startHref = `/start?service=${page.slug}`;

  return (
    <>
      <JsonLd data={[serviceJsonLd(page), faqJsonLd(page.faqs), breadcrumbJsonLd(crumbs)]} />
      <PageHero
        id="service-title"
        title={page.name}
        lead={page.lead}
        crumbs={crumbs}
        actions={
          <>
            <Button href={startHref} size="lg">
              Start a project
            </Button>
            <Button href="#pricing-title" variant="secondary" size="lg">
              How it is priced
            </Button>
          </>
        }
        visual={<WebGLModel model={model} still={<ModelStill model={model} />} />}
      />
      <ServiceDemo page={page} />
      <Block id="what-you-get" title="What you get">
        <TickList items={page.whatYouGet.filter(isFilled)} />
      </Block>
      {page.note?.placement === "afterWhatYouGet" ? <Note page={page} /> : null}
      <Block id="how-we-work" title="How we work on this" soft>
        <MiniStepper steps={page.howWeWork.filter(isFilled)} />
      </Block>
      <Block id="tools" title="Tools we use">
        <ToolChips items={page.tools} />
      </Block>
      {page.note?.placement === "afterTools" ? <Note page={page} /> : null}
      <section aria-labelledby="pricing-title" className="py-16 md:py-20">
        <Container className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <div>
            <Reveal as="h2" id="pricing-title" className="type-h2 text-ink">
              How it is priced
            </Reveal>
            <p className="mt-5 max-w-[40em] type-lead text-body">{pricing}</p>
          </div>
          {/* The home page features one card for show; on its own service page the card is plain
              like the others, and leaves out the pricing model when the paragraph already says it. */}
          {card ? (
            <PriceCard
              card={{ ...card, featured: false }}
              showModel={card.model.trim() !== pricing.trim()}
            />
          ) : null}
        </Container>
      </section>
      {faqs.length ? (
        <Block id="questions" title="Questions" soft>
          <Accordion
            className="max-w-[880px]"
            items={faqs.map((faq, index) => ({
              id: `faq-${index}`,
              question: faq.question,
              answer: faq.answer,
            }))}
          />
        </Block>
      ) : null}
      <Block id="related" title="Related services">
        {/* As many columns as cards (up to four), so two related services fill the row. */}
        <ul
          className={cn(
            "grid gap-5 sm:grid-cols-2",
            related(page).length >= 4
              ? "lg:grid-cols-4"
              : related(page).length === 3
                ? "lg:grid-cols-3"
                : "lg:grid-cols-2",
          )}
        >
          {related(page).map((other) => {
            const OtherIcon = serviceIcons[other.slug];
            return (
              <li key={other.slug}>
                <Link
                  href={other.href}
                  className="group flex h-full flex-col gap-3 rounded-card border border-line bg-card p-6 shadow-soft transition-shadow duration-300 hover:shadow-lift"
                >
                  <span
                    className="grid size-11 place-items-center rounded-[12px] bg-[color-mix(in_srgb,var(--c)_14%,transparent)] text-[var(--c)]"
                    style={{ "--c": serviceColors[other.slug] } as CSSProperties}
                  >
                    <Icon icon={OtherIcon} size={20} />
                  </span>
                  <span className="type-h4 text-ink group-hover:text-accent">
                    {other.name}
                    {" "}
                    <Icon
                      icon={ArrowRight}
                      size={16}
                      className="inline-block align-[-0.1em] text-accent transition-transform duration-150 group-hover:translate-x-0.5"
                    />
                  </span>
                  <span className="text-sm text-body">{other.menuDescription}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Block>
      <ClosingCta />
    </>
  );
}
