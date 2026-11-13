"use client";

import type { AnchorHTMLAttributes } from "react";
import { track } from "@/lib/analytics";

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** How the visitor is getting in touch, for the `contact_clicked` event. */
  kind: "email" | "whatsapp";
};

/**
 * A plain link to our email or WhatsApp that records `contact_clicked` with
 * the channel. Lets the server components that use it (footer, contact
 * details, the WhatsApp button) stay server components. Sends no address.
 */
export default function TrackedLink({ kind, onClick, ...props }: TrackedLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        track("contact_clicked", { channel: kind });
        onClick?.(event);
      }}
    />
  );
}
