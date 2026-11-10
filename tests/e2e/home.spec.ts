import { expect, test } from "./support/test";

test.describe("home", () => {
  test("renders the hero, the orbit of services, and every section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("We build the");
    const orbit = page.getByRole("list", { name: "Services" });
    await expect(orbit.getByRole("link")).toHaveCount(7);
    for (const title of [
      "Five things we build, all in accounts you own",
      "See it working",
      "Real code, in your repo, from week one",
      "The stack behind your project",
      "How a project runs",
      "What it costs",
      "What you can hold us to",
      "Questions people ask first",
      "Tell us what you need",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: title })).toBeAttached();
    }
    // The home page is CSS 3D only: no WebGL canvas.
    await expect(page.locator("canvas")).toHaveCount(0);
    // No owner placeholder ever reaches the page.
    expect(await page.content()).not.toContain("[OWNER:");
  });

  test("an orbit chip opens its service page", async ({ page }) => {
    // Under reduced motion the orbit holds still, so the chip can be clicked where it is.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page
      .getByRole("list", { name: "Services" })
      .getByRole("link", { name: "WhatsApp bot" })
      .click();
    await expect(page).toHaveURL(/\/services\/agentic-automation\/whatsapp-bot$/);
  });

  test("the theme toggle switches to dark, remembers it, and switches back", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect(html).toHaveAttribute("data-theme", "light");
  });

  test("the demo tabs switch between the WhatsApp bot and the calling agent", async ({ page }) => {
    await page.goto("/");
    const tabs = page.getByRole("tablist", { name: "Agent demos" });
    await tabs.scrollIntoViewIfNeeded();
    await expect(page.getByRole("figure").filter({ hasText: "dental clinic" })).toBeAttached();
    await tabs.getByRole("tab", { name: "Calling agent" }).click();
    await expect(page.getByText("Summary written to your CRM").first()).toBeAttached();
  });

  test("the process stepper shows the step you choose", async ({ page }) => {
    await page.goto("/");
    const steps = page.getByRole("tablist", { name: "How a project runs" });
    await steps.scrollIntoViewIfNeeded();
    await steps.getByRole("tab", { name: "Launch" }).click();
    await expect(steps.getByRole("tab", { name: "Launch" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByRole("tabpanel").getByRole("heading", { name: "Launch" })).toBeVisible();
  });

  test("each pricing card asks for a quote on the brief, with the service chosen", async ({
    page,
  }) => {
    await page.goto("/");
    const quotes = page.getByRole("link", { name: /^Get a quote for this: / });
    await expect(quotes).toHaveCount(5);
    await expect(quotes.first()).toHaveAttribute("href", "/start?service=web-development");
  });

  test("under reduced motion the demos show their whole script", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("tablist", { name: "Agent demos" }).scrollIntoViewIfNeeded();
    await expect(page.getByText("You will get a confirmation by email.").first()).toBeVisible();
  });

  test("the terminal starts a brief and hands it to /start with the answers filled in", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#closing-cta-title").scrollIntoViewIfNeeded();
    // Scoped to the terminal's chip group: service names also appear in other links on the page.
    const web = page
      .getByRole("group", { name: "What do you need?" })
      .getByRole("button", { name: "Web development" });
    await expect(web).toBeVisible({ timeout: 10_000 });
    await web.click();
    await expect(web).toHaveAttribute("aria-pressed", "true");
    const email = page.getByLabel("Email address");
    await expect(email).toBeVisible();

    await email.fill("not-an-email");
    await page.getByRole("button", { name: "Continue to the brief" }).click();
    // Each finished line is in the DOM twice: typed (hidden from screen readers) and announced.
    await expect(
      page.getByText("enter an email address like name@company.com").first(),
    ).toBeVisible();

    await email.fill("name@company.com");
    await page.getByRole("button", { name: "Continue to the brief" }).click();
    // Nothing is sent from the terminal: the brief opens on its second step with both answers kept.
    await expect(page).toHaveURL(/\/start$/, { timeout: 10_000 });
    await expect(page.getByRole("heading", { name: "About the project" })).toBeVisible();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.locator("input[value=web-development]")).toBeChecked();
  });

  test("header links navigate", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    await header.getByRole("link", { name: "Process" }).click();
    await expect(page).toHaveURL(/\/process$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.getByRole("banner").getByRole("link", { name: "Start a project" }).click();
    await expect(page).toHaveURL(/\/start$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("the services mega menu opens and closes with the keyboard", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Services" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const webLink = page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: /Web development/ });
    await expect(webLink).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("Enter");
    await expect(webLink).toBeVisible();
    await webLink.click();
    await expect(page).toHaveURL(/\/services\/web-development$/);
  });
});

test("the phone menu returns focus to the Menu button when dismissed", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Menu" });
  await menuButton.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(menuButton).toBeFocused();
});

test.describe("service pages", () => {
  test("a service page shows its still drawing, then its model after the first interaction", async ({
    page,
  }) => {
    await page.goto("/services/web-development");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const panel = page.locator(".model-panel");
    await expect(panel.locator(".model-still svg")).toBeAttached();
    // No WebGL until the visitor moves: nothing in the measured window.
    await expect(panel.locator("canvas")).toHaveCount(0);
    // A visitor keeps moving: moves made before the page hydrates are not seen, so keep moving until it is live.
    let x = 200;
    await expect
      .poll(
        async () => {
          x = x === 200 ? 400 : 200;
          await page.mouse.move(x, 300);
          return panel.getAttribute("data-live");
        },
        { timeout: 20_000 },
      )
      .toBe("");
    await expect(
      page.getByRole("heading", { level: 2, name: "Watch a page come together" }),
    ).toBeAttached();
    // Give the model a moment to draw; console problems fail the test.
    await page.waitForTimeout(1500);
  });

  test("every service page renders without owner placeholders", async ({ page }) => {
    for (const path of [
      "/services",
      "/services/web-development",
      "/services/app-development",
      "/services/agentic-automation",
      "/services/agentic-automation/whatsapp-bot",
      "/services/agentic-automation/calling-agent",
      "/services/digital-marketing",
      "/services/custom-software",
    ]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.content(), path).not.toContain("[OWNER:");
    }
  });
});

test("the brief starts with the service named in the link", async ({ page }) => {
  await page.goto("/start?service=digital-marketing");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Digital marketing" })).toBeChecked({
    timeout: 10_000,
  });
});
