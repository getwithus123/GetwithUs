import { describe, expect, it } from "vitest";
import { contrastLevel, contrastRatio, luminance } from "@/lib/color";

describe("contrastRatio", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#FFFFFF")).toBeCloseTo(4.48, 2);
    expect(contrastRatio("#000000", "#000000")).toBe(1);
  });

  it("does not depend on argument order", () => {
    expect(contrastRatio("#1E4FD8", "#FFFFFF")).toBe(contrastRatio("#FFFFFF", "#1E4FD8"));
  });

  it("rejects anything but #RRGGBB", () => {
    expect(() => luminance("blue")).toThrow();
  });
});

describe("contrastLevel", () => {
  it("applies the normal and large text thresholds", () => {
    expect(contrastLevel(7.1)).toBe("AAA");
    expect(contrastLevel(4.6)).toBe("AA");
    expect(contrastLevel(3.2)).toBe("Fail");
    expect(contrastLevel(3.2, true)).toBe("AA");
  });
});

describe("the light theme's accent tint (tokens.css)", () => {
  // --accent-soft is the accent at 10 percent over white.
  const ACCENT = "#0E7C86";
  const ACCENT_SOFT = "#E7F2F3";
  const INK = "#0F1B2D";

  it("does not carry accent text: text on the tint must be ink", () => {
    expect(contrastLevel(contrastRatio(ACCENT, ACCENT_SOFT))).toBe("Fail");
    expect(contrastLevel(contrastRatio(INK, ACCENT_SOFT))).toBe("AAA");
  });
});
