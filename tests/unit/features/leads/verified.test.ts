import { describe, expect, it, vi } from "vitest";
import type { Lead } from "@/features/leads/types";

const captureServerEvent = vi.hoisted(() => vi.fn(async () => undefined));
const notifyLeadVerified = vi.hoisted(() => vi.fn());
vi.mock("@/server/analytics", () => ({ captureServerEvent }));
vi.mock("@/features/notifications/dispatch", () => ({ notifyLeadVerified }));
// The service's other collaborators are never reached for an API lead.
vi.mock("@/features/leads/repository", () => ({}));
vi.mock("@/features/notifications/repository", () => ({}));
vi.mock("@/server/email/client", () => ({}));

const { handleLeadVerified } = await import("@/features/leads/service");

const lead = {
  id: "11111111-1111-4111-8111-111111111111",
  source: "api",
  name: "Test Lead",
  email: "test.lead@example.com",
  services: ["custom-software"],
  timeline: "1-3-months",
} as Lead;

describe("handleLeadVerified", () => {
  it("counts the lead in analytics even when the team notification throws", async () => {
    notifyLeadVerified.mockRejectedValueOnce(new Error("database down"));
    await expect(handleLeadVerified(lead, "req-1")).rejects.toThrow("database down");
    expect(captureServerEvent).toHaveBeenCalledWith("lead_verified", lead.id, {
      form: "api",
      services: ["custom-software"],
      timeline: "1-3-months",
    });
  });
});
