import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Code,
  Eye,
  FileText,
  Key,
  MessageSquare,
  Pencil,
  RefreshCw,
  Rocket,
  Shield,
} from "lucide-react";
import type { CSSProperties } from "react";
import Reveal from "@/components/motion/Reveal";
import ProcessStepper from "@/components/motion/ProcessStepper";
import ClosingCta from "@/components/sections/ClosingCta";
import PageHero from "@/components/sections/PageHero";
import ModelStill from "@/components/three/ModelStill";
import WebGLModel from "@/components/three/WebGLModel";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Icon from "@/components/ui/Icon";
import SectionIntro from "@/components/ui/SectionIntro";
import AnimatedGif from "@/components/ui/AnimatedGif";
import { isFilled, known, site } from "@/config/site";
import { processPage } from "@/content/pages";
import {
  processStats,
  processSteps,
  sampleWeek,
  workingTogether,
} from "@/content/process";
import { pageMetadata } from "@/lib/seo";
import type { LucideIcon } from "lucide-react";

export const metadata = pageMetadata({
  title: processPage.title,
  description: processPage.description,
  path: processPage.path,
});

const STEP_ICONS = [FileText, Code, Rocket, RefreshCw];

const WORKING_ICONS: Record<string, LucideIcon> = {
  message: MessageSquare,
  eye: Eye,
  pencil: Pencil,
  key: Key,
  clock: Clock,
  shield: Shield,
};

const DAY_COLORS: Record<string, string> = {
  Plan: "var(--c-web)",
  Build: "var(--accent)",
  Test: "var(--c-mob)",
  Demo: "var(--ok)",
};

