"use client";

import { useState, type FormEvent } from "react";
import FormAlert from "@/components/forms/FormAlert";
import Button from "@/components/ui/Button";
import CodeInput from "@/components/ui/CodeInput";
import Field from "@/components/ui/Field";
import { errorCopy, formCopy } from "@/content/forms";
import { resendLeadCode, verifyLeadCode } from "@/features/leads/client";
import { track } from "@/lib/analytics";
import { useCountdown } from "@/hooks/useCountdown";

type VerifyCodeStepProps = {
  leadId: string;
  email: string;
  /** What the code confirms, for the intro sentence. */
  subject: "message" | "brief";
  resendAvailableAt: string;
  onVerified: () => void;
  onResent: (resendAvailableAt: string) => void;
  onChangeEmail: () => void;
};

type Status =
  | { name: "idle" }
  | { name: "checking" }
  | { name: "verified" }
  | { name: "error"; message: string };

const textButton =
  "rounded-tag type-small text-body underline decoration-line-2 underline-offset-[3px] transition-colors duration-150 ease-out hover:text-ink disabled:cursor-not-allowed disabled:text-muted disabled:no-underline";

/**
 * "We sent a 6-digit code": the code boxes, Confirm, Resend with a 60 second
 * countdown, and a way back to the form with every answer kept.
 */
export default function VerifyCodeStep({
  leadId,
  email,
  subject,
  resendAvailableAt,
  onVerified,
  onResent,
  onChangeEmail,
}: VerifyCodeStepProps) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>({ name: "idle" });
  const [notice, setNotice] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const secondsLeft = useCountdown(resendAvailableAt);

  const verify = async (value: string) => {
    if (status.name === "checking" || status.name === "verified") return;
    if (!/^\d{6}$/.test(value)) {
      setStatus({ name: "error", message: "Enter the 6-digit code from the email." });
      return;
    }
    setStatus({ name: "checking" });
    setNotice(null);
    const result = await verifyLeadCode(leadId, value);
    if (result.ok) {
      setStatus({ name: "verified" });
      track("lead_email_verified", { form: subject === "brief" ? "brief" : "contact" });
      // Let the boxes turn green before the success state replaces them.
      window.setTimeout(onVerified, 400);
      return;
    }
    const remaining = result.error.details?.remainingAttempts;
    setStatus({
      name: "error",
      message: errorCopy(result.error.code, {
        remainingAttempts: typeof remaining === "number" ? remaining : undefined,
        message: result.error.message,
      }),
    });
  };

  const resend = async () => {
    setResending(true);
    setNotice(null);
    const result = await resendLeadCode(leadId);
    setResending(false);
    if (result.ok) {
      setCode("");
      setStatus({ name: "idle" });
      setNotice(formCopy.verify.resent);
      onResent(result.data.resendAvailableAt);
      return;
    }
    setStatus({
      name: "error",
      message: errorCopy(result.error.code, { message: result.error.message }),
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void verify(code);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      {/* Focus lands on the first code box; the intro is its description, so it is read out there. */}
      <h2 className="type-h3">{formCopy.verify.title}</h2>
      <Field
        label={formCopy.verify.codeLabel}
        hint={formCopy.verify.intro(email, subject)}
        error={status.name === "error" ? status.message : undefined}
      >
        {(control) => (
          <CodeInput
            {...control}
            value={code}
            onChange={(value) => {
              setCode(value);
              if (status.name === "error") setStatus({ name: "idle" });
            }}
            onComplete={(value) => void verify(value)}
            autoFocus
            disabled={status.name === "checking" || status.name === "verified"}
            status={
              status.name === "verified" ? "success" : status.name === "error" ? "error" : "idle"
            }
          />
        )}
      </Field>
      <FormAlert message={notice} tone="status" />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <Button
          type="submit"
          loading={status.name === "checking"}
          disabled={status.name === "verified"}
        >
          {formCopy.verify.confirm}
        </Button>
        <button
          type="button"
          className={textButton}
          disabled={secondsLeft > 0 || resending}
          onClick={() => void resend()}
        >
          {secondsLeft > 0 ? formCopy.verify.resendIn(secondsLeft) : formCopy.verify.resend}
        </button>
        <button type="button" className={textButton} onClick={onChangeEmail}>
          {formCopy.verify.differentEmail}
        </button>
      </div>
    </form>
  );
}
