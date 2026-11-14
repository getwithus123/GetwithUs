"use client";

/*
 * WebDevLayers  - web-development service page model.
 *
 * Eight rounded-extruded planes assemble from above: each layer drops in
 * staggered (0.3 s apart), bounces slightly on landing at its assembled z
 * position (za, k = 0), then the cycle replays every 7 s.
 *
 * Reduced motion / still: every layer parked at za, y = 0, one frame.
 * Pointer tilt: group y-rotation 0.45 ± 0.28, x-rotation -0.12 ± 0.16.
 * Shadows on high/medium; plain shading on low.
 */

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  ExtrudeGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Shape,
  SphereGeometry,
  Vector2,
  type DirectionalLight,
  type Group,
} from "three";
import { useModelFrame, useModelPalette } from "@/components/three/models/context";
import { useSceneStore } from "@/stores/scene.store";

// ---------------------------------------------------------------------------
// Geometry factory  - module-level builder, never called in render
// ---------------------------------------------------------------------------

/** Rounded-rectangle extruded slab, centred on z = 0. */
function roundedRect(w: number, h: number, r: number, depth: number): ExtrudeGeometry {
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
    depth,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 8,
  });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

type Geos = {
  backGlass: ExtrudeGeometry;
  winBg: ExtrudeGeometry;
  winBar: ExtrudeGeometry;
  dot: SphereGeometry;
  navBg: ExtrudeGeometry;
  navLogo: ExtrudeGeometry;
  menuBar: ExtrudeGeometry;
  heroH1: ExtrudeGeometry;
  heroH2: ExtrudeGeometry;
  heroS1: ExtrudeGeometry;
  heroS2: ExtrudeGeometry;
  ctaTeal: ExtrudeGeometry;
  ctaAccent: ExtrudeGeometry;
  ctaGhost: ExtrudeGeometry;
  card: ExtrudeGeometry;
  cardImg: ExtrudeGeometry;
  cardTitle: ExtrudeGeometry;
  cardSub: ExtrudeGeometry;
  badge: ExtrudeGeometry;
  badgeLabel: PlaneGeometry;
};

function disposeGeos(g: Geos) {
  for (const geo of Object.values(g)) geo.dispose();
}

// ---------------------------------------------------------------------------
// Badge CanvasTexture
// ---------------------------------------------------------------------------

function buildBadgeTexture(accentHex: string): CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 128;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = accentHex;
  ctx.font = "bold 72px ui-monospace,Menlo,Consolas,monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("</>", 128, 68);
  return new CanvasTexture(cv);
}

// ---------------------------------------------------------------------------
// Layer data
// ---------------------------------------------------------------------------

type LayerDef = { za: number; ze: number };

const LAYER_DEFS: LayerDef[] = [
  { za: -0.2, ze: -1.6 }, // 0 back glass
  { za: 0.0,  ze: -0.8 }, // 1 browser window
  { za: 0.1,  ze: 0.1  }, // 2 nav bar
  { za: 0.14, ze: 0.65 }, // 3 hero text
  { za: 0.2,  ze: 1.2  }, // 4 CTA
  { za: 0.12, ze: 0.35 }, // 5 card left
  { za: 0.14, ze: 0.75 }, // 6 card centre
  { za: 0.16, ze: 1.15 }, // 7 card right
  { za: 0.2,  ze: 1.9  }, // 8 badge
];

