"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SplashScreen = dynamic(() => import("@/components/splash/SplashScreen"), {
  ssr: false,
});

export default function SplashWrapper() {
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = Boolean(sessionStorage.getItem("gwu-splash"));
    } catch {
      // Ignore
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!seen && !reduce) {
      setTimeout(() => setShouldMount(true), 0);
    }
  }, []);

  return (
    <>
      {/* Instant fallback backdrop rendered before three.js finishes loading */}
      <div id="gwu-splash-placeholder" aria-hidden="true" />
      {shouldMount ? <SplashScreen /> : null}
    </>
  );
}

