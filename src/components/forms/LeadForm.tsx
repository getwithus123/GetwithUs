"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import FormAlert from "@/components/forms/FormAlert";
import Honeypot from "@/components/forms/Honeypot";
import { serviceOptions } from "@/components/forms/service-options";
import SuccessStep from "@/components/forms/SuccessStep";
import Turnstile from "@/components/forms/Turnstile";
import { useLeadSubmission } from "@/components/forms/useLeadSubmission";
import VerifyCodeStep from "@/components/forms/VerifyCodeStep";
import Button from "@/components/ui/Button";
import ChipGroup from "@/components/ui/ChipGroup";
import Field from "@/components/ui/Field";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { formCopy } from "@/content/forms";
import { contactFieldsSchema } from "@/features/leads/schema";
import { track } from "@/lib/analytics";

type Phase =
  | { name: "editing" }
  | { name: "verifying"; leadId: string; email: string; resendAvailableAt: string }
  | { name: "done"; email: string };

const fieldNames = ["name", "email", "company", "services", "message"] as const;

/**
 * The contact form. After "Send and verify" it is replaced in place by the code
 * step; "Use a different email" brings it back with every value kept.
 */
export default function LeadForm() {
  const [phase, setPhase] = useState<Phase>({ name: "editing" });
  const { submit, honeypot, onTurnstileToken, formError } = useLeadSubmission();
  const started = useRef(false);
  const form = useForm({
    resolver: zodResolver(contactFieldsSchema),
    defaultValues: { name: "", email: "", company: "", services: [], message: "" },
    mode: "onTouched",
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await submit({ source: "contact", ...values }, (fieldErrors) => {
      for (const name of fieldNames) {
        const message = fieldErrors[name]?.[0];
        if (message) form.setError(name, { message });
      }
    });
    if (result) setPhase({ name: "verifying", ...result });
  });

  if (phase.name === "verifying") {
    return (
      <VerifyCodeStep
        leadId={phase.leadId}
        email={phase.email}
        subject="message"
        resendAvailableAt={phase.resendAvailableAt}
        onVerified={() => setPhase({ name: "done", email: phase.email })}
        onResent={(resendAvailableAt) => setPhase({ ...phase, resendAvailableAt })}
        onChangeEmail={() => setPhase({ name: "editing" })}
      />
    );
  }

  if (phase.name === "done") return <SuccessStep message={formCopy.success.contact(phase.email)} />;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative grid gap-6"
      // The first focus inside the form counts as starting it, once per page load.
      onFocus={() => {
        if (started.current) return;
        started.current = true;
        track("form_started", { form: "contact" });
      }}
    >
      <Field label={formCopy.fields.name} error={errors.name?.message}>
        {(control) => <Input {...control} {...form.register("name")} autoComplete="name" />}
      </Field>
      <Field
        label={formCopy.fields.email}
        hint={formCopy.hints.email}
        error={errors.email?.message}
      >
        {(control) => (
          <Input
            {...control}
            {...form.register("email")}
            type="email"
            autoComplete="email"
            inputMode="email"
          />
        )}
      </Field>
      <Field label={formCopy.fields.company} optional error={errors.company?.message}>
        {(control) => (
          <Input {...control} {...form.register("company")} autoComplete="organization" />
        )}
      </Field>
      <Field label={formCopy.fields.services} optional group error={errors.services?.message}>
        {(control) => (
          <Controller
            control={form.control}
            name="services"
            render={({ field }) => (
              <ChipGroup
                id={control.id}
                name={field.name}
                options={serviceOptions}
                value={field.value ?? []}
                onChange={field.onChange}
              />
            )}
          />
        )}
      </Field>
      <Field label={formCopy.fields.message} error={errors.message?.message}>
        {(control) => (
          <Textarea {...control} {...form.register("message")} rows={6} maxLength={2000} />
        )}
      </Field>
      <Honeypot inputRef={honeypot} />
      <Turnstile onToken={onTurnstileToken} />
      <FormAlert message={formError} />
      <div>
        <Button type="submit" loading={isSubmitting}>
          {formCopy.sendAndVerify}
        </Button>
      </div>
    </form>
  );
}
