"use client";

import { useFrame } from "@react-three/fiber";
import { createContext, useContext, useRef } from "react";
import { Color } from "three";

/** The page's colours as three.js colours, read from the CSS tokens of the current theme. */
export type ModelPalette = {
  bg: Color;
  card: Color;
  ink: Color;
  body: Color;
  line: Color;
  accent: Color;
  amber: Color;
  ok: Color;
  wa: Color;
  web: Color;
  mob: Color;
  data: Color;
  ai: Color;
  mkt: Color;
};

const TOKENS: Record<keyof ModelPalette, readonly [string, string]> = {
  bg: ["--bg", "#ffffff"],
  card: ["--card", "#ffffff"],
  ink: ["--ink", "#0f1b2d"],
  body: ["--body", "#46515f"],
  line: ["--line-2", "#d3dbe2"],
  accent: ["--accent", "#0e7c86"],
  amber: ["--amber", "#a05f00"],
  ok: ["--ok", "#127a43"],
  wa: ["--wa", "#15803d"],
  web: ["--c-web", "#2563eb"],
  mob: ["--c-mob", "#7c3aed"],
  data: ["--c-data", "#0e7c86"],
  ai: ["--c-ai", "#d9480f"],
  mkt: ["--c-mkt", "#be185d"],
};

export function readModelPalette(): ModelPalette {
  const css = getComputedStyle(document.documentElement);
  const entries = Object.entries(TOKENS).map(([key, [name, fallback]]) => [
    key,
    new Color(css.getPropertyValue(name).trim() || fallback),
  ]);
  return Object.fromEntries(entries) as ModelPalette;
}

type ModelSettings = { palette: ModelPalette; still: boolean; quality: "high" | "medium" | "low" };

export const ModelContext = createContext<ModelSettings | null>(null);

function useModelSettings(): ModelSettings {
  const settings = useContext(ModelContext);
  if (!settings) throw new Error("Page models render inside ModelCanvas");
  return settings;
}

/** The current theme's colours; models re-render with new ones when the theme changes. */
export function useModelPalette(): ModelPalette {
  return useModelSettings().palette;
}

/** The current quality tier. */
export function useModelQuality(): "high" | "medium" | "low" {
  return useModelSettings().quality;
}

/**
 * Runs a model's animation each rendered frame with a clamped step (so a pause
 * off screen never makes it jump). Under reduced motion it is called with time
 * 0 only, so every model's still pose is its pose at time 0.
 */
export function useModelFrame(callback: (delta: number, elapsed: number) => void): void {
  const { still } = useModelSettings();
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    if (still) {
      callback(0, 0);
      return;
    }
    const step = Math.min(delta, 1 / 20);
    elapsed.current += step;
    callback(step, elapsed.current);
  });
}
