/**
 * Browser-safe configuration. src/config/env.ts validates every variable,
 * including these, when next.config.ts loads at build and at startup; this module
 * re-exposes only the public values so client bundles do not carry the validator.
 * Next.js inlines each NEXT_PUBLIC_* reference at build time.
 */
const blankToUndefined = (value: string | undefined) => (value ? value : undefined);

export const publicEnv = {
  nodeEnv: process.env.NODE_ENV,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://getwithus.in",
  siteName: blankToUndefined(process.env.NEXT_PUBLIC_SITE_NAME) ?? "GetwithUs",
  turnstileSiteKey: blankToUndefined(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
  posthogKey: blankToUndefined(process.env.NEXT_PUBLIC_POSTHOG_KEY),
  posthogRegion: process.env.NEXT_PUBLIC_POSTHOG_REGION === "eu" ? ("eu" as const) : ("us" as const),
  schedulingUrl: blankToUndefined(process.env.NEXT_PUBLIC_SCHEDULING_URL),
} as const;
