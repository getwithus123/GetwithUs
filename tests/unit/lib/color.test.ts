import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/color";

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
    expect(() => contrastRatio("blue", "#FFFFFF")).toThrow();
  });
});

/*
 * The real colour tokens, read from tokens.css, so changing a colour cannot slip
 * past these checks. Translucent tokens such as --accent-soft are composited over
 * the surfaces they sit on.
 */
const css = readFileSync(resolve(process.cwd(), "src/styles/tokens.css"), "utf8");

function tokens(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`No "${selector}" block in tokens.css`);
  const block = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
  );
}

const hex = (value: string) => {
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`Expected #RRGGBB, got "${value}"`);
  return value;
};

/** An `rgb(r g b / a)` token laid over an opaque `#RRGGBB` surface, as the browser paints it. */
function over(translucent: string, surface: string): string {
  const match = /^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/.exec(translucent);
  if (!match) throw new Error(`Expected rgb(r g b / a), got "${translucent}"`);
  const [r, g, b, alpha] = match.slice(1).map(Number);
  const base = [1, 3, 5].map((i) => parseInt(hex(surface).slice(i, i + 2), 16));
  return `#${[r, g, b]
    .map((channel, i) => Math.round(channel * alpha + base[i] * (1 - alpha)))
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

const AA = 4.5;

for (const [theme, selector] of [
  ["light", ":root"],
  ["dark", ':root[data-theme="dark"]'],
] as const) {
  describe(`${theme} theme tokens`, () => {
    const t = tokens(selector);
    const surfaces = { card: hex(t.card), "bg-soft": hex(t["bg-soft"]) };

    it("keeps body text and accent links readable on every surface", () => {
      for (const surface of Object.values(surfaces)) {
        expect(contrastRatio(hex(t.ink), surface)).toBeGreaterThanOrEqual(AA);
        expect(contrastRatio(hex(t.body), surface)).toBeGreaterThanOrEqual(AA);
        expect(contrastRatio(hex(t.muted), surface)).toBeGreaterThanOrEqual(AA);
        expect(contrastRatio(hex(t.accent), surface)).toBeGreaterThanOrEqual(AA);
      }
    });

    it("keeps button text readable on the accent", () => {
      expect(contrastRatio(hex(t["accent-ink"]), hex(t.accent))).toBeGreaterThanOrEqual(AA);
    });

    it("keeps ink text readable on the accent tint", () => {
      for (const surface of Object.values(surfaces)) {
        expect(contrastRatio(hex(t.ink), over(t["accent-soft"], surface))).toBeGreaterThanOrEqual(AA);
      }
    });
  });
}

describe("the light accent tint", () => {
  it("is too weak for accent text, so text on it is ink (see .link-pill:hover and /about)", () => {
    const t = tokens(":root");
    expect(contrastRatio(hex(t.accent), over(t["accent-soft"], hex(t.card)))).toBeLessThan(AA);
  });
});
