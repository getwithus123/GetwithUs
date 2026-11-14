"use client";

/**
 * ServicesHub  - /services index hero model.
 *
 * Five service lines connected to one central hub.
 * Ported from docs/prototype/Software services hub 3D prototype.html.
 *
 * Hub at (0, 0.05). Five tiles at positions derived from:
 *   angle = π/2 + i * 2π/5,  x = 2.2*cos(a),  y = 0.05 + 1.3*sin(a)
 *
 * Tile order: web, app, automation, marketing, cloud.
 */

import FlowScene, { type FlowSpec, type NodeDef } from "@/components/three/models/shared/FlowScene";

const HUB_X = 0;
const HUB_Y = 0.05;
const RADIUS = 2.2;
const TILE_Y_OFFSET = 1.3;

function tilePosition(i: number): { x: number; y: number } {
  const a = Math.PI / 2 + (i * Math.PI * 2) / 5;
  return { x: RADIUS * Math.cos(a), y: HUB_Y + TILE_Y_OFFSET * Math.sin(a) };
}

// Tile content builders (match prototype TILES array)
function tileMeshes(i: number): NodeDef["meshes"] {
  switch (i) {
    case 0: // web
      return [
        { w: 0.65, h: 0.12, r: 0.05, d: 0.04, x: 0,     y:  0.27, z: 0.05, color: "teal" },
        { w: 0.65, h: 0.32, r: 0.06, d: 0.04, x: 0,     y: -0.03, z: 0.05, color: "tint" },
        { w: 0.40, h: 0.06, r: 0.03, d: 0.03, x: -0.12, y: -0.28, z: 0.05, color: "soft" },
      ];
    case 1: // app
      return [
        { w: 0.38, h: 0.66, r: 0.10, d: 0.06, x:  0,    y:  0,    z: 0.05, color: "teal", emissive: 0.15 },
        { w: 0.14, h: 0.04, r: 0.02, d: 0.03, x:  0,    y:  0.25, z: 0.10, color: "pure" },
        { w: 0.20, h: 0.20, r: 0.06, d: 0.03, x:  0,    y: -0.02, z: 0.10, color: "pure" },
      ];
    case 2: // automation
      return [
        { w: 0.20, h: 0.20, r: 0.10, d: 0.04, x: -0.25, y:  0,    z: 0.05, color: "teal"  },
        { w: 0.20, h: 0.20, r: 0.10, d: 0.04, x:  0.25, y:  0.20, z: 0.05, color: "tint"  },
        { w: 0.20, h: 0.20, r: 0.10, d: 0.04, x:  0.25, y: -0.20, z: 0.05, color: "tint"  },
        { w: 0.34, h: 0.04, r: 0.02, d: 0.03, x:  0,    y:  0.11, z: 0.05, color: "soft", opacity: 0.5 },
        { w: 0.34, h: 0.04, r: 0.02, d: 0.03, x:  0,    y: -0.11, z: 0.05, color: "soft", opacity: 0.5 },
      ];
    case 3: // marketing (4 bars)
      return [
        { w: 0.12, h: 0.20, r: 0.04, d: 0.04, x: -0.27, y: -0.30 + 0.20 / 2, z: 0.05, color: "tint" },
        { w: 0.12, h: 0.35, r: 0.04, d: 0.04, x: -0.09, y: -0.30 + 0.35 / 2, z: 0.05, color: "tint" },
        { w: 0.12, h: 0.28, r: 0.04, d: 0.04, x:  0.09, y: -0.30 + 0.28 / 2, z: 0.05, color: "tint" },
        { w: 0.12, h: 0.50, r: 0.04, d: 0.04, x:  0.27, y: -0.30 + 0.50 / 2, z: 0.05, color: "teal" },
      ];
    default: // cloud (3 blobs)
      return [
        { w: 0.55, h: 0.22, r: 0.11, d: 0.10, x:  0,    y: -0.08, z: 0.05, color: "teal", emissive: 0.15 },
        { w: 0.30, h: 0.30, r: 0.15, d: 0.10, x: -0.10, y:  0.08, z: 0.055,color: "teal", emissive: 0.15 },
        { w: 0.36, h: 0.36, r: 0.18, d: 0.10, x:  0.08, y:  0.12, z: 0.06, color: "teal", emissive: 0.15 },
      ];
  }
}

function buildNodes(): NodeDef[] {
  // Hub first
  const nodes: NodeDef[] = [
    {
      x: HUB_X, y: HUB_Y, za: 0.1, ze: 0.6, arrival: 0,
      meshes: [
        { w: 1.1, h: 1.1, r: 0.28, d: 0.12, x: 0, y: 0, z: 0, color: "teal", emissive: 0.15 },
        { w: 0.5, h: 0.5, r: 0.25, d: 0.04, x: 0, y: 0, z: 0.08, color: "pure" },
        { w: 0.26,h: 0.26,r: 0.13, d: 0.04, x: 0, y: 0, z: 0.10, color: "teal", emissive: 0.15 },
        { w: 0.24,h: 0.10,r: 0.03, d: 0.04, x: 0.12, y: 0, z: 0.10, color: "pure" },
      ],
    },
  ];

  // Five tiles
  for (let i = 0; i < 5; i++) {
    const pos = tilePosition(i);
    const zeVariant = 0.9 + (i % 2) * 0.4;
    nodes.push({
      x: pos.x, y: pos.y, za: 0.1, ze: zeVariant, arrival: i * 0.8 + 0.7,
      meshes: [
        { w: 0.9, h: 0.9, r: 0.20, d: 0.10, x: 0, y: 0, z: 0, color: "white" },
        ...tileMeshes(i),
      ],
    });
  }
  return nodes;
}

function buildCurves(): FlowSpec["curves"] {
  const curves: FlowSpec["curves"] = [];
  for (let i = 0; i < 5; i++) {
    const pos = tilePosition(i);
    const dx = pos.x - HUB_X;
    const dy = pos.y - HUB_Y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / len;
    const ny = dy / len;
    const p0x = HUB_X  + nx * 0.65;
    const p0y = HUB_Y  + ny * 0.65;
    const p1x = pos.x  - nx * 0.55;
    const p1y = pos.y  - ny * 0.55;
    curves.push({
      ax: p0x, ay: p0y, tax: nx * 0.4, tay: ny * 0.4,
      bx: p1x, by: p1y, tbx: -nx * 0.4, tby: -ny * 0.4,
    });
  }
  return curves;
}

const NODES  = buildNodes();
const CURVES = buildCurves();

const SPEC: FlowSpec = {
  baseRotY: -0.3,
  loop: 5.6,
  nodes:  NODES,
  curves: CURVES,
  // Pulse windows: [i*0.8, 0.7] for each tile (matches WIN in prototype)
  pulseWindows: [0, 1, 2, 3, 4].map((i): [number, number] => [i * 0.8, 0.7]),
};

export default function ServicesHub() {
  return <FlowScene spec={SPEC} />;
}
