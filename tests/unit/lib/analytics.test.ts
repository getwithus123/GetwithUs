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
  alias: vi.fn(),
  get_property: vi.fn((): unknown => undefined),
  opt_in_capturing: vi.fn(),
  opt_out_capturing: vi.fn(),
  get_explicit_consent_status: vi.fn((): "pending" | "granted" | "denied" => "pending"),
}));
vi.mock("posthog-js", () => ({ default: posthog }));

type Analytics = typeof AnalyticsModule;
type Event = { event: string; properties: Record<string, unknown>; timestamp?: Date };
type InitOptions = {
  cookieless_mode: string;
  opt_out_capturing_by_default: boolean;
  session_recording: {
    maskAllInputs: boolean;
    maskTextSelector: string;
    maskTextFn: (text: string) => string;
  };
  before_send: (event: Event) => Event | null;
};

const location = { href: "https://getwithus.in/contact", pathname: "/contact" };

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
  location.href = "https://getwithus.in/contact";
  location.pathname = "/contact";
  vi.stubGlobal("document", { readyState: "complete" });
  vi.stubGlobal("window", { requestIdleCallback: (run: () => void) => run(), location });
  vi.stubGlobal("navigator", {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  publicEnv.posthogKey = "phc_test";
  posthog.get_explicit_consent_status.mockImplementation(() => "pending");
  posthog.get_property.mockImplementation(() => undefined);
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

  it("sends events from before PostHog loaded, with the page and time they happened on", async () => {
    vi.resetModules();
    const analytics = await import("@/lib/analytics");
    analytics.track("form_started", { form: "brief" });
    location.href = "https://getwithus.in/about";
    analytics.startAnalytics();
    await vi.waitFor(() =>
      expect(posthog.capture).toHaveBeenCalledWith(
        "form_started",
        { form: "brief", $current_url: "https://getwithus.in/contact" },
        { timestamp: expect.any(Date) },
      ),
    );
  });

  it("does not ask again once the visitor has chosen", async () => {
    posthog.get_explicit_consent_status.mockImplementation(() => "denied");
    const analytics = await startFresh();
    expect(analytics.getConsent()).toEqual({ status: "denied", open: false });
  });

  it.each([
    ["Do Not Track", { doNotTrack: "1" }],
    ["Global Privacy Control (Brave)", { globalPrivacyControl: true }],
  ])("offers no choice when the browser sends %s", async (_signal, navigatorValues) => {
    vi.stubGlobal("navigator", navigatorValues);
    posthog.get_explicit_consent_status.mockImplementation(() => "denied");
    const analytics = await startFresh();
    expect(analytics.getConsent()).toEqual({ status: "unavailable", open: false });

    analytics.openConsentSettings();
    analytics.chooseConsent(true);
    expect(analytics.getConsent()).toEqual({ status: "unavailable", open: false });
    expect(posthog.opt_in_capturing).not.toHaveBeenCalled();
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

  it("ties leads to the visitor only with consent, and a second lead to the same person", async () => {
    const analytics = await startFresh();
    analytics.identifyLead("lead-1");
    expect(posthog.identify).not.toHaveBeenCalled();

    posthog.get_explicit_consent_status.mockImplementation(() => "granted");
    analytics.identifyLead("lead-1");
    expect(posthog.identify).toHaveBeenCalledWith("lead-1");

    posthog.get_property.mockImplementation(() => "identified");
    analytics.identifyLead("lead-2");
    expect(posthog.alias).toHaveBeenCalledWith("lead-2");
    expect(posthog.identify).toHaveBeenCalledTimes(1);
  });

  it("hides inputs and shown-back emails from recordings", async () => {
    const analytics = await startFresh();
    const { session_recording } = initOptions();
    expect(session_recording.maskAllInputs).toBe(true);
    expect(session_recording.maskTextSelector).toBe(`.${analytics.PRIVATE_CLASS}`);
    expect(analytics.PRIVATE_CLASS).toBe("ph-sensitive");
    expect(session_recording.maskTextFn("We sent a code to ana@example.com. Enter it.")).toBe(
      "We sent a code to ***************. Enter it.",
    );
  });

  it("never sends an email address in an event, wherever a click picked it up", async () => {
    await startFresh();
    const { before_send } = initOptions();
    const timestamp = new Date();
    const click: Event = {
      event: "$dead_click",
      timestamp,
      properties: {
        $current_url: "https://getwithus.in/contact",
        $elements_chain: 'h2:text="Thanks, Ana. We wrote to ana@example.com."',
        $elements: [{ tag_name: "h2", $el_text: "Thanks, Ana. We wrote to ana@example.com." }],
      },
    };
    const sent = before_send(click);
    expect(JSON.stringify(sent)).not.toContain("ana@example.com");
    expect(sent?.properties.$elements).toEqual([
      { tag_name: "h2", $el_text: "Thanks, Ana. We wrote to ***************." },
    ]);
    expect(sent?.timestamp).toBe(timestamp);
  });

  it("never sends events or recordings from the team's admin pages", async () => {
    await startFresh();
    const { before_send } = initOptions();
    const admin: Event = {
      event: "$pageview",
      properties: { $current_url: "https://getwithus.in/admin/leads" },
    };
    const page: Event = {
      event: "$pageview",
      properties: { $current_url: "https://getwithus.in/about" },
    };
    expect(before_send(admin)).toBeNull();
    expect(before_send(page)).toEqual(page);

    // Recording data has no page address: the page the browser is on decides.
    const snapshot: Event = { event: "$snapshot", properties: { $snapshot_data: [] } };
    expect(before_send(snapshot)).toBe(snapshot);
    location.pathname = "/admin/leads";
    expect(before_send(snapshot)).toBeNull();
  });
});
