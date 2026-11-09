/*
 * Settings for the end-to-end suite. The suite runs a production build with
 * test hooks on (so console emails carry their codes), the console email
 * transport, and its own database, on a port no development server uses.
 */

const port = Number(process.env.E2E_PORT ?? 3200);

export const baseUrl = `http://localhost:${port}`;

/** The test database. Every run migrates it and empties it; never point this at real data. */
export const databaseUrl =
  process.env.E2E_DATABASE_URL ?? "postgres://getwithus:getwithus@localhost:5432/getwithus_test";

export const adminEmail = "admin@example.com";

/** Set E2E_SKIP_BUILD=1 to reuse a build made with the same variables. */
const skipBuild = process.env.E2E_SKIP_BUILD === "1";

export const serverCommand = `${skipBuild ? "" : "pnpm build && "}pnpm start -p ${port}`;

/**
 * Variables for both the build (NEXT_PUBLIC_* are inlined then) and the server.
 * Every third-party integration is blanked so a run never reaches Slack,
 * WhatsApp, Turnstile, or Resend, whatever .env.local holds.
 */
export const serverEnv: Record<string, string> = {
  DATABASE_URL: databaseUrl,
  AUTH_SECRET: "e2e-auth-secret-000000000000000000000000000000",
  ADMIN_EMAILS: adminEmail,
  VERIFICATION_PEPPER: "e2e-verification-pepper-000000000000000000000",
  CRON_SECRET: "e2e-cron-secret-000000",
  EMAIL_TRANSPORT: "console",
  EMAIL_FROM: "GetwithUs <no-reply@example.com>",
  TEAM_NOTIFY_EMAILS: "team@example.com",
  LEADS_API_KEY: "e2e-leads-api-key-00000000000000000000000000",
  SLACK_WEBHOOK_URL: "",
  WHATSAPP_PHONE_NUMBER_ID: "",
  WHATSAPP_ACCESS_TOKEN: "",
  WHATSAPP_NOTIFY_TO: "",
  WHATSAPP_TEMPLATE_NAME: "",
  TURNSTILE_SECRET_KEY: "",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
  NEXT_PUBLIC_POSTHOG_KEY: "",
  NEXT_PUBLIC_SITE_URL: baseUrl,
  NEXT_PUBLIC_TEST_HOOKS: "1",
};
