import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import TiltCard from "@/components/motion/TiltCard";
import CaseStudyCard from "@/components/sections/CaseStudyCard";
import ClosingCta from "@/components/sections/ClosingCta";
import PageHero from "@/components/sections/PageHero";
import ModelStill from "@/components/three/ModelStill";
import WebGLModel from "@/components/three/WebGLModel";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Icon from "@/components/ui/Icon";
import { workPage } from "@/content/pages";
import { getPublishedCaseStudies } from "@/features/case-studies/getPublishedCaseStudies";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: workPage.title,
    description: workPage.description,
    path: workPage.path,
  }),
  // Until a case study is published the page is empty: kept out of search results,
  // as it is already left out of the sitemap and the navigation.
  ...(getPublishedCaseStudies().length > 0 ? {} : { robots: { index: false, follow: true } }),
};

/** /work: project folders that fan out (closed while there is nothing to show), and the case studies as tilting cards. */
export default function WorkPage() {
  const studies = getPublishedCaseStudies();
  const model = studies.length > 0 ? "folders" : "folders-closed";
  return (
    <>
      <PageHero
        id="work-title"
        title={workPage.title}
        lead={studies.length > 0 ? workPage.lead : workPage.emptyLead}
        crumbs={[
          { name: "Home", path: "/" },
          { name: workPage.title, path: workPage.path },
        ]}
        visual={<WebGLModel model={model} still={<ModelStill model={model} />} />}
      />
      <section aria-label="Case studies" className="py-20 md:py-24">
        <Container>
          {studies.length > 0 ? (
            <ul className="grid gap-6 [perspective:1400px] md:grid-cols-2 lg:grid-cols-3">
              {studies.map((study) => (
                <li key={study.slug}>
                  <TiltCard maxDeg={6} className="h-full rounded-card">
                    <CaseStudyCard study={study} />
                  </TiltCard>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mx-auto grid max-w-xl justify-items-center rounded-card border border-line bg-card p-10 text-center shadow-soft">
              <span className="grid size-14 place-items-center rounded-[16px] bg-accent-soft text-accent">
                <Icon icon={Inbox} size={24} />
              </span>
              <h2 className="mt-5 type-h3 text-ink">{workPage.emptyTitle}</h2>
              <p className="mt-2 text-body">{workPage.emptyText}</p>
              <Button href={workPage.emptyAction.href} className="mt-6">
                {workPage.emptyAction.label}
              </Button>
            </div>
          )}
        </Container>
      </section>
      <ClosingCta />
    </>
  );
}
