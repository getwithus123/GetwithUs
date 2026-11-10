type DeploymentVars = {
  NEXT_PUBLIC_SITE_URL: string;
  VERCEL_ENV?: "production" | "preview" | "development";
  VERCEL_BRANCH_URL?: string;
  VERCEL_URL?: string;
};

/**
 * The origin of the deployment this code runs on, for links that must come back
 * to it (such as admin links in lead notifications). Every Vercel preview shares
 * one NEXT_PUBLIC_SITE_URL, so a preview uses its own branch URL instead. In
 * production VERCEL_URL is the per-deployment vercel.app address, so it is used
 * only on previews; production and local copies use NEXT_PUBLIC_SITE_URL.
 */
export function deploymentOrigin(vars: DeploymentVars): string {
  const preview =
    vars.VERCEL_ENV === "preview" ? vars.VERCEL_BRANCH_URL || vars.VERCEL_URL : undefined;
  return preview ? `https://${preview}` : new URL(vars.NEXT_PUBLIC_SITE_URL).origin;
}
