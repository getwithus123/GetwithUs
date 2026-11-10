import { ArrowRight, Check, MessageCircle, Phone, Workflow } from "lucide-react";
import Link from "next/link";
import CallDemo from "@/components/motion/CallDemo";
import ChatDemo from "@/components/motion/ChatDemo";
import AppFlowDemo from "@/components/services/demos/AppFlowDemo";
import HubDemo from "@/components/services/demos/HubDemo";
import SearchDemo from "@/components/services/demos/SearchDemo";
import WebBuildDemo from "@/components/services/demos/WebBuildDemo";
import WorkflowDemo from "@/components/services/demos/WorkflowDemo";
import Container from "@/components/ui/Container";
import Icon from "@/components/ui/Icon";
import SectionIntro from "@/components/ui/SectionIntro";
import TechLogo from "@/components/ui/TechLogo";
import { callDemo, whatsappDemo, workflowDemo } from "@/content/demos";
import { serviceDemos } from "@/content/service-demos";
import type { ServicePage } from "@/content/types";

function Points({ points }: { points: readonly string[] }) {
  return (
    <ul className="grid gap-4">
      {points.map((point) => (
        <li key={point} className="flex gap-3 text-body">
          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
            <Check size={14} strokeWidth={2.6} aria-hidden="true" />
          </span>
          {point}
        </li>
      ))}
    </ul>
  );
}

/** The agentic products under the workflow run, each with a small still preview of its demo. */
function ProductPreviews({ page }: { page: ServicePage }) {
  const previews = [
    {
      icon: MessageCircle,
      lines: [whatsappDemo.steps[0].text, whatsappDemo.steps[3].text],
    },
    {
      icon: Phone,
      lines: [callDemo.lines[0].text, callDemo.lines[3].text],
    },
    {
      icon: Workflow,
      steps: [workflowDemo[0].label, workflowDemo[2].label, workflowDemo[4].label],
    },
  ] as const;
  return (
    // Three across on wide screens; at tablet width an odd last card spans both columns.
    <ul className="mt-10 grid gap-6 md:grid-cols-2 md:[&>li:last-child:nth-child(odd)]:col-span-2 lg:grid-cols-3 lg:[&>li:last-child:nth-child(odd)]:col-span-1">
      {(page.products ?? []).map((product, index) => {
        const preview = previews[index];
        return (
          <li key={product.name}>
            <article className="relative flex h-full flex-col rounded-card border border-line bg-card p-6 shadow-soft transition-shadow duration-300 hover:shadow-lift">
              <div aria-hidden="true" className="grid gap-2 rounded-[16px] bg-bg-soft p-4">
                {preview && "steps" in preview
                  ? preview.steps.map((step) => (
                      <span
                        key={step}
                        className="flex items-center gap-2.5 rounded-[12px] border border-line bg-card px-3 py-2 text-[0.8125rem] text-ink"
                      >
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent text-accent-ink">
                          <Check size={12} strokeWidth={3} />
                        </span>
                        {step}
                      </span>
                    ))
                  : null}
                {(preview && "lines" in preview ? preview.lines : []).map((line, position) => (
                  <span
                    key={line}
                    className={
                      position % 2
                        ? "max-w-[85%] justify-self-end rounded-[12px] bg-accent px-3 py-2 text-[0.8125rem] text-accent-ink"
                        : "max-w-[85%] rounded-[12px] border border-line bg-card px-3 py-2 text-[0.8125rem] text-ink"
                    }
                  >
                    {line}
                  </span>
                ))}
              </div>
              <h3 className="mt-5 flex items-center gap-2.5 type-h4 text-ink">
                {preview ? <Icon icon={preview.icon} size={20} className="text-accent" /> : null}
                {product.href ? (
                  <Link
                    href={product.href}
                    className="after:absolute after:inset-0 after:rounded-card after:content-[''] hover:text-accent"
                  >
                    {product.name}
                  </Link>
                ) : (
                  product.name
                )}
                {/* The arrow promises a page: only shown when the card links to one. */}
                {product.href ? <Icon icon={ArrowRight} size={16} className="text-accent" /> : null}
              </h3>
              <p className="mt-2 text-body">{product.description}</p>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

function Demo({ page }: { page: ServicePage }) {
  const copy = serviceDemos[page.slug];
  switch (page.slug) {
    case "web-development":
      return <WebBuildDemo />;
    case "app-development":
      return (
        <AppFlowDemo
          marks={[
            <TechLogo key="apple" slug="apple" size={24} />,
            <TechLogo key="play" slug="googleplay" size={24} />,
          ]}
        />
      );
    case "agentic-automation":
      return (
        <>
          <WorkflowDemo />
          <ProductPreviews page={page} />
        </>
      );
    case "whatsapp-bot":
      return (
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Points points={copy.points ?? []} />
          <ChatDemo script={whatsappDemo} className="mx-auto w-full max-w-[420px]" />
        </div>
      );
    case "calling-agent":
      return (
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Points points={copy.points ?? []} />
          <CallDemo script={callDemo} className="mx-auto w-full max-w-[460px]" />
        </div>
      );
    case "digital-marketing":
      return <SearchDemo />;
    case "custom-software":
      return <HubDemo />;
  }
}

/** A service page's contextual demo (docs/build-final-prompt.md, section 7.1), on a soft band. */
export default function ServiceDemo({ page }: { page: ServicePage }) {
  const copy = serviceDemos[page.slug];
  return (
    <section
      aria-labelledby="demo-title"
      className="border-b border-line bg-bg-soft py-20 md:py-24"
    >
      <Container>
        <SectionIntro id="demo-title" title={copy.title} lead={copy.lead} />
        <div className="mt-12">
          <Demo page={page} />
        </div>
      </Container>
    </section>
  );
}
