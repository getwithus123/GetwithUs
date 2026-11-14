/*
 * Settings shared by the page model canvases (ModelCanvas): one tier per
 * device class, chosen once per visit by useQuality.
 */
import type { Quality } from "@/stores/scene.store";

type TierSettings = {
  /** Device pixel ratio range for the canvas. */
  dpr: number | [number, number];
  /**
   * Whether to enable PCFSoftShadowMap on the renderer.
   * Passed as the `shadows` prop on <Canvas> so R3F sets it declaratively
   * (avoids mutating the renderer object from inside a component).
   */
  shadows: boolean;
};

export const TIERS: Record<Exclude<Quality, "none">, TierSettings> = {
  high:   { dpr: [1, 1.75], shadows: true  },
  medium: { dpr: [1, 1.25], shadows: true  },
  low:    { dpr: 1,         shadows: false },
};
