"use client";

import { useSyncExternalStore } from "react";
import {
  getConsent,
  getServerConsent,
  openConsentSettings,
  subscribeConsent,
} from "@/lib/analytics";

/**
 * "Cookie settings" in the footer's legal list: reopens the cookie banner so a
 * choice can be changed. Appears once PostHog has loaded; never while analytics is off.
 */
export default function CookieSettingsItem({ className }: { className?: string }) {
  const { status } = useSyncExternalStore(subscribeConsent, getConsent, getServerConsent);
  if (status === "unavailable") return null;
  return (
    <li>
      <button type="button" className={className} onClick={openConsentSettings}>
        Cookie settings
      </button>
    </li>
  );
}
