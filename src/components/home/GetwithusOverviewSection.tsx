import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ModelStill from "@/components/three/ModelStill";
import WebGLModel from "@/components/three/WebGLModel";
import Container from "@/components/ui/Container";
import Icon from "@/components/ui/Icon";

/**
 * "One team, from idea to launch"  - the GetwithUs overview section.
 *
 * Sits between <HomeFaq /> and <CtaSection /> on the home page. Shows the
 * 3D model on one side and a short heading, description and service links on
 * the other. On mobile the text comes first; on desktop they sit side by side.
 *
 * Copy is kept here so it is easy to edit without touching the page component.
 */

const HEADING = "One team, from idea to launch";
const BODY    = "Websites, apps, automation and marketing, run through the same four steps.";

const SERVICE_LINKS = [
  { label: "Web development",  href: "/services/web-development"  },
  { label: "App development",  href: "/services/app-development"  },
  { label: "Automation",       href: "/services/agentic-automation" },
  { label: "Digital marketing",href: "/services/digital-marketing"  },
] as const;

const PROCESS_LINK = { label: "How a project runs", href: "/process" };

const MODEL_LABEL =
  "The GetwithUs logo with web, app, automation and marketing services around it, and the four project steps below";

export default function GetwithusOverviewSection() {
  return (
    <section
      aria-labelledby="getwithus-overview-title"
      className="border-t border-line py-20 md:py-[120px]"
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          {/* Text column  - first on mobile, left on desktop */}
          <div>
            <h2
              id="getwithus-overview-title"
              className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-[1.08] tracking-tight text-ink"
            >
              {HEADING}
            </h2>
            <p className="mt-5 max-w-[36em] text-[1.0625rem] leading-relaxed text-body">
              {BODY}
            </p>

            {/* Service links */}
            <ul className="mt-8 grid gap-2 sm:grid-cols-2">
              {SERVICE_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2 text-[0.9375rem] font-semibold text-ink transition-colors duration-150 hover:text-accent"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-accent transition-colors duration-150 group-hover:bg-accent group-hover:text-white">
                      <Icon icon={ArrowRight} size={16} />
                    </span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Process link */}
            <div className="mt-6">
              <Link
                href={PROCESS_LINK.href}
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
              >
                {PROCESS_LINK.label}
                <Icon
                  icon={ArrowRight}
                  size={16}
                  className="transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>

          {/* 3D model panel  - second on mobile, right on desktop */}
          <div>
            <WebGLModel
              model="getwithus-overview"
              still={<ModelStill model="getwithus-overview" />}
              label={MODEL_LABEL}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
