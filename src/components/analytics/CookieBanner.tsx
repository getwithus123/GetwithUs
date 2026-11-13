"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import Button from "@/components/ui/Button";
import { chooseConsent, getConsent, getServerConsent, subscribeConsent } from "@/lib/analytics";

/**
 * Asks once whether PostHog may use cookies and record visits. Shown only after
 * PostHog has loaded and only while the visitor has not chosen (or has reopened
 * it from "Cookie settings"). Until then, and after "Decline", visits are only
 * counted anonymously without cookies. Not a dialog: the page stays usable and
 * focus is left where it is.
 */
export default function CookieBanner() {
  const { status, open } = useSyncExternalStore(subscribeConsent, getConsent, getServerConsent);
  if (!open || status === "unavailable") return null;

  return (
    <section
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-4 bottom-[calc(16px+env(safe-area-inset-bottom,0px))] z-[60] grid gap-4 rounded-panel border border-line bg-card p-5 shadow-lift sm:right-auto sm:left-5 sm:max-w-[26rem]"
    >
      <h2 id="cookie-banner-title" className="font-display text-lg font-bold text-ink">
        Can we use cookies?
      </h2>
      <p className="type-small text-body">
        They show us how people use this site, including recordings of visits, so we can improve it.
        Anything you type in a form is hidden from recordings. If you decline, we only count visits,
        anonymously and without cookies.{" "}
        <Link
          href="/privacy#cookies-and-tracking"
          className="text-ink underline decoration-line-2 underline-offset-[3px] hover:decoration-ink"
        >
          Privacy policy
        </Link>
      </p>
      <div className="flex flex-wrap gap-3">
        <Button size="sm" onClick={() => chooseConsent(true)}>
          Accept
        </Button>
        <Button size="sm" variant="secondary" onClick={() => chooseConsent(false)}>
          Decline
        </Button>
      </div>
    </section>
  );
}
