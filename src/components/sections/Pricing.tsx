import { Check, Clock } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import SectionIntro from "@/components/ui/SectionIntro";
import { known, site } from "@/config/site";
import { home } from "@/content/home";
import { platformCosts, priceText, pricingCards, type PricingCard } from "@/content/pricing";
import { cn } from "@/lib/cn";

/**
 * Two cards a row from md and three from lg, on a grid of half-cards, so a short
 * last row starts in the middle instead of leaving an empty slot at the end.
 */
function centreLastRow(index: number, total: number): string | undefined {
  const classes: string[] = [];
  if (total % 2 === 1 && index === total - 1) classes.push("md:col-start-2");
  const rest = total % 3;
  if (rest === 2 && index === total - 2) classes.push("lg:col-start-2");
  else if (rest === 1 && index === total - 1) classes.push("lg:col-start-3");
  else if (classes.length) classes.push("lg:col-start-auto");
  return classes.join(" ") || undefined;
}

/** The payment lines that are known, in order; the platform costs line is always true. */
function paymentLines(): string[] {
  const { schedule, currency, tax, methods } = site.payment;
  const lines = [
    known(schedule) ? `Payment schedule: ${known(schedule)}.` : undefined,
    known(currency) ? `Invoiced in ${known(currency)}.` : undefined,
    known(tax) ? `${known(tax)}.` : undefined,
    known(methods) ? `We accept ${known(methods)}.` : undefined,
    platformCosts,
  ];
  return lines.filter((line): line is string => Boolean(line));
}

/**
 * One pricing card; the featured one is dark. Also used alone on each service
 * page, which already states the pricing model beside it, so it can hide it.
 */
export function PriceCard({ card, showModel = true }: { card: PricingCard; showModel?: boolean }) {
  const price = priceText(card);
  const timeline = known(card.timeline);
  const dark = card.featured === true;
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-card border p-7",
        dark
          ? "border-accent/60 bg-cta text-cta-ink shadow-[0_0_0_4px_var(--accent-soft),var(--shadow-lg)]"
          : "border-line bg-card text-ink shadow-soft",
      )}
    >
      <h3 className="type-h4">{card.name}</h3>
      <p
        className={cn(
          "mt-3 font-display font-bold tracking-[-0.02em]",
          price ? "text-[2rem] leading-tight" : "text-[1.25rem] leading-snug",
        )}
      >
        {price ?? card.fallback}
      </p>
      {showModel ? (
        <p className={cn("mt-3 text-[0.94rem]", dark ? "text-cta-body" : "text-body")}>
          {card.model}
        </p>
      ) : null}
      <ul className="mt-6 grid gap-3 text-[0.94rem]">
        {card.included.map((item) => (
          <li key={item} className="flex gap-2.5">
            <Check
              size={18}
              strokeWidth={2.4}
              aria-hidden="true"
              className={cn("mt-0.5 shrink-0", dark ? "text-[#3ee08a]" : "text-ok")}
            />
            {item}
          </li>
        ))}
      </ul>
      {timeline ? (
        <p
          className={cn(
            "mt-5 flex items-center gap-2 text-sm",
            dark ? "text-cta-body" : "text-muted",
          )}
        >
          <Clock size={16} strokeWidth={1.75} aria-hidden="true" />
          {home.pricing.timeline}: {timeline}
        </p>
      ) : null}
      <div className="mt-auto pt-7">
        <Button
          href={`/start?service=${card.slug}`}
          variant={dark ? "primary" : "secondary"}
          className="w-full"
          // Starts with the visible text, as WCAG 2.5.3 requires, then names the card.
          aria-label={`${home.pricing.quote}: ${card.name}`}
        >
          {home.pricing.quote}
        </Button>
      </div>
    </article>
  );
}

/**
 * "What it costs": one card per service line and "How payment works" under
 * them. Information only, no checkout. Prices, timelines, and payment facts
 * are the owner's: until they are filled in, each card shows its fallback and
 * each unknown payment line is left out.
 */
export default function Pricing({ className }: { className?: string }) {
  return (
    <section aria-labelledby="pricing-title" className={cn("py-20 md:py-[120px]", className)}>
      <Container>
        <SectionIntro id="pricing-title" title={home.pricing.title} lead={home.pricing.lead} />
        <ul className="mt-14 grid gap-6 md:grid-cols-4 lg:grid-cols-6">
          {pricingCards.map((card, index) => (
            <li
              key={card.slug}
              className={cn("md:col-span-2", centreLastRow(index, pricingCards.length))}
            >
              <PriceCard card={card} />
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-card border border-line bg-bg-soft px-7 py-6">
          <h3 className="type-h4 text-ink">{home.pricing.paymentTitle}</h3>
          <ul className="mt-3 grid gap-1.5 text-body">
            {paymentLines().map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
