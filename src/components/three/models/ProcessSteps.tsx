"use client";

/**
 * ProcessSteps  - /process page model.
 *
 * Four stage cards (Discover, Scope, Build, Launch) on a rising staircase,
 * bezier tube connectors between them, a teal pulse completing each stage in
 * turn, and a progress bar that fills. Loop: 7 s.
 *
 * Ported from docs/prototype/Process 3D prototype.html (three.js r128).
 * Camera: fov 30, z 10 (set in MODEL_VIEWS).
 *
 * Palette note: ink is #0f1b2d in BOTH themes because stage cards stay light
 * (surf #fff / #dfe8ef). The global palette.ts uses #e8eef4 for dark ink  -
 * that value is NOT used here.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CanvasTexture,
  Color,
  CubicBezierCurve3,
  type DirectionalLight,
  type Group,
  type Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  type PointLight,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { THEME_EVENT } from "@/lib/theme";
import { useModelFrame, useModelQuality } from "@/components/three/models/context";
import { rg } from "@/components/three/models/shared/geo";

// ---------------------------------------------------------------------------
// Palette (local  - ink locked to #0f1b2d in both themes)
// ---------------------------------------------------------------------------

type P = { teal: string; ink: string; surf: string; soft: string; tint: string; white: string };

function isDk(): boolean {
  const t = document.documentElement.dataset["theme"];
  return t ? t === "dark" : window.matchMedia("(prefers-color-scheme:dark)").matches;
}
function pal(): P {
  return isDk()
    ? { teal: "#2fb5bf", ink: "#0f1b2d", surf: "#dfe8ef", soft: "#9aa8b6", tint: "#3a6a72", white: "#ffffff" }
    : { teal: "#0f5f66", ink: "#0f1b2d", surf: "#ffffff",  soft: "#b7c0c9", tint: "#8fc3cb", white: "#ffffff" };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sm(x: number) { return x * x * (3 - 2 * x); }

type TM = MeshStandardMaterial & { _k: keyof P };

function mkm(c: P, k: keyof P, e = 0, op = 1): TM {
  const m = new MeshStandardMaterial({
    color: new Color(c[k]),
    roughness: 0.5, metalness: 0,
    transparent: op < 1, opacity: op,
    ...(e > 0 && { emissive: new Color(c.teal), emissiveIntensity: e }),
  }) as TM;
  m._k = k;
  return m;
}

function recolAll(mats: TM[], bm: MeshBasicMaterial[], txs: CanvasTexture[],
  redraws: Array<() => void>, c: P, pl: PointLight | null) {
  for (const m of mats) { m.color.set(c[m._k]); if (m.emissive) m.emissive.set(c.teal); }
  if (pl) pl.color.set(c.teal);
  for (const redraw of redraws) redraw();
  for (const bmat of bm) bmat.needsUpdate = true;
}

function mkLabel(text: string, w: number, h: number, c: P, key: keyof P, align: CanvasTextAlign) {
  const cv = document.createElement("canvas");
  cv.width = Math.round(w * 500); cv.height = Math.round(h * 500);
  const ctx = cv.getContext("2d")!;
  const tex = new CanvasTexture(cv);
  let _c = c;
  const redraw = () => {
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = _c[key];
    ctx.font = `700 ${cv.height * 0.72}px system-ui,sans-serif`;
    ctx.textBaseline = "middle"; ctx.textAlign = align;
    ctx.fillText(text, align === "center" ? cv.width / 2 : 6, cv.height / 2 + 2);
    tex.needsUpdate = true;
  };
  redraw();
  const setC = (nc: P) => { _c = nc; };
  const geo = new PlaneGeometry(w, h);
  const mat = new MeshBasicMaterial({ map: tex, transparent: true });
  return { tex, geo, mat, redraw, setC };
}

// ---------------------------------------------------------------------------
// Scene constants (from prototype)
// ---------------------------------------------------------------------------

const NAMES = ["Discover", "Scope", "Build", "Launch"] as const;
const XS    = [-2.325, -0.775, 0.775, 2.325] as const;
const YS    = [-0.5, -0.15, 0.2, 0.55] as const;
const ZE    = [0.6, 0.9, 1.2, 1.5] as const;
const ARR   = [0.4, 1.7, 3.0, 4.3] as const;
const SEGS  = [0.8, 2.1, 3.4] as const;
const PDUR  = 0.9;
const LOOP  = 7;

const BACK_GEO  = rg(6.6, 4.2, 0.3, 0.06);
const TRACK_GEO = rg(5.6, 0.2, 0.1, 0.05);
const FILL_GEO  = (() => { const g = rg(5.6, 0.2, 0.1, 0.05); g.translate(2.8, 0, 0); return g; })();

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProcessSteps() {
  const quality = useModelQuality();
  const [palette, setPalette] = useState<P>(pal);
  useEffect(() => {
    const up = () => setPalette(pal());
    window.addEventListener(THEME_EVENT, up);
    return () => window.removeEventListener(THEME_EVENT, up);
  }, []);

  const tubeSegs = quality === "high" ? 32 : quality === "medium" ? 24 : 16;

  // All tracked materials, label textures, and redraws
  const mats    = useRef<TM[]>([]);
  const bmats   = useRef<MeshBasicMaterial[]>([]);
  const texs    = useRef<CanvasTexture[]>([]);
  const redraws = useRef<Array<() => void>>([]);

  // Refs for per-frame mutation
  const rootRef      = useRef<Group>(null);
  const layerRefs    = useRef<Array<Group | null>>(Array(5).fill(null));
  const circMatRefs  = useRef<Array<MeshStandardMaterial | null>>(Array(4).fill(null));
  const sqMatRefs    = useRef<Array<Array<MeshStandardMaterial | null>>>(Array(4).fill(null).map(() => Array(3).fill(null)));
  const pillMatRefs  = useRef<Array<MeshStandardMaterial | null>>(Array(4).fill(null));
  const badgeRefs    = useRef<Array<Group | null>>(Array(4).fill(null));
  const fillRef      = useRef<Mesh>(null);
  const pulseRefs    = useRef<Array<Mesh | null>>(Array(3).fill(null));
  const plRef        = useRef<PointLight>(null);
  const shadowRef    = useRef<DirectionalLight>(null);
  const pointer      = useRef({ x: 0, y: 0 });
  const runStart     = useRef(0);

  // Build scene geometry + materials (once per palette change)
  const scene = useMemo(() => {
    const c = palette;
    const newMats:    TM[]                  = [];
    const newBmats:   MeshBasicMaterial[]   = [];
    const newTexs:    CanvasTexture[]       = [];
    const newRedraws: Array<() => void>     = [];

    const mk = (k: keyof P, e = 0, op = 1) => {
      const m = mkm(c, k, e, op); newMats.push(m); return m;
    };
    const lbl = (text: string, w: number, h: number, k: keyof P, align: CanvasTextAlign) => {
      const r = mkLabel(text, w, h, c, k, align);
      newTexs.push(r.tex); newBmats.push(r.mat);
      let _latest = c;
      newRedraws.push(() => { r.setC(_latest); r.redraw(); });
      return { r, setLatest: (p: P) => { _latest = p; } };
    };

    const backMat  = mk("tint", 0, 0.5);
    const trackMat = mk("tint");
    const fillMat  = mk("teal", 0.3);
    const tubeMat  = mk("soft");
    const pulseMat = mk("teal", 0.9);

    const stages = NAMES.map((name, i) => {
      const surfMat  = mk("surf");
      const circMat  = mk("soft", 0);
      const pillMat  = mk("tint");
      const badgeMat = mk("teal", 0.2);
      const numLbl   = lbl(String(i + 1), 0.34, 0.34, "white", "center").r;
      const nameLbl  = lbl(name, 0.62, 0.2, "ink", "left").r;
      const divMat   = mk("soft");
      const sq1Mat   = mk("soft"); const sq2Mat = mk("soft"); const sq3Mat = mk("soft");
      const sqWMat1  = mk("soft"); const sqWMat2 = mk("soft"); const sqWMat3 = mk("soft");
      const checkLbl = lbl("✓", 0.3, 0.3, "white", "center").r;
      return { surfMat, circMat, pillMat, badgeMat, numLbl, nameLbl, divMat,
               sqMats: [sq1Mat, sq2Mat, sq3Mat], sqWMats: [sqWMat1, sqWMat2, sqWMat3], checkLbl };
    });

    // Curves + tube geometries
    const curves: CubicBezierCurve3[] = [];
    const tubeGeos: TubeGeometry[] = [];
    const sphGeos: SphereGeometry[] = [];
    for (let i = 0; i < 3; i++) {
      const a = new Vector3(XS[i] + 0.55, YS[i], -0.1);
      const b = new Vector3(XS[i + 1] - 0.55, YS[i + 1], -0.1);
      const cu = new CubicBezierCurve3(a, a.clone().add(new Vector3(0.25, 0, 0)), b.clone().add(new Vector3(-0.25, 0, 0)), b);
      curves.push(cu);
      tubeGeos.push(new TubeGeometry(cu, tubeSegs, 0.03, 8, false));
      sphGeos.push(new SphereGeometry(0.075, 16, 12));
    }

    return { backMat, trackMat, fillMat, tubeMat, pulseMat, stages, curves, tubeGeos, sphGeos,
             newMats, newBmats, newTexs, newRedraws };
  }, [palette, tubeSegs]);

  // Sync tracking refs (safe  - in effect, not render)
  useEffect(() => {
    mats.current    = scene.newMats;
    bmats.current   = scene.newBmats;
    texs.current    = scene.newTexs;
    redraws.current = scene.newRedraws;
  }, [scene]);

  // Dispose on unmount or scene rebuild
  useEffect(() => () => {
    for (const m of scene.newMats) m.dispose();
    for (const m of scene.newBmats) m.dispose();
    for (const t of scene.newTexs) t.dispose();
    for (const g of scene.tubeGeos) g.dispose();
    for (const g of scene.sphGeos) g.dispose();
  }, [scene]);

  // Recolour after palette change
  useEffect(() => {
    recolAll(scene.newMats, scene.newBmats, scene.newTexs, scene.newRedraws, palette, plRef.current);
  }, [palette, scene]);

  // Shadow light config
  useEffect(() => {
    const l = shadowRef.current; if (!l) return;
    const sc = l.shadow.camera;
    sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.near = 1; sc.far = 25;
    sc.updateProjectionMatrix();
    l.shadow.bias = -0.0006; l.shadow.normalBias = 0.02; l.shadow.radius = 4;
    l.shadow.mapSize.set(quality === "high" ? 1024 : 512, quality === "high" ? 1024 : 512);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pointer
  useEffect(() => {
    const mv = (e: PointerEvent) => { pointer.current = { x: (e.clientX / window.innerWidth - 0.5) * 2, y: -(e.clientY / window.innerHeight - 0.5) * 2 }; };
    const lv = () => { pointer.current = { x: 0, y: 0 }; };
    window.addEventListener("pointermove", mv, { passive: true });
    window.addEventListener("pointerleave", lv);
    return () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerleave", lv); };
  }, []);

  useModelFrame((_, elapsed) => {
    const isStill = elapsed === 0;
    const nowMs = elapsed * 1000;
    const wall = performance.now() / 1000;
    let t: number;
    if (isStill) { t = 99; }
    else { t = wall - runStart.current; if (t > LOOP) { runStart.current = wall; t = 0; } }

    const k = isStill ? 0.3 : 0.5;

    // Layer z + bob
    for (let i = 0; i < 4; i++) {
      const g = layerRefs.current[i]; if (!g) continue;
      g.position.z = 0.1 + (ZE[i] - 0.1) * k;
      g.position.y = YS[i] + (isStill ? 0 : Math.sin(nowMs / 900 + i * 0.9) * 0.025 * k);
    }
    const tg = layerRefs.current[4];
    if (tg) {
      tg.position.z = 0.1 + (0.45 - 0.1) * k;
      tg.position.y = -1.8 + (isStill ? 0 : Math.sin(nowMs / 900 + 4 * 0.9) * 0.025 * k);
    }

    // Stage animations
    let nDone = 0, pFill = 0;
    for (let i = 0; i < 4; i++) {
      const dt = t - ARR[i], done = dt >= 0;
      if (done) nDone++;
      const g = layerRefs.current[i];
      if (g) g.scale.setScalar(dt >= 0 && dt <= 0.45 ? 1 + 0.1 * (1 - dt / 0.45) : 1);
      const cm = circMatRefs.current[i];
      if (cm) { cm.color.set(done ? palette.teal : palette.soft); if (i === 3) cm.emissiveIntensity = dt >= 0 && dt <= 0.8 ? 0.7 * (1 - dt / 0.8) : 0; }
      for (let j = 0; j < 3; j++) { const sm2 = sqMatRefs.current[i]?.[j]; if (sm2) sm2.color.set(done ? palette.teal : palette.soft); }
      const pm = pillMatRefs.current[i]; if (pm) pm.color.set(done ? palette.teal : palette.tint);
      const bg = badgeRefs.current[i]; if (bg) bg.scale.setScalar(Math.max(0.001, done ? sm(Math.min(1, dt / 0.35)) : 0));
    }
    for (let j = 0; j < 3; j++) {
      const pm = pulseRefs.current[j]; if (!pm) continue;
      const q = (t - SEGS[j]) / PDUR, on = !isStill && q >= 0 && q <= 1;
      pm.visible = on;
      if (on) { const sp = sm(q); pm.position.copy(scene.curves[j].getPoint(sp)); pFill = sp; }
    }
    const f = fillRef.current; if (f) f.scale.x = Math.max(0.001, Math.min(1, (nDone + pFill) / 4));
    if (rootRef.current) {
      rootRef.current.rotation.y += ((isStill ? -0.28 : -0.28 + pointer.current.x * 0.28) - rootRef.current.rotation.y) * 0.08;
      rootRef.current.rotation.x += ((isStill ? -0.1 : -0.1 + pointer.current.y * 0.16) - rootRef.current.rotation.x) * 0.08;
    }
  });

  const useShadows = quality !== "low";

  return (
    <>
      <hemisphereLight args={[0xffffff, 0x9fb8c2, 0.6]} />
      {useShadows && <directionalLight ref={shadowRef} position={[-3, 4, 8]} intensity={0.6} castShadow />}
      <pointLight ref={plRef} color={palette.teal} intensity={0.5} distance={12} position={[-3, -2, 4]} />

      <group ref={rootRef} rotation={[-0.1, -0.28, 0]}>
        {/* Back glass */}
        <mesh geometry={BACK_GEO} material={scene.backMat} position={[0, -0.05, -0.5]} receiveShadow />

        {/* Stage cards */}
        {NAMES.map((name, i) => {
          const st = scene.stages[i];
          return (
            <group key={name} ref={(g) => { layerRefs.current[i] = g; }} position={[XS[i], YS[i], 0.1]}>
              {/* Card body */}
              <mesh geometry={rg(1.1, 1.7, 0.16, 0.1)} material={st.surfMat} castShadow receiveShadow />
              {/* Circle */}
              <mesh
                ref={(m) => { if (m) circMatRefs.current[i] = m.material as MeshStandardMaterial; }}
                geometry={rg(0.34, 0.34, 0.17, 0.04)} material={st.circMat}
                position={[-0.3, 0.6, 0.07]} castShadow
              />
              {/* Number */}
              <mesh geometry={st.numLbl.geo} material={st.numLbl.mat} position={[-0.3, 0.6, 0.095]} />
              {/* Name */}
              <mesh geometry={st.nameLbl.geo} material={st.nameLbl.mat} position={[0.14, 0.62, 0.075]} />
              {/* Divider */}
              <mesh geometry={rg(0.45, 0.06, 0.03, 0.03)} material={st.divMat} position={[0.05, 0.42, 0.07]} />
              {/* Checklist */}
              {[0, 1, 2].map((j) => (
                <group key={j}>
                  <mesh
                    ref={(m) => { if (m) { sqMatRefs.current[i][j] = m.material as MeshStandardMaterial; } }}
                    geometry={rg(0.15, 0.15, 0.04, 0.03)} material={st.sqMats[j]}
                    position={[-0.33, 0.12 - 0.3 * j, 0.07]}
                  />
                  <mesh geometry={rg([0.5, 0.38, 0.44][j], 0.07, 0.03, 0.03)} material={st.sqWMats[j]}
                    position={[0.08, 0.12 - 0.3 * j, 0.07]} />
                </group>
              ))}
              {/* Pill */}
              <mesh
                ref={(m) => { if (m) pillMatRefs.current[i] = m.material as MeshStandardMaterial; }}
                geometry={rg(0.82, 0.14, 0.07, 0.03)} material={st.pillMat}
                position={[0, -0.68, 0.07]}
              />
              {/* Badge */}
              <group ref={(g) => { badgeRefs.current[i] = g; }} position={[0.5, 0.78, 0.1]} scale={[0.001, 0.001, 0.001]}>
                <mesh geometry={rg(0.3, 0.3, 0.15, 0.04)} material={st.badgeMat} castShadow />
                <mesh geometry={st.checkLbl.geo} material={st.checkLbl.mat} position={[0, 0, 0.03]} />
              </group>
            </group>
          );
        })}

        {/* Progress track */}
        <group ref={(g) => { layerRefs.current[4] = g; }} position={[0, -1.8, 0.1]}>
          <mesh geometry={TRACK_GEO} material={scene.trackMat} castShadow receiveShadow />
          <mesh ref={fillRef} geometry={FILL_GEO} material={scene.fillMat} position={[-2.8, 0, 0.03]} scale={[0.001, 1, 1]} />
        </group>

        {/* Tube connectors */}
        {scene.tubeGeos.map((geo, i) => (
          <mesh key={i} geometry={geo} material={scene.tubeMat} receiveShadow />
        ))}

        {/* Pulse spheres */}
        {scene.sphGeos.map((geo, i) => (
          <mesh key={i} ref={(m) => { pulseRefs.current[i] = m; }} geometry={geo} material={scene.pulseMat} visible={false} />
        ))}
      </group>
    </>
  );
}
