import { describe, expect, it, vi } from "vitest";
import type * as SiteModule from "@/config/site";
import { site } from "@/config/site";
import { errorCopy } from "@/content/forms";

describe("errorCopy (spec section 13 table)", () => {
  it("adds remaining attempts only when two or fewer are left", () => {
    expect(errorCopy("VERIFICATION_INVALID", { remainingAttempts: 4 })).toBe(
      "That code is not correct. Check the email and try again.",
    );
    expect(errorCopy("VERIFICATION_INVALID", { remainingAttempts: 2 })).toBe(
      "That code is not correct. Check the email and try again. 2 attempts left.",
    );
    expect(errorCopy("VERIFICATION_INVALID", { remainingAttempts: 1 })).toMatch(
      /1 attempt left\.$/,
    );
  });

  it("uses the table's copy for expiry, lockout, and rate limits", () => {
    expect(errorCopy("VERIFICATION_EXPIRED")).toBe("That code has expired. Request a new one.");
    expect(errorCopy("VERIFICATION_LOCKED")).toBe(
      "Too many attempts. Request a new code to continue.",
    );
    expect(errorCopy("RATE_LIMITED")).toBe(
      "Too many requests from this connection. Try again in a few minutes.",
    );
  });

  it("offers another try when sending fails, with the contact email", () => {
    const fallback = `Try again, or email us directly at ${site.contact.email}.`;
    expect(errorCopy("EMAIL_ERROR")).toBe(`We could not send the email right now. ${fallback}`);
    expect(errorCopy("DB_ERROR")).toBe(`Something went wrong on our side. ${fallback}`);
    expect(errorCopy("INTERNAL")).toBe(errorCopy("DB_ERROR"));
  });

  it("offers a plain retry while the contact email is not known", async () => {
    // forms.ts reads the email when it loads, so load it again with no email set.
    vi.resetModules();
    vi.doMock("@/config/site", async (importOriginal) => {
      const actual = await importOriginal<typeof SiteModule>();
      return { ...actual, site: { ...actual.site, contact: { ...actual.site.contact, email: "" } } };
    });
    try {
      const { errorCopy: withoutEmail } = await import("@/content/forms");
      expect(withoutEmail("EMAIL_ERROR")).toBe(
        "We could not send the email right now. Try again in a few minutes.",
      );
      expect(withoutEmail("DB_ERROR")).toBe(
        "Something went wrong on our side. Try again in a few minutes.",
      );
    } finally {
      vi.doUnmock("@/config/site");
      vi.resetModules();
    }
  });

  it("passes specific client messages through", () => {
    expect(errorCopy("CONFLICT", { message: "This email is already confirmed." })).toBe(
      "This email is already confirmed.",
    );
  });

  it("never apologizes", () => {
    for (const code of ["EMAIL_ERROR", "INTERNAL", "RATE_LIMITED", "BOT_CHECK_FAILED"] as const) {
      expect(errorCopy(code)).not.toMatch(/sorry|apolog/i);
    }
  });
});
