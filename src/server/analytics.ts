import { posthogHosts } from "@/config/analytics";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

type ServerEventProperties = Record<string, string | number | boolean | readonly string[]>;

/**
 * Sends one event to PostHog from the server, where no ad blocker can drop it.
 * The distinct id is an anonymous record id (a lead id), never an email, and
 * no person profile is made. Does nothing while analytics is off; a failure is
 * logged and never reaches the caller.
 */
export async function captureServerEvent(
  event: string,
  distinctId: string,
  properties: ServerEventProperties,
): Promise<void> {
  const key = env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  try {
    const response = await fetch(`${posthogHosts(env.NEXT_PUBLIC_POSTHOG_REGION).ingest}/i/v0/e/`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        event,
        distinct_id: distinctId,
        properties: { ...properties, $process_person_profile: false },
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) logger.warn("Analytics event not accepted", { event, status: response.status });
  } catch (error) {
    logger.warn("Analytics event not sent", { event, error: String(error) });
  }
}
