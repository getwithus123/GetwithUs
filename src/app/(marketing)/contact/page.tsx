import { ArrowRight, CalendarDays, MessageSquare } from "lucide-react";
import type { CSSProperties } from "react";
import AnimatedGif from "@/components/ui/AnimatedGif";
import DeferredForm from "@/components/forms/DeferredForm";
import FormPreview from "@/components/forms/FormPreview";
import ContactDetails, { hasContactDetails } from "@/components/sections/ContactDetails";
import PageHero from "@/components/sections/PageHero";
import ModelStill from "@/components/three/ModelStill";
import WebGLModel from "@/components/three/WebGLModel";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Icon from "@/components/ui/Icon";
import { known, RESPONSE_TIME, site } from "@/config/site";
import { contactPage } from "@/content/pages";
import { cn } from "@/lib/cn";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: contactPage.title,
  description: contactPage.description,
  path: contactPage.path,
});

/** Reassurance steps shown beside the form: what happens after you send */
const NEXT_STEPS = [
  {
    step: "01",
    heading: "We read every message",
    body: "Every message goes directly to the people who do the work. No sales team, no ticketing system.",
  },
  {
    step: "02",
    heading: "You get a direct reply",
    body: RESPONSE_TIME
      ? `We reply within ${RESPONSE_TIME} by email, with specific questions if we need them and a price range where we can give one.`
      : "We reply by email with specific questions if we need them and a price range where we can give one.",
  },
  {
    step: "03",
    heading: "No obligation",
    body: "A message is not a commitment. We tell you what a project would cost and how we would approach it. You decide from there.",
  },
] as const;

const FAQS = [
  {
    q: "What if I am not sure what I need yet?",
    a: "That is fine. Describe the problem you want to solve. We reply by email with questions, and if it helps, we work out the scope together on a short call.",
  },
  {
    q: "How quickly do you reply?",
    a: RESPONSE_TIME
      ? `Within ${RESPONSE_TIME}. We reply faster when things are quieter.`
      : "We reply by email as soon as we can.",
  },
  {
    q: "Do you work with clients outside India?",
    a: "Yes. We work with clients remotely and communicate over email, video, and your preferred messaging app.",
  },
  {
    q: "What happens after the first message?",
    a: "We reply with a few questions if we need more detail, then arrange a short call to align on scope before we write a proposal.",
  },
] as const;

export default function ContactPage() {
  const hasDetails = hasContactDetails(true);
  const email = known(site.contact.email);
  const hasScheduling = Boolean(site.schedulingUrl);

  return (
    <>
      <PageHero
        id="contact-title"
        title={contactPage.title}
        lead={contactPage.lead}
        crumbs={[
          { name: "Home", path: "/" },
          { name: contactPage.title, path: contactPage.path },
        ]}
        actions={
          hasScheduling ? (
            <Button
              href={site.schedulingUrl as string}
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon icon={CalendarDays} size={16} />
              {contactPage.bookCall}
            </Button>
          ) : undefined
        }
        visual={<WebGLModel model="contact-message" still={<ModelStill model="contact-message" />} label="A contact form being filled, a paper plane flying to an inbox, and a reply card appearing" />}
      />

      {/* Form + sidebar */}
      <section aria-label="Contact form" className="py-16 md:py-20">
        <Container
          className={cn(
            "grid items-start gap-10 lg:gap-14",
            "lg:grid-cols-[minmax(0,620px)_minmax(0,1fr)]",
          )}
        >
          {/* Form card */}
          <div className="rounded-panel border border-line bg-card p-6 shadow-soft md:p-10">
            <p className="mb-6 text-sm font-semibold text-muted">{contactPage.formNote}</p>
            <DeferredForm form="contact">
              <FormPreview form="contact" />
            </DeferredForm>
          </div>

          {/* Sidebar */}
          <aside className="grid gap-6 lg:sticky lg:top-[calc(var(--header-h)+24px)]">

            {/* What happens next */}
            <div className="rounded-[20px] border border-line bg-card p-6 shadow-soft">
              <h2 className="type-h4 text-ink">What happens after you send</h2>
              <AnimatedGif
                src="/animations/05-visitor-uses-website.gif"
                width={960}
                height={540}
                className="mt-5 mb-1"
              />
              <ol className="mt-5 grid gap-5">
                {NEXT_STEPS.map((item) => (
                  <li key={item.step} className="flex gap-4">
                    <span
                      className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-xs font-extrabold text-ink"
                      aria-hidden="true"
                    >
                      {item.step}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{item.heading}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-body">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Other ways to reach us - only when facts are known */}
            {hasDetails ? (
              <section
                aria-labelledby="contact-details-title"
                className="rounded-[20px] border border-line bg-bg-soft p-6"
              >
                <h2 id="contact-details-title" className="type-h4 text-ink">
                  {contactPage.detailsTitle}
                </h2>
                <div className="mt-5">
                  <ContactDetails showBooking />
                </div>
              </section>
            ) : null}

            {/* Prefer a brief? */}
            <div className="rounded-[20px] border border-line bg-card p-6 shadow-soft">
              <div className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-accent-soft text-accent">
                  <Icon icon={MessageSquare} size={20} />
                </span>
                <div>
                  <p className="font-semibold text-ink">Starting a project?</p>
                  <p className="mt-1 text-sm leading-relaxed text-body">
                    The project brief asks for a few more details and helps us give you a price
                    range on the first reply.
                  </p>
                  <div className="mt-3">
                    <Button href="/start" variant="secondary" size="sm">
                      Start a project brief
                      <ArrowRight size={14} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </Container>
      </section>

      {/* FAQ */}
      <section
        aria-labelledby="contact-faq-title"
        className="border-t border-line bg-bg-soft py-16 md:py-20"
      >
        <Container>
          <div className="mx-auto max-w-[720px]">
            <h2 id="contact-faq-title" className="type-h3 text-ink">
              Common questions
            </h2>
            <dl className="mt-8 grid gap-5">
              {FAQS.map((item) => (
                <div
                  key={item.q}
                  className="rounded-[16px] border border-line bg-card p-5 shadow-soft"
                  style={{ "--i": 0 } as CSSProperties}
                >
                  <dt className="font-semibold text-ink">{item.q}</dt>
                  <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-body">{item.a}</dd>
                </div>
              ))}
            </dl>
            {email ? (
              <p className="mt-8 text-sm text-muted">
                Prefer email?{" "}
                <a
                  href={`mailto:${email}`}
                  className="link-draw font-semibold text-accent"
                >
                  {email}
                </a>
              </p>
            ) : null}
          </div>
        </Container>
      </section>
    </>
  );
}
