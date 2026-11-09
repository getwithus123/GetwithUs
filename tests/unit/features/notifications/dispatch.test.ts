import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { site } from "@/config/site";
import type { Lead } from "@/features/leads/types";

const repository = vi.hoisted(() => ({
  insertNotification: vi.fn(),
  recordDelivery: vi.fn(),
}));
vi.mock("@/features/notifications/repository", () => repository);

const { notifyLeadVerified, notifyLeadStatusChanged } =
  await import("@/features/notifications/dispatch");
const { emailChannel } = await import("@/features/notifications/channels/email");
const { slackChannel } = await import("@/features/notifications/channels/slack");
const { whatsappChannel } = await import("@/features/notifications/channels/whatsapp");
const { dbError } = await import("@/lib/errors");

const lead: Lead = {
  id: "11111111-1111-4111-8111-111111111111",
  source: "brief",
  status: "new",
  name: "Test Lead",
  email: "test.lead@example.com",
  emailVerifiedAt: new Date("2026-10-31T10:00:00Z"),
  company: "Example Co",
  phone: null,
  services: ["app-development"],
  message: "A booking app for a small chain of clinics.",
  budgetRange: "not-sure",
  timeline: "exploring",
  existingUrl: null,
  referral: null,
  meta: {},
  createdAt: new Date("2026-10-31T09:59:00Z"),
  updatedAt: new Date("2026-10-31T10:00:00Z"),
};

const SLACK_URL = "https://hooks.slack.test/services/T000/B000/XXXX";
const whatsapp = {
  phoneNumberId: "123",
  accessToken: "token",
  to: "+15550000000",
  template: "new_lead",
};

function stubFetch(statusFor: (url: string) => number) {
  const fetchMock = vi.fn(async (url: string) => new Response("{}", { status: statusFor(url) }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  repository.insertNotification.mockImplementation(async (notification) => ({
    ok: true,
    data: { ...notification, id: "n-1", readAt: null, createdAt: new Date() },
  }));
  repository.recordDelivery.mockResolvedValue({ ok: true, data: null });
  vi.spyOn(console, "info").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  repository.insertNotification.mockReset();
  repository.recordDelivery.mockReset();
});

describe("notifyLeadVerified", () => {
  it("creates the in-app notification and calls every channel", async () => {
    const fetchMock = stubFetch(() => 200);
    const result = await notifyLeadVerified(lead, {
      channels: [
        emailChannel(["team@example.com"]),
        slackChannel(SLACK_URL),
        whatsappChannel(whatsapp),
      ],
    });

    expect(repository.insertNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "lead_verified",
        title: "New project brief from Test Lead (Example Co)",
        href: `/admin/leads/${lead.id}`,
        leadId: lead.id,
      }),
    );
    expect(result.ok && result.data.deliveries).toEqual([
      { channel: "email", status: "sent" },
      { channel: "slack", status: "sent" },
      { channel: "whatsapp", status: "sent" },
    ]);
    const urls = fetchMock.mock.calls.map(([url]) => url);
    expect(urls).toContain(SLACK_URL);
    expect(urls).toContain("https://graph.facebook.com/v26.0/123/messages");
  });

  it("sends WhatsApp only as a template with name, company, services, and link", async () => {
    const fetchMock = stubFetch(() => 200);
    await notifyLeadVerified(lead, { channels: [whatsappChannel(whatsapp)] });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body.type).toBe("template");
    expect(body.template.name).toBe("new_lead");
    expect(body.template.components[0].parameters.map((p: { text: string }) => p.text)).toEqual([
      "Test Lead",
      "Example Co",
      "App development",
      `${site.url}/admin/leads/${lead.id}`,
    ]);
  });

  it("keeps going when one channel fails, and records each outcome", async () => {
    stubFetch((url) => (url === SLACK_URL ? 500 : 200));
    const result = await notifyLeadVerified(lead, {
      channels: [
        emailChannel(["team@example.com"]),
        slackChannel(SLACK_URL),
        whatsappChannel(whatsapp),
      ],
    });

    expect(result.ok && result.data.deliveries).toEqual([
      { channel: "email", status: "sent" },
      { channel: "slack", status: "failed" },
      { channel: "whatsapp", status: "sent" },
    ]);
    const recorded = repository.recordDelivery.mock.calls.map(([delivery]) => delivery);
    expect(recorded).toHaveLength(3);
    expect(recorded.find((delivery) => delivery.channel === "slack")).toMatchObject({
      status: "failed",
      leadId: lead.id,
      notificationId: "n-1",
    });
    expect(recorded.find((delivery) => delivery.channel === "slack")?.error).toMatch(
      /Slack responded 500/,
    );
    expect(recorded.filter((delivery) => delivery.status === "sent")).toHaveLength(2);
  });

  it("treats a channel that throws like any other failure", async () => {
    stubFetch(() => 200);
    const exploding = {
      name: "slack" as const,
      send: async () => {
        throw new Error("network down");
      },
    };
    const result = await notifyLeadVerified(lead, {
      channels: [exploding, whatsappChannel(whatsapp)],
    });
    expect(result.ok && result.data.deliveries).toEqual([
      { channel: "slack", status: "failed" },
      { channel: "whatsapp", status: "sent" },
    ]);
  });

  it("reaches no channel when the in-app notification cannot be stored", async () => {
    const fetchMock = stubFetch(() => 200);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    repository.insertNotification.mockResolvedValue({
      ok: false,
      error: dbError(new Error("down")),
    });
    const result = await notifyLeadVerified(lead, { channels: [slackChannel(SLACK_URL)] });
    expect(result.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(repository.recordDelivery).not.toHaveBeenCalled();
  });
});

describe("notifyLeadStatusChanged", () => {
  it("describes the change with the actor", async () => {
    stubFetch(() => 200);
    await notifyLeadStatusChanged(lead, "new", "contacted", "admin@example.com", { channels: [] });
    expect(repository.insertNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "lead_status_changed",
        title: "Test Lead: New to Contacted",
        body: "Changed by admin@example.com.",
      }),
    );
  });
});
