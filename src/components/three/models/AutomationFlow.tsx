"use client";

/**
 * AutomationFlow  - agentic-automation service page model.
 *
 * A trigger fires, a condition branches, actions run, and the result lands.
 * Ported from docs/prototype/Automation 3D prototype.html.
 *
 * Node layout (x, y) with za/ze:
 *   T  trigger    (-2.2,  0.5)  za 0.1 ze 0.9  arrival 0
 *   C  condition  (-0.7,  0.5)  za 0.1 ze 0.5  arrival 0.7
 *   A1 action 1  ( 0.9,  1.2)  za 0.1 ze 1.25 arrival 1.5
 *   A2 action 2  ( 0.9, -0.2)  za 0.1 ze 0.8  arrival 1.5
 *   D  data      (-0.7, -1.2)  za 0.1 ze 0.35 arrival 1.5
 *   O  output    ( 2.35, 0.5)  za 0.1 ze 1.5  arrival 2.4
 */

import FlowScene, { type FlowSpec } from "@/components/three/models/shared/FlowScene";

const SPEC: FlowSpec = {
  baseRotY: -0.28,
  loop: 5,

  nodes: [
    // 0  - trigger (teal card with bolt icon + text bars)
    { x: -2.2, y: 0.5, za: 0.1, ze: 0.9, arrival: 0, meshes: [
      { w: 1.1,  h: 0.7,  r: 0.16, d: 0.10, x:  0,     y:  0,    z: 0,    color: "teal", emissive: 0.15 },
      // bolt: two polygons approximated as thin bars at an angle
      { w: 0.08, h: 0.44, r: 0.03, d: 0.03, x: -0.25,  y:  0,    z: 0.06, color: "pure", rotZ: 0.5 },
      { w: 0.08, h: 0.44, r: 0.03, d: 0.03, x: -0.19,  y:  0,    z: 0.06, color: "pure", rotZ: -0.5 },
      { w: 0.4,  h: 0.08, r: 0.03, d: 0.03, x:  0.20,  y:  0.08, z: 0.06, color: "pure" },
      { w: 0.28, h: 0.06, r: 0.03, d: 0.03, x:  0.14,  y: -0.08, z: 0.06, color: "pure", opacity: 0.7 },
    ]},
    // 1  - condition (rotated diamond)
    { x: -0.7, y: 0.5, za: 0.1, ze: 0.5, arrival: 0.7, meshes: [
      { w: 0.72, h: 0.72, r: 0.14, d: 0.10, x: 0,    y: 0,    z: 0,    color: "white", rotZ: Math.PI / 4 },
      { w: 0.20, h: 0.20, r: 0.05, d: 0.04, x: 0,    y: 0,    z: 0.07, color: "teal",  rotZ: Math.PI / 4 },
    ]},
    // 2  - action 1 (white card, teal icon, text bars)
    { x: 0.9, y: 1.2, za: 0.1, ze: 1.25, arrival: 1.5, meshes: [
      { w: 1.1,  h: 0.6,  r: 0.14, d: 0.08, x:  0,    y:  0,    z: 0,    color: "white" },
      { w: 0.28, h: 0.28, r: 0.09, d: 0.04, x: -0.35, y:  0,    z: 0.05, color: "teal"  },
      { w: 0.14, h: 0.04, r: 0.01, d: 0.02, x: -0.35, y:  0,    z: 0.08, color: "pure"  },
      { w: 0.5,  h: 0.07, r: 0.03, d: 0.03, x:  0.18, y:  0.07, z: 0.05, color: "ink"   },
      { w: 0.36, h: 0.06, r: 0.03, d: 0.03, x:  0.11, y: -0.08, z: 0.05, color: "soft"  },
    ]},
    // 3  - action 2 (white card, tint icon, text bars)
    { x: 0.9, y: -0.2, za: 0.1, ze: 0.8, arrival: 1.5, meshes: [
      { w: 1.1,  h: 0.6,  r: 0.14, d: 0.08, x:  0,    y:  0,    z: 0,    color: "white" },
      { w: 0.28, h: 0.28, r: 0.14, d: 0.04, x: -0.35, y:  0,    z: 0.05, color: "tint"  },
      { w: 0.5,  h: 0.07, r: 0.03, d: 0.03, x:  0.18, y:  0.07, z: 0.05, color: "ink"   },
      { w: 0.36, h: 0.06, r: 0.03, d: 0.03, x:  0.11, y: -0.08, z: 0.05, color: "soft"  },
    ]},
    // 4  - data (white card, 3 bars)
    { x: -0.7, y: -1.2, za: 0.1, ze: 0.35, arrival: 1.5, meshes: [
      { w: 0.9,  h: 0.55, r: 0.14, d: 0.08, x:  0,    y:  0,    z: 0,    color: "white" },
      { w: 0.55, h: 0.08, r: 0.04, d: 0.04, x: -0.05, y:  0.14, z: 0.05, color: "teal"  },
      { w: 0.55, h: 0.08, r: 0.04, d: 0.04, x: -0.05, y:  0.00, z: 0.05, color: "tint"  },
      { w: 0.47, h: 0.08, r: 0.04, d: 0.04, x: -0.09, y: -0.14, z: 0.05, color: "tint"  },
    ]},
    // 5  - output (teal circle-ish, check/tick)
    { x: 2.35, y: 0.5, za: 0.1, ze: 1.5, arrival: 2.4, meshes: [
      { w: 0.76, h: 0.76, r: 0.38, d: 0.12, x:  0,    y:  0,    z: 0,    color: "teal", emissive: 0.2 },
      { w: 0.14, h: 0.05, r: 0.02, d: 0.03, x: -0.08, y: -0.05, z: 0.07, color: "pure", rotZ: -Math.PI / 4 },
      { w: 0.28, h: 0.05, r: 0.02, d: 0.03, x:  0.05, y:  0.02, z: 0.07, color: "pure", rotZ:  Math.PI / 4 },
    ]},
  ],

  curves: [
    // T → C
    { ax: -1.65, ay: 0.5, tax: 0.3, tay: 0, bx: -1.07, by: 0.5, tbx: -0.3, tby: 0 },
    // C → A1
    { ax: -0.33, ay: 0.5, tax: 0.4, tay: 0, bx: 0.35,  by: 1.2, tbx: -0.4, tby: 0 },
    // C → A2
    { ax: -0.33, ay: 0.5, tax: 0.4, tay: 0, bx: 0.35,  by: -0.2, tbx: -0.4, tby: 0 },
    // C → D
    { ax: -0.7,  ay: 0.13, tax: 0, tay: -0.3, bx: -0.7, by: -0.92, tbx: 0, tby: 0.3 },
    // A1 → O
    { ax: 1.45,  ay: 1.2,  tax: 0.4, tay: 0, bx: 1.97, by: 0.5,  tbx: -0.4, tby: 0 },
    // A2 → O
    { ax: 1.45,  ay: -0.2, tax: 0.4, tay: 0, bx: 1.97, by: 0.5,  tbx: -0.4, tby: 0 },
  ],

  pulseWindows: [
    [0.0, 0.7], // T→C
    [0.8, 0.7], // C→A1
    [0.8, 0.7], // C→A2
    [0.8, 0.7], // C→D
    [1.7, 0.7], // A1→O
    [1.7, 0.7], // A2→O
  ],

  // Output glow burst at arrival 2.4
  glowTargets: [
    { nodeIndex: 5, meshIndex: 0, triggerTime: 2.4, base: 0.2, peak: 0.7 },
  ],
};

export default function AutomationFlow() {
  return <FlowScene spec={SPEC} />;
}