function CheckList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">{title}</p>
      <ul className="grid gap-2.5">
        {items.filter(isFilled).map((item) => (
          <li key={item} className="flex gap-2.5 text-[0.9375rem] text-body">
            <CheckCircle2
              size={16}
              strokeWidth={2.2}
              className="mt-0.5 shrink-0 text-ok"
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepDetail({
  step,
  youGetTitle,
  needFromYouTitle,
}: {
  step: (typeof processSteps)[number];
  youGetTitle: string;
  needFromYouTitle: string;
}) {
  return (
    <>
      <p className="max-w-[60ch] text-[1.0625rem] leading-relaxed text-body">{step.detail}</p>
      <div className="mt-6 grid gap-5 rounded-[14px] border border-line bg-bg-soft p-5 sm:grid-cols-[1fr_1px_1fr]">
        <CheckList title={needFromYouTitle} items={step.needFromYou} />
        <div className="hidden w-px self-stretch bg-line sm:block" aria-hidden="true" />
        <CheckList title={youGetTitle} items={step.youGet} />
      </div>
    </>
  );
}

/** Highlighted number + label strip between sections */
function StatStrip() {
  return (
    <div className="border-y border-line bg-bg-soft py-10">
      <Container>
        <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {processStats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <dt className="font-display text-[2.25rem] font-extrabold leading-none tracking-tight text-accent">
                {stat.value}
              </dt>
              <dd className="text-sm font-semibold text-body">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </div>
  );
}

export default function ProcessPage() {
  const steps = processSteps.map((step, index) => {
    const StepIcon = STEP_ICONS[index] ?? FileText;
    return {
      title: step.title,
      icon: <StepIcon strokeWidth={1.6} />,
      detail: (
        <StepDetail
          step={step}
          youGetTitle={processPage.youGetTitle}
          needFromYouTitle={processPage.needFromYouTitle}
        />
      ),
    };
  });

  return (
    <>
      <PageHero
        id="process-title"
        title={processPage.title}
        lead="The same four steps on every project, written down, priced in advance, and visible from day one. No surprises."
        crumbs={[
          { name: "Home", path: "/" },
          { name: processPage.title, path: processPage.path },
        ]}
        actions={
          <>
            <Button href="/start" size="lg">
              Start a project
            </Button>
            <Button href="#steps-title" variant="secondary" size="lg">
              See the steps
            </Button>
          </>
        }
        visual={<WebGLModel model="process-steps" still={<ModelStill model="process-steps" />} label="Four project stages  - Discover, Scope, Build, Launch  - connected on a rising staircase" />}
      />

      <StatStrip />

      {/* Steps */}
      <section
        aria-labelledby="steps-title"
        className="dots-bg border-b border-line bg-bg-soft py-20 md:py-24"
      >
        <Container>
          <SectionIntro
            id="steps-title"
            title="Four steps, the same every time"
            lead="Select a step to see what happens, what we need from you, and what you walk away with."
          />
          <ProcessStepper
            steps={steps}
            label={processPage.title}
            className="mt-14 [&_.stepper-detail]:max-w-[900px]"
          />
        </Container>
      </section>

      {/* Build-test-deploy GIF: illustrates the weekly cycle */}
      <section aria-hidden="true" className="border-b border-line py-14 md:py-16">
        <Container>
          <AnimatedGif
            src="/animations/03-build-test-deploy.gif"
            width={960}
            height={540}
            caption="Build, test, and deploy: every week, on a staging link you can open."
            className="mx-auto max-w-[720px]"
          />
        </Container>
      </section>

      {/* Sample week */}
      <section aria-labelledby="week-title" className="py-20 md:py-24">
        <Container>
          <SectionIntro
            id="week-title"
            align="left"
            title="A sample build week"
            lead="Every week follows the same shape. You always know what day something happens and what to expect at the end of it."
          />
          <div className="relative mt-12">
            {/* Connector line - hidden on mobile, visible from lg */}
            <div
              className="absolute top-[52px] right-[calc(100%/10)] left-[calc(100%/10)] hidden h-px bg-line lg:block"
              aria-hidden="true"
            />
            <Reveal
              as="ol"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
              style={{ "--n": sampleWeek.length } as CSSProperties}
            >
              {sampleWeek.map((day, index) => (
                <li
                  key={day.day}
                  style={
                    {
                      "--i": index,
                      "--day-c": DAY_COLORS[day.label] ?? "var(--accent)",
                    } as CSSProperties
                  }
                  className="relative flex flex-col rounded-[18px] border border-line bg-card p-5 shadow-soft"
                >
                  {/* Day dot */}
                  <div
                    className="relative z-10 mb-4 flex size-[42px] items-center justify-center rounded-full border-2 border-[var(--day-c)] bg-card"
                    aria-hidden="true"
                  >
                    <span
                      className="text-xs font-extrabold"
                      style={{ color: "var(--day-c)" }}
                    >
                      {day.day}
                    </span>
                  </div>
                  <p
                    className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em]"
                    style={{ color: "var(--day-c)" }}
                  >
                    {day.label}
                  </p>
                  <p className="text-[0.9375rem] leading-snug text-ink">{day.text}</p>
                </li>
              ))}
            </Reveal>
          </div>
          <p className="mt-6 text-sm text-muted">
            Weeks repeat until launch. The scope document names exactly how many weeks.
          </p>
        </Container>
      </section>

      {/* Working together */}
      <section
        aria-labelledby="working-together-title"
        className="border-t border-line bg-bg-soft py-20 md:py-24"
      >
        <Container>
          <SectionIntro
            id="working-together-title"
            title="How we work together"
            lead="The practices that make a project feel predictable instead of stressful."
          />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {workingTogether.map((item) => {
              const ItemIcon = WORKING_ICONS[item.icon] ?? CheckCircle2;
              return (
                <li
                  key={item.title}
                  className="flex flex-col gap-4 rounded-[20px] border border-line bg-card p-6 shadow-soft"
                >
                  <span className="grid size-10 place-items-center rounded-[12px] bg-accent-soft text-accent">
                    <Icon icon={ItemIcon} size={20} />
                  </span>
                  <div>
                    <h3 className="type-h4 text-ink">{item.title}</h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-body">{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* FAQ-style reassurance strip */}
      <section aria-labelledby="written-title" className="border-t border-line py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-[720px]">
            <h2
              id="written-title"
              className="type-h2 text-ink"
            >
              Everything that matters is in writing
            </h2>
            <p className="mt-4 max-w-[54ch] type-lead text-body">
              Before any work starts you have a document with the scope, timeline, price, and payment schedule. Every change, every addition, every fix window is added to that document, not agreed verbally and forgotten.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                {
                  q: "What if requirements change mid-project?",
                  a: "We write up a change request with the impact on scope, timeline, and price. You approve it or we do not build it. The original scope and price do not change without your signature.",
                },
                {
                  q: "Who owns the code and accounts when we finish?",
                  a: "You do, once the project is paid for. Code goes into a repository in your name from day one, and every other account, such as the domain, hosting, and analytics, is opened in your name, never ours.",
                },
                {
                  q: "What does the fix window cover?",
                  a: `Anything we built that does not work as the scope described. The ${known(site.fixWindow) ?? "fix"} window starts on launch day and is stated in the contract.`,
                },
                {
                  q: "How do I know the project is on track?",
                  a: "Every Friday you get a staging link with the latest build and a written note of what changed. The project board is always visible to you. No update meeting needed.",
                },
              ].map((item) => (
                <div
                  key={item.q}
                  className="rounded-[16px] border border-line bg-card p-5 shadow-soft"
                >
                  <div className="flex items-start gap-3">
                    <ArrowRight
                      size={16}
                      strokeWidth={2}
                      className="mt-1 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-semibold text-ink">{item.q}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-body">{item.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/start" size="lg">
                Start a project
              </Button>
              <Button href="/contact" variant="secondary" size="lg">
                Ask a question
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <ClosingCta />
    </>
  );
}
