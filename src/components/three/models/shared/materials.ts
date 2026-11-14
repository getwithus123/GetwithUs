/**
 * Material factory for prototype-ported models.
 *
 * Every material records its palette key (k) and emissive intensity (e) in
 * userData so recolourMats() can update colours on theme change without
 * rebuilding geometry or the scene graph.
 */
import { Color, MeshStandardMaterial } from "three";
import type { Palette, PaletteKey } from "@/components/three/models/shared/palette";

export type TrackedMat = MeshStandardMaterial & {
  userData: { k: PaletteKey; e: number };
};

export function buildMat(
  pal: Palette,
  key: PaletteKey,
  opts: { emissive?: number; opacity?: number; rotZ?: number } = {},
): TrackedMat {
  const opacity = opts.opacity ?? 1;
  const ei = opts.emissive ?? 0;
  const m = new MeshStandardMaterial({
    color: new Color(pal[key]),
    roughness: 0.5,
    metalness: 0,
    transparent: opacity < 1,
    opacity,
    ...(ei > 0 && { emissive: new Color(pal.teal), emissiveIntensity: ei }),
  }) as TrackedMat;
  m.userData = { k: key, e: ei };
  return m;
}

/** Re-applies palette colours to every tracked material after a theme change. */
export function recolourMats(mats: TrackedMat[], pal: Palette): void {
  for (const m of mats) {
    m.color.set(pal[m.userData.k]);
    if (m.userData.e > 0) m.emissive?.set(pal.teal);
  }
}
