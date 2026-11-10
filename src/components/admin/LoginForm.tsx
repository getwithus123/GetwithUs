"use client";

import { MailCheck } from "lucide-react";
import { useActionState, useState } from "react";
import FormAlert from "@/components/forms/FormAlert";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import { requestMagicLink, type LoginState } from "@/features/admin/actions";

const authErrors: Record<string, string> = {
  Verification: "That sign-in link has expired or was already used. Request a new one.",
  AccessDenied: "If that address is on the team list, a link is on its way.",
};

/** Email in, magic link out. The confirmation is the same whether or not the address is allowlisted. */
export default function LoginForm({ next, authError }: { next?: string; authError?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(requestMagicLink, {
    status: "idle",
  });
  // "Send another link" hides this confirmation; the next submission returns a new state and shows it again.
  const [dismissed, setDismissed] = useState<LoginState | null>(null);

  if (state.status === "sent" && state !== dismissed) {
    return (
      <div className="flex items-start gap-3" role="status">
        <Icon icon={MailCheck} size={24} className="mt-0.5 text-ok" />
        <div>
          <h2 className="type-h4">Check your email</h2>
          <p className="mt-1 text-body">
            If that address is on the team list, a link is on its way. If nothing arrives in a few
            minutes, send another.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={() => setDismissed(state)}
          >
            Send another link
          </Button>
        </div>
      </div>
    );
  }

  const message =
    state.status === "error"
      ? state.message
      : authError
        ? (authErrors[authError] ?? "That sign-in did not work. Request a new link.")
        : null;

  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Work email">
        {(control) => (
          <Input {...control} name="email" type="email" autoComplete="email" required />
        )}
      </Field>
      <FormAlert message={message} />
      <div>
        <Button type="submit" loading={pending}>
          Email me a sign-in link
        </Button>
      </div>
    </form>
  );
}
