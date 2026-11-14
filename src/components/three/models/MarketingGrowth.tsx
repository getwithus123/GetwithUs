"use client";

/**
 * MarketingGrowth  - digital-marketing service page model.
 *
 * Reach grows, the trend climbs, and engagement lands.
 * Ported from docs/prototype/Digital marketing 3D prototype.html.
 *
 * This model is NOT in the flow engine  - it has animated chart bars,
 * a trend-line pulse, and a heart scale animation that require direct
 * mesh refs. It follows the same palette/geometry/material conventions.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CatmullRomCurve3,
  type Mesh,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type DirectionalLight,
  type Group,
} from "three";
import { THEME_EVENT } from "@/lib/theme";
import { useModelFrame, useModelQuality } from "@/components/three/models/context";
import { rg } from "@/components/three/models/shared/geo";
import { buildMat, recolourMats, type TrackedMat } from "@/components/three/models/shared/materials";
import { buildPalette, type Palette } from "@/components/three/models/shared/palette";

// Bar heights from prototype
const BAR_H = [0.35, 0.5, 0.45, 0.75, 0.95, 1.25] as const;
// Back glass geometry (shared)
const BACK_GEO = rg(6.0, 3.9, 0.3, 0.06);

function ease(x: number): number { return 1 - Math.pow(1 - x, 3); }
function sm(x: number): number { return x * x * (3 - 2 * x); }

export default function MarketingGrowth() {
  const quality = useModelQuality();
  const [pal, setPal] = useState<Palette>(buildPalette);
  useEffect(() => {
    const update = () => setPal(buildPalette());
    window.addEventListener(THEME_EVENT, update);
    return () => window.removeEventListener(THEME_EVENT, update);
  }, []);

  // ---- Geometries ----
  // Bar geometry: width 0.26, height 1 (bar scaled per height), radius 0.09, depth 0.1
  // The prototype translates the bar geo up by 0.5 so pivot is at bottom.
  const barGeo = useMemo(() => {
    const g = rg(0.26, 1, 0.09, 0.1);
    g.translate(0, 0.5, 0); // pivot at bottom
    return g;
  }, []);

  const trendSegs = quality === "high" ? 40 : quality === "medium" ? 28 : 16;
  const { trendGeo, trendCurve, pulseSphereGeo } = useMemo(() => {
    const pts = BAR_H.map((h, i) => new Vector3(-1.9 + i * 0.46 + 0.7, -0.85 + h + 0.2, 0.1));
    const trendCurve = new CatmullRomCurve3(pts);
    const trendGeo   = new TubeGeometry(trendCurve, trendSegs, 0.03, 8, false);
    const pulseSphereGeo = new SphereGeometry(0.08, 16, 12);
    return { trendGeo, trendCurve, pulseSphereGeo };
  }, [trendSegs]);
  useEffect(() => () => {
    trendGeo.dispose();
    pulseSphereGeo.dispose();
  }, [trendGeo, pulseSphereGeo]);

  // ---- Materials ----
  const bgMat      = useMemo(() => buildMat(pal, "tint", { opacity: 0.5 }), [pal]);
  const cardMat    = useMemo(() => buildMat(pal, "white"), [pal]);
  const inkMat     = useMemo(() => buildMat(pal, "ink"), [pal]);
  const softMat    = useMemo(() => buildMat(pal, "soft"), [pal]);
  const tealMat    = useMemo(() => buildMat(pal, "teal"), [pal]);
  const tintMat    = useMemo(() => buildMat(pal, "tint"), [pal]);
  const trendMat   = useMemo(() => buildMat(pal, "teal", { emissive: 0.15 }), [pal]);
  const pulseMat   = useMemo(() => buildMat(pal, "teal", { emissive: 0.9 }), [pal]);
  const heartMat   = useMemo(() => buildMat(pal, "teal", { emissive: 0.2 }), [pal]);
  const tealBarMat = useMemo(() => buildMat(pal, "teal", { emissive: 0.12 }), [pal]);
  const chipUpMat  = useMemo(() => buildMat(pal, "teal"), [pal]);

  const allMats = useMemo<TrackedMat[]>(
    () => [bgMat, cardMat, inkMat, softMat, tealMat, tintMat, trendMat, pulseMat, heartMat, tealBarMat, chipUpMat],
    [bgMat, cardMat, inkMat, softMat, tealMat, tintMat, trendMat, pulseMat, heartMat, tealBarMat, chipUpMat],
  );
  useEffect(() => { recolourMats(allMats, pal); }, [pal, allMats]);
  useEffect(() => () => { for (const m of allMats) m.dispose(); }, [allMats]);

  // Bar materials (tint × 5, teal × 1 for the last bar)
  const barMats = useMemo(() => BAR_H.map((_, i) =>
    i === 5 ? buildMat(pal, "teal", { emissive: 0.12 }) : buildMat(pal, "tint")
  ), [pal]);
  useEffect(() => () => { for (const m of barMats) m.dispose(); }, [barMats]);
  useEffect(() => { recolourMats(barMats as TrackedMat[], pal); }, [pal, barMats]);

  // ---- Refs ----
  const root        = useRef<Group>(null);
  const cardNode    = useRef<Group>(null); // chart card node
  const barNode     = useRef<Group>(null);
  const trendNode   = useRef<Group>(null);
  const chipNode    = useRef<Group>(null);
  const socNode     = useRef<Group>(null);
  const tgtNode     = useRef<Group>(null);
  const barMeshes   = useRef<(Mesh | null)[]>(BAR_H.map(() => null));
  const pulseMesh   = useRef<Mesh>(null);
  const heartMesh   = useRef<Mesh>(null);
  const pointer     = useRef(new Vector2(0, 0));
  const runStart    = useRef(0);
  const shadowRef   = useRef<DirectionalLight>(null);

  // Shadow config
  useEffect(() => {
    const l = shadowRef.current;
    if (!l) return;
    const sc = l.shadow.camera;
    sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5;
    sc.near = 1; sc.far = 25; sc.updateProjectionMatrix();
    l.shadow.bias = -0.0006; l.shadow.normalBias = 0.02; l.shadow.radius = 4;
    l.shadow.mapSize.set(quality === "high" ? 1024 : 512, quality === "high" ? 1024 : 512);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pointer
  useEffect(() => {
    const onMove = (e: PointerEvent) => pointer.current.set(
      (e.clientX / window.innerWidth  - 0.5) * 2,
      -(e.clientY / window.innerHeight - 0.5) * 2,
    );
    const onLeave = () => pointer.current.set(0, 0);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerleave", onLeave); };
  }, []);

  // Arrival data: [nodeRef, arrivalTime]
  const ARRIVALS = useMemo(() => [
    // chart nodes arrive at 0 (bars/trend arrive separately)
    { ref: trendNode, t: 3.1 },
    { ref: chipNode,  t: 3.3 },
    { ref: socNode,   t: 3.5 },
    { ref: tgtNode,   t: 3.7 },
  ], []);

  const NODE_DEFS = useMemo(() => [
    { ref: cardNode,  x: -0.7, y: -0.1, za: 0.1, ze: 0.3 },
    { ref: barNode,   x: -0.7, y: -0.1, za: 0.14, ze: 0.7 },
    { ref: trendNode, x: -0.7, y: -0.1, za: 0.16, ze: 1.1 },
    { ref: chipNode,  x: -1.7, y:  1.45, za: 0.2, ze: 1.3 },
    { ref: socNode,   x:  1.9, y:  0.8,  za: 0.15, ze: 0.9 },
    { ref: tgtNode,   x:  1.9, y: -0.75, za: 0.15, ze: 0.6 },
  ], []);

  useModelFrame((_, elapsed) => {
    const isStill = elapsed === 0;
    const nowMs = elapsed * 1000;

    const wall = performance.now() / 1000;
    let t = isStill ? -1 : (wall - runStart.current);
    if (!isStill && t > 6.2) { runStart.current = wall; t = 0; }

    const k = isStill ? 0.3 : 0.5;

    // Nodes
    NODE_DEFS.forEach(({ ref, x, y, za, ze }, i) => {
      const g = ref.current;
      if (!g) return;
      g.position.set(x, y + (isStill ? 0 : Math.sin(nowMs / 900 + i * 0.9) * 0.025 * k), za + (ze - za) * k);
      // Arrival pop
      const arr = ARRIVALS.find(a => a.ref === ref);
      if (arr) {
        const dt = t - arr.t;
        g.scale.setScalar(t >= 0 && dt >= 0 && dt < 0.45 ? 1 + 0.1 * (1 - dt / 0.45) : 1);
      }
    });

    // Bar scale.y animation (grow in from 0 → h)
    barMeshes.current.forEach((m, i) => {
      if (!m) return;
      const p = isStill ? 1 : Math.max(0, Math.min(1, (t - i * 0.15) / 0.7));
      m.scale.y = Math.max(0.001, BAR_H[i] * ease(p));
    });

    // Trend pulse
    const pp = (t - 1.8) / 1.3;
    if (pulseMesh.current) {
      if (isStill || pp < 0 || pp > 1) {
        pulseMesh.current.visible = false;
      } else {
        pulseMesh.current.visible = true;
        pulseMesh.current.position.copy(trendCurve.getPoint(sm(pp)));
      }
    }

    // Heart scale burst
    if (heartMesh.current) {
      const hd = t - 3.5;
      const hs = !isStill && hd >= 0 && hd < 0.6 ? 2.4 * (1 + 0.5 * Math.sin(hd / 0.6 * Math.PI)) : 2.4;
      heartMesh.current.scale.setScalar(hs);
    }

    // Root tilt
    if (root.current) {
      root.current.rotation.y += (-0.28 + pointer.current.x * 0.28 - root.current.rotation.y) * 0.08;
      root.current.rotation.x += (-0.1  + pointer.current.y * 0.16 - root.current.rotation.x) * 0.08;
    }
  });

  // Chart card X offset: prototype has CX = -0.7 for the whole chart group
  const CX = 0; // local coords within the card node

  return (
    <>
      <hemisphereLight args={[0xffffff, 0x9fb8c2, 0.6]} />
      <directionalLight ref={shadowRef} position={[-3, 4, 8]} intensity={0.6} castShadow />
      <pointLight color={pal.teal} intensity={0.5} distance={12} position={[-3, -2, 4]} />

      <group ref={root} rotation={[-0.1, -0.28, 0]}>
        {/* Back glass */}
        <mesh geometry={BACK_GEO} material={bgMat} position={[0, 0.05, -0.5]} receiveShadow />

        {/* Chart card */}
        <group ref={cardNode}>
          <mesh geometry={rg(3.2, 2.4, 0.2, 0.08)} material={cardMat} position={[CX, 0, 0]} castShadow receiveShadow />
          <mesh geometry={rg(0.9, 0.12, 0.05, 0.03)} material={inkMat}  position={[CX - 0.9, 0.95, 0.05]} castShadow />
          <mesh geometry={rg(0.6, 0.07, 0.03, 0.03)} material={softMat} position={[CX - 1.05, 0.75, 0.05]} />
          <mesh geometry={rg(0.14, 0.14, 0.07, 0.03)} material={tealMat} position={[CX + 1.3, 0.95, 0.05]} />
          {/* Grid lines */}
          {([-0.45, -0.05, 0.35] as const).map((y) => (
            <mesh key={y} geometry={rg(2.8, 0.015, 0.007, 0.01)} material={softMat}
              position={[CX, y, 0.045]} />
          ))}
        </group>

        {/* Bar node */}
        <group ref={barNode}>
          {BAR_H.map((h, i) => (
            <mesh
              key={i}
              ref={(m) => { barMeshes.current[i] = m; }}
              geometry={barGeo}
              material={barMats[i]}
              position={[CX - 1.9 + i * 0.46 + 0.7, -0.85, 0.05]}
              scale={[1, Math.max(0.001, h), 1]}
              castShadow
            />
          ))}
        </group>

        {/* Trend line node */}
        <group ref={trendNode}>
          <mesh geometry={trendGeo} material={trendMat} />
          {/* Arrow head */}
          <mesh
            geometry={rg(0.09, 0.11, 0.03, 0.04)}
            material={tealMat}
            position={[CX - 1.9 + 5 * 0.46 + 0.7 + 0.03, -0.85 + BAR_H[5] + 0.2, 0.1]}
            rotation={[0, 0, -0.99]}
          />
          {/* Pulse */}
          <mesh ref={pulseMesh} geometry={pulseSphereGeo} material={pulseMat} visible={false} position={[0, 0, 0.1]} />
        </group>

        {/* Notification chip */}
        <group ref={chipNode}>
          <mesh geometry={rg(1.3, 0.4, 0.2, 0.08)} material={cardMat} position={[-1.7, 1.45, 0]} castShadow receiveShadow />
          {/* Up-arrow (teal triangle approx) */}
          <mesh geometry={rg(0.09, 0.11, 0.03, 0.04)} material={chipUpMat}
            position={[-2.15, 1.45, 0.05]} rotation={[0, 0, 0]} castShadow />
          <mesh geometry={rg(0.55, 0.07, 0.03, 0.03)} material={inkMat}  position={[-1.58, 1.51, 0.05]} />
          <mesh geometry={rg(0.40, 0.06, 0.03, 0.03)} material={softMat} position={[-1.65, 1.38, 0.05]} />
        </group>

        {/* Social post */}
        <group ref={socNode}>
          <mesh geometry={rg(1.3, 1.15, 0.16, 0.08)} material={cardMat} position={[1.9, 0.8,  0]} castShadow receiveShadow />
          <mesh geometry={rg(0.26, 0.26, 0.13, 0.04)} material={tealMat} position={[1.48, 1.18, 0.05]} />
          <mesh geometry={rg(0.5,  0.07, 0.03, 0.03)} material={inkMat}  position={[1.95, 1.22, 0.05]} />
          <mesh geometry={rg(0.36, 0.06, 0.03, 0.03)} material={softMat} position={[1.90, 1.10, 0.05]} />
          <mesh geometry={rg(1.1,  0.5,  0.10, 0.04)} material={tintMat} position={[1.9,  0.75, 0.05]} />
          {/* Heart */}
          <mesh
            ref={heartMesh}
            geometry={rg(0.09, 0.095, 0.04, 0.03)}
            material={heartMat}
            position={[1.48, 0.38, 0.06]}
            scale={[2.4, 2.4, 2.4]}
          />
          <mesh geometry={rg(0.45, 0.06, 0.03, 0.03)} material={softMat} position={[1.95, 0.38, 0.05]} />
        </group>

        {/* Target card */}
        <group ref={tgtNode}>
          <mesh geometry={rg(1.3, 1.0, 0.16, 0.08)} material={cardMat} position={[1.9, -0.75, 0]} castShadow receiveShadow />
          {/* Target rings */}
          <mesh position={[1.57, -0.75, 0.05]}>
            <torusGeometry args={[0.32, 0.035, 10, 40]} />
            <primitive object={softMat} />
          </mesh>
          <mesh position={[1.57, -0.75, 0.05]}>
            <torusGeometry args={[0.20, 0.035, 10, 40]} />
            <primitive object={tintMat} />
          </mesh>
          <mesh position={[1.57, -0.75, 0.07]}>
            <sphereGeometry args={[0.08, 16, 12]} />
            <primitive object={tealMat} />
          </mesh>
          <mesh geometry={rg(0.4, 0.07, 0.03, 0.03)} material={inkMat}  position={[2.22, -0.67, 0.05]} />
          <mesh geometry={rg(0.3, 0.06, 0.03, 0.03)} material={softMat} position={[2.17, -0.83, 0.05]} />
        </group>
      </group>
    </>
  );
}
