import type { PostHog } from "posthog-js";
import { ANALYTICS_PATH, posthogHosts } from "@/config/analytics";
import { publicEnv } from "@/config/public-env";

/** The product events the site sends. Pageviews, clicks, and page speed are captured automatically. */
export type AnalyticsEvent =
  | "form_started"
  | "brief_step_completed"
  | "lead_submitted"
  | "lead_email_verified"
  | "terminal_brief_handoff"
  | "contact_clicked";

/** Facts about what someone chose, never what they typed. */
type EventProperties = Record<string, string | number | boolean | readonly string[]>;

let client: PostHog | null = null;
let started = false;
// Events from before PostHog has loaded; a handful at most, so the cap only guards against a loop.
const queue: [AnalyticsEvent, EventProperties | undefined][] = [];
const QUEUE_LIMIT = 20;

/** Records an event, or holds it until PostHog has loaded. Does nothing while analytics is off. */
export function track(event: AnalyticsEvent, properties?: EventProperties): void {
  if (!publicEnv.posthogKey) return;
  if (client) client.capture(event, properties);
  else if (queue.length < QUEUE_LIMIT) queue.push([event, properties]);
}

/** Team pages are never measured. */
function isTeamPage(url: unknown): boolean {
  if (typeof url !== "string") return false;
  try {
    return new URL(url).pathname.startsWith("/admin");
  } catch {
    return false;
  }
}

async function load(key: string): Promise<void> {
  const { default: posthog } = await import("posthog-js");
  posthog.init(key, {
    api_host: ANALYTICS_PATH,
    ui_host: posthogHosts(publicEnv.posthogRegion).app,
    defaults: "2026-08-30",
    // No cookies or browser storage, so no consent banner. PostHog counts visitors with a
    // daily-rotating hash on its servers; "cookieless tracking" must be on in the project
    // settings (Settings, Project, Web analytics) or PostHog drops these events.
    cookieless_mode: "always",
    person_profiles: "identified_only",
    capture_pageview: "history_change",
    capture_pageleave: true,
    capture_performance: { web_vitals: true, network_timing: false },
    capture_exceptions: false,
    disable_session_recording: true,
    disable_surveys: true,
    disable_product_tours: true,
    disable_conversations: true,
    disable_web_experiments: true,
    advanced_disable_flags: true,
    respect_dnt: true,
    before_send: (event) => (event && isTeamPage(event.properties.$current_url) ? null : event),
  });
  client = posthog;
  for (const [event, properties] of queue.splice(0)) posthog.capture(event, properties);
}

/**
 * Loads PostHog once the page has loaded and the browser is idle, so analytics
 * never competes with the first render. Safe to call more than once.
 */
export function startAnalytics(): void {
  const key = publicEnv.posthogKey;
  if (!key || started) return;
  started = true;
  const run = () => {
    load(key).catch(() => {
      // Blocked or offline: the site works the same without analytics.
    });
  };
  // Older Safari has no requestIdleCallback, although the DOM types say every browser does.
  const idle: typeof window.requestIdleCallback | undefined = window.requestIdleCallback;
  const whenIdle = () => {
    if (idle) idle(run, { timeout: 4000 });
    else window.setTimeout(run, 1500);
  };
  if (document.readyState === "complete") whenIdle();
  else window.addEventListener("load", whenIdle, { once: true });
}
