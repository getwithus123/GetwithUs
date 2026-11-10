import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./support/test";

const PAGES = [
  "/",
  "/services",
  "/services/web-development",
  "/services/agentic-automation/whatsapp-bot",
  "/process",
  "/about",
  "/contact",
  "/start",
  "/privacy",
  "/admin/login",
];

/*
 * Purely decorative pieces (the stack sphere's chips fade with depth) are
 * marked data-decorative and hidden from assistive technology; WCAG 1.4.3
 * exempts text that is pure decoration, so axe leaves them out. Every name
 * they show is also in the page as real text.
 */
for (const theme of ["light", "dark"] as const) {
  for (const path of PAGES) {
    test(`axe finds no WCAG 2.2 AA violations on ${path} (${theme})`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.waitForLoadState("networkidle");
      // Reveal hides blocks below the fold until they scroll into view, and axe skips
      // what it cannot see. Scroll the whole page first so every block is checked as a
      // visitor sees it, then let the last rise animations finish.
      await page.evaluate(async () => {
        const step = Math.round(window.innerHeight * 0.6);
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((done) => setTimeout(done, 120));
        }
        window.scrollTo(0, 0);
      });
      await expect(page.locator('.reveal[data-enter="waiting"]')).toHaveCount(0);
      await page.waitForTimeout(1200);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .exclude("[data-decorative]")
        .analyze();
      const summary = results.violations.map((violation) => ({
        rule: violation.id,
        impact: violation.impact,
        targets: violation.nodes.map((node) => node.target.join(" ")),
      }));
      expect(summary).toEqual([]);
    });
  }
}
