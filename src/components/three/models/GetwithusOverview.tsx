"use client";

/**
 * GetwithusOverview  - home-page "One team, from idea to launch" section model.
 *
 * Hub logo (tile, G annular sector, teal square) → four service cards
 * (Web, Apps, Automation, Marketing) → process track → CTA chip.
 * Five bezier-tube connectors, one pulse per connector.
 *
 * Ported from docs/prototype/GetwithUs 3D prototype.html (three.js r128).
 * Camera: fov 30, z 10.5 (set in MODEL_VIEWS).
 * Loop: 8.2 s.
 *
 * Local palette  - ink stays #0f1b2d in both themes (cards stay light).
 * navy: #0f1b2d light / #18283b dark  (logo tile)
 * surf: #ffffff  light / #dfe8ef dark (card surface)
 * The wordmark "Get" and "Us" use #0f1b2d light / #e8eef4 dark (panel bg text).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CanvasTexture,
  Color,
  CubicBezierCurve3,
  type DirectionalLight,
  ExtrudeGeometry,
  type Group,
  type Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  type PointLight,
  Shape,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { THEME_EVENT } from "@/lib/theme";
import { useModelFrame, useModelQuality } from "@/components/three/models/context";
import { rg } from "@/components/three/models/shared/geo";

// ---------------------------------------------------------------------------
// Local palette
// ---------------------------------------------------------------------------

type P = {
  teal: string; ink: string; navy: string; surf: string;
  soft: string; tint: string; white: string;
  /** wordmark text colour  - dark on light panel bg, light on dark panel bg */
  wm: string;
};

function isDk(): boolean {
  const t = document.documentElement.dataset["theme"];
  return t ? t === "dark" : window.matchMedia("(prefers-color-scheme:dark)").matches;
}
function pal(): P {
  return isDk()
    ? { teal: "#2fb5bf", ink: "#0f1b2d", navy: "#18283b", surf: "#dfe8ef", soft: "#9aa8b6", tint: "#3a6a72", white: "#ffffff", wm: "#e8eef4" }
    : { teal: "#0f5f66", ink: "#0f1b2d", navy: "#0f1b2d", surf: "#ffffff",  soft: "#b7c0c9", tint: "#8fc3cb", white: "#ffffff", wm: "#0f1b2d" };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sm(x: number) { return x * x * (3 - 2 * x); }
function popV(d: number, T: number) { const x = Math.min(1, d / T); return d >= 0 ? sm(x) + 0.12 * Math.sin(Math.PI * x) : 0; }

type TM = MeshStandardMaterial & { _k: keyof P };

function mkm(c: P, k: keyof P, e = 0, op = 1): TM {
  const m = new MeshStandardMaterial({
    color: new Color(c[k]), roughness: 0.5, metalness: 0,
    transparent: op < 1, opacity: op,
    ...(e > 0 && { emissive: new Color(c.teal), emissiveIntensity: e }),
  }) as TM;
  m._k = k;
  return m;
}

function mkLabel(
  text: string | null, w: number, h: number, c: P,
  drawFn: (ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement, c: P) => void,
) {
  void text;
  const cv = document.createElement("canvas");
  cv.width = Math.round(w * 500); cv.height = Math.round(h * 500);
  const ctx = cv.getContext("2d")!;
  const tex = new CanvasTexture(cv);
  let _c = c;
  const redraw = () => { drawFn(ctx, cv, _c); tex.needsUpdate = true; };
  redraw();
  const setC = (nc: P) => { _c = nc; };
  return {
    tex, geo: new PlaneGeometry(w, h),
    mat: new MeshBasicMaterial({ map: tex, transparent: true }),
    redraw, setC,
  };
}

function simpleLabel(text: string, w: number, h: number, c: P, key: keyof P, align: CanvasTextAlign) {
  return mkLabel(text, w, h, c, (ctx, cv, cc) => {
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = cc[key];
    ctx.font = `700 ${cv.height * 0.72}px system-ui,sans-serif`;
    ctx.textBaseline = "middle"; ctx.textAlign = align;
    ctx.fillText(text, align === "center" ? cv.width / 2 : 6, cv.height / 2 + 2);
  });
}

// G annular sector geometry (from prototype: outer 0.6, inner 0.308, 45°→360°)
function makeGGeo(): ExtrudeGeometry {
  const Ro = 0.6, Ri = 0.308;
  const sh = new Shape();
  sh.absarc(0, 0, Ro, Math.PI / 4, 2 * Math.PI, false);
  sh.lineTo(Ri * Math.cos(2 * Math.PI), Ri * Math.sin(2 * Math.PI));
  sh.absarc(0, 0, Ri, 2 * Math.PI, Math.PI / 4, true);
  sh.closePath();
  const geo = new ExtrudeGeometry(sh, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 48,
  });
  geo.translate(0, 0, -0.03);
  return geo;
}

