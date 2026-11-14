"use client";

import { useEffect } from "react";
import CookieBanner from "@/components/analytics/CookieBanner";
import { startAnalytics } from "@/lib/analytics";

/** Starts PostHog on the public pages once they are idle, and asks about cookies. Off until the key is set. */
export default function Analytics() {
  useEffect(() => {
    startAnalytics();
  }, []);
  return <CookieBanner />;
}
