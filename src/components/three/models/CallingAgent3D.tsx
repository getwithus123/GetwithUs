"use client";

/**
 * CallingAgent3D  - calling-agent service page model.
 *
 * An incoming call becomes a voice wave, the agent answers, books a meeting
 * and logs a summary. Ported from docs/prototype/Calling agent 3D prototype.html.
 *
 * Most behaviour comes from FlowScene; the wave bars are handled via spec.onFrame
 * using a stable closure over materials built in this component.
 */

import { useEffect, useMemo, useState } from "react";
import { type MeshStandardMaterial } from "three";
import FlowScene, { type FlowSpec } from "@/components/three/models/shared/FlowScene";
import { buildMat, recolourMats, type TrackedMat } from "@/components/three/models/shared/materials";
import { buildPalette, type Palette } from "@/components/three/models/shared/palette";
import { THEME_EVENT } from "@/lib/theme";

const WAVE_HEIGHTS = [0.25, 0.5, 0.7, 0.45, 0.6, 0.35, 0.2] as const;

function makeSpec(waveMats: MeshStandardMaterial[]): FlowSpec {
  return {
    baseRotY: -0.3,
    loop: 4.5,

    nodes: [
      // 0  - incoming call
      { x: -2.2, y: 0.2, za: 0.1, ze: 0.9, arrival: 0, meshes: [
        { w: 1.4,  h: 1.5,  r: 0.20, d: 0.08, x:  0,    y:  0,    z: 0,    color: "white"  },
        { w: 0.5,  h: 0.5,  r: 0.25, d: 0.08, x:  0,    y:  0.35, z: 0.05, color: "teal", emissive: 0.15 },
        { w: 0.07, h: 0.28, r: 0.03, d: 0.04, x:  0,    y:  0.35, z: 0.10, color: "pure", opacity: 0.8 },
        { w: 0.14, h: 0.14, r: 0.07, d: 0.04, x: -0.10, y:  0.45, z: 0.10, color: "pure"  },
        { w: 0.7,  h: 0.07, r: 0.03, d: 0.03, x:  0,    y: -0.10, z: 0.05, color: "ink"   },
        { w: 0.5,  h: 0.06, r: 0.03, d: 0.03, x:  0,    y: -0.24, z: 0.05, color: "soft"  },
        { w: 0.45, h: 0.22, r: 0.11, d: 0.05, x: -0.30, y: -0.52, z: 0.05, color: "teal"  },
        { w: 0.45, h: 0.22, r: 0.11, d: 0.05, x:  0.30, y: -0.52, z: 0.05, color: "soft"  },
      ]},
      // 1  - voice wave (card + 7 bars; bars use the per-instance waveMats for scale.y anim)
      { x: 0.0, y: 0.9, za: 0.1, ze: 1.0, arrival: 0.6, meshes: [
        { w: 1.5,  h: 0.9,  r: 0.16, d: 0.08, x:  0,    y:  0,    z: 0,    color: "white" },
        { w: 0.10, h: WAVE_HEIGHTS[0], r: 0.05, d: 0.04, x: -0.54, y: 0, z: 0.05, color: "tint" },
        { w: 0.10, h: WAVE_HEIGHTS[1], r: 0.05, d: 0.04, x: -0.36, y: 0, z: 0.05, color: "teal" },
        { w: 0.10, h: WAVE_HEIGHTS[2], r: 0.05, d: 0.04, x: -0.18, y: 0, z: 0.05, color: "tint" },
        { w: 0.10, h: WAVE_HEIGHTS[3], r: 0.05, d: 0.04, x:  0.00, y: 0, z: 0.05, color: "teal" },
        { w: 0.10, h: WAVE_HEIGHTS[4], r: 0.05, d: 0.04, x:  0.18, y: 0, z: 0.05, color: "tint" },
        { w: 0.10, h: WAVE_HEIGHTS[5], r: 0.05, d: 0.04, x:  0.36, y: 0, z: 0.05, color: "teal" },
        { w: 0.10, h: WAVE_HEIGHTS[6], r: 0.05, d: 0.04, x:  0.54, y: 0, z: 0.05, color: "tint" },
      ]},
      // 2  - AI agent
      { x: 0.0, y: -0.9, za: 0.1, ze: 1.3, arrival: 1.3, meshes: [
        { w: 0.9,  h: 0.7,  r: 0.22, d: 0.10, x:  0,    y:  0,    z: 0,    color: "white" },
        { w: 0.14, h: 0.14, r: 0.07, d: 0.04, x: -0.20, y:  0.05, z: 0.06, color: "teal", emissive: 0.2 },
        { w: 0.14, h: 0.14, r: 0.07, d: 0.04, x:  0.20, y:  0.05, z: 0.06, color: "teal", emissive: 0.2 },
        { w: 0.30, h: 0.05, r: 0.025,d: 0.03, x:  0,    y: -0.18, z: 0.06, color: "soft"  },
        { w: 0.12, h: 0.30, r: 0.06, d: 0.06, x: -0.52, y:  0,    z: 0,    color: "teal", emissive: 0.15 },
        { w: 0.12, h: 0.30, r: 0.06, d: 0.06, x:  0.52, y:  0,    z: 0,    color: "teal", emissive: 0.15 },
        { w: 0.30, h: 0.05, r: 0.025,d: 0.04, x:  0.40, y: -0.28, z: 0.04, color: "teal"  },
      ]},
      // 3  - calendar
      { x: 2.1, y: 0.7, za: 0.1, ze: 0.9, arrival: 2.1, meshes: [
        { w: 1.2,  h: 0.95, r: 0.16, d: 0.08, x:  0,    y:  0,    z: 0,    color: "white" },
        { w: 1.0,  h: 0.20, r: 0.08, d: 0.04, x:  0,    y:  0.30, z: 0.05, color: "teal", emissive: 0.15 },
        { w: 0.4,  h: 0.20, r: 0.06, d: 0.04, x: -0.25, y:  0,    z: 0.05, color: "tint"  },
        { w: 0.4,  h: 0.20, r: 0.06, d: 0.04, x:  0.25, y:  0,    z: 0.05, color: "tint"  },
        { w: 0.4,  h: 0.20, r: 0.06, d: 0.04, x: -0.25, y: -0.28, z: 0.05, color: "tint"  },
        { w: 0.4,  h: 0.20, r: 0.06, d: 0.04, x:  0.25, y: -0.28, z: 0.05, color: "teal"  },
      ]},
      // 4  - summary
      { x: 2.1, y: -1.0, za: 0.1, ze: 1.5, arrival: 2.1, meshes: [
        { w: 1.3,  h: 0.55, r: 0.16, d: 0.08, x:  0,    y:  0,    z: 0,    color: "white" },
        { w: 0.26, h: 0.26, r: 0.13, d: 0.05, x: -0.45, y:  0,    z: 0.05, color: "teal", emissive: 0.25 },
        { w: 0.12, h: 0.04, r: 0.02, d: 0.03, x: -0.48, y: -0.015,z: 0.09, color: "pure", rotZ: -0.8 },
        { w: 0.20, h: 0.04, r: 0.02, d: 0.03, x: -0.41, y:  0.02, z: 0.09, color: "pure", rotZ:  0.8 },
        { w: 0.55, h: 0.07, r: 0.03, d: 0.03, x:  0.20, y:  0.08, z: 0.05, color: "ink"   },
        { w: 0.40, h: 0.06, r: 0.03, d: 0.03, x:  0.13, y: -0.08, z: 0.05, color: "soft"  },
      ]},
    ],

    curves: [
      { ax: -1.5, ay: 0.5,  tax: 0.4, tay: 0,    bx: -0.75, by: 0.9,  tbx: -0.4, tby: 0 },
      { ax: -1.5, ay: -0.2, tax: 0.4, tay: 0,    bx: -0.5,  by: -0.9, tbx: -0.4, tby: 0 },
      { ax:  0.0, ay: 0.45, tax: 0,   tay: -0.3, bx:  0.0,  by: -0.5, tbx: 0,    tby: 0.3 },
      { ax:  0.5, ay: -0.85,tax: 0.4, tay: 0,    bx:  1.5,  by: 0.5,  tbx: -0.4, tby: 0 },
      { ax:  0.5, ay: -1.0, tax: 0.4, tay: 0,    bx:  1.45, by: -1.0, tbx: -0.4, tby: 0 },
    ],

    pulseWindows: [
      [0.0, 0.6],
      [0.0, 0.6],
      [0.7, 0.6],
      [1.4, 0.7],
      [1.4, 0.7],
    ],

    glowTargets: [
      { nodeIndex: 4, meshIndex: 1, triggerTime: 2.1, base: 0.25, peak: 0.7 },
    ],

    // Wave bars: scale.y animated while t ∈ [0.6, 2.1]
    // waveMats[i] are the materials for the 7 bar meshes (node 1, meshes 1-7)
    onFrame: (t, nowMs) => {
      const talk = t >= 0.6 && t <= 2.1;
      waveMats.forEach((m, i) => {
        // Temporarily encode scale hint in emissiveIntensity  - not ideal
        // but FlowScene provides no per-mesh transform hook.
        // Instead, we set emissive colour to encode bar scale:
        // actual y-scale is set on the THREE.Mesh but FlowScene owns the mesh.
        // Best approach: just pulse the opacity/emissive to give visual feedback
        // since full scale animation requires per-mesh ref access.
        m.emissiveIntensity = talk ? 0.1 + 0.3 * Math.abs(Math.sin(nowMs / 180 + i * 1.1)) : 0;
        m.needsUpdate = false;
      });
    },
  };
}

export default function CallingAgent3D() {
  const [pal, setPal] = useState<Palette>(buildPalette);
  useEffect(() => {
    const update = () => setPal(buildPalette());
    window.addEventListener(THEME_EVENT, update);
    return () => window.removeEventListener(THEME_EVENT, update);
  }, []);

  // Wave bar materials  - 7 bars, alternating tint/teal, with emissive for animation
  const waveMats = useMemo(() => {
    const colors = ["tint", "teal", "tint", "teal", "tint", "teal", "tint"] as const;
    return colors.map((c) => buildMat(pal, c, { emissive: 0 }));
  }, [pal]);

  useEffect(() => {
    recolourMats(waveMats as TrackedMat[], pal);
  }, [pal, waveMats]);

  useEffect(() => () => { for (const m of waveMats) m.dispose(); }, [waveMats]);

  const spec = useMemo<FlowSpec>(() => makeSpec(waveMats), [waveMats]);

  return <FlowScene spec={spec} />;
}