// Module-level G geometry (created once, never recreated)
const G_GEO = makeGGeo();
const BACK_GEO = rg(7.0, 4.4, 0.3, 0.06);
const TRACK_GEO = rg(4.6, 0.2, 0.1, 0.05);
const FILL_GEO  = (() => { const g = rg(4.6, 0.2, 0.1, 0.05); g.translate(2.3, 0, 0); return g; })();

// ---------------------------------------------------------------------------
// Scene constants (from prototype)
// ---------------------------------------------------------------------------

const CARD_DATA = [
  { name: "Web",        cx: -2.4, cy:  0.95, ze: 0.6,  i: 4 },
  { name: "Apps",       cx:  2.4, cy:  0.95, ze: 0.9,  i: 5 },
  { name: "Automation", cx: -2.4, cy: -0.95, ze: 0.75, i: 6 },
  { name: "Marketing",  cx:  2.4, cy: -0.95, ze: 1.05, i: 7 },
] as const;

const DOT_XS   = [-2.2, -0.73, 0.73, 2.2] as const;
const SEG      = [0.8, 1.2, 1.6, 2.0, 4.8] as const;
const PDUR     = 0.8;
const LOOP     = 8.2;
const DOT_TIMES = [2.95, 3.5, 4.0, 4.55] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GetwithusOverview() {
  const quality = useModelQuality();
  const [palette, setPalette] = useState<P>(pal);
  useEffect(() => {
    const up = () => setPalette(pal());
    window.addEventListener(THEME_EVENT, up);
    return () => window.removeEventListener(THEME_EVENT, up);
  }, []);

  const tubeSegs = quality === "high" ? 32 : quality === "medium" ? 24 : 16;

  const mats    = useRef<TM[]>([]);
  const bmats   = useRef<MeshBasicMaterial[]>([]);
  const texs    = useRef<CanvasTexture[]>([]);
  const redraws = useRef<Array<() => void>>([]);

  // Animated targets
  const rootRef      = useRef<Group>(null);
  const tileRef      = useRef<Mesh>(null);
  const gGroupRef    = useRef<Group>(null);
  const sqGroupRef   = useRef<Group>(null);
  const sqMatRef     = useRef<MeshStandardMaterial | null>(null);
  const cardRefs     = useRef<Array<Group | null>>(Array(4).fill(null));
  const cardAccMats  = useRef<Array<MeshStandardMaterial | null>>(Array(4).fill(null));
  const ctaGroupRef  = useRef<Group>(null);
  const ctaMatRef    = useRef<MeshStandardMaterial | null>(null);
  const fillRef      = useRef<Mesh>(null);
  const dotMatRefs   = useRef<Array<MeshStandardMaterial | null>>(Array(4).fill(null));
  const layerRefs    = useRef<Array<Group | null>>(Array(10).fill(null));
  const layerData    = useRef<Array<{ y: number; za: number; ze: number; i: number }>>([]);
  const pulseRefs    = useRef<Array<Mesh | null>>(Array(5).fill(null));
  const plRef        = useRef<PointLight>(null);
  const shadowRef    = useRef<DirectionalLight>(null);
  const pointer      = useRef({ x: 0, y: 0 });
  const runStart     = useRef(0);
  const onReadyFired = useRef(false);

  // Build scene
  const scene = useMemo(() => {
    const c = palette;
    // tracking arrays built fresh each time palette/quality changes
    const newMats:    TM[]                        = [];
    const newBmats:   MeshBasicMaterial[]         = [];
    const newTexs:    CanvasTexture[]              = [];
    const newRedraws: Array<() => void>            = [];
    const newLayerData: Array<{ y: number; za: number; ze: number; i: number }> = [];

    const mk = (k: keyof P, e = 0, op = 1) => { const m = mkm(c, k, e, op); newMats.push(m); return m; };
    const lbl = (text: string, w: number, h: number, k: keyof P, align: CanvasTextAlign) => {
      const r = simpleLabel(text, w, h, c, k, align);
      newTexs.push(r.tex); newBmats.push(r.mat);
      let _latest = c;
      newRedraws.push(() => { r.setC(_latest); r.redraw(); });
      return { r, setLatest: (p: P) => { _latest = p; } };
    };

    // Helper to register a layer
    const regLayer = (y: number, za: number, ze: number, i: number) => {
      newLayerData.push({ y, za, ze, i });
    };

    // Layer registrations (order must match JSX layerRefs indices 0-9)
    regLayer(0,     0.1,  0.1,  0); // 0 hubT
    regLayer(0,     0.13, 0.6,  1); // 1 gg
    regLayer(0,     0.16, 0.9,  2); // 2 sqg
    regLayer(-1.2,  0.1,  0.5,  3); // 3 wmg
    for (const { cy, ze, i } of CARD_DATA) regLayer(cy, 0.1, ze, i);
    regLayer(1.75,  0.1,  0.7,  8); // 8 cg
    regLayer(-1.85, 0.1,  0.4,  9); // 9 tk

    const backMat  = mk("tint", 0, 0.5);
    const tileMat  = mk("navy");
    const gMat     = mk("white");
    const sqMat    = mk("teal", 0.2);
    const trackMat = mk("tint");
    const fillMat  = mk("teal", 0.3);
    const tubeMat  = mk("soft");
    const pulseMat = mk("teal", 0.9);
    const ctaMat   = mk("tint", 0.2);

    // Wordmark canvas
    let _wmLatest = c;
    const wmCanvas  = document.createElement("canvas");
    wmCanvas.width  = 1300; wmCanvas.height = 250;
    const wmCtx = wmCanvas.getContext("2d")!;
    const wmTex = new CanvasTexture(wmCanvas);
    const wmRedraw = () => {
      wmCtx.clearRect(0, 0, wmCanvas.width, wmCanvas.height);
      wmCtx.font = `800 ${wmCanvas.height * 0.72}px system-ui,sans-serif`;
      wmCtx.textBaseline = "middle";
      const parts: [string, string][] = [["Get", _wmLatest.wm], ["with", _wmLatest.teal], ["Us", _wmLatest.wm]];
      const total = parts.reduce((s, [t]) => s + wmCtx.measureText(t).width, 0);
      let x = (wmCanvas.width - total) / 2;
      for (const [t, col] of parts) { wmCtx.fillStyle = col; wmCtx.fillText(t, x, wmCanvas.height / 2); x += wmCtx.measureText(t).width; }
      wmTex.needsUpdate = true;
    };
    wmRedraw();
    newTexs.push(wmTex);
    const wmMat = new MeshBasicMaterial({ map: wmTex, transparent: true });
    newBmats.push(wmMat);
    newRedraws.push(() => { _wmLatest = palette; wmRedraw(); });
    const wmGeo = new PlaneGeometry(2.6, 0.5);

    // CTA label
    const ctaR = lbl("Start a project", 1.7, 0.26, "white", "center");

    // Card-specific materials and labels
    const cards = CARD_DATA.map(({ name }, i) => {
      const surfMat  = mk("surf");
      const nameR    = lbl(name, 1.2, 0.24, "ink", "left");
      let accMat: TM;
      if (i === 0)      { accMat = mk("tint"); }
      else if (i === 1) { accMat = mk("ink");  }
      else if (i === 2) { accMat = mk("soft"); }
      else              { accMat = mk("tint"); }
      const extra1 = mk("soft"); const extra2 = mk("soft"); const extra3 = mk("soft");
      return { surfMat, nameR, accMat, extra1, extra2, extra3 };
    });

    // Dot number labels
    const dotLbls = DOT_XS.map((_, j) => lbl(String(j + 1), 0.3, 0.3, "white", "center"));
    const dotMatsArr = DOT_XS.map(() => mk("soft"));

    // Curves + tube geometries
    const curves: CubicBezierCurve3[] = [];
    const tubeGeos: TubeGeometry[] = [];
    const sphGeos:  SphereGeometry[] = [];

    for (const { cx, cy } of CARD_DATA) {
      const s  = Math.sign(cx);
      const a  = new Vector3(s * 0.8, cy * 0.25, -0.1);
      const b  = new Vector3(cx - s * 0.75, cy, -0.1);
      const cu = new CubicBezierCurve3(a, a.clone().add(new Vector3(s * 0.5, 0, 0)), b.clone().add(new Vector3(-s * 0.5, 0, 0)), b);
      curves.push(cu);
      tubeGeos.push(new TubeGeometry(cu, tubeSegs, 0.03, 8, false));
      sphGeos.push(new SphereGeometry(0.075, 16, 12));
    }
    const ctaA  = new Vector3(0, 0.8, -0.1);
    const ctaB  = new Vector3(0, 1.5, -0.1);
    const ctaCu = new CubicBezierCurve3(ctaA, ctaA.clone().add(new Vector3(0, 0.3, 0)), ctaB.clone().add(new Vector3(0, -0.3, 0)), ctaB);
    curves.push(ctaCu);
    tubeGeos.push(new TubeGeometry(ctaCu, tubeSegs, 0.03, 8, false));
    sphGeos.push(new SphereGeometry(0.075, 16, 12));

    return {
      backMat, tileMat, gMat, sqMat, trackMat, fillMat, tubeMat, pulseMat, ctaMat,
      wmGeo, wmMat, ctaR, cards, dotLbls, dotMatsArr,
      curves, tubeGeos, sphGeos,
      // tracking arrays returned so effects can use them
      newMats, newBmats, newTexs, newRedraws, newLayerData,
    };
  }, [palette, tubeSegs]);

  // Sync tracking refs when scene changes (safe  - in effect, not render)
  useEffect(() => {
    mats.current    = scene.newMats;
    bmats.current   = scene.newBmats;
    texs.current    = scene.newTexs;
    redraws.current = scene.newRedraws;
    layerData.current = scene.newLayerData;
  }, [scene]);

  // Dispose on scene rebuild / unmount
  useEffect(() => () => {
    for (const m of scene.newMats) m.dispose();
    for (const m of scene.newBmats) m.dispose();
    for (const t of scene.newTexs) t.dispose();
    for (const g of scene.tubeGeos) g.dispose();
    for (const g of scene.sphGeos) g.dispose();
    scene.wmGeo.dispose();
  }, [scene]);

  // Recolour after palette change
  useEffect(() => {
    const c = palette;
    for (const m of mats.current) { m.color.set(c[m._k]); if (m.emissive) m.emissive.set(c.teal); }
    if (plRef.current) plRef.current.color.set(c.teal);
    for (const r of redraws.current) r();
  }, [palette]);

  // Shadow light
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

    // Delay run start by 1.2 s after first frame
    if (!onReadyFired.current) {
      onReadyFired.current = true;
      runStart.current = performance.now() / 1000 + 1.2;
    }

    const wall = performance.now() / 1000;
    let t: number;
    if (isStill) { t = 99; }
    else { t = wall - runStart.current; if (t > LOOP) { runStart.current = wall; t = 0; } }

    const k = isStill ? 0.3 : 0.5;

    // Layer z + bob
    layerData.current.forEach(({ y, za, ze, i }, idx) => {
      const g = layerRefs.current[idx]; if (!g) return;
      g.position.z = za + (ze - za) * k;
      g.position.y = y + (isStill ? 0 : Math.sin(nowMs / 900 + i * 0.9) * 0.025 * k);
    });

    // Hub tile / G / square pop
    const tile = tileRef.current;
    if (tile) tile.scale.setScalar(Math.max(0.001, popV(t - 0.3, 0.4)));
    const gg = gGroupRef.current;
    if (gg) gg.scale.setScalar(Math.max(0.001, popV(t - 0.5, 0.4)));
    const sq = sqGroupRef.current;
    if (sq) sq.scale.setScalar(Math.max(0.001, popV(t - 0.7, 0.4)));
    const sqM = sqMatRef.current;
    if (sqM) {
      const gd = t - 0.7;
      sqM.emissiveIntensity = gd >= 0 && gd <= 0.8 ? 0.2 + 0.6 * (1 - gd / 0.8) : 0.2;
    }

    // Service cards
    for (let i = 0; i < 4; i++) {
      const d = t - (SEG[i] + PDUR), on = d >= 0;
      const cg = cardRefs.current[i];
      if (cg) cg.scale.setScalar(on && d <= 0.45 ? 1 + 0.1 * (1 - d / 0.45) : 1);
      const am = cardAccMats.current[i];
      if (am) am.color.set(on ? palette.teal : (i === 1 ? palette.ink : palette.soft));
    }

    // Pulses
    for (let j = 0; j < 5; j++) {
      const pm = pulseRefs.current[j]; if (!pm) continue;
      const q = (t - SEG[j]) / PDUR, on = !isStill && q >= 0 && q <= 1;
      pm.visible = on;
      if (on) pm.position.copy(scene.curves[j].getPoint(sm(q)));
    }

    // CTA chip
    const cd = t - (SEG[4] + PDUR), con = cd >= 0;
    const ctaG = ctaGroupRef.current;
    if (ctaG) ctaG.scale.setScalar(con && cd <= 0.45 ? 1 + 0.1 * (1 - cd / 0.45) : 1);
    const ctaM = ctaMatRef.current;
    if (ctaM) {
      ctaM.color.set(con ? palette.teal : palette.tint);
      ctaM.emissiveIntensity = con && cd <= 0.8 ? 0.2 + 0.6 * (1 - cd / 0.8) : 0.2;
    }

    // Track fill
    const f = fillRef.current;
    if (f) f.scale.x = Math.max(0.001, Math.min(1, (t - 2.9) / 1.7));

    // Dots
    for (let j = 0; j < 4; j++) {
      const dm = dotMatRefs.current[j]; if (!dm) continue;
      const d = t - DOT_TIMES[j], on = d >= 0;
      dm.color.set(on ? palette.teal : palette.soft);
    }

    // Root tilt
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

        {/* Hub: tile (layer 0) */}
        <group ref={(g) => { layerRefs.current[0] = g; }} position={[0, 0, 0.1]}>
          <mesh
            ref={tileRef}
            geometry={rg(1.7, 1.7, 0.4, 0.14)}
            material={scene.tileMat}
            scale={[0.001, 0.001, 0.001]}
            castShadow receiveShadow
          />
        </group>

        {/* Hub: G annular sector (layer 1) */}
        <group ref={(g) => { layerRefs.current[1] = g; gGroupRef.current = g; }} position={[0, 0, 0.13]} scale={[0.001, 0.001, 0.001]}>
          <mesh geometry={G_GEO} material={scene.gMat} castShadow receiveShadow />
        </group>

        {/* Hub: teal square (layer 2) */}
        <group ref={(g) => { layerRefs.current[2] = g; sqGroupRef.current = g; }} position={[0, 0, 0.16]} scale={[0.001, 0.001, 0.001]}>
          <mesh
            ref={(m) => { if (m) sqMatRef.current = m.material as MeshStandardMaterial; }}
            geometry={rg(0.36, 0.36, 0.1, 0.07)}
            material={scene.sqMat}
            position={[0.21, -0.178, 0]}
            castShadow
          />
        </group>

        {/* Wordmark (layer 3) */}
        <group ref={(g) => { layerRefs.current[3] = g; }} position={[0, -1.2, 0.1]}>
          <mesh geometry={scene.wmGeo} material={scene.wmMat} />
        </group>

        {/* Service cards (layers 4-7) */}
        {CARD_DATA.map(({ name, cx, cy }, i) => {
          const st = scene.cards[i];
          return (
            <group
              key={name}
              ref={(g) => { layerRefs.current[4 + i] = g; cardRefs.current[i] = g; }}
              position={[cx, cy, 0.1]}
            >
              <mesh geometry={rg(1.5, 1.1, 0.18, 0.1)} material={st.surfMat} castShadow receiveShadow />
              <mesh geometry={scene.cards[i].nameR.r.geo} material={scene.cards[i].nameR.r.mat} position={[0, 0.3, 0.075]} />
              {/* Per-card icon shapes */}
              {i === 0 && ( // Web: tint bar + soft accent
                <>
                  <mesh geometry={rg(1.1, 0.36, 0.08, 0.04)} material={st.extra1} position={[0, -0.12, 0.07]} />
                  <mesh
                    ref={(m) => { if (m) cardAccMats.current[i] = m.material as MeshStandardMaterial; }}
                    geometry={rg(0.4, 0.1, 0.04, 0.03)} material={st.accMat}
                    position={[-0.3, -0.12, 0.1]}
                  />
                </>
              )}
              {i === 1 && ( // Apps: phone body (ink) + bars
                <>
                  <mesh
                    ref={(m) => { if (m) cardAccMats.current[i] = m.material as MeshStandardMaterial; }}
                    geometry={rg(0.36, 0.66, 0.1, 0.05)} material={st.accMat}
                    position={[-0.35, -0.15, 0.07]}
                  />
                  <mesh geometry={rg(0.22, 0.07, 0.03, 0.03)} material={st.extra1} position={[-0.35, -0.02, 0.1]} />
                  <mesh geometry={rg(0.55, 0.07, 0.03, 0.03)} material={st.extra2} position={[0.2, -0.05, 0.07]} />
                  <mesh geometry={rg(0.4, 0.06, 0.03, 0.03)} material={st.extra3} position={[0.13, -0.22, 0.07]} />
                </>
              )}
              {i === 2 && ( // Automation: three circles
                <>
                  {[-0.45, 0, 0.45].map((dx, j) => (
                    <mesh
                      key={j}
                      ref={j === 0 ? (m) => { if (m) cardAccMats.current[i] = m.material as MeshStandardMaterial; } : undefined}
                      geometry={rg(0.24, 0.24, 0.07, 0.04)} material={j === 0 ? st.accMat : (j === 1 ? st.extra1 : st.extra2)}
                      position={[dx, -0.15, 0.07]}
                    />
                  ))}
                  <mesh geometry={rg(0.2, 0.04, 0.02, 0.03)} material={st.extra3} position={[-0.225, -0.15, 0.07]} />
                  <mesh geometry={rg(0.2, 0.04, 0.02, 0.03)} material={st.extra3} position={[0.225, -0.15, 0.07]} />
                </>
              )}
              {i === 3 && ( // Marketing: 4 chart bars
                <>
                  {([0.2, 0.32, 0.44, 0.6] as const).map((h, j) => (
                    <mesh
                      key={j}
                      ref={j === 3 ? (m) => { if (m) cardAccMats.current[i] = m.material as MeshStandardMaterial; } : undefined}
                      geometry={rg(0.17, h, 0.05, 0.04)}
                      material={j === 3 ? st.accMat : st.extra1}
                      position={[-0.4 + 0.27 * j, -0.45 + h / 2, 0.07]}
                    />
                  ))}
                </>
              )}
            </group>
          );
        })}

        {/* CTA chip (layer 8) */}
        <group ref={(g) => { layerRefs.current[8] = g; ctaGroupRef.current = g; }} position={[0, 1.75, 0.1]}>
          <mesh
            ref={(m) => { if (m) ctaMatRef.current = m.material as MeshStandardMaterial; }}
            geometry={rg(2.0, 0.44, 0.22, 0.1)} material={scene.ctaMat}
            castShadow receiveShadow
          />
          <mesh geometry={scene.ctaR.r.geo} material={scene.ctaR.r.mat} position={[0, 0, 0.075]} />
        </group>

        {/* Process track (layer 9) */}
        <group ref={(g) => { layerRefs.current[9] = g; }} position={[0, -1.85, 0.1]}>
          <mesh geometry={TRACK_GEO} material={scene.trackMat} castShadow receiveShadow />
          <mesh ref={fillRef} geometry={FILL_GEO} material={scene.fillMat} position={[-2.3, 0, 0.03]} scale={[0.001, 1, 1]} />
          {DOT_XS.map((x, j) => (
            <group key={j}>
              <mesh
                ref={(m) => { if (m) dotMatRefs.current[j] = m.material as MeshStandardMaterial; }}
                geometry={rg(0.3, 0.3, 0.15, 0.05)} material={scene.dotMatsArr[j]}
                position={[x, 0, 0.06]}
              />
              <mesh geometry={scene.dotLbls[j].r.geo} material={scene.dotLbls[j].r.mat} position={[x, 0, 0.09]} />
            </group>
          ))}
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
