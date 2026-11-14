import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { ANALYTICS_PATH } from "@/config/analytics";
import { config, proxy } from "@/proxy";

describe("proxy", () => {
  it("forwards analytics requests to PostHog without this site's cookies", () => {
    const request = new NextRequest(`https://getwithus.in${ANALYTICS_PATH}/e/`, {
      method: "POST",
      headers: {
        cookie: "__Secure-authjs.session-token=secret; ph_phc_test_posthog=1",
        "x-forwarded-for": "203.0.113.9",
      },
    });
    const response = proxy(request);

    // Next.js forwards exactly the headers listed here and drops the rest (resolve-routes.js).
    const kept = response.headers.get("x-middleware-override-headers")?.split(",") ?? [];
    expect(kept).not.toContain("cookie");
    expect(response.headers.get("x-middleware-request-cookie")).toBeNull();
    expect(response.headers.get("x-middleware-request-x-forwarded-for")).toBe("203.0.113.9");
    expect(response.headers.get("location")).toBeNull();
  });

  it("runs for the analytics path, whose matcher has to be written out", () => {
    expect(config.matcher).toContain(`${ANALYTICS_PATH}/:path*`);
  });

  it("sends admin visitors without a session to sign in, and lets signed-in ones through", () => {
    const anonymous = proxy(new NextRequest("https://getwithus.in/admin/leads?page=2"));
    expect(anonymous.headers.get("location")).toBe(
      "https://getwithus.in/admin/login?next=%2Fadmin%2Fleads%3Fpage%3D2",
    );

    const signedIn = proxy(
      new NextRequest("https://getwithus.in/admin/leads", {
        headers: { cookie: "__Secure-authjs.session-token=secret" },
      }),
    );
    expect(signedIn.headers.get("location")).toBeNull();
    expect(signedIn.headers.get("x-middleware-next")).toBe("1");
  });
});
