"use client";

/**
 * ContactMessage  - /contact page model.
 *
 * Form card whose three fields fill as if typed, a Send button that presses
 * and glows, a paper plane flying along a bezier curve to an inbox card, a
 * new inbox row that pops, then a reply card that pops. Loop: 8 s.
 *
 * Ported from docs/prototype/Contact 3D prototype.html (three.js r128).
 * Camera: fov 30, z 10.5 (set in MODEL_VIEWS).
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
  Vector3,
} from "three";
import { THEME_EVENT } from "@/lib/theme";
import { useModelFrame, useModelQuality } from "@/components/three/models/context";
import { rg } from "@/components/three/models/shared/geo";

// ---------------------------------------------------------------------------
// Palette
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

function sm(x: number) { return x * x * (3 - 2 * x); }
function pop(d: number, T: number) { const x = Math.min(1, d / T); return d >= 0 ? sm(x) + 0.12 * Math.sin(Math.PI * x) : 0; }

type TM = MeshStandardMaterial & { _k: keyof P };
function mkm(c: P, k: keyof P, e = 0, op = 1): TM {
  const m = new MeshStandardMaterial({
    color: new Color(c[k]), roughness: 0.5, metalness: 0,
    transparent: op < 1, opacity: op,
    ...(e > 0 && { emissive: new Color(c.teal), emissiveIntensity: e }),
  }) as TM;
  m._k = k; return m;
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
  return { tex, geo: new PlaneGeometry(w, h), mat: new MeshBasicMaterial({ map: tex, transparent: true }), redraw, setC };
}

// Scene constants (from prototype)
const BACK_GEO = rg(6.8, 4.2, 0.3, 0.06);
// Typing bars: [width, y, animStart, animEnd]
const TBARS = [[1.0, 0.8, 0.3, 1.0], [1.3, 0.15, 1.1, 1.9], [1.6, -0.35, 2.0, 2.8], [1.0, -0.6, 2.8, 3.3]] as const;
// Bezier curve for paper plane
const FC = new CubicBezierCurve3(
  new Vector3(-2.2, -1.5, 1.3),
  new Vector3(-1, 1.8, 1.7),
  new Vector3(0.8, 2, 1.7),
  new Vector3(1.9, 0.55, 1.3),
);

// Paper plane geometry (from prototype shape)
function mkPlaneGeo(): ExtrudeGeometry {
  const ps = new Shape();
  ps.moveTo(0.3, 0); ps.lineTo(-0.22, 0.16); ps.lineTo(-0.1, 0); ps.lineTo(-0.22, -0.16);
  ps.closePath();
  return new ExtrudeGeometry(ps, { depth: 0.05, bevelEnabled: false });
}

const BTN_T    = 3.5;
const PLANE_S  = 3.7; const PLANE_D = 1.2;
const ROW_T    = 4.9;
const REPLY_T  = 5.6;
const LOOP     = 8;

// Za/Ze for each layer group
const LAYERS = [
  { x: -1.9, y: -0.1, za: 0.1, ze: 0.5, i: 0 }, // form card
  { x:  1.8, y:  0.5, za: 0.1, ze: 0.9, i: 1 }, // inbox card
  { x:  1.8, y: -1.3, za: 0.1, ze: 0.6, i: 2 }, // reply card
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ContactMessage() {
  const quality = useModelQuality();
  const [palette, setPalette] = useState<P>(pal);
  useEffect(() => {
    const up = () => setPalette(pal());
    window.addEventListener(THEME_EVENT, up);
    return () => window.removeEventListener(THEME_EVENT, up);
  }, []);

  const mats    = useRef<TM[]>([]);
  const bmats   = useRef<MeshBasicMaterial[]>([]);
  const texs    = useRef<CanvasTexture[]>([]);
  const redraws = useRef<Array<() => void>>([]);

  const rootRef    = useRef<Group>(null);
  const layerRefs  = useRef<Array<Group | null>>(Array(3).fill(null));
  const tbarRefs   = useRef<Array<Mesh | null>>(Array(4).fill(null));
  const btnRef     = useRef<Mesh>(null);
  const btnMatRef  = useRef<MeshStandardMaterial | null>(null);
  const planeRef   = useRef<Mesh>(null);
  const rowRef     = useRef<Group>(null);
  const replyRef   = useRef<Group>(null);
  const plRef      = useRef<PointLight>(null);
  const shadowRef  = useRef<DirectionalLight>(null);
  const pointer    = useRef({ x: 0, y: 0 });
  const runStart   = useRef(0);

  const scene = useMemo(() => {
    const c = palette;
    const newMats:    TM[]                  = [];
    const newBmats:   MeshBasicMaterial[]   = [];
    const newTexs:    CanvasTexture[]       = [];
    const newRedraws: Array<() => void>     = [];

    const mk = (k: keyof P, e = 0, op = 1) => { const m = mkm(c, k, e, op); newMats.push(m); return m; };
    const lbl = (text: string, w: number, h: number, k: keyof P, align: CanvasTextAlign) => {
      const r = mkLabel(text, w, h, c, k, align);
      newTexs.push(r.tex); newBmats.push(r.mat);
      let _latest = c;
      newRedraws.push(() => { r.setC(_latest); r.redraw(); });
      return { ...r, setLatest: (p: P) => { _latest = p; } };
    };

    const backMat  = mk("tint", 0, 0.5);
    // Form card
    const fmSurf   = mk("surf");
    const titleLbl = lbl("Start a project", 2.0, 0.3, "ink", "left");
    const fld1     = mk("soft"); const fld2 = mk("soft"); const fld3 = mk("soft");
    const tbarMats = TBARS.map(() => mk("ink"));
    const btnMat   = mk("teal", 0.2);
    const btnLbl   = lbl("Send", 1.0, 0.24, "white", "center");
    // Paper plane
    const planeMat = mk("teal", 0.4);
    const planeGeo = mkPlaneGeo();
    // Inbox card
    const ibSurf   = mk("surf");
    const inboxLbl = lbl("Inbox", 1.0, 0.26, "ink", "left");
    const ibAvMat  = mk("soft"); const ibRow1 = mk("soft"); const ibRow2 = mk("soft");
    const rbAvMat  = mk("teal", 0.3); const rbRow1 = mk("ink"); const rbRow2 = mk("soft");
    // Reply card
    const rpSurf    = mk("surf");
    const rpIconMat = mk("teal", 0.2);
    const checkLbl  = lbl("✓", 0.5, 0.5, "white", "center");
    const replyLbl  = lbl("Reply on the way", 1.5, 0.26, "ink", "left");
    const rpLine    = mk("soft");

    return { backMat, fmSurf, titleLbl, fld1, fld2, fld3, tbarMats, btnMat, btnLbl,
             planeMat, planeGeo,
             ibSurf, inboxLbl, ibAvMat, ibRow1, ibRow2, rbAvMat, rbRow1, rbRow2,
             rpSurf, rpIconMat, checkLbl, replyLbl, rpLine,
             newMats, newBmats, newTexs, newRedraws };
  }, [palette]);

  // Sync tracking refs (safe  - in effect, not render)
  useEffect(() => {
    mats.current    = scene.newMats;
    bmats.current   = scene.newBmats;
    texs.current    = scene.newTexs;
    redraws.current = scene.newRedraws;
  }, [scene]);

  useEffect(() => () => {
    for (const m of scene.newMats) m.dispose();
    for (const m of scene.newBmats) m.dispose();
    for (const t of scene.newTexs) t.dispose();
    scene.planeGeo.dispose();
  }, [scene]);

  useEffect(() => {
    const c = palette;
    for (const m of scene.newMats) { m.color.set(c[m._k]); if (m.emissive) m.emissive.set(c.teal); }
    if (plRef.current) plRef.current.color.set(c.teal);
    for (const r of scene.newRedraws) r();
  }, [palette, scene]);

  useEffect(() => {
    const l = shadowRef.current; if (!l) return;
    const sc = l.shadow.camera;
    sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.near = 1; sc.far = 25;
    sc.updateProjectionMatrix();
    l.shadow.bias = -0.0006; l.shadow.normalBias = 0.02; l.shadow.radius = 4;
    l.shadow.mapSize.set(quality === "high" ? 1024 : 512, quality === "high" ? 1024 : 512);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    for (let i = 0; i < 3; i++) {
      const g = layerRefs.current[i]; if (!g) continue;
      const L = LAYERS[i];
      g.position.z = L.za + (L.ze - L.za) * k;
      g.position.y = L.y + (isStill ? 0 : Math.sin(nowMs / 900 + L.i * 0.9) * 0.025 * k);
    }

    // Typing bars
    for (let j = 0; j < 4; j++) {
      const tb = tbarRefs.current[j]; if (!tb) continue;
      const [w, , a, b] = TBARS[j];
      const prog = isStill ? 1 : Math.max(0.001, Math.min(1, (t - a) / (b - a)));
      tb.scale.x = prog * (w / w); // scale relative to full width  - keep as plain progress
      void w;
    }

    // Button
    const btn = btnRef.current;
    if (btn) {
      const cd = t - BTN_T;
      btn.scale.setScalar(cd >= 0 && cd < 0.25 ? 1 - 0.08 * Math.sin(Math.PI * cd / 0.25) : 1);
    }
    const btnM = btnMatRef.current;
    if (btnM) {
      const cd = t - BTN_T;
      btnM.emissiveIntensity = cd >= 0 && cd <= 0.9 ? 0.2 + 0.6 * (1 - cd / 0.9) : 0.2;
    }

    // Paper plane
    const pl = planeRef.current;
    if (pl) {
      const fu = (t - PLANE_S) / PLANE_D;
      pl.visible = !isStill && fu >= 0 && fu <= 1;
      if (pl.visible) {
        const u = sm(fu);
        const tg = FC.getTangent(u);
        pl.position.copy(FC.getPoint(u));
        pl.rotation.z = Math.atan2(tg.y, tg.x);
      }
    }

    // Inbox row + reply card
    const rw = rowRef.current; if (rw) rw.scale.setScalar(Math.max(0.001, pop(t - ROW_T, 0.4)));
    const rp = replyRef.current; if (rp) rp.scale.setScalar(Math.max(0.001, pop(t - REPLY_T, 0.4)));

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
        <mesh geometry={BACK_GEO} material={scene.backMat} position={[0, -0.05, -0.5]} receiveShadow />

        {/* Form card */}
        <group ref={(g) => { layerRefs.current[0] = g; }} position={[-1.9, -0.1, 0.1]}>
          <mesh geometry={rg(2.7, 3.5, 0.2, 0.12)} material={scene.fmSurf} castShadow receiveShadow />
          <mesh geometry={scene.titleLbl.geo} material={scene.titleLbl.mat} position={[0, 1.4, 0.09]} />
          {/* Field outlines */}
          <mesh geometry={rg(2.2, 0.5, 0.14, 0.04)} material={scene.fld1} position={[0, 0.8, 0.07]} />
          <mesh geometry={rg(2.2, 0.5, 0.14, 0.04)} material={scene.fld2} position={[0, 0.15, 0.07]} />
          <mesh geometry={rg(2.2, 0.9, 0.14, 0.04)} material={scene.fld3} position={[0, -0.55, 0.07]} />
          {/* Typing bars (pivot at left so scale.x grows from left) */}
          {TBARS.map(([w, y], j) => (
            <mesh
              key={j}
              ref={(m) => { tbarRefs.current[j] = m; }}
              geometry={(() => { const g = rg(w, 0.08, 0.03, 0.03); g.translate(w / 2, 0, 0); return g; })()}
              material={scene.tbarMats[j]}
              position={[-0.9, y, 0.1]}
              scale={[0.001, 1, 1]}
            />
          ))}
          {/* Send button */}
          <mesh
            ref={(m) => { (btnRef as React.MutableRefObject<Mesh | null>).current = m; if (m) btnMatRef.current = m.material as MeshStandardMaterial; }}
            geometry={rg(1.3, 0.38, 0.19, 0.07)} material={scene.btnMat}
            position={[-0.45, -1.4, 0.08]} castShadow
          />
          <mesh geometry={scene.btnLbl.geo} material={scene.btnLbl.mat} position={[-0.45, -1.4, 0.115]} />
        </group>

        {/* Paper plane */}
        <mesh ref={planeRef} geometry={scene.planeGeo} material={scene.planeMat} visible={false} castShadow />

        {/* Inbox card */}
        <group ref={(g) => { layerRefs.current[1] = g; }} position={[1.8, 0.5, 0.1]}>
          <mesh geometry={rg(2.4, 1.5, 0.18, 0.1)} material={scene.ibSurf} castShadow receiveShadow />
          <mesh geometry={scene.inboxLbl.geo} material={scene.inboxLbl.mat} position={[-0.3, 0.52, 0.075]} />
          {/* Static row */}
          <mesh geometry={rg(0.2, 0.2, 0.1, 0.04)} material={scene.ibAvMat} position={[-0.85, 0.1, 0.07]} />
          <mesh geometry={rg(1.1, 0.07, 0.03, 0.03)} material={scene.ibRow1} position={[0.15, 0.16, 0.07]} />
          <mesh geometry={rg(0.8, 0.06, 0.03, 0.03)} material={scene.ibRow2} position={[0, 0, 0.07]} />
          {/* New row (pops in) */}
          <group ref={rowRef} position={[0, -0.4, 0]} scale={[0.001, 0.001, 0.001]}>
            <mesh geometry={rg(0.2, 0.2, 0.1, 0.04)} material={scene.rbAvMat} position={[-0.85, 0, 0.07]} />
            <mesh geometry={rg(1.1, 0.07, 0.03, 0.03)} material={scene.rbRow1} position={[0.15, 0.06, 0.07]} />
            <mesh geometry={rg(0.8, 0.06, 0.03, 0.03)} material={scene.rbRow2} position={[0, -0.1, 0.07]} />
          </group>
        </group>

        {/* Reply card */}
        <group ref={(g) => { layerRefs.current[2] = g; replyRef.current = g; }} position={[1.8, -1.3, 0.1]} scale={[0.001, 0.001, 0.001]}>
          <mesh geometry={rg(2.4, 0.9, 0.18, 0.1)} material={scene.rpSurf} castShadow receiveShadow />
          <mesh geometry={rg(0.5, 0.5, 0.25, 0.05)} material={scene.rpIconMat} position={[-0.85, 0, 0.07]} castShadow />
          <mesh geometry={scene.checkLbl.geo} material={scene.checkLbl.mat} position={[-0.85, 0, 0.1]} />
          <mesh geometry={scene.replyLbl.geo} material={scene.replyLbl.mat} position={[0.2, 0.12, 0.075]} />
          <mesh geometry={rg(1.0, 0.06, 0.03, 0.03)} material={scene.rpLine} position={[-0.05, -0.12, 0.07]} />
        </group>
      </group>
    </>
  );
}
