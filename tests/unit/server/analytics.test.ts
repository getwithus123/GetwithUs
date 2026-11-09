import { afterEach, describe, expect, it, vi } from "vitest";

const env = vi.hoisted(() => ({
  NEXT_PUBLIC_POSTHOG_KEY: undefined as string | undefined,
  NEXT_PUBLIC_POSTHOG_REGION: "us" as "us" | "eu",
}));
vi.mock("@/config/env", () => ({ env }));

const { captureServerEvent } = await import("@/server/analytics");

function stubFetch(status = 200) {
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => new Response("{}", { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  env.NEXT_PUBLIC_POSTHOG_KEY = undefined;
  env.NEXT_PUBLIC_POSTHOG_REGION = "us";
});

describe("captureServerEvent", () => {
  it("sends nothing while analytics is off", async () => {
    const fetchMock = stubFetch();
    await captureServerEvent("lead_verified", "lead-1", { form: "brief" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts one event to the region's capture endpoint without a person profile", async () => {
    env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test";
    env.NEXT_PUBLIC_POSTHOG_REGION = "eu";
    const fetchMock = stubFetch();
    await captureServerEvent("lead_verified", "lead-1", { form: "brief", services: ["web-development"] });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://eu.i.posthog.com/i/v0/e/");
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({
      api_key: "phc_test",
      event: "lead_verified",
      distinct_id: "lead-1",
      properties: { form: "brief", services: ["web-development"], $process_person_profile: false },
    });
  });

  it("never throws when PostHog is down or rejects the event", async () => {
    env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test";
    stubFetch(503);
    await expect(captureServerEvent("lead_verified", "lead-1", {})).resolves.toBeUndefined();
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("offline"))));
    await expect(captureServerEvent("lead_verified", "lead-1", {})).resolves.toBeUndefined();
  });
});
