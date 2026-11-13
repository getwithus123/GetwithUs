"use client";

import { useRef, useState } from "react";
import { errorCopy } from "@/content/forms";
import { submissionFacts } from "@/features/leads/analytics";
import { readUtm, submitLeadRequest } from "@/features/leads/client";
import type { SubmitLeadResult } from "@/features/leads/service";
import { useFormToken } from "@/hooks/useFormToken";
import { identifyLead, track } from "@/lib/analytics";

type FieldErrors = Record<string, string[] | undefined>;

/**
 * What both public forms share on submit: the signed form token, the honeypot,
 * the Turnstile token, campaign attribution, and mapping API errors to copy.
 * Field errors go back to the form; everything else becomes one form-level message.
 */
export function useLeadSubmission() {
  const token = useFormToken();
  const honeypot = useRef<HTMLInputElement>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (
    fields: Record<string, unknown>,
    onFieldErrors: (errors: FieldErrors) => void,
  ): Promise<SubmitLeadResult | null> => {
    setFormError(null);
    const formToken = await token.get();
    if (!formToken) {
      setFormError(errorCopy("INTERNAL"));
      return null;
    }
    const result = await submitLeadRequest({
      ...fields,
      formToken,
      website: honeypot.current?.value || undefined,
      turnstileToken: turnstileToken ?? undefined,
      utm: readUtm(),
    });
    if (result.ok) {
      track("lead_submitted", submissionFacts(fields));
      identifyLead(result.data.leadId);
      return result.data;
    }

    const { code, details, message } = result.error;
    if (code === "VALIDATION_ERROR" && details?.fieldErrors)
      onFieldErrors(details.fieldErrors as FieldErrors);
    // A rejected token is usually stale; the next attempt gets a fresh one.
    if (code === "BOT_CHECK_FAILED") token.refresh();
    setFormError(errorCopy(code, { message }));
    return null;
  };

  return { submit, honeypot, onTurnstileToken: setTurnstileToken, formError };
}
