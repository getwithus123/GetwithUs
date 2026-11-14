"use client";

/**
 * WhatsAppBot3D  - whatsapp-bot service page model.
 *
 * A customer message flows to a bot, which looks up an order and sends a confirmation.
 * Ported from docs/prototype/WhatsApp bot 3D prototype.html.
 *
 * Node layout:
 *   0 chat window   (-1.3,  0.0) za 0.1 ze 0.6 arrival 0
 *   1 customer msg  (-1.5,  0.7) za 0.15 ze 1.0 arrival 0
 *   2 bot           ( 1.0,  0.9) za 0.1 ze 1.3 arrival 0.7
 *   3 bot reply     (-1.0, -0.05) za 0.15 ze 1.1 arrival 1.5
 *   4 orders        ( 1.3, -0.4) za 0.1 ze 0.9 arrival 1.5
 *   5 quick replies (-1.3, -0.95) za 0.12 ze 0.8 arrival 1.6
 *   6 confirmation  ( 2.3, -1.4) za 0.1 ze 1.5 arrival 2.3
 */

import FlowScene, { type FlowSpec } from "@/components/three/models/shared/FlowScene";

const SPEC: FlowSpec = {
  baseRotY: -0.3,
  loop: 5,

  nodes: [
    // 0  - chat window (white card, teal header bar, avatar, name bar)
    { x: -1.3, y: 0.0, za: 0.1, ze: 0.6, arrival: 0, meshes: [
      { w: 1.9,  h: 3.3,  r: 0.25, d: 0.10, x:  0,     y:  0,    z: 0,    color: "white" },
      { w: 1.6,  h: 0.34, r: 0.17, d: 0.05, x:  0,     y:  1.38, z: 0.06, color: "teal", emissive: 0.15 },
      { w: 0.20, h: 0.20, r: 0.10, d: 0.03, x: -0.65,  y:  1.38, z: 0.10, color: "pure" },
      { w: 0.60, h: 0.07, r: 0.03, d: 0.03, x: -0.20,  y:  1.38, z: 0.10, color: "pure" },
    ]},
    // 1  - customer message (soft bubble, text bars)
    { x: -1.5, y: 0.7, za: 0.15, ze: 1.0, arrival: 0, meshes: [
      { w: 1.1,  h: 0.42, r: 0.20, d: 0.07, x:  0,    y:  0,    z: 0,    color: "soft"  },
      { w: 0.7,  h: 0.07, r: 0.03, d: 0.03, x: -0.05, y:  0.05, z: 0.05, color: "ink"   },
      { w: 0.45, h: 0.06, r: 0.03, d: 0.03, x: -0.17, y: -0.08, z: 0.05, color: "ink"   },
    ]},
    // 2  - bot (white card, two eye dots, mouth, antenna)
    { x: 1.0, y: 0.9, za: 0.1, ze: 1.3, arrival: 0.7, meshes: [
      { w: 0.9,  h: 0.7,  r: 0.22, d: 0.10, x:  0,    y:  0,    z: 0,    color: "white" },
      { w: 0.14, h: 0.14, r: 0.07, d: 0.04, x: -0.20, y:  0.05, z: 0.06, color: "teal", emissive: 0.2 },
      { w: 0.14, h: 0.14, r: 0.07, d: 0.04, x:  0.20, y:  0.05, z: 0.06, color: "teal", emissive: 0.2 },
      { w: 0.30, h: 0.05, r: 0.025,d: 0.03, x:  0,    y: -0.18, z: 0.06, color: "soft"  },
      { w: 0.06, h: 0.20, r: 0.03, d: 0.04, x:  0,    y:  0.45, z: 0,    color: "teal"  },
      { w: 0.14, h: 0.14, r: 0.07, d: 0.04, x:  0,    y:  0.60, z: 0,    color: "teal", emissive: 0.2 },
    ]},
    // 3  - bot reply (teal bubble)
    { x: -1.0, y: -0.05, za: 0.15, ze: 1.1, arrival: 1.5, meshes: [
      { w: 1.25, h: 0.5,  r: 0.22, d: 0.07, x:  0,    y:  0,    z: 0,    color: "teal", emissive: 0.15 },
      { w: 0.80, h: 0.07, r: 0.03, d: 0.03, x: -0.10, y:  0.08, z: 0.05, color: "pure" },
      { w: 0.50, h: 0.06, r: 0.03, d: 0.03, x: -0.22, y: -0.08, z: 0.05, color: "pure", opacity: 0.7 },
    ]},
    // 4  - orders (white card, 3 order bars)
    { x: 1.3, y: -0.4, za: 0.1, ze: 0.9, arrival: 1.5, meshes: [
      { w: 1.3,  h: 0.9,  r: 0.16, d: 0.08, x:  0,    y:  0,    z: 0,    color: "white" },
      { w: 0.90, h: 0.12, r: 0.06, d: 0.04, x: -0.10, y:  0.25, z: 0.05, color: "teal"  },
      { w: 0.75, h: 0.12, r: 0.06, d: 0.04, x: -0.175,y:  0,    z: 0.05, color: "tint"  },
      { w: 0.60, h: 0.12, r: 0.06, d: 0.04, x: -0.25, y: -0.25, z: 0.05, color: "tint"  },
    ]},
    // 5  - quick replies (two tint chips)
    { x: -1.3, y: -0.95, za: 0.12, ze: 0.8, arrival: 1.6, meshes: [
      { w: 0.7,  h: 0.3,  r: 0.15, d: 0.06, x: -0.4,  y:  0,    z: 0,    color: "tint"  },
      { w: 0.4,  h: 0.06, r: 0.03, d: 0.03, x: -0.4,  y:  0,    z: 0.05, color: "ink"   },
      { w: 0.7,  h: 0.3,  r: 0.15, d: 0.06, x:  0.4,  y:  0,    z: 0,    color: "tint"  },
      { w: 0.4,  h: 0.06, r: 0.03, d: 0.03, x:  0.4,  y:  0,    z: 0.05, color: "ink"   },
    ]},
    // 6  - confirmation (white chip, teal check, text bars)
    { x: 2.3, y: -1.4, za: 0.1, ze: 1.5, arrival: 2.3, meshes: [
      { w: 1.1,  h: 0.4,  r: 0.20, d: 0.08, x:  0,    y:  0,    z: 0,    color: "white" },
      { w: 0.22, h: 0.22, r: 0.11, d: 0.05, x: -0.35, y:  0,    z: 0.05, color: "teal", emissive: 0.25 },
      // tick (two crossed bars)
      { w: 0.10, h: 0.035,r: 0.015,d: 0.03, x: -0.37, y: -0.01, z: 0.09, color: "pure", rotZ: -0.8 },
      { w: 0.18, h: 0.035,r: 0.015,d: 0.03, x: -0.31, y:  0.02, z: 0.09, color: "pure", rotZ:  0.8 },
      { w: 0.45, h: 0.07, r: 0.03, d: 0.03, x:  0.15, y:  0,    z: 0.05, color: "ink"   },
    ]},
  ],

  curves: [
    // customer msg → bot
    { ax: -0.95, ay: 0.7, tax: 0.4, tay: 0,    bx: 0.55,  by: 0.9,  tbx: -0.4, tby: 0 },
    // bot → orders
    { ax:  1.0,  ay: 0.5, tax: 0,   tay: -0.3, bx: 1.3,   by: 0.1,  tbx: 0,    tby: 0.3 },
    // bot → bot reply
    { ax:  0.65, ay: 0.6, tax: -0.4,tay: 0,    bx: -0.375,by: -0.05,tbx: 0.4,  tby: 0 },
    // orders → confirmation
    { ax:  1.7,  ay: -0.85,tax: 0.4,tay: 0,    bx: 1.75,  by: -1.4, tbx: -0.3, tby: 0 },
  ],

  pulseWindows: [
    [0.0, 0.7], // msg→bot
    [0.8, 0.7], // bot→orders
    [0.8, 0.7], // bot→reply
    [1.6, 0.7], // orders→confirmation
  ],

  glowTargets: [
    { nodeIndex: 6, meshIndex: 1, triggerTime: 2.3, base: 0.25, peak: 0.7 },
  ],
};

export default function WhatsAppBot3D() {
  return <FlowScene spec={SPEC} />;
}
