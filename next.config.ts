import type { NextConfig } from "next";
import { env } from "./src/config/env";
import { flags } from "./src/config/flags";
import { siteContent } from "./src/content/site";

const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";
/** The canonical production address (no www). */
const CANONICAL = new URL(siteContent.url);
const PLAUSIBLE_ORIGIN = "https://plausible.io";

/**
 * One static Content-Security-Policy for every route. A per-request nonce would
 * force every marketing page to render dynamically, so scripts use 'unsafe-inline'
 * (needed for the inline scripts Next.js emits) and nothing else is loosened.
 * See docs/decisions/0002-security-headers.md.
 */
function contentSecurityPolicy(): string {
  const isDev = env.NODE_ENV === "development";
  const scriptSrc = ["'self'", "'unsafe-inline'"];
  const connectSrc = ["'self'"];
  // Turnstile draws its challenge in an iframe; without this the widget is blocked and every form fails.
  const frameSrc: string[] = [];

  if (isDev) scriptSrc.push("'unsafe-eval'");
  if (flags.turnstile) {
    scriptSrc.push(TURNSTILE_ORIGIN);
    connectSrc.push(TURNSTILE_ORIGIN);
    frameSrc.push(TURNSTILE_ORIGIN);
  }
  if (flags.analytics) {
    scriptSrc.push(PLAUSIBLE_ORIGIN);
    connectSrc.push(PLAUSIBLE_ORIGIN);
  }

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src ${connectSrc.join(" ")}`,
    "worker-src 'self' blob:",
    frameSrc.length ? `frame-src ${frameSrc.join(" ")}` : "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(env.NEXT_PUBLIC_SITE_URL.startsWith("https://") ? ["upgrade-insecure-requests"] : []),
  ];
  return directives.join("; ");
}

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Inline every public variable from the validated env, including unset ones as "", so client
  // code never falls back to a runtime `process.env` lookup (which ships a process polyfill).
  env: {
    NEXT_PUBLIC_SITE_URL: env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "",
    NEXT_PUBLIC_SCHEDULING_URL: env.NEXT_PUBLIC_SCHEDULING_URL ?? "",
    NEXT_PUBLIC_TEST_HOOKS: env.NEXT_PUBLIC_TEST_HOOKS ?? "",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // One address for search engines and links: www redirects to the canonical apex domain.
  // Never also redirect the apex to www in Vercel, or the two loop (docs/launch-checklist.md, step 5).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: `www.${CANONICAL.host}` }],
        destination: `${CANONICAL.origin}/:path*`,
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Belt and braces with the admin metadata: never index the admin area.
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
