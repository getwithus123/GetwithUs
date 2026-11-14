# 0002. Security headers in next.config.ts, with a static CSP

Date: 2026-10-31

## Context

Spec section 16 asks for security headers from either `src/proxy.ts` or `headers()` in `next.config.ts`, and for a Content-Security-Policy that prefers a nonce if the installed Next.js supports it cleanly.

The bundled Next.js 16.4 guide (`content-security-policy.md`) says a nonce must be generated per request, which forces every page to render dynamically, and that a nonce-based CSP is incompatible with the static shell that `cacheComponents` produces. Section 8.3 of the spec requires the marketing pages to be fully static.

## Decision

- All security headers are set once, for every path, in `headers()` in `next.config.ts`. `src/proxy.ts` handles only the admin redirect, and removes cookies from analytics requests before they are forwarded to PostHog.
- The CSP is static. `script-src` is `'self' 'unsafe-inline'`, because Next.js emits inline scripts for the React Server Components payload and there is no nonce to attach to them. `'unsafe-eval'` is added in development only, because React uses `eval` for dev tooling.
- Third-party origins are added only when their feature flag is on: Cloudflare Turnstile (`script-src`, `connect-src`, `frame-src`). PostHog needs none: its script and data go through `/gwr` on this origin (rewrites in `next.config.ts`).
- `frame-src` is `'none'` unless Turnstile is on. `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`.
- `img-src 'self' data: blob:` and `worker-src 'self' blob:` cover anything the 3D scene creates at runtime. The scene uses no textures, HDRIs, or remote assets.
- `upgrade-insecure-requests` is added only when `NEXT_PUBLIC_SITE_URL` is HTTPS, so `next dev` and `next start` on plain-HTTP localhost keep working.

## Consequences

- Marketing pages stay static and cacheable at the edge.
- `'unsafe-inline'` for scripts weakens XSS protection compared with a nonce. The site renders no user-generated HTML, React escapes all output, and the only `dangerouslySetInnerHTML` is JSON-LD built from typed objects with `<` escaped, which keeps the practical risk low.
- When Next.js supports hashes or SRI for the static shell without breaking inline scripts, revisit this decision. The experimental `sri` option exists but cannot cover dynamically generated scripts.
