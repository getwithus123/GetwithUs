"use client";

/**
 * SoftwareCloud  - custom-software service page model.
 *
 * Code, API, cloud, and servers connected by a glowing pulse.
 * Ported from docs/prototype/Custom software and cloud 3D prototype.html.
 *
 * Node layout (x, y) with za/ze:
 *   0 code window  (-2.2,  0.35) za 0.1 ze 0.9  arrival 0
 *   1 cloud        ( 0.2,  1.0)  za 0.1 ze 1.3  arrival 0.7
 *   2 API          ( 0.1, -0.95) za 0.1 ze 0.6  arrival 0.7
 *   3 servers      ( 2.2, -0.1)  za 0.1 ze 1.1  arrival 1.5
 *   4 deploy chip  ( 2.2,  1.35) za 0.1 ze 1.6  arrival 1.6
 */

import FlowScene, { type FlowSpec } from "@/components/three/models/shared/FlowScene";

// Server LEDs: glow burst at t=1.5 (server arrival)
// Three servers × 1 LED each = mesh indices 1, 5, 9 within node 3
// Using glowTargets for the first LED on each server row
const SPEC: FlowSpec = {
  baseRotY: -0.3,
  loop: 4,

  nodes: [
    // 0  - code window
    { x: -2.2, y: 0.35, za: 0.1, ze: 0.9, arrival: 0, meshes: [
      { w: 1.5,  h: 1.15, r: 0.14, d: 0.08, x:  0,     y:  0,    z: 0,    color: "white" },
      // syntax highlight dots
      { w: 0.08, h: 0.08, r: 0.04, d: 0.03, x: -0.58,  y:  0.42, z: 0.05, color: "teal"  },
      { w: 0.08, h: 0.08, r: 0.04, d: 0.03, x: -0.44,  y:  0.42, z: 0.05, color: "soft"  },
      { w: 0.08, h: 0.08, r: 0.04, d: 0.03, x: -0.30,  y:  0.42, z: 0.05, color: "soft"  },
      // code lines
      { w: 0.70, h: 0.07, r: 0.03, d: 0.03, x: -0.65+0.35, y:  0.18, z: 0.05, color: "teal" },
      { w: 0.95, h: 0.07, r: 0.03, d: 0.03, x: -0.65+0.475, y: 0.00, z: 0.05, color: "soft" },
      { w: 0.60, h: 0.07, r: 0.03, d: 0.03, x: -0.65+0.30, y: -0.18, z: 0.05, color: "ink"  },
      { w: 0.80, h: 0.07, r: 0.03, d: 0.03, x: -0.65+0.40, y: -0.36, z: 0.05, color: "soft" },
    ]},
    // 1  - cloud (layered teal blobs)
    { x: 0.2, y: 1.0, za: 0.1, ze: 1.3, arrival: 0.7, meshes: [
      { w: 1.4,  h: 0.5,  r: 0.25, d: 0.10, x:  0,     y: -0.10, z: 0,    color: "teal", emissive: 0.15 },
      { w: 0.7,  h: 0.7,  r: 0.35, d: 0.10, x: -0.30,  y:  0.15, z: 0.005,color: "teal", emissive: 0.15 },
      { w: 0.8,  h: 0.8,  r: 0.40, d: 0.10, x:  0.15,  y:  0.20, z: 0.01, color: "teal", emissive: 0.15 },
      { w: 0.55, h: 0.07, r: 0.03, d: 0.03, x:  0,     y: -0.12, z: 0.07, color: "pure"  },
      { w: 0.35, h: 0.06, r: 0.03, d: 0.03, x: -0.10,  y: -0.26, z: 0.07, color: "pure", opacity: 0.7 },
    ]},
    // 2  - API (white square, bracket bars, centre dot)
    { x: 0.1, y: -0.95, za: 0.1, ze: 0.6, arrival: 0.7, meshes: [
      { w: 0.8,  h: 0.8,  r: 0.20, d: 0.10, x:  0,    y:  0,    z: 0,    color: "white" },
      { w: 0.06, h: 0.34, r: 0.03, d: 0.03, x: -0.20, y:  0,    z: 0.06, color: "teal"  },
      { w: 0.06, h: 0.34, r: 0.03, d: 0.03, x:  0.20, y:  0,    z: 0.06, color: "teal"  },
      { w: 0.14, h: 0.14, r: 0.07, d: 0.04, x:  0,    y:  0,    z: 0.06, color: "tint"  },
    ]},
    // 3  - servers (3 rows × 1 LED + 1 bar = 6 meshes)
    { x: 2.2, y: -0.1, za: 0.1, ze: 1.1, arrival: 1.5, meshes: [
      { w: 1.3,  h: 0.4,  r: 0.10, d: 0.08, x:  0,    y:  0.5,  z: 0,    color: "white" },
      { w: 0.10, h: 0.10, r: 0.05, d: 0.03, x: -0.45, y:  0.5,  z: 0.05, color: "teal", emissive: 0.2 },
      { w: 0.5,  h: 0.06, r: 0.03, d: 0.03, x:  0.10, y:  0.5,  z: 0.05, color: "soft"  },
      { w: 1.3,  h: 0.4,  r: 0.10, d: 0.08, x:  0,    y:  0,    z: 0,    color: "white" },
      { w: 0.10, h: 0.10, r: 0.05, d: 0.03, x: -0.45, y:  0,    z: 0.05, color: "teal", emissive: 0.2 },
      { w: 0.5,  h: 0.06, r: 0.03, d: 0.03, x:  0.10, y:  0,    z: 0.05, color: "soft"  },
      { w: 1.3,  h: 0.4,  r: 0.10, d: 0.08, x:  0,    y: -0.5,  z: 0,    color: "white" },
      { w: 0.10, h: 0.10, r: 0.05, d: 0.03, x: -0.45, y: -0.5,  z: 0.05, color: "teal", emissive: 0.2 },
      { w: 0.5,  h: 0.06, r: 0.03, d: 0.03, x:  0.10, y: -0.5,  z: 0.05, color: "soft"  },
    ]},
    // 4  - deploy chip
    { x: 2.2, y: 1.35, za: 0.1, ze: 1.6, arrival: 1.6, meshes: [
      { w: 1.0,  h: 0.4,  r: 0.20, d: 0.08, x:  0,    y:  0,    z: 0,    color: "white" },
      { w: 0.14, h: 0.14, r: 0.07, d: 0.04, x: -0.30, y:  0,    z: 0.05, color: "teal"  },
      { w: 0.45, h: 0.07, r: 0.03, d: 0.03, x:  0.12, y:  0,    z: 0.05, color: "ink"   },
    ]},
  ],

  curves: [
    // code → cloud
    { ax: -1.45, ay: 0.1,  tax:  0.4, tay: 0,    bx: -0.3,  by: 0.9,  tbx: -0.4, tby: 0 },
    // code → API
    { ax: -1.45, ay: 0.55, tax:  0.4, tay: 0,    bx: -0.5,  by: -0.95, tbx: -0.4, tby: 0 },
    // cloud → servers
    { ax:  0.9,  ay: 0.9,  tax:  0.4, tay: 0,    bx:  1.55, by: 0.4,  tbx: -0.4, tby: 0 },
    // API → servers
    { ax:  0.5,  ay: -0.95, tax: 0.4, tay: 0,    bx:  1.55, by: -0.6, tbx: -0.4, tby: 0 },
  ],

  pulseWindows: [
    [0.0, 0.7], // code→cloud
    [0.0, 0.7], // code→API
    [0.8, 0.7], // cloud→servers
    [0.8, 0.7], // API→servers
  ],

  // LED glow burst on all 3 server LEDs (meshes 1, 4, 7 of node 3)
  glowTargets: [
    { nodeIndex: 3, meshIndex: 1, triggerTime: 1.5, base: 0.2, peak: 0.7 },
    { nodeIndex: 3, meshIndex: 4, triggerTime: 1.5, base: 0.2, peak: 0.7 },
    { nodeIndex: 3, meshIndex: 7, triggerTime: 1.5, base: 0.2, peak: 0.7 },
  ],
};

export default function SoftwareCloud() {
  return <FlowScene spec={SPEC} />;
}
