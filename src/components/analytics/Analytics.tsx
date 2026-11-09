"use client";

import { useEffect } from "react";
import { startAnalytics } from "@/lib/analytics";

/** Starts PostHog on the public pages once they are idle. Renders nothing; off until the key is set. */
export default function Analytics() {
  useEffect(() => {
    startAnalytics();
  }, []);
  return null;
}
