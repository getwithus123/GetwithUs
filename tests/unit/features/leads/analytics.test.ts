import { describe, expect, it } from "vitest";
import { submissionFacts, verifiedLeadFacts } from "@/features/leads/analytics";
import type { Lead } from "@/features/leads/types";

describe("submissionFacts", () => {
  it("keeps the form and the choices, and nothing anyone typed", () => {
    const facts = submissionFacts({
      source: "brief",
      services: ["app-development"],
      budgetRange: "range-2",
      timeline: "asap",
      name: "Test Lead",
      email: "test.lead@example.com",
      phone: "+15551234567",
      company: "Example Co",
      message: "A booking app.",
      existingUrl: "https://example.com",
    });
    expect(facts).toEqual({
      form: "brief",
      services: ["app-development"],
      budget_range: "range-2",
      timeline: "asap",
    });
  });

  it("leaves out values that are not on the fixed lists", () => {
    expect(
      submissionFacts({
        source: "contact",
        services: ["app-development", "someone@example.com"],
        budgetRange: "about 5 lakh, call me on 98xxxxxx",
        timeline: "",
      }),
    ).toEqual({ form: "contact", services: ["app-development"] });
  });
});

describe("verifiedLeadFacts", () => {
  it("describes a confirmed lead by its source and choices only", () => {
    const lead = {
      id: "11111111-1111-4111-8111-111111111111",
      source: "api",
      name: "Test Lead",
      email: "test.lead@example.com",
      services: ["custom-software"],
      budgetRange: "free text from the bot",
      timeline: "1-3-months",
    } as Lead;
    expect(verifiedLeadFacts(lead)).toEqual({
      form: "api",
      services: ["custom-software"],
      timeline: "1-3-months",
    });
  });
});
