"use client";

/*
 * AppDevPhones  - app-development service page model.
 *
 * Two phone objects (iOS + Android) built from rounded-extruded planes.
 * Each phone is 7 layers deep; the iOS phone adds three satellite layers
 * (notification chip, stat card, app tile) only shown in single mode.
 *
 * Mode A ("single"):  one iOS phone centred, satellites visible, k = 0.55.
 * Mode B ("duo"):     both phones visible at scale 0.78, satellites hidden,
 *                     k breathes gently. Layers drop in staggered per loop.
 *
 * Default on the services page is mode B. Pass modelProps.kind="phone" for A.
 *
 * Colour constants match the prototype byte-for-byte (re-read on themechange).
 * Shadows are driven by ModelCanvas (shadows="soft" when tier ≥ medium).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Color,
  ExtrudeGeometry,
  MeshStandardMaterial,
  Shape,
  Vector2,
  type DirectionalLight,
  type Group,
} from "three";
import { THEME_EVENT } from "@/lib/theme";
import { useModelFrame } from "@/components/three/models/context";
import type { ModelProps } from "@/components/three/models/keys";

// ---------------------------------------------------------------------------
// Palette  - theme-aware hex constants, re-read on themechange
// ---------------------------------------------------------------------------

type Palette = {
  TEAL:  Color; INK:   Color; WHITE: Color; SOFT:  Color;
  ROW:   Color; BODY:  Color; CHART: Color; W:     Color;
};

function buildPalette(): Palette {
  const dark =
    document.documentElement.dataset["theme"] === "dark" ||
    (document.documentElement.dataset["theme"] === undefined &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  return {
    TEAL:  new Color(dark ? 0x2fb5bf : 0x0f5f66),
    INK:   new Color(dark ? 0xe8eef4 : 0x0f1b2d),
    WHITE: new Color(dark ? 0xdfe8ef : 0xffffff),
    SOFT:  new Color(dark ? 0x9aa8b6 : 0xb7c0c9),
    ROW:   new Color(dark ? 0x2a3a4a : 0xeaf0f4),
    BODY:  new Color(dark ? 0x0b121a : 0x172233),
    CHART: new Color(dark ? 0x3a6a72 : 0x8fc3cb),
    W:     new Color(0xffffff),
  };
}

// ---------------------------------------------------------------------------
// Geometry factory (rounded-rectangle extrusion, centred on z)
// Module-level cache so identical shapes are never re-created.
// ---------------------------------------------------------------------------

const GEO_CACHE = new Map<string, ExtrudeGeometry>();

function rr(w: number, h: number, r: number, d: number): ExtrudeGeometry {
  const key = `${w}|${h}|${r}|${d}`;
  const cached = GEO_CACHE.get(key);
  if (cached) return cached;

  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  const cr = Math.min(r, w / 2 - 0.001, h / 2 - 0.001);
  s.moveTo(x + cr, y);
  s.lineTo(x + w - cr, y);
  s.quadraticCurveTo(x + w, y, x + w, y + cr);
  s.lineTo(x + w, y + h - cr);
  s.quadraticCurveTo(x + w, y + h, x + w - cr, y + h);
  s.lineTo(x + cr, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - cr);
  s.lineTo(x, y + cr);
  s.quadraticCurveTo(x, y, x + cr, y);

  const geo = new ExtrudeGeometry(s, {
    depth: d,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 8,
  });
  geo.translate(0, 0, -d / 2);
  GEO_CACHE.set(key, geo);
  return geo;
}

// ---------------------------------------------------------------------------
// Mesh spec type  - one entry in a layer's mesh list
// ---------------------------------------------------------------------------

type MeshSpec = {
  w: number; h: number; r: number; d: number;
  x: number; y: number; z: number;
  color: keyof Palette;
  ei?: number; // emissive intensity using same colour
};

// ---------------------------------------------------------------------------
// Layer spec  - za/ze define assembled/exploded z; sat layers hide in duo mode
// ---------------------------------------------------------------------------

type LayerSpec = { za: number; ze: number; sat?: boolean; meshes: MeshSpec[] };

function phoneLayerSpecs(androidCam: boolean, withSat: boolean): LayerSpec[] {
  const camW = androidCam ? 0.11 : 0.5;
  const camH = androidCam ? 0.11 : 0.1;
  const camR = androidCam ? 0.055 : 0.05;

  const base: LayerSpec[] = [
    { za: 0.00, ze: -1.00, meshes: [
      { w: 1.9, h: 3.8, r: 0.30, d: 0.14, x: 0, y: 0, z: 0, color: "BODY" },
    ]},
    { za: 0.09, ze: -0.40, meshes: [
      { w: 1.72, h: 3.62, r: 0.22, d: 0.04, x: 0, y: 0, z: 0, color: "WHITE" },
    ]},
    { za: 0.13, ze: 0.25, meshes: [
      { w: camW, h: camH, r: camR,  d: 0.03, x:  0,     y: 1.65, z: 0, color: "INK"  },
      { w: 0.9,  h: 0.14, r: 0.06,  d: 0.04, x: -0.35,  y: 1.30, z: 0, color: "INK"  },
      { w: 0.28, h: 0.28, r: 0.14,  d: 0.05, x:  0.62,  y: 1.30, z: 0, color: "TEAL" },
      { w: 0.6,  h: 0.07, r: 0.03,  d: 0.03, x: -0.55,  y: 1.10, z: 0, color: "SOFT" },
    ]},
    { za: 0.15, ze: 0.60, meshes: [
      { w: 1.5,  h: 0.62, r: 0.14, d: 0.05, x:  0,    y: 0.60, z: 0,    color: "TEAL", ei: 0.12 },
      { w: 0.8,  h: 0.10, r: 0.04, d: 0.03, x: -0.30, y: 0.70, z: 0.05, color: "W"    },
      { w: 0.5,  h: 0.07, r: 0.03, d: 0.03, x: -0.45, y: 0.50, z: 0.05, color: "W"    },
    ]},
    // list rows  - 3 rows × 4 meshes each
    { za: 0.14, ze: 0.90, meshes: [
      ...([0.05, -0.50, -1.05] as const).flatMap((ry, ri): MeshSpec[] => [
        { w: 1.5,  h: 0.46, r: 0.12, d: 0.05, x:  0,    y: ry,       z: 0,    color: "ROW"                  },
        { w: 0.28, h: 0.28, r: 0.09, d: 0.03, x: -0.5,  y: ry,       z: 0.04, color: ri === 0 ? "TEAL" : "SOFT" },
        { w: 0.55, h: 0.07, r: 0.03, d: 0.03, x:  0.1,  y: ry + 0.07, z: 0.04, color: "INK"                  },
        { w: 0.4,  h: 0.06, r: 0.03, d: 0.03, x:  0.02, y: ry - 0.08, z: 0.04, color: "SOFT"                 },
      ]),
    ]},
    { za: 0.12, ze: 0.45, meshes: [
      { w: 1.5,  h: 0.30, r: 0.15, d: 0.07, x:  0,    y: -1.58, z: 0,    color: "WHITE" },
      { w: 0.14, h: 0.14, r: 0.04, d: 0.03, x: -0.55, y: -1.58, z: 0.05, color: "TEAL"  },
      { w: 0.14, h: 0.14, r: 0.04, d: 0.03, x: -0.18, y: -1.58, z: 0.05, color: "SOFT"  },
      { w: 0.14, h: 0.14, r: 0.04, d: 0.03, x:  0.18, y: -1.58, z: 0.05, color: "SOFT"  },
      { w: 0.14, h: 0.14, r: 0.04, d: 0.03, x:  0.55, y: -1.58, z: 0.05, color: "SOFT"  },
    ]},
    { za: 0.18, ze: 1.35, meshes: [
      { w: 0.36,  h: 0.36,  r: 0.18,  d: 0.10, x: 0.6, y: -1.1, z: 0,    color: "TEAL", ei: 0.35 },
      { w: 0.16,  h: 0.035, r: 0.015, d: 0.03, x: 0.6, y: -1.1, z: 0.07, color: "W"    },
      { w: 0.035, h: 0.16,  r: 0.015, d: 0.03, x: 0.6, y: -1.1, z: 0.07, color: "W"    },
    ]},
  ];

  if (!withSat) return base;

  return [
    ...base,
    { za: 0.30, ze: 1.20, sat: true, meshes: [
      { w: 1.15, h: 0.40, r: 0.20, d: 0.08, x:  1.5,  y:  0.95, z: 0,    color: "WHITE" },
      { w: 0.14, h: 0.14, r: 0.07, d: 0.04, x:  1.05, y:  0.95, z: 0.05, color: "TEAL"  },
      { w: 0.55, h: 0.07, r: 0.03, d: 0.03, x:  1.60, y:  1.02, z: 0.05, color: "INK"   },
      { w: 0.40, h: 0.06, r: 0.03, d: 0.03, x:  1.52, y:  0.88, z: 0.05, color: "SOFT"  },
    ]},
    { za: 0.30, ze: 0.90, sat: true, meshes: [
      { w: 1.0,  h: 0.85, r: 0.16, d: 0.08, x: -1.55,                y: -0.35,              z: 0,    color: "WHITE" },
      { w: 0.13, h: 0.25, r: 0.04, d: 0.04, x: -1.84 + 0 * 0.19,    y: -0.65 + 0.25 / 2,  z: 0.05, color: "CHART" },
      { w: 0.13, h: 0.45, r: 0.04, d: 0.04, x: -1.84 + 1 * 0.19,    y: -0.65 + 0.45 / 2,  z: 0.05, color: "CHART" },
      { w: 0.13, h: 0.35, r: 0.04, d: 0.04, x: -1.84 + 2 * 0.19,    y: -0.65 + 0.35 / 2,  z: 0.05, color: "CHART" },
      { w: 0.13, h: 0.60, r: 0.04, d: 0.04, x: -1.84 + 3 * 0.19,    y: -0.65 + 0.60 / 2,  z: 0.05, color: "TEAL"  },
    ]},
    { za: 0.30, ze: 1.60, sat: true, meshes: [
      { w: 0.5,  h: 0.5,  r: 0.15, d: 0.09, x: 1.45, y: -0.75, z: 0,    color: "TEAL", ei: 0.25 },
      { w: 0.22, h: 0.22, r: 0.07, d: 0.03, x: 1.45, y: -0.75, z: 0.06, color: "W"    },
    ]},
  ];
}

// ---------------------------------------------------------------------------
// Material builder  - returns flat array parallel to all meshes across layers
// ---------------------------------------------------------------------------

function buildMaterials(specs: LayerSpec[], pal: Palette): MeshStandardMaterial[] {
  const mats: MeshStandardMaterial[] = [];
  for (const spec of specs) {
    for (const m of spec.meshes) {
      const col = pal[m.color];
      mats.push(new MeshStandardMaterial({
        color: col.clone(),
        roughness: 0.5,
        metalness: 0,
        ...(m.ei != null && { emissive: col.clone(), emissiveIntensity: m.ei }),
      }));
    }
  }
  return mats;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AppDevPhones({ kind }: ModelProps) {
  const isDuo = kind !== "phone"; // default: duo (mode B)

  // Palette as state so a theme change triggers a re-render + material rebuild
  const [pal, setPal] = useState<Palette>(buildPalette);
  useEffect(() => {
    const update = () => setPal(buildPalette());
    window.addEventListener(THEME_EVENT, update);
    return () => window.removeEventListener(THEME_EVENT, update);
  }, []);

  // Layer specs (stable  - same shape regardless of mode)
  const iosSpecs   = useMemo(() => phoneLayerSpecs(false, true),  []);
  const droidSpecs = useMemo(() => phoneLayerSpecs(true,  false), []);

  // Materials  - rebuilt whenever palette changes
  const iosMats   = useMemo(() => buildMaterials(iosSpecs,   pal), [iosSpecs,   pal]);
  const droidMats = useMemo(() => buildMaterials(droidSpecs, pal), [droidSpecs, pal]);
  useEffect(() => () => { for (const m of iosMats)   m.dispose(); }, [iosMats]);
  useEffect(() => () => { for (const m of droidMats) m.dispose(); }, [droidMats]);

  // Ref arrays for the layer Groups (animation targets)
  const iosLayerRefs   = useRef<(Group | null)[]>(iosSpecs.map(() => null));
  const droidLayerRefs = useRef<(Group | null)[]>(droidSpecs.map(() => null));
  // Phone-level Groups for position / scale lerp
  const iosGroupRef   = useRef<Group>(null);
  const droidGroupRef = useRef<Group>(null);
  // Root group
  const root = useRef<Group>(null);
  // Pointer
  const pointer = useRef(new Vector2(0, 0));
  // Shadow light
  const shadowLightRef = useRef<DirectionalLight>(null);

  // Shadow light configuration  - runs once after mount
  useEffect(() => {
    const light = shadowLightRef.current;
    if (!light) return;
    const sc = light.shadow.camera;
    sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5;
    sc.near = 1;  sc.far   = 25;
    sc.updateProjectionMatrix();
    light.shadow.bias       = -0.0006;
    light.shadow.normalBias =  0.02;
    light.shadow.radius     =  4;
    light.shadow.mapSize.set(1024, 1024);
  }, []);

  // Pointer tracking
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const canvas = document.querySelector("canvas");
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      pointer.current.set(
        ((e.clientX - rect.left) / rect.width  - 0.5) * 2,
        -((e.clientY - rect.top)  / rect.height - 0.5) * 2,
      );
    };
    const onLeave = () => pointer.current.set(0, 0);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useModelFrame((_, elapsed) => {
    const isStill = elapsed === 0;

    // Animate iOS layers
    iosLayerRefs.current.forEach((g, i) => {
      if (!g) return;
      const spec = iosSpecs[i];
      g.visible = !(spec.sat ?? false) || !isDuo;

      let y = 0;
      let z = spec.za + (spec.ze - spec.za) * 0.3;

      if (!isStill) {
        if (isDuo) {
          const k = 0.25 + Math.sin(elapsed * (1000 / 1500) + i) * 0.05;
          z = spec.za + (spec.ze - spec.za) * k;
          const t = elapsed % 7;
          const p = Math.max(0, Math.min(1, (t - i * 0.18) / 0.9));
          const eased   = 1 - Math.pow(1 - p, 3);
          y = (1 - (eased + Math.sin(p * Math.PI) * 0.07)) * 5;
        } else {
          const k = 0.55;
          z = spec.za + (spec.ze - spec.za) * k;
          y = Math.sin(elapsed * (1000 / 900) + i * 0.8) * 0.03 * k;
        }
      }
      g.position.set(0, y, z);
    });

    // Animate Android layers (always duo-k style)
    droidLayerRefs.current.forEach((g, i) => {
      if (!g) return;
      const spec = droidSpecs[i];
      let y = 0;
      let z = spec.za + (spec.ze - spec.za) * 0.3;
      if (!isStill) {
        const k = 0.25 + Math.sin(elapsed * (1000 / 1500) + i) * 0.05;
        z = spec.za + (spec.ze - spec.za) * k;
        const t = elapsed % 7;
        const p = Math.max(0, Math.min(1, (t - i * 0.18) / 0.9));
        const eased = 1 - Math.pow(1 - p, 3);
        y = (1 - (eased + Math.sin(p * Math.PI) * 0.07)) * 5;
      }
      g.position.set(0, y, z);
    });

    // Phone position / scale lerp
    const targetScale = isDuo ? 0.78 : 1.0;

    const iosG = iosGroupRef.current;
    if (iosG) {
      iosG.position.x += ((isDuo ? -1.2  : 0.0 ) - iosG.position.x) * 0.08;
      iosG.position.y += ((isDuo ? -0.05 : 0.0 ) - iosG.position.y) * 0.08;
      iosG.scale.setScalar(iosG.scale.x + (targetScale - iosG.scale.x) * 0.08);
    }

    const droidG = droidGroupRef.current;
    if (droidG) {
      droidG.visible    = isDuo;
      droidG.position.x += ((isDuo ?  1.2  : 0.0) - droidG.position.x) * 0.08;
      droidG.position.y  = 0.12;
      droidG.position.z  = -0.25;
      droidG.scale.setScalar(droidG.scale.x + (targetScale - droidG.scale.x) * 0.08);
    }

    // Root tilt
    if (root.current) {
      const baseY = isDuo ? -0.2 : -0.4;
      root.current.rotation.y += (baseY + pointer.current.x * 0.28 - root.current.rotation.y) * 0.08;
      root.current.rotation.x += (-0.1  + pointer.current.y * 0.16 - root.current.rotation.x) * 0.08;
    }
  });

  // Render helpers for a phone's layers
  function renderLayers(
    specs: LayerSpec[],
    mats: MeshStandardMaterial[],
    layerRefs: React.MutableRefObject<(Group | null)[]>,
  ) {
    let matIdx = 0;
    return specs.map((spec, li) => {
      const startIdx = matIdx;
      matIdx += spec.meshes.length;
      return (
        <group
          key={li}
          ref={(g) => { layerRefs.current[li] = g; }}
        >
          {spec.meshes.map((m, mi) => (
            <mesh
              key={mi}
              geometry={rr(m.w, m.h, m.r, m.d)}
              material={mats[startIdx + mi]}
              position={[m.x, m.y, m.z]}
              castShadow
              receiveShadow
            />
          ))}
        </group>
      );
    });
  }

  return (
    <>
      <hemisphereLight args={[0xffffff, 0x9fb8c2, 0.6]} />
      <directionalLight
        ref={shadowLightRef}
        position={[-3, 4, 8]}
        intensity={0.6}
        castShadow
      />
      <pointLight
        color={pal.TEAL}
        intensity={0.5}
        distance={12}
        position={[-3, -2, 4]}
      />

      <group ref={root} rotation={[-0.1, isDuo ? -0.2 : -0.4, 0]}>
        {/* iOS phone */}
        <group ref={iosGroupRef}>
          {renderLayers(iosSpecs, iosMats, iosLayerRefs)}
        </group>
        {/* Android phone */}
        <group ref={droidGroupRef}>
          {renderLayers(droidSpecs, droidMats, droidLayerRefs)}
        </group>
      </group>
    </>
  );
}
