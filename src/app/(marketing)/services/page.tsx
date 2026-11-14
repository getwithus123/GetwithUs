import ServiceCards from "@/components/home/ServiceCards";
import ClosingCta from "@/components/sections/ClosingCta";
import PageHero from "@/components/sections/PageHero";
import Pricing from "@/components/sections/Pricing";
import ProcessSection from "@/components/sections/ProcessSection";
import ModelStill from "@/components/three/ModelStill";
import WebGLModel from "@/components/three/WebGLModel";
import Button from "@/components/ui/Button";
import { home } from "@/content/home";
import { servicesPage } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: servicesPage.title,
  description: servicesPage.description,
  path: servicesPage.path,
});

/** The services index: the five models on a turntable, the service cards, the process, and pricing. */
export default function ServicesPage() {
  return (
    <>
      <PageHero
        id="services-page-title"
        title={servicesPage.title}
        lead={servicesPage.lead}
        crumbs={[
          { name: "Home", path: "/" },
          { name: servicesPage.title, path: servicesPage.path },
        ]}
        actions={
          <>
            <Button href="/start" size="lg">
              Start a project
            </Button>
            <Button href="#pricing-title" variant="secondary" size="lg">
              {home.pricing.title}
            </Button>
          </>
        }
        visual={
          <WebGLModel
            model="services-hub"
            still={<ModelStill model="services-hub" />}
            label="Five service lines connected to one way of working"
          />
        }
      />
      <ServiceCards title={servicesPage.listTitle} lead={home.services.lead} />
      <ProcessSection title={servicesPage.processTitle} />
      <Pricing />
      <ClosingCta />
    </>
  );
}
