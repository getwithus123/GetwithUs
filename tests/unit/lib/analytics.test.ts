import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as AnalyticsModule from "@/lib/analytics";

const publicEnv = vi.hoisted(() => ({
  posthogKey: "phc_test" as string | undefined,
  posthogRegion: "us" as const,
}));
vi.mock("@/config/public-env", () => ({ publicEnv }));

const posthog = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  identify: vi.fn(),
  opt_in_capturing: vi.fn(),
  opt_out_capturing: vi.fn(),
  get_explicit_consent_status: vi.fn((): "pending" | "granted" | "denied" => "pending"),
}));
vi.mock("posthog-js", () => ({ default: posthog }));

type Analytics = typeof AnalyticsModule;
type InitOptions = {
  cookieless_mode: string;
  opt_out_capturing_by_default: boolean;
  session_recording: {
    maskAllInputs: boolean;
    maskTextSelector: string;
    maskTextFn: (text: string) => string;
  };
  before_send: (event: { properties: Record<string, unknown> }) => unknown;
};

/** A fresh copy of the module (its state is per page load), started in a browser that is already idle. */
async function startFresh(): Promise<Analytics> {
  vi.resetModules();
  const analytics = await import("@/lib/analytics");
  analytics.startAnalytics();
  await vi.waitFor(() => expect(posthog.init).toHaveBeenCalled());
  return analytics;
}

const initOptions = () => posthog.init.mock.calls[0][1] as InitOptions;

beforeEach(() => {
  vi.stubGlobal("document", { readyState: "complete" });
  vi.stubGlobal("window", { requestIdleCallback: (run: () => void) => run() });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  publicEnv.posthogKey = "phc_test";
  posthog.get_explicit_consent_status.mockImplementation(() => "pending");
});

describe("analytics", () => {
  it("does nothing while the key is unset", async () => {
    publicEnv.posthogKey = undefined;
    vi.resetModules();
    const analytics = await import("@/lib/analytics");
    analytics.startAnalytics();
    analytics.track("form_started", { form: "contact" });
    await Promise.resolve();
    expect(posthog.init).not.toHaveBeenCalled();
    expect(analytics.getConsent()).toEqual({ status: "unavailable", open: false });
  });

  it("counts visitors without cookies until they accept, and opens the banner", async () => {
    const analytics = await startFresh();
    expect(initOptions()).toMatchObject({
      cookieless_mode: "on_reject",
      opt_out_capturing_by_default: true,
    });
    expect(analytics.getConsent()).toEqual({ status: "pending", open: true });
  });

  it("sends events from before PostHog loaded", async () => {
    vi.resetModules();
    const analytics = await import("@/lib/analytics");
    analytics.track("form_started", { form: "brief" });
    analytics.startAnalytics();
    await vi.waitFor(() =>
      expect(posthog.capture).toHaveBeenCalledWith("form_started", { form: "brief" }),
    );
  });

  it("does not ask again once the visitor has chosen", async () => {
    posthog.get_explicit_consent_status.mockImplementation(() => "denied");
    const analytics = await startFresh();
    expect(analytics.getConsent()).toEqual({ status: "denied", open: false });
  });

  it("opts in on Accept and out on Decline, and closes the banner", async () => {
    const analytics = await startFresh();
    const changes = vi.fn();
    analytics.subscribeConsent(changes);

    analytics.chooseConsent(true);
    expect(posthog.opt_in_capturing).toHaveBeenCalled();
    expect(analytics.getConsent()).toEqual({ status: "granted", open: false });

    analytics.openConsentSettings();
    expect(analytics.getConsent()).toEqual({ status: "granted", open: true });

    analytics.chooseConsent(false);
    expect(posthog.opt_out_capturing).toHaveBeenCalled();
    expect(analytics.getConsent()).toEqual({ status: "denied", open: false });
    expect(changes).toHaveBeenCalledTimes(3);
  });

  it("ties a lead to the visitor only with consent", async () => {
    const analytics = await startFresh();
    analytics.identifyLead("lead-1");
    expect(posthog.identify).not.toHaveBeenCalled();

    posthog.get_explicit_consent_status.mockImplementation(() => "granted");
    analytics.identifyLead("lead-1");
    expect(posthog.identify).toHaveBeenCalledWith("lead-1");
  });

  it("hides inputs and shown-back emails from recordings", async () => {
    await startFresh();
    const { session_recording } = initOptions();
    expect(session_recording.maskAllInputs).toBe(true);
    expect(session_recording.maskTextSelector).toBe("[data-private]");
    expect(session_recording.maskTextFn("We sent a code to ana@example.com. Enter it.")).toBe(
      "We sent a code to ***************. Enter it.",
    );
  });

  it("never sends events from the team's admin pages", async () => {
    await startFresh();
    const { before_send } = initOptions();
    const admin = { properties: { $current_url: "https://getwithus.in/admin/leads" } };
    const page = { properties: { $current_url: "https://getwithus.in/about" } };
    expect(before_send(admin)).toBeNull();
    expect(before_send(page)).toBe(page);
  });
});
