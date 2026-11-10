import { describe, expect, it } from "vitest";
import { deploymentOrigin } from "@/lib/deployment";

const SITE = "https://getwithus.in";

describe("deploymentOrigin", () => {
  it("uses the site URL in production, never the per-deployment vercel.app address", () => {
    expect(
      deploymentOrigin({
        NEXT_PUBLIC_SITE_URL: SITE,
        VERCEL_ENV: "production",
        VERCEL_URL: "getwithus-abc123.vercel.app",
        VERCEL_BRANCH_URL: "getwithus-git-main.vercel.app",
      }),
    ).toBe(SITE);
  });

  it("uses a preview's own branch URL, since every preview shares one site URL", () => {
    expect(
      deploymentOrigin({
        NEXT_PUBLIC_SITE_URL: SITE,
        VERCEL_ENV: "preview",
        VERCEL_URL: "getwithus-abc123.vercel.app",
        VERCEL_BRANCH_URL: "getwithus-git-feature.vercel.app",
      }),
    ).toBe("https://getwithus-git-feature.vercel.app");
    expect(
      deploymentOrigin({
        NEXT_PUBLIC_SITE_URL: SITE,
        VERCEL_ENV: "preview",
        VERCEL_URL: "getwithus-abc123.vercel.app",
      }),
    ).toBe("https://getwithus-abc123.vercel.app");
  });

  it("uses the site URL off Vercel, such as a local copy", () => {
    expect(deploymentOrigin({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000" })).toBe(
      "http://localhost:3000",
    );
  });
});
