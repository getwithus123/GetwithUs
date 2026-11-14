import { NextResponse, type NextRequest } from "next/server";
import { ANALYTICS_PATH } from "@/config/analytics";

// Auth.js session cookie names: plain on http://localhost, __Secure- prefixed over HTTPS.
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

/**
 * Analytics requests go on to PostHog (the rewrites in next.config.ts) without
 * this site's cookies: the browser attaches every cookie for the site, including
 * a team member's admin session, and PostHog needs none of them. The visitor's
 * IP (x-forwarded-for) still goes, for PostHog's cookieless count.
 */
function withoutCookies(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete("cookie");
  return NextResponse.next({ request: { headers } });
}

/**
 * Optimistic admin gate: requests under /admin without a session cookie go to
 * the sign-in page with `next` set. The admin layout and every admin action
 * still verify the session against the database (defense in depth). Security
 * headers are set for every route in next.config.ts.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith(`${ANALYTICS_PATH}/`)) return withoutCookies(request);
  if (pathname === "/admin/login") return NextResponse.next();
  if (SESSION_COOKIES.some((name) => request.cookies.has(name))) return NextResponse.next();
  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

// Matchers must be literals; "/gwr" is ANALYTICS_PATH (tests/unit/proxy.test.ts checks they agree).
export const config = { matcher: ["/admin/:path*", "/gwr/:path*"] };
