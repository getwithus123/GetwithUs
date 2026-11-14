// Relative import: next.config.ts loads this file, and its transpiler does not resolve the @/ alias.
import { env } from "./env";

/**
 * Server-side feature flags. Each integration turns on when its variables are
 * present and stays off otherwise, so a missing key never breaks a request.
 */
export const flags = {
  slack: Boolean(env.SLACK_WEBHOOK_URL),
  whatsapp: Boolean(
    env.WHATSAPP_PHONE_NUMBER_ID &&
    env.WHATSAPP_ACCESS_TOKEN &&
    env.WHATSAPP_NOTIFY_TO &&
    env.WHATSAPP_TEMPLATE_NAME,
  ),
  turnstile: Boolean(env.TURNSTILE_SECRET_KEY && env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
  analytics: Boolean(env.NEXT_PUBLIC_POSTHOG_KEY),
  integrationsApi: Boolean(env.LEADS_API_KEY),
} as const;