const CARD_X = [0.25, 0.9, 1.55] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WebDevLayers() {
  const palette = useModelPalette();
  const quality = useSceneStore((state) => state.quality);

  const useShadows = quality === "high" || quality === "medium";
  const shadowMapSize = quality === "high" ? 1024 : 512;

  const geos = useMemo<Geos>(() => ({
    backGlass:  roundedRect(4.6, 3.5, 0.3,  0.06),
    winBg:      roundedRect(4.2, 3.2, 0.22, 0.1),
    winBar:     roundedRect(4.0, 0.3, 0.1,  0.02),
    dot:        new SphereGeometry(0.05, 16, 12),
    navBg:      roundedRect(3.6, 0.36, 0.18, 0.07),
    navLogo:    roundedRect(0.2, 0.2,  0.05, 0.03),
    menuBar:    roundedRect(0.28, 0.06, 0.03, 0.03),
    heroH1:     roundedRect(1.8, 0.28, 0.08, 0.07),
    heroH2:     roundedRect(1.3, 0.28, 0.08, 0.07),
    heroS1:     roundedRect(1.7, 0.09, 0.04, 0.04),
    heroS2:     roundedRect(1.2, 0.09, 0.04, 0.04),
    ctaTeal:    roundedRect(0.95, 0.32, 0.16, 0.09),
    ctaAccent:  roundedRect(0.4,  0.07, 0.03, 0.03),
    ctaGhost:   roundedRect(1.0,  0.32, 0.16, 0.05),
    card:       roundedRect(0.58, 1.25, 0.12, 0.08),
    cardImg:    roundedRect(0.5,  0.55, 0.08, 0.03),
    cardTitle:  roundedRect(0.4,  0.07, 0.03, 0.03),
    cardSub:    roundedRect(0.3,  0.06, 0.03, 0.03),
    badge:      roundedRect(0.85, 0.5,  0.15, 0.09),
    badgeLabel: new PlaneGeometry(0.7, 0.35),
  }), []); // geometry objects are stable; no deps needed
  useEffect(() => () => disposeGeos(geos), [geos]);

  // Badge texture  - rebuilt only when the accent hex changes
  const accentHex = `#${palette.accent.getHexString()}`;
  const badgeTex = useMemo(() => buildBadgeTexture(accentHex), [accentHex]);
  useEffect(() => () => badgeTex.dispose(), [badgeTex]);

  // Materials  - rebuilt when palette or badge texture change
  const mats = useMemo(() => ({
    backGlass:      new MeshStandardMaterial({
      color: palette.accent.clone().lerp(palette.card, 0.5),
      transparent: true, opacity: 0.55, roughness: 0.4,
    }),
    winBg:          new MeshStandardMaterial({
      color: palette.card, transparent: true, opacity: 0.96, roughness: 0.3,
    }),
    winBar:         new MeshStandardMaterial({ color: palette.line, roughness: 0.5 }),
    dotR:           new MeshStandardMaterial({ color: 0xff5f57, roughness: 0.3 }),
    dotY:           new MeshStandardMaterial({ color: 0xffbd2e, roughness: 0.3 }),
    dotG:           new MeshStandardMaterial({ color: 0x28c840, roughness: 0.3 }),
    navBg:          new MeshStandardMaterial({
      color: palette.card, transparent: true, opacity: 0.98, roughness: 0.3,
    }),
    navLogo:        new MeshStandardMaterial({ color: palette.accent, roughness: 0.35 }),
    menuBar:        new MeshStandardMaterial({ color: palette.body,   roughness: 0.5  }),
    ink:            new MeshStandardMaterial({ color: palette.ink,    roughness: 0.5  }),
    soft:           new MeshStandardMaterial({ color: palette.body,   roughness: 0.6  }),
    ctaTeal:        new MeshStandardMaterial({
      color: palette.accent, roughness: 0.4,
      emissive: palette.accent.clone(), emissiveIntensity: 0.3,
    }),
    ctaBar:         new MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
    ctaGhost:       new MeshStandardMaterial({
      color: palette.card, transparent: true, opacity: 0.98, roughness: 0.35,
    }),
    card:           new MeshStandardMaterial({
      color: palette.card, transparent: true, opacity: 0.98, roughness: 0.3,
    }),
    cardImgNeutral: new MeshStandardMaterial({ color: palette.line, roughness: 0.5 }),
    cardImgTeal:    new MeshStandardMaterial({
      color: palette.accent.clone().lerp(palette.card, 0.4), roughness: 0.4,
    }),
    badgeBg:        new MeshStandardMaterial({
      color: palette.card, transparent: true, opacity: 0.98, roughness: 0.3,
    }),
    badgeLabel:     new MeshBasicMaterial({ map: badgeTex, transparent: true }),
  }), [palette.accent, palette.card, palette.line, palette.body, palette.ink, badgeTex]); // palette Colors are objects; identity changes when theme toggles
  useEffect(() => () => { for (const m of Object.values(mats)) m.dispose(); }, [mats]);

  // Animation refs
  const root = useRef<Group>(null);
  const layerGroups = useRef<(Group | null)[]>(LAYER_DEFS.map(() => null));
  const pointer = useRef(new Vector2(0, 0));

  // Per-layer ref callbacks  - stable across renders
  const layerRef = useCallback(
    (index: number) => (g: Group | null) => { layerGroups.current[index] = g; },
    [],
  );

  // Shadow light ref  - imperative because we need to configure shadow.camera
  const shadowLightRef = useRef<DirectionalLight>(null);
  useEffect(() => {
    const light = shadowLightRef.current;
    if (!light || !useShadows) return;
    const sc = light.shadow.camera;
    sc.left   = -5;
    sc.right  =  5;
    sc.top    =  5;
    sc.bottom = -5;
    sc.near   =  1;
    sc.far    = 25;
    sc.updateProjectionMatrix();
    light.shadow.bias       = -0.0006;
    light.shadow.normalBias =  0.02;
    light.shadow.radius     =  4;
    light.shadow.mapSize.set(shadowMapSize, shadowMapSize);
  }, [useShadows, shadowMapSize]);

  // Pointer tracking
  useEffect(() => {
    // Track pointer against the whole document; the canvas may be smaller than the panel
    const onMove = (e: PointerEvent) => {
      const canvas = document.querySelector("canvas");
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      pointer.current.set(
        ((e.clientX - r.left) / r.width  - 0.5) * 2,
        -((e.clientY - r.top)  / r.height - 0.5) * 2,
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

    layerGroups.current.forEach((group, i) => {
      if (!group) return;
      const { za } = LAYER_DEFS[i];

      let y = 0;
      if (!isStill) {
        // Loop period: 7 s. Within each cycle, t runs 0 → 7.
        const t = elapsed % 7;
        // Layers assemble in the first ~5 s (each takes 0.9 s, staggered 0.3 s apart).
        // After 6 s they launch upward again to reset before the next cycle.
        const p = Math.max(0, Math.min(1, (t - i * 0.3) / 0.9));
        const eased = 1 - Math.pow(1 - p, 3);
        const bounced = eased + Math.sin(p * Math.PI) * 0.07;
        y = (1 - bounced) * 5;
        // Re-launch: after 6 s, shoot upward so the loop is continuous
        if (t > 6) {
          const q = Math.min(1, t - 6);
          y += q * q * 5;
        }
      }

      group.position.set(0, y, za);
    });

    if (root.current) {
      const { x: px, y: py } = pointer.current;
      root.current.rotation.y += (0.45 + px * 0.28 - root.current.rotation.y) * 0.08;
      root.current.rotation.x += (-0.12 + py * 0.16 - root.current.rotation.x) * 0.08;
    }
  });


  return (
    <>
      {/* Shadow-casting directional light (high/medium only) */}
      {useShadows && (
        <directionalLight
          ref={shadowLightRef}
          position={[-3, 4, 8]}
          intensity={0.6}
          castShadow
        />
      )}
      {/* Teal fill light from below-left */}
      {useShadows && (
        <pointLight
          color={palette.accent}
          intensity={0.5}
          distance={12}
          position={[-3, -2, 4]}
        />
      )}

      <group ref={root} rotation={[-0.12, 0.45, 0]}>

        {/* Layer 0  - back glass */}
        <group ref={layerRef(0)}>
          <mesh geometry={geos.backGlass} material={mats.backGlass} receiveShadow />
        </group>

        {/* Layer 1  - browser window */}
        <group ref={layerRef(1)}>
          <mesh geometry={geos.winBg}  material={mats.winBg}  castShadow receiveShadow />
          <mesh geometry={geos.winBar} material={mats.winBar} position={[0, 1.3, 0.07]} castShadow />
          {/* Traffic-light dots */}
          <mesh geometry={geos.dot} material={mats.dotR} position={[-1.85, 1.3, 0.1]} />
          <mesh geometry={geos.dot} material={mats.dotY} position={[-1.69, 1.3, 0.1]} />
          <mesh geometry={geos.dot} material={mats.dotG} position={[-1.53, 1.3, 0.1]} />
        </group>

        {/* Layer 2  - nav bar */}
        <group ref={layerRef(2)}>
          <mesh geometry={geos.navBg}   material={mats.navBg}   position={[0, 0.85, 0]}     castShadow receiveShadow />
          <mesh geometry={geos.navLogo} material={mats.navLogo} position={[-1.55, 0.85, 0.05]} />
          <mesh geometry={geos.menuBar} material={mats.menuBar} position={[0.7,  0.85, 0.05]} />
          <mesh geometry={geos.menuBar} material={mats.menuBar} position={[1.1,  0.85, 0.05]} />
          <mesh geometry={geos.menuBar} material={mats.menuBar} position={[1.5,  0.85, 0.05]} />
        </group>

        {/* Layer 3  - hero text */}
        <group ref={layerRef(3)}>
          <mesh geometry={geos.heroH1} material={mats.ink}  position={[-0.95, 0.4,   0]} castShadow />
          <mesh geometry={geos.heroH2} material={mats.ink}  position={[-1.2,  0.04,  0]} castShadow />
          <mesh geometry={geos.heroS1} material={mats.soft} position={[-1.0, -0.4,   0]} />
          <mesh geometry={geos.heroS2} material={mats.soft} position={[-1.25,-0.55,  0]} />
        </group>

        {/* Layer 4  - CTA */}
        <group ref={layerRef(4)}>
          <mesh geometry={geos.ctaTeal}  material={mats.ctaTeal}  position={[-1.5, -1.05, 0]}    castShadow />
          <mesh geometry={geos.ctaAccent}material={mats.ctaBar}   position={[-1.5, -1.05, 0.06]} />
          <mesh geometry={geos.ctaGhost} material={mats.ctaGhost} position={[-0.5, -1.05, 0]}    castShadow />
        </group>

        {/* Layers 5-7  - cards */}
        {CARD_X.map((cx, i) => (
          <group key={cx} ref={layerRef(5 + i)}>
            <mesh geometry={geos.card}      material={mats.card}                                    position={[cx,         -0.2,  0]}    castShadow receiveShadow />
            <mesh geometry={geos.cardImg}   material={i === 1 ? mats.cardImgTeal : mats.cardImgNeutral} position={[cx,      0.12, 0.05]}  castShadow />
            <mesh geometry={geos.cardTitle} material={mats.ink}                                     position={[cx - 0.03, -0.35, 0.05]} />
            <mesh geometry={geos.cardSub}   material={mats.soft}                                    position={[cx - 0.08, -0.5,  0.05]} />
          </group>
        ))}

        {/* Layer 8  - badge */}
        <group ref={layerRef(8)}>
          <mesh geometry={geos.badge}      material={mats.badgeBg}    position={[1.45, 1.3, 0]}     castShadow receiveShadow />
          <mesh geometry={geos.badgeLabel} material={mats.badgeLabel} position={[1.45, 1.3, 0.075]} />
        </group>

      </group>
    </>
  );
}
