import { createAdminSession, insertVerifiedLead, leadEvents } from "./support/db";
import { baseUrl } from "./support/env";
import { expect, test } from "./support/test";

test.describe("admin", () => {
  test("an unauthenticated visit redirects to sign-in with the destination kept", async ({
    page,
  }) => {
    await page.goto("/admin/leads");
    await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fleads$/);
    await expect(page.getByRole("button", { name: "Email me a sign-in link" })).toBeVisible();
  });

  test("sign-in answers the same for any address and offers to send another link", async ({
    page,
  }) => {
    const email = `not.on.the.list.${Date.now()}@example.com`;
    await page.goto("/admin/login");
    // Not on the team list: the answer must not reveal that.
    await page.getByLabel("Work email").fill(email);
    await page.getByRole("button", { name: "Email me a sign-in link" }).click();
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    await page.getByRole("button", { name: "Send another link" }).click();
    await expect(page.getByRole("button", { name: "Email me a sign-in link" })).toBeVisible();
    // Focus and the address come back with the form, so a keyboard user can send again at once.
    await expect(page.getByLabel("Work email")).toBeFocused();
    await expect(page.getByLabel("Work email")).toHaveValue(email);
  });

  test("a signed-in admin sees the lead and a status change writes an event", async ({
    page,
    context,
  }) => {
    const lead = await insertVerifiedLead(`E2E Lead ${Date.now()}`);
    const token = await createAdminSession();
    await context.addCookies([{ name: "authjs.session-token", value: token, url: baseUrl }]);

    await page.goto("/admin/leads");
    await expect(page.getByRole("heading", { name: "Leads", exact: true })).toBeVisible();
    await page.getByRole("link", { name: /E2E Lead/ }).click();
    await expect(page).toHaveURL(new RegExp(`/admin/leads/${lead.id}$`));

    await page
      .getByLabel("Status", { exact: true })
      .locator("visible=true")
      .selectOption("contacted");
    await expect(page.getByText("Status changed to Contacted")).toBeVisible();

    await expect
      .poll(async () => (await leadEvents(lead.id)).filter((e) => e.type === "status_changed"))
      .toEqual([
        {
          type: "status_changed",
          actor: "admin@example.com",
          data: { from: "new", to: "contacted" },
        },
      ]);
  });
});
