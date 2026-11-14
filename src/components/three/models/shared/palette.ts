/**
 * Theme-aware colour palette for the prototype-ported models.
 * Hex values match the prototypes byte-for-byte. Re-read on THEME_EVENT.
 *
 * Keys match the prototype's PAL.light/dark keys exactly so colour-key strings
 * from the data files remain meaningful.
 */
export type PaletteKey = "teal" | "ink" | "white" | "soft" | "tint" | "pure";

export type Palette = Record<PaletteKey, string>;

function isDark(): boolean {
  const t = document.documentElement.dataset["theme"];
  return t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function buildPalette(): Palette {
  return isDark()
    ? { teal: "#2fb5bf", ink: "#e8eef4", white: "#dfe8ef", soft: "#9aa8b6", tint: "#3a6a72", pure: "#ffffff" }
    : { teal: "#0f5f66", ink: "#0f1b2d", white: "#ffffff",  soft: "#b7c0c9", tint: "#8fc3cb", pure: "#ffffff" };
}
