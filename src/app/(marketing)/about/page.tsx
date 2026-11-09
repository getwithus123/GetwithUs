import { ArrowRight, CheckCircle2, FileCheck, KeyRound, LockOpen, MonitorPlay } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";
import FounderTiltCard from "@/components/founders/FounderTiltCard";
import JsonLd from "@/components/layout/JsonLd";
import Reveal from "@/components/motion/Reveal";
import RevealText from "@/components/motion/RevealText";
import ClosingCta from "@/components/sections/ClosingCta";
import ContactDetails, { hasContactDetails } from "@/components/sections/ContactDetails";
import PageHero from "@/components/sections/PageHero";
import { serviceColors, serviceIcons } from "@/components/sections/serviceIcons";
import ModelStill from "@/components/three/ModelStill";
import WebGLModel from "@/components/three/WebGLModel";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Icon from "@/components/ui/Icon";
import SectionIntro from "@/components/ui/SectionIntro";
import { known } from "@/config/site";
import {
  clientLogos,
  clientQuotes,
  idealClient,
  industries,
  problemBeats,
  resultFigures,
  story,
} from "@/content/about";
import { commitments } from "@/content/commitments";
import { aboutPage, processPage } from "@/content/pages";
import { processSteps } from "@/content/process";
import { serviceLines } from "@/content/services/catalog";
import { siteContent } from "@/content/site";
import { team } from "@/content/team";
import { aboutPageJsonLd, breadcrumbJsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/seo";

export const instant = false;

export const metadata = pageMetadata({
  title: "About",
  description:
    "Meet the founders of GetwithUs: Priyanshu Bansal, Pranav Maheshwari, and Rajat Sisodia. Scope and price in writing, weekly demos, and accounts you own.",
  path: aboutPage.path,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COMMITMENT_ICONS = [FileCheck, KeyRound, MonitorPlay, LockOpen];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AboutPage() {
  const lead = known(aboutPage.lead) ?? aboutPage.leadFallback;

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "About", path: aboutPage.path },
  ];

  const showStory = story.length > 0 && story.some((p) => p.trim().length > 0);
  const showProblem = problemBeats.length > 0;
  const showServices = serviceLines.length > 0;
  const showProcess = processSteps.length > 0;
  const showClients =
    idealClient.trim().length > 0 || industries.length > 0 || clientLogos.length > 0;
  const showFounders = team.length > 0;
  const showProof = clientQuotes.length > 0 || resultFigures.length > 0;
  const showContact = hasContactDetails();

  const founderSchema = team.map((member) => ({
    name: member.name,
    role: member.role,
    linkedin: member.links?.linkedin,
    portfolio: member.links?.portfolio,
  }));

  return (
    <>
      <JsonLd data={[...aboutPageJsonLd(founderSchema), breadcrumbJsonLd(crumbs)]} />

      {/* Hero */}
      <PageHero
        id="about-title"
        title={aboutPage.title}
        lead={lead}
        crumbs={crumbs}
        actions={
          <>
            <Button href="/start" size="lg">
              Start a project
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              Ask a question
            </Button>
          </>
        }
        visual={<WebGLModel model="about-cube" still={<ModelStill model="about-cube" />} />}
      />

      {/* Our story */}
      {showStory ? (
        <section aria-labelledby="story-title" className="py-20 md:py-24">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
              <div>
                <RevealText
                  as="h2"
                  id="story-title"
                  text="Our story"
                  className="type-h2 text-ink"
                />
              </div>
              <div className="grid gap-5">
                {story
                  .filter((p) => p.trim().length > 0)
                  .map((paragraph, i) => (
                    <p key={i} className="text-[1.0625rem] leading-relaxed text-body">
                      {paragraph}
                    </p>
                  ))}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {/* What we set out to fix */}
      {showProblem ? (
        <section
          aria-labelledby="problem-title"
          className="dots-bg border-y border-line bg-bg-soft py-20 md:py-24"
        >
          <Container>
            <SectionIntro
              id="problem-title"
              title="What we set out to fix"
              lead="Three problems that repeat across every agency relationship. Each one has a specific answer."
            />
            <Reveal
              as="ul"
              className="mt-12 grid gap-5 sm:grid-cols-3"
              style={{ "--n": problemBeats.length } as CSSProperties}
            >
              {problemBeats.map((beat, i) => (
                <li
                  key={beat.label}
                  style={{ "--i": i } as CSSProperties}
                  className="flex flex-col rounded-[20px] border border-line bg-card p-6 shadow-soft"
                >
                  <span
                    className="mb-4 self-start rounded-full bg-accent-soft px-3 py-1 font-display text-xs font-extrabold tracking-widest text-accent"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="type-h4 text-ink">{beat.label}</h3>
                  <dl className="mt-4 grid gap-3">
                    <div>
                      <dt className="text-xs font-bold tracking-widest text-muted uppercase">
                        The problem
                      </dt>
                      <dd className="mt-1 text-[0.9375rem] leading-relaxed text-body">
                        {beat.problem}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold tracking-widest text-muted uppercase">
                        The effect
                      </dt>
                      <dd className="mt-1 text-[0.9375rem] leading-relaxed text-body">
                        {beat.effect}
                      </dd>
                    </div>
                    <div className="rounded-[12px] bg-accent-soft p-3">
                      <dt className="text-xs font-bold tracking-widest text-accent uppercase">
                        How we fix it
                      </dt>
                      <dd className="mt-1 text-[0.9375rem] leading-relaxed font-medium text-ink">
                        {beat.solution}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </Reveal>
          </Container>
        </section>
      ) : null}

      {/* What we believe - four commitment cards */}
      <section aria-labelledby="beliefs-title" className="py-20 md:py-24">
        <Container>
          <SectionIntro
            id="beliefs-title"
            title={aboutPage.beliefsTitle}
            lead="Four practices we hold to on every project. Not aspirational - they are in the contract."
          />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2">
            {commitments.map((commitment, position) => {
              const CommitIcon = COMMITMENT_ICONS[position] ?? FileCheck;
              return (
                <li
                  key={commitment.text}
                  className="flex flex-col gap-5 rounded-[20px] border border-line bg-card p-7 shadow-soft md:p-8"
                >
                  <span className="grid size-12 place-items-center rounded-[14px] bg-accent-soft text-accent">
                    <Icon icon={CommitIcon} size={24} />
                  </span>
                  <div>
                    <p className="type-lead font-semibold text-ink">{commitment.text}</p>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-body">
                      {commitment.expanded}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* Meet the founders - always rendered when team is populated */}
      {showFounders ? (
        <section
          aria-labelledby="founders-title"
          className="border-t border-line bg-bg-soft py-20 md:py-24"
        >
          <Container>
            <SectionIntro
              id="founders-title"
              title="Meet the founders"
              lead="The people behind GetWithUs."
            />
            <ul className="mt-12 grid gap-6 lg:grid-cols-3">
              {team.map((member, i) => (
                <FounderTiltCard key={member.name} member={member} index={i} />
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* What we build - service lines */}
      {showServices ? (
        <section aria-labelledby="services-title" className="border-t border-line py-20 md:py-24">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
              <div>
                <RevealText
                  as="h2"
                  id="services-title"
                  text="What we build"
                  className="type-h2 text-ink"
                />
                <p className="mt-4 max-w-[34ch] text-[1.0625rem] leading-relaxed text-body">
                  Five lines of work, delivered the same way: a written scope, weekly staging demos,
                  and accounts in your name.
                </p>
                <div className="mt-8">
                  <Button href="/services" variant="secondary">
                    All services
                    <ArrowRight size={16} aria-hidden="true" />
                  </Button>
                </div>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {serviceLines.map((service) => {
                  const ServiceIcon = serviceIcons[service.slug];
                  const color = serviceColors[service.slug];
                  return (
                    <li key={service.slug}>
                      <a
                        href={service.href}
                        className="group flex h-full items-start gap-4 rounded-[18px] border border-line bg-card p-5 shadow-soft transition-shadow duration-300 hover:shadow-lift"
                      >
                        <span
                          className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-[12px] bg-[color-mix(in_srgb,var(--c)_14%,transparent)] text-[var(--c)]"
                          style={{ "--c": color } as CSSProperties}
                        >
                          <Icon icon={ServiceIcon} size={20} />
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink group-hover:text-accent">
                            {service.name}
                          </p>
                          <p className="mt-0.5 text-sm leading-snug text-body">
                            {service.menuDescription}
                          </p>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Container>
        </section>
      ) : null}

      {/* How we work - 4-step summary */}
      {showProcess ? (
        <section
          aria-labelledby="how-title"
          className="border-t border-line bg-bg-soft py-20 md:py-24"
        >
          <Container>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
              <div>
                <RevealText
                  as="h2"
                  id="how-title"
                  text={processPage.title}
                  className="type-h2 text-ink"
                />
                <p className="mt-4 max-w-[34ch] text-[1.0625rem] leading-relaxed text-body">
                  The same four steps on every project, written down so there are no surprises on
                  either side.
                </p>
                <div className="mt-8">
                  <Button href="/process" variant="secondary">
                    See the full process
                    <ArrowRight size={16} aria-hidden="true" />
                  </Button>
                </div>
              </div>
              <ol className="grid gap-3 sm:grid-cols-2">
                {processSteps.map((step, i) => (
                  <li
                    key={step.title}
                    className="flex flex-col gap-3 rounded-[18px] border border-line bg-card p-5 shadow-soft"
                  >
                    <span
                      className="font-display text-3xl leading-none font-extrabold text-accent"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-body">{step.short}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Container>
        </section>
      ) : null}

      {/* Who we work with */}
      {showClients ? (
        <section aria-labelledby="clients-title" className="border-t border-line py-20 md:py-24">
          <Container>
            <SectionIntro
              id="clients-title"
              title="Who we work with"
              align="left"
              lead={idealClient.trim().length > 0 ? idealClient : undefined}
            />
            {industries.length > 0 ? (
              <Reveal
                as="ul"
                className="mt-10 flex flex-wrap gap-2.5"
                style={{ "--n": industries.length } as CSSProperties}
              >
                {industries.map((industry, i) => (
                  <li
                    key={industry}
                    style={{ "--i": i } as CSSProperties}
                    className="rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold text-ink shadow-soft"
                  >
                    {industry}
                  </li>
                ))}
              </Reveal>
            ) : null}
            {clientLogos.length > 0 ? (
              <div className="mt-12">
                <p className="mb-6 text-sm font-semibold text-muted">
                  Clients who have given permission to be named
                </p>
                <ul className="flex flex-wrap items-center gap-8">
                  {clientLogos.map((logo) => (
                    <li key={logo.name}>
                      <Image
                        src={`/logos/${logo.file}`}
                        alt={logo.name}
                        width={logo.width}
                        height={logo.height}
                        className="h-8 w-auto opacity-70 transition-opacity hover:opacity-100"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Container>
        </section>
      ) : null}

      {/* Proof: client quotes and results, or the "How we prove it" fallback */}
      {showProof ? (
        <section
          aria-labelledby="proof-title"
          className="border-t border-line bg-bg-soft py-20 md:py-24"
        >
          <Container>
            <SectionIntro id="proof-title" title="What clients say" />
            {resultFigures.length > 0 ? (
              <dl className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
                {resultFigures.map((fig) => (
                  <div
                    key={fig.label}
                    className="flex flex-col gap-1 rounded-[18px] border border-line bg-card p-6 shadow-soft"
                  >
                    <dt className="font-display text-[2.25rem] leading-none font-extrabold tracking-tight text-accent">
                      {fig.value}
                    </dt>
                    <dd className="text-sm font-semibold text-body">{fig.label}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {clientQuotes.length > 0 ? (
              <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {clientQuotes.map((q) => (
                  <li
                    key={q.name}
                    className="flex flex-col gap-5 rounded-[20px] border border-line bg-card p-6 shadow-soft"
                  >
                    <blockquote className="flex-1 text-[1.0625rem] leading-relaxed text-ink">
                      <span aria-hidden="true" className="mr-1 text-accent">
                        &ldquo;
                      </span>
                      {q.quote}
                      <span aria-hidden="true" className="ml-1 text-accent">
                        &rdquo;
                      </span>
                    </blockquote>
                    <footer className="text-sm">
                      <p className="font-semibold text-ink">{q.name}</p>
                      <p className="text-muted">
                        {q.role}
                        {q.company ? `, ${q.company}` : ""}
                      </p>
                    </footer>
                  </li>
                ))}
              </ul>
            ) : null}
          </Container>
        </section>
      ) : (
        <section
          aria-labelledby="proof-title"
          className="border-t border-line bg-bg-soft py-20 md:py-24"
        >
          <Container>
            <SectionIntro
              id="proof-title"
              title="How we prove it"
              lead="We do not publish numbers we cannot back up or quotes we do not have permission to use. Here is what we do instead."
            />
            <ul className="mt-10 grid gap-5 sm:grid-cols-3">
              {[
                {
                  heading: "Staging from week one",
                  body: "Every project has a staging link from the first week. You see working software on your own devices, not screenshots or mockups.",
                },
                {
                  heading: "Scope in writing",
                  body: "The written scope is the proof of the price. If we missed something, we fix it. If you add something, we price it first.",
                },
                {
                  heading: "Accounts in your name",
                  body: "When the project ends, nothing has to be transferred. You already own every account, every repository, and every credential.",
                },
              ].map((item) => (
                <li
                  key={item.heading}
                  className="flex flex-col gap-3 rounded-[20px] border border-line bg-card p-6 shadow-soft"
                >
                  <span className="grid size-10 place-items-center rounded-[12px] bg-accent-soft text-accent">
                    <CheckCircle2 size={20} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="type-h4 text-ink">{item.heading}</h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-body">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Contact details - only if at least one fact is known */}
      {showContact ? (
        <section
          aria-labelledby="about-contact-title"
          className="border-t border-line py-20 md:py-24"
        >
          <Container>
            <SectionIntro id="about-contact-title" title={aboutPage.contactTitle} align="left" />
            <div className="mt-10 max-w-xl">
              <ContactDetails showBooking />
            </div>
          </Container>
        </section>
      ) : null}

      {/* Closing CTA - founder note + email link beside the primary button */}
      <ClosingCta
        founderNote="Every brief goes directly to the founders, who read and reply personally."
        contactEmail={siteContent.email}
      />
    </>
  );
}
