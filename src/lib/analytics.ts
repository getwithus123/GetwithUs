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

/**
 * The visitor's cookie choice. "unavailable" until PostHog has loaded, and for
 * good when analytics is off, blocked, or the visitor sends Do Not Track (which
 * PostHog reads as "denied").
 */
export type ConsentStatus = "unavailable" | "pending" | "granted" | "denied";
export type ConsentView = { status: ConsentStatus; open: boolean };

/** Elements whose text never appears in session recordings (typed details shown back, such as an email). */
export const PRIVATE_TEXT = "[data-private]";

let client: PostHog | null = null;
let started = false;
// Events from before PostHog has loaded; a handful at most, so the cap only guards against a loop.
const queue: [AnalyticsEvent, EventProperties | undefined][] = [];
const QUEUE_LIMIT = 20;

const UNAVAILABLE: ConsentView = { status: "unavailable", open: false };
let consent: ConsentView = UNAVAILABLE;
const listeners = new Set<() => void>();

function setConsent(next: ConsentView): void {
  consent = next;
  for (const listener of listeners) listener();
}

/** For useSyncExternalStore: the cookie banner re-renders when the choice changes. */
export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export const getConsent = (): ConsentView => consent;
export const getServerConsent = (): ConsentView => UNAVAILABLE;

/** Records an event, or holds it until PostHog has loaded. Does nothing while analytics is off. */
export function track(event: AnalyticsEvent, properties?: EventProperties): void {
  if (!publicEnv.posthogKey) return;
  if (client) client.capture(event, properties);
  else if (queue.length < QUEUE_LIMIT) queue.push([event, properties]);
}

/**
 * Accept: cookies, session recording, and one visitor across visits.
 * Decline: back to anonymous counting with no cookies, and any recording stops.
 */
export function chooseConsent(accept: boolean): void {
  if (!client) return;
  if (accept) client.opt_in_capturing();
  else client.opt_out_capturing();
  setConsent({ status: accept ? "granted" : "denied", open: false });
}

/** Opens the cookie banner again, from "Cookie settings" in the footer. */
export function openConsentSettings(): void {
  if (consent.status === "unavailable") return;
  setConsent({ ...consent, open: true });
}

/**
 * Ties this visitor's recordings and events to a lead, so the lead's visits can
 * be found in PostHog by its id. Only with consent: an anonymous visitor stays
 * anonymous. The id is random; no name or email goes to PostHog.
 */
export function identifyLead(leadId: string): void {
  if (client?.get_explicit_consent_status() === "granted") client.identify(leadId);
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

// The last part stops at a dot, so a full stop after the address is left as it is.
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@.]+/g;

async function load(key: string): Promise<void> {
  const { default: posthog } = await import("posthog-js");
  posthog.init(key, {
    api_host: ANALYTICS_PATH,
    ui_host: posthogHosts(publicEnv.posthogRegion).app,
    defaults: "2026-08-30",
    // Until a visitor accepts cookies (and after they decline), PostHog stores nothing in the
    // browser and counts them with a daily-rotating hash on its servers. "Cookieless tracking"
    // must be on in the project settings (Settings, Project, Web analytics) or PostHog drops
    // these events. opt_out_capturing_by_default makes "not answered yet" count this way too;
    // without it PostHog would send nothing at all until the banner is answered.
    cookieless_mode: "on_reject",
    opt_out_capturing_by_default: true,
    person_profiles: "identified_only",
    capture_pageview: "history_change",
    capture_pageleave: true,
    capture_performance: { web_vitals: true, network_timing: false },
    capture_exceptions: false,
    // Recording runs only after "Accept", and only while "Record user sessions" is on in
    // the project settings. Every input is masked, and inside PRIVATE_TEXT so is any email.
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: PRIVATE_TEXT,
      maskTextFn: (text) => text.replace(EMAIL, (address) => "*".repeat(address.length)),
      recordHeaders: false,
      recordBody: false,
    },
    enable_heatmaps: true,
    disable_surveys: true,
    disable_product_tours: true,
    disable_conversations: true,
    disable_web_experiments: true,
    // No feature flags; the project's settings (recording, heatmaps) still load.
    advanced_disable_feature_flags: true,
    respect_dnt: true,
    before_send: (event) => (event && isTeamPage(event.properties.$current_url) ? null : event),
  });
  client = posthog;
  const status = posthog.get_explicit_consent_status();
  setConsent({ status, open: status === "pending" });
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
