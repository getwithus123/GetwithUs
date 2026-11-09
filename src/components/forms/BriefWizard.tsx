"use client";

import { useEffect, useRef, useState } from "react";
import BriefProgress from "@/components/forms/BriefProgress";
import BudgetStep from "@/components/forms/steps/BudgetStep";
import DetailsStep from "@/components/forms/steps/DetailsStep";
import ProjectStep from "@/components/forms/steps/ProjectStep";
import ServicesStep from "@/components/forms/steps/ServicesStep";
import SuccessStep from "@/components/forms/SuccessStep";
import VerifyCodeStep from "@/components/forms/VerifyCodeStep";
import Skeleton from "@/components/ui/Skeleton";
import { formCopy } from "@/content/forms";
import { serviceSlugs } from "@/content/services/catalog";
import { track } from "@/lib/analytics";
import { useBriefStore } from "@/stores/brief.store";

/**
 * A service named in the URL (`/start?service=web-development`, from the
 * pricing cards and service pages) starts the brief with that service chosen,
 * unless the visitor has already picked services in this session.
 */
function preselectService() {
  const slug = new URLSearchParams(window.location.search).get("service");
  const state = useBriefStore.getState();
  if (!slug || !(serviceSlugs as readonly string[]).includes(slug)) return;
  if (state.step !== 1 || state.draft.services.length > 0) return;
  state.update({ services: [slug] });
}

/** Restores the saved draft from sessionStorage after mount, so server and client render the same first frame. */
function useBriefHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsubscribe = useBriefStore.persist.onFinishHydration(() => {
      preselectService();
      setHydrated(true);
    });
    void useBriefStore.persist.rehydrate();
    return unsubscribe;
  }, []);
  return hydrated;
}

/**
 * The five-step project brief in one large panel. Each step validates before
 * Continue; the draft survives Back and refresh; step 5 confirms the email.
 */
export default function BriefWizard() {
  const hydrated = useBriefHydration();
  const step = useBriefStore((state) => state.step);
  const pending = useBriefStore((state) => state.pending);
  const done = useBriefStore((state) => state.done);
  const resent = useBriefStore((state) => state.resent);
  const editEmail = useBriefStore((state) => state.editEmail);
  const finish = useBriefStore((state) => state.finish);
  const panel = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const lastStep = useRef<number | null>(null);

  // Each step moved past counts once for the funnel. A draft restored at a later step does not.
  useEffect(() => {
    if (!hydrated) return;
    if (lastStep.current !== null && step > lastStep.current) {
      track("brief_step_completed", { step: lastStep.current });
    }
    lastStep.current = step;
  }, [hydrated, step]);

  // After the first frame, every step change moves focus to the new step's heading.
  useEffect(() => {
    if (!hydrated) return;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    panel.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus();
  }, [hydrated, step]);

  const body = !hydrated ? (
    <div className="grid gap-6" aria-hidden="true">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-11 w-32" />
    </div>
  ) : done ? (
    <SuccessStep message={formCopy.success.brief} />
  ) : step === 5 && pending ? (
    <VerifyCodeStep
      leadId={pending.leadId}
      email={pending.email}
      subject="brief"
      resendAvailableAt={pending.resendAvailableAt}
      onVerified={finish}
      onResent={resent}
      onChangeEmail={editEmail}
    />
  ) : step === 2 ? (
    <ProjectStep />
  ) : step === 3 ? (
    <BudgetStep />
  ) : step === 4 || step === 5 ? (
    <DetailsStep />
  ) : (
    <ServicesStep />
  );

  return (
    <div ref={panel} className="grid gap-10 rounded-panel border border-line bg-card p-6 md:p-10">
      <BriefProgress step={hydrated ? step : 1} done={done} />
      {body}
    </div>
  );
}
