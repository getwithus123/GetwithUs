  "use client";

/*
 * The canvas for a page model. This module and everything it imports (three,
 * fiber, drei, the models) form the 3D chunk, loaded only by WebGLModel once
 * the visitor has interacted and the panel is near the viewport.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { onFrame } from "@/components/motion/frame";
import { TIERS } from "@/components/three/constants";
import { MODELS } from "@/components/three/models";
import {
  ModelContext,
  readModelPalette,
  type ModelPalette,
} from "@/components/three/models/context";
import { MODEL_VIEWS, OWN_LIGHTS_MODELS, type ModelKey, type ModelProps } from "@/components/three/models/keys";
import { THEME_EVENT } from "@/lib/theme";
import { useSceneStore, type Quality } from "@/stores/scene.store";

const FRAME_MS = 1000 / 30;

/** Renders at 30 frames per second while active; one frame at a time otherwise (still, or a theme change). */
function Driver({
  active,
  still,
  palette,
  onReady,
}: {
  active: boolean;
  still: boolean;
  palette: ModelPalette;
  onReady: () => void;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const size = useThree((state) => state.size);
  const reported = useRef(false);

  // A new frame whenever the colours or the canvas size change: a still model's
  // only frame must come after the canvas has its size, or nothing is drawn.
  useEffect(() => {
    invalidate();
  }, [palette, size, invalidate]);

  useEffect(() => {
    if (!active || still) {
      invalidate();
      return;
    }
    let last = 0;
    return onFrame((now) => {
      if (now - last < FRAME_MS - 2) return;
      last = now;
      invalidate();
    });
  }, [active, still, invalidate]);

  useFrame(() => {
    if (reported.current) return;
    reported.current = true;
    requestAnimationFrame(onReady);
  });

  return null;
}

function Lights({ palette }: { palette: ModelPalette }) {
  return (
    <>
      <hemisphereLight color="#ffffff" groundColor={palette.line} intensity={1.3} />
      <directionalLight position={[3, 5, 4]} intensity={1.8} />
      <directionalLight position={[-4, 1.5, -2]} intensity={0.6} color={palette.accent} />
    </>
  );
}

export default function ModelCanvas({
  model,
  quality,
  active,
  still,
  onReady,
  modelProps,
}: {
  model: ModelKey;
  quality: Exclude<Quality, "none">;
  active: boolean;
  still: boolean;
  onReady: () => void;
  modelProps?: ModelProps;
}) {
  const Model = MODELS[model];
  const [palette, setPalette] = useState(readModelPalette);
  const setQuality = useSceneStore((state) => state.setQuality);

  useEffect(() => {
    const update = () => setPalette(readModelPalette());
    window.addEventListener(THEME_EVENT, update);
    return () => window.removeEventListener(THEME_EVENT, update);
  }, []);

  return (
    <Canvas
      dpr={TIERS[quality].dpr}
      shadows={TIERS[quality].shadows ? "soft" : false}
      frameloop="demand"
      gl={{ antialias: quality !== "low", alpha: true, powerPreference: "high-performance" }}
      camera={{
        fov: MODEL_VIEWS[model]?.fov ?? 32,
        near: 0.1,
        far: 60,
        position: MODEL_VIEWS[model]?.position ?? [0, 0.5, 7.2],
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener("webglcontextlost", () => setQuality("none"), {
          once: true,
        });
      }}
    >
      <ModelContext value={{ palette, still, quality }}>
        {OWN_LIGHTS_MODELS.has(model) ? null : <Lights palette={palette} />}
        <Driver active={active} still={still} palette={palette} onReady={onReady} />
        <Model {...modelProps} />
      </ModelContext>
    </Canvas>
  );
}
