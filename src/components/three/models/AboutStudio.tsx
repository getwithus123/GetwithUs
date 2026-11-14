"use client";

/**
 * AboutStudio  - /about page model.
 *
 * Studio card (logo tile, name, 3 team avatars that pop in, "Say hello"
 * button that glows), a values card (3 rows that tick one by one), an "Our
 * story" timeline (line fills, dots turn teal), and a "Hi!" bubble that pops.
 *
 * Ported from docs/prototype/About 3D prototype.html (three.js r128).
 * Camera: fov 30, z 10.5 (set in MODEL_VIEWS). Loop: 7.5 s.
 *
 * Palette note: same as ProcessSteps  - ink is #0f1b2d in both themes.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CanvasTexture,
  Color,
  type DirectionalLight,
  type Group,
  type Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  type PointLight,
} from "three";
import { THEME_EVENT } from "@/lib/theme";
import { useModelFrame, useModelQuality } from "@/components/three/models/context";
import { rg } from "@/components/three/models/shared/geo";

// ---------------------------------------------------------------------------
// Palette (local  - ink #0f1b2d both themes)
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
  const geo = new PlaneGeometry(w, h);
  const mat = new MeshBasicMaterial({ map: tex, transparent: true });
  return { tex, geo, mat, redraw, setC };
}

// Scene constants (from prototype)
const BACK_GEO = rg(6.8, 4.2, 0.3, 0.06);
const AV_COLS  = ["teal", "tint", "soft"] as const;
const ROW_TXTS = ["Clear scope", "Fast delivery", "Honest talk"] as const;
const DOT_XS   = [-0.75, 0, 0.75] as const;
const AV_ARR   = [0.3, 0.6, 0.9] as const;   // avatar pop arrivals
const ROW_ARR  = [1.5, 2.0, 2.5] as const;   // row tick arrivals
const TL_START = 2.9; const TL_DUR = 1.4;    // timeline fill
const DOT_ARR  = [3.0, 3.6, 4.2] as const;   // dot turn-teal arrivals
const BUBBLE_T = 4.9;                          // bubble pop
const BTN_T    = 5.2;                          // button glow
const LOOP     = 7.5;

// Za/Ze for each layer group (matches prototype `lay` calls)
const LAYERS = [
  { x: -1.85, y: -0.2,  za: 0.1, ze: 0.5, i: 0 }, // studio card
  { x:  1.75, y:  0.95, za: 0.1, ze: 0.9, i: 1 }, // values card
  { x:  1.75, y: -1.2,  za: 0.1, ze: 0.6, i: 2 }, // timeline card
  { x: -0.3,  y:  1.7,  za: 0.3, ze: 1.2, i: 3 }, // bubble
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AboutStudio() {
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

  const rootRef     = useRef<Group>(null);
  const layerRefs   = useRef<Array<Group | null>>(Array(4).fill(null));
  const avRefs      = useRef<Array<Group | null>>(Array(3).fill(null));
  const rowSqMats   = useRef<Array<MeshStandardMaterial | null>>(Array(3).fill(null));
  const rowCkRefs   = useRef<Array<Group | null>>(Array(3).fill(null));
  const fillRef     = useRef<Mesh>(null);
  const dotMatRefs  = useRef<Array<MeshStandardMaterial | null>>(Array(3).fill(null));
  const bubbleRef   = useRef<Group>(null);
  const btnMatRef   = useRef<MeshStandardMaterial | null>(null);
  const plRef       = useRef<PointLight>(null);
  const shadowRef   = useRef<DirectionalLight>(null);
  const pointer     = useRef({ x: 0, y: 0 });
  const runStart    = useRef(0);

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

    // Studio card
    const stSurf   = mk("surf");
    const logoMat  = mk("teal", 0.15);
    const gLbl     = lbl("G", 0.62, 0.62, "white", "center");
    const nameLbl  = lbl("GetwithUs", 1.4, 0.32, "ink", "left");
    const line1    = mk("soft"); const line2 = mk("soft");
    const avMats   = AV_COLS.map((k) => mk(k as keyof P));
    const avLineMats = AV_COLS.map(() => mk("soft"));
    const btnMat   = mk("teal", 0.2);
    const btnLbl   = lbl("Say hello", 1.2, 0.26, "white", "center");

    // Values card
    const vcSurf       = mk("surf");
    const rowSqMatsArr = ROW_TXTS.map(() => mk("soft"));
    const rowTxts      = ROW_TXTS.map((t) => lbl(t, 1.6, 0.26, "ink", "left"));
    const rowCkLbls    = ROW_TXTS.map(() => lbl("✓", 0.3, 0.3, "white", "center"));

    // Timeline card
    const tlSurf    = mk("surf");
    const tlLbl     = lbl("Our story", 1.2, 0.24, "ink", "left");
    const tlTrack   = mk("tint");
    const tlFill    = mk("teal");
    const dotSubMats = DOT_XS.map(() => mk("soft"));
    const dotMatsArr = DOT_XS.map(() => mk("soft"));

    // Bubble
    const bbMat  = mk("teal", 0.25);
    const bbLbl  = lbl("Hi!", 0.6, 0.28, "white", "center");

    // Fill geo (needs translate for pivot-at-left)
    const tlFillGeo = rg(1.7, 0.05, 0.02, 0.03);
    tlFillGeo.translate(0.85, 0, 0);

    return {
      backMat, stSurf, logoMat, gLbl, nameLbl, line1, line2,
      avMats, avLineMats, btnMat, btnLbl,
      vcSurf, rowSqMatsArr, rowTxts, rowCkLbls,
      tlSurf, tlLbl, tlTrack, tlFill, tlFillGeo, dotSubMats, dotMatsArr,
      bbMat, bbLbl,
      newMats, newBmats, newTexs, newRedraws,
    };
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
    scene.tlFillGeo.dispose();
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
    for (let i = 0; i < 4; i++) {
      const g = layerRefs.current[i]; if (!g) continue;
      const L = LAYERS[i];
      g.position.z = L.za + (L.ze - L.za) * k;
      g.position.y = L.y + (isStill ? 0 : Math.sin(nowMs / 900 + L.i * 0.9) * 0.025 * k);
    }

    // Avatars
    for (let i = 0; i < 3; i++) {
      const g = avRefs.current[i]; if (!g) continue;
      const d = t - AV_ARR[i];
      g.scale.setScalar(Math.max(0.001, d >= 0 ? sm(Math.min(1, d / 0.35)) : 0));
    }

    // Values rows
    for (let j = 0; j < 3; j++) {
      const d = t - ROW_ARR[j], on = d >= 0;
      const sq = rowSqMats.current[j]; if (sq) sq.color.set(on ? palette.teal : palette.soft);
      const ck = rowCkRefs.current[j];
      if (ck) ck.scale.setScalar(Math.max(0.001, on ? sm(Math.min(1, d / 0.3)) : 0));
    }

    // Timeline fill
    const f = fillRef.current;
    if (f) f.scale.x = Math.max(0.001, Math.min(1, (t - TL_START) / TL_DUR));

    // Dots
    for (let j = 0; j < 3; j++) {
      const d = t - DOT_ARR[j], on = d >= 0;
      const dm = dotMatRefs.current[j]; if (dm) dm.color.set(on ? palette.teal : palette.soft);
    }

    // Bubble
    const bb = bubbleRef.current;
    if (bb) {
      const bd = t - BUBBLE_T, x = Math.min(1, bd / 0.4);
      bb.scale.setScalar(Math.max(0.001, bd >= 0 ? sm(x) + 0.12 * Math.sin(Math.PI * x) : 0));
    }

    // Button glow
    const btn = btnMatRef.current;
    if (btn) {
      const gd = t - BTN_T;
      btn.emissiveIntensity = gd >= 0 && gd <= 0.8 ? 0.2 + 0.5 * (1 - gd / 0.8) : 0.2;
    }

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

        {/* Studio card */}
        <group ref={(g) => { layerRefs.current[0] = g; }} position={[-1.85, -0.2, 0.1]}>
          <mesh geometry={rg(2.7, 3.3, 0.2, 0.12)} material={scene.stSurf} castShadow receiveShadow />
          <mesh geometry={rg(0.62, 0.62, 0.16, 0.05)} material={scene.logoMat} position={[-0.78, 1.2, 0.08]} castShadow />
          <mesh geometry={scene.gLbl.geo} material={scene.gLbl.mat} position={[-0.78, 1.2, 0.115]} />
          <mesh geometry={scene.nameLbl.geo} material={scene.nameLbl.mat} position={[0.42, 1.2, 0.09]} />
          <mesh geometry={rg(2.0, 0.07, 0.03, 0.03)} material={scene.line1} position={[0, 0.7, 0.07]} />
          <mesh geometry={rg(1.5, 0.07, 0.03, 0.03)} material={scene.line2} position={[-0.25, 0.52, 0.07]} />
          {/* Avatars */}
          {[0, 1, 2].map((i) => (
            <group key={i} ref={(g) => { avRefs.current[i] = g; }} position={[[-0.7, 0, 0.7][i], -0.1, 0]} scale={[0.001, 0.001, 0.001]}>
              <mesh geometry={rg(0.56, 0.56, 0.28, 0.05)} material={scene.avMats[i]} position={[0, 0, 0.08]} castShadow />
              <mesh geometry={rg(0.44, 0.07, 0.03, 0.03)} material={scene.avLineMats[i]} position={[0, -0.45, 0.07]} />
            </group>
          ))}
          {/* Button */}
          <mesh
            ref={(m) => { if (m) btnMatRef.current = m.material as MeshStandardMaterial; }}
            geometry={rg(1.4, 0.42, 0.21, 0.07)} material={scene.btnMat}
            position={[-0.45, -1.2, 0.08]} castShadow
          />
          <mesh geometry={scene.btnLbl.geo} material={scene.btnLbl.mat} position={[-0.45, -1.2, 0.115]} />
        </group>

        {/* Values card */}
        <group ref={(g) => { layerRefs.current[1] = g; }} position={[1.75, 0.95, 0.1]}>
          <mesh geometry={rg(2.4, 1.75, 0.18, 0.1)} material={scene.vcSurf} castShadow receiveShadow />
          {ROW_TXTS.map((_, j) => {
            const y = 0.5 - 0.5 * j;
            return (
              <group key={j}>
                <mesh
                  ref={(m) => { if (m) rowSqMats.current[j] = m.material as MeshStandardMaterial; }}
                  geometry={rg(0.3, 0.3, 0.09, 0.04)} material={scene.rowSqMatsArr[j]}
                  position={[-0.82, y, 0.07]}
                />
                <group ref={(g) => { rowCkRefs.current[j] = g; }} position={[-0.82, y, 0.1]} scale={[0.001, 0.001, 0.001]}>
                  <mesh geometry={scene.rowCkLbls[j].geo} material={scene.rowCkLbls[j].mat} />
                </group>
                <mesh geometry={scene.rowTxts[j].geo} material={scene.rowTxts[j].mat} position={[0.35, y, 0.075]} />
              </group>
            );
          })}
        </group>

        {/* Timeline card */}
        <group ref={(g) => { layerRefs.current[2] = g; }} position={[1.75, -1.2, 0.1]}>
          <mesh geometry={rg(2.4, 1.3, 0.18, 0.1)} material={scene.tlSurf} castShadow receiveShadow />
          <mesh geometry={scene.tlLbl.geo} material={scene.tlLbl.mat} position={[-0.25, 0.42, 0.075]} />
          <mesh geometry={rg(1.7, 0.05, 0.02, 0.03)} material={scene.tlTrack} position={[0, 0.05, 0.07]} />
          <mesh ref={fillRef} geometry={scene.tlFillGeo} material={scene.tlFill}
            position={[-0.85, 0.05, 0.085]} scale={[0.001, 1, 1]} />
          {DOT_XS.map((x, j) => (
            <group key={j}>
              <mesh geometry={rg(0.42, 0.06, 0.03, 0.03)} material={scene.dotSubMats[j]} position={[x, -0.3, 0.07]} />
              <mesh
                ref={(m) => { if (m) dotMatRefs.current[j] = m.material as MeshStandardMaterial; }}
                geometry={rg(0.2, 0.2, 0.1, 0.04)} material={scene.dotMatsArr[j]}
                position={[x, 0.05, 0.1]}
              />
            </group>
          ))}
        </group>

        {/* Chat bubble */}
        <group ref={(g) => { layerRefs.current[3] = g; bubbleRef.current = g; }} position={[-0.3, 1.7, 0.3]} scale={[0.001, 0.001, 0.001]}>
          <mesh geometry={rg(0.9, 0.46, 0.23, 0.08)} material={scene.bbMat} castShadow />
          <mesh geometry={scene.bbLbl.geo} material={scene.bbLbl.mat} position={[0, 0, 0.05]} />
        </group>
      </group>
    </>
  );
}
