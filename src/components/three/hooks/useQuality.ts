"use client";

import { useEffect } from "react";
import { useSceneStore, type Quality } from "@/stores/scene.store";

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

function hasWebGL2(): boolean {
  try {
    // A 1 x 1 probe, left for garbage collection. Releasing it with
    // WEBGL_lose_context makes Firefox log "WebGL context was lost" on every page.
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.getContext("webgl2") !== null;
  } catch {
    return false;
  }
}

/** Picks the performance tier once, from device signals (spec section 5.4). */
function pickQuality(): Quality {
  if (!hasWebGL2()) return "none";
  const mobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency || 4;
  const saveData = (navigator as NavigatorWithConnection).connection?.saveData === true;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Low only for explicit accessibility/data-saver prefs, or very old devices (<=2 cores).
  if (reduceMotion || saveData || cores <= 2) return "low";
  // High on capable desktops; medium everywhere else including modern mobiles.
  if (!mobile && cores >= 8 && window.devicePixelRatio <= 2) return "high";
  return "medium";
}

/**
 * The tier for this page load, chosen once and shared through the scene store.
 * Nothing is probed until `enabled`: creating even a 1 x 1 WebGL context starts
 * the browser's GPU process, which blocked hydration for hundreds of
 * milliseconds on a throttled phone.
 */
export function useQuality(enabled: boolean): Quality | null {
  const quality = useSceneStore((state) => state.quality);
  const setQuality = useSceneStore((state) => state.setQuality);

  useEffect(() => {
    if (enabled && quality === null) setQuality(pickQuality());
  }, [enabled, quality, setQuality]);

  return quality;
}
