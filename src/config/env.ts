import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/** A comma-separated list of email addresses, normalized to lowercase. */
const emailList = z
  .string()
  .min(3)
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  )
  .pipe(z.array(z.email()).min(1));

/**
 * The only place in src/ that reads process.env. Importing this module validates
 * every variable, so a missing or malformed value stops the app at startup with
 * a message naming the variable.
 */
export const env = createEnv({
  shared: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  server: {
    DATABASE_URL: z.string().min(1),
    AUTH_SECRET: z.string().min(32),
    ADMIN_EMAILS: emailList,
    VERIFICATION_PEPPER: z.string().min(32),
    CRON_SECRET: z.string().min(16),
    EMAIL_TRANSPORT: z.enum(["resend", "console", "smtp"]).default("resend"),
    RESEND_API_KEY: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_SECURE: z.enum(["true", "false"]).optional(),
    EMAIL_FROM: z.string().min(3),
    EMAIL_REPLY_TO: z.string().optional(),
    TEAM_NOTIFY_EMAILS: emailList,
    LEADS_API_KEY: z.string().min(32).optional(),
    SLACK_WEBHOOK_URL: z.url().optional(),
    WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
    WHATSAPP_ACCESS_TOKEN: z.string().optional(),
    WHATSAPP_NOTIFY_TO: z.string().optional(),
    WHATSAPP_TEMPLATE_NAME: z.string().optional(),
    TURNSTILE_SECRET_KEY: z.string().optional(),
    // Set by Vercel. Preview deployments accept form posts from their own URLs, and
    // VERCEL_ENV tells a preview from production (see src/lib/deployment.ts).
    VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),
    VERCEL_URL: z.string().optional(),
    VERCEL_BRANCH_URL: z.string().optional(),
    VERCEL_GIT_COMMIT_SHA: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.url(),
    NEXT_PUBLIC_SITE_NAME: z.string().default("GetwithUs"),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_SCHEDULING_URL: z.url().optional(),
    NEXT_PUBLIC_TEST_HOOKS: z.enum(["0", "1"]).optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    VERIFICATION_PEPPER: process.env.VERIFICATION_PEPPER,
    CRON_SECRET: process.env.CRON_SECRET,
    EMAIL_TRANSPORT: process.env.EMAIL_TRANSPORT,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_SECURE: process.env.SMTP_SECURE,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO,
    TEAM_NOTIFY_EMAILS: process.env.TEAM_NOTIFY_EMAILS,
    LEADS_API_KEY: process.env.LEADS_API_KEY,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_NOTIFY_TO: process.env.WHATSAPP_NOTIFY_TO,
    WHATSAPP_TEMPLATE_NAME: process.env.WHATSAPP_TEMPLATE_NAME,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    NEXT_PUBLIC_SCHEDULING_URL: process.env.NEXT_PUBLIC_SCHEDULING_URL,
    NEXT_PUBLIC_TEST_HOOKS: process.env.NEXT_PUBLIC_TEST_HOOKS,
  },
  emptyStringAsUndefined: true,
  createFinalSchema: (shape, isServer) =>
    z.object(shape).superRefine((value, ctx) => {
      if (isServer && value.EMAIL_TRANSPORT === "resend" && !value.RESEND_API_KEY) {
        ctx.addIssue({
          code: "custom",
          path: ["RESEND_API_KEY"],
          message: "RESEND_API_KEY is required when EMAIL_TRANSPORT is resend.",
        });
      }
      if (isServer && value.EMAIL_TRANSPORT === "smtp" && !value.SMTP_HOST) {
        ctx.addIssue({
          code: "custom",
          path: ["SMTP_HOST"],
          message: "SMTP_HOST is required when EMAIL_TRANSPORT is smtp.",
        });
      }
      // Only when SMTP sends the email: an old SMTP_USER left in Vercel must not fail a Resend build.
      if (isServer && value.EMAIL_TRANSPORT === "smtp" && value.SMTP_USER && !value.SMTP_PASS) {
        ctx.addIssue({
          code: "custom",
          path: ["SMTP_PASS"],
          message: "SMTP_PASS is required when SMTP_USER is set.",
        });
      }
    }),
});
