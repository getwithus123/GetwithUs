import nodemailer, { type Transporter } from "nodemailer";
import { Resend } from "resend";
import { env } from "@/config/env";
import { emailError } from "@/lib/errors";
import { logger, maskEmail } from "@/lib/logger";
import { err, ok, type Result } from "@/lib/result";

export type OutgoingEmail = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

let resend: Resend | null = null;
let smtpTransport: Transporter | null = null;

function resendClient(): Resend {
  resend ??= new Resend(env.RESEND_API_KEY);
  return resend;
}

/**
 * SMTP over implicit TLS (SMTP_SECURE=true, usually port 465) or STARTTLS on
 * 587. requireTLS refuses to continue if the server does not upgrade, so the
 * password, codes and sign-in links are never sent in the clear. The timeouts
 * keep a stuck server from holding a form submission for minutes.
 */
function smtpClient(): Transporter {
  const secure = env.SMTP_SECURE === "true";
  smtpTransport ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? (secure ? 465 : 587),
    secure,
    requireTLS: !secure,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
  });
  return smtpTransport;
}

/**
 * Sends one email through Resend, SMTP (Nodemailer), or prints it with the
 * console transport. The console transport shows the full text (including
 * verification codes) only in development and test builds; production builds
 * record only that a message was suppressed.
 */
export async function sendEmail(email: OutgoingEmail): Promise<Result<{ id: string | null }>> {
  const recipients = Array.isArray(email.to) ? email.to : [email.to];

  // ── Console transport ──────────────────────────────────────────────────────
  if (env.EMAIL_TRANSPORT === "console") {
    if (env.NODE_ENV === "production" && env.NEXT_PUBLIC_TEST_HOOKS !== "1") {
      logger.warn("Email suppressed: EMAIL_TRANSPORT is console", {
        to: recipients.map(maskEmail),
      });
    } else {
      logger.info(
        `Email (console transport)\nTo: ${recipients.join(", ")}\nSubject: ${email.subject}\n\n${email.text}\n`,
      );
    }
    return ok({ id: null });
  }

  // ── SMTP transport (Nodemailer) ────────────────────────────────────────────
  if (env.EMAIL_TRANSPORT === "smtp") {
    try {
      const info = await smtpClient().sendMail({
        from: env.EMAIL_FROM,
        to: recipients.join(", "),
        subject: email.subject,
        html: email.html,
        text: email.text,
        replyTo: email.replyTo ?? env.EMAIL_REPLY_TO,
      });
      logger.info(`Email sent via SMTP: ${info.messageId}`);
      return ok({ id: info.messageId ?? null });
    } catch (error) {
      logger.error("SMTP sendMail failed", { error: String(error) });
      return err(emailError(error));
    }
  }

  // ── Resend transport ───────────────────────────────────────────────────────
  try {
    const { data, error } = await resendClient().emails.send(
      {
        from: env.EMAIL_FROM,
        to: recipients,
        subject: email.subject,
        html: email.html,
        text: email.text,
        replyTo: email.replyTo ?? env.EMAIL_REPLY_TO,
      },
      { signal: AbortSignal.timeout(5000) },
    );
    if (error) return err(emailError(error));
    return ok({ id: data?.id ?? null });
  } catch (error) {
    return err(emailError(error));
  }
}
