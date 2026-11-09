"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { isAllowlisted } from "@/features/admin/allowlist";
import { requireAdmin } from "@/features/admin/auth";
import { loginSchema } from "@/features/admin/schema";
import { markAllNotificationsRead, markNotificationRead } from "@/features/notifications/service";
import { withAction, type ActionResult } from "@/lib/action";
import { validationError } from "@/lib/errors";
import { logger, maskEmail } from "@/lib/logger";
import { err, ok } from "@/lib/result";
import { signIn, signOut } from "@/server/auth/config";
import { checkRateLimits } from "@/server/rate-limit";
import { hashKey, ipHashFromHeaders } from "@/server/request";

export type LoginState =
  { status: "idle" } | { status: "sent" } | { status: "error"; message: string };

/** Only same-site admin paths may be the post-sign-in destination. */
function safeNext(next: string | undefined): string {
  return next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

/**
 * Emails a sign-in link when the address is on the team allowlist. The answer
 * is the same either way, so the form cannot be used to discover who is on it.
 */
export async function requestMagicLink(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) return { status: "error", message: "Enter a valid email address." };
  const { email, next } = parsed.data;

  const limited = await checkRateLimits([
    { key: `admin_login:ip:${ipHashFromHeaders(await headers())}`, limit: 5, windowSeconds: 900 },
    { key: `admin_login:email:${hashKey(email)}`, limit: 3, windowSeconds: 900 },
  ]);
  if (!limited.ok) {
    return {
      status: "error",
      message:
        limited.error.code === "RATE_LIMITED"
          ? "Too many requests from this connection. Try again in a few minutes."
          : "Something went wrong on our side. Try again in a minute.",
    };
  }

  if (isAllowlisted(email)) {
    try {
      const resultUrl = await signIn("resend", { email, redirect: false, redirectTo: safeNext(next) });
      if (typeof resultUrl === "string" && resultUrl.includes("error=")) {
        return {
          status: "error",
          message: "Failed to send email. Check SMTP server logs and credentials.",
        };
      }
    } catch (error) {
      unstable_rethrow(error);
      logger.error("Sign-in link not sent", { email: maskEmail(email), error });
      return {
        status: "error",
        message: "We could not send the email right now. Try again in a minute.",
      };
    }
  }
  return { status: "sent" };
}

/** Ends the session and returns to the sign-in page. */
export async function signOutAdmin(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}

/** Marks one notification as read. */
export async function markNotificationReadAction(id: string): Promise<ActionResult<null>> {
  return withAction("markNotificationRead", async () => {
    await requireAdmin();
    if (!z.uuid().safeParse(id).success)
      return err(validationError("That notification does not exist."));
    const result = await markNotificationRead(id);
    if (result.ok) refresh();
    return result;
  });
}

/** Marks every unread notification as read. */
export async function markAllNotificationsReadAction(): Promise<ActionResult<null>> {
  return withAction("markAllNotificationsRead", async () => {
    await requireAdmin();
    const result = await markAllNotificationsRead();
    if (!result.ok) return result;
    refresh();
    return ok(null);
  });
}
