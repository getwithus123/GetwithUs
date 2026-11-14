/**
 * PostHog settings shared by next.config.ts (the proxy rewrites), the browser
 * client, and server-side events. No `@/` imports: next.config.ts loads this file.
 */
export type PosthogRegion = "us" | "eu";

/**
 * The same-origin path the browser sends analytics to; next.config.ts forwards
 * it to PostHog. Deliberately not "/analytics" or "/posthog", which ad blockers
 * block by name.
 */
export const ANALYTICS_PATH = "/gwr";

/** PostHog's hosts for a cloud region. */
export function posthogHosts(region: PosthogRegion) {
  return {
    ingest: `https://${region}.i.posthog.com`,
    assets: `https://${region}-assets.i.posthog.com`,
    app: `https://${region}.posthog.com`,
  };
}
