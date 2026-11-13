"use client";
// GetwithUs 3D splash for Next.js (App Router).
// Setup:  npm i three   &&   npm i -D @types/three
// Use:    in app/layout.tsx, render <SplashScreen /> just inside <body>, before {children}.
// Plays once per browser session. Skipped for prefers-reduced-motion.

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const DONE = 3.7; // seconds
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const outBack = (x: number) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);
const bounce = (x: number) => {
  const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
};

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [out, setOut] = useState(false);
  const [text, setText] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fill = useRef<HTMLDivElement>(null);

  // Decide whether to show (once per session, not for reduced motion)
  useEffect(() => {
    const seen = sessionStorage.getItem("gwu-splash");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!seen && !reduce) {
      setVisible(true);
      document.body.style.overflow = "hidden";
    }
  }, []);

  useEffect(() => {
    if (!visible || !canvas.current || !wrap.current) return;
    const el = wrap.current;
    const renderer = new THREE.WebGLRenderer({ canvas: canvas.current, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0, 8);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1); key.position.set(3, 4, 6); scene.add(key);
    const rim = new THREE.PointLight(0x19a5b0, 1.2, 20); rim.position.set(-4, -2, 3); scene.add(rim);
    const glow = new THREE.PointLight(0x19c0cc, 0, 8); glow.position.set(0.4, -0.3, 1.6); scene.add(glow);

    const root = new THREE.Group(); root.position.y = 0.95; scene.add(root);
    const spin = new THREE.Group(); root.add(spin);

    // "G"
    const R = 1, ri = 0.51, a0 = Math.PI / 4;
    const gs = new THREE.Shape();
    gs.moveTo(Math.cos(a0) * R, Math.sin(a0) * R);
    gs.absarc(0, 0, R, a0, Math.PI * 2, false);
    gs.lineTo(ri, 0);
    gs.absarc(0, 0, ri, Math.PI * 2, a0, true);
    gs.closePath();
    const gGeo = new THREE.ExtrudeGeometry(gs, { depth: 0.32, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 4, curveSegments: 72 });
    gGeo.translate(0, 0, -0.16);
    const gMat = new THREE.MeshStandardMaterial({ color: 0xf6f9fc, roughness: 0.32, metalness: 0.12 });
    const gMesh = new THREE.Mesh(gGeo, gMat); spin.add(gMesh);

    // Teal square
    const h = 0.3, rr = 0.13, qs = new THREE.Shape();
    qs.moveTo(-h + rr, -h); qs.lineTo(h - rr, -h); qs.quadraticCurveTo(h, -h, h, -h + rr); qs.lineTo(h, h - rr); qs.quadraticCurveTo(h, h, h - rr, h);
    qs.lineTo(-h + rr, h); qs.quadraticCurveTo(-h, h, -h, h - rr); qs.lineTo(-h, -h + rr); qs.quadraticCurveTo(-h, -h, -h + rr, -h);
    const qGeo = new THREE.ExtrudeGeometry(qs, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 4, curveSegments: 16 });
    qGeo.translate(0, 0, -0.15);
    const qMat = new THREE.MeshStandardMaterial({ color: 0x0e7f89, roughness: 0.28, metalness: 0.1, emissive: 0x0a5a62, emissiveIntensity: 0.5 });
    const cube = new THREE.Mesh(qGeo, qMat);
    const CX = 0.35, CY = -0.3, CZ = 0.12;
    cube.position.set(CX, CY + 3.2, CZ); spin.add(cube);

    const ringMat = new THREE.MeshBasicMaterial({ color: 0x19c0cc, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const ringGeo = new THREE.RingGeometry(0.95, 1, 96);
    const ring = new THREE.Mesh(ringGeo, ringMat); ring.position.set(CX, CY, -0.3); root.add(ring);

    const N = 90, pos = new Float32Array(N * 3), seed: number[] = [];
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14; pos[i * 3 + 1] = (Math.random() - 0.5) * 9; pos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
      seed.push(Math.random() * 6.28);
    }
    const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x6fd3db, size: 0.05, transparent: true, opacity: 0.55, depthWrite: false });
    const pts = new THREE.Points(pGeo, pMat); scene.add(pts);

    const resize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight, false);
      camera.aspect = el.clientWidth / el.clientHeight; camera.updateProjectionMatrix();
    };
    resize(); window.addEventListener("resize", resize);

    let raf = 0, shown = false, ended = false;
    const t0 = performance.now();
    const loop = (now: number) => {
      const t = (now - t0) / 1000;
      const g = clamp((t - 0.15) / 1.25);
      gMesh.scale.setScalar(Math.max(0.001, outBack(g)));
      const c = clamp((t - 1.25) / 0.85);
      cube.position.y = CY + (1 - bounce(c)) * 3.2;
      cube.rotation.z = (1 - outCubic(c)) * 0.9; cube.rotation.y = (1 - outCubic(c)) * -0.6;
      const p = clamp((t - 1.75) / 0.9);
      ringMat.opacity = p > 0 && p < 1 ? 0.7 * (1 - p) : 0; ring.scale.setScalar(0.5 + outCubic(p) * 2.3);
      glow.intensity = p > 0 ? 2.2 * Math.sin(Math.PI * Math.min(1, p * 1.2)) + 0.5 * clamp((t - 2.6) / 1) : 0;
      qMat.emissiveIntensity = 0.5 + (p > 0 && p < 1 ? 1.2 * (1 - p) : 0);
      const idle = t > 2.2 ? Math.sin(t * 0.9) * 0.18 : 0;
      spin.rotation.y = (1 - outCubic(g)) * -Math.PI * 1.4 + idle;
      root.position.y = 0.95 + (t > 2.2 ? Math.sin(t * 1.3) * 0.04 : 0);
      const a = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < N; i++) { a[i * 3 + 1] += 0.004 + Math.sin(seed[i] + t) * 0.0008; if (a[i * 3 + 1] > 4.6) a[i * 3 + 1] = -4.6; }
      pGeo.attributes.position.needsUpdate = true; pts.rotation.y = t * 0.04;
      if (fill.current) fill.current.style.width = clamp((t - 0.2) / (DONE - 0.4)) * 100 + "%";
      if (!shown && t > 2.3) { shown = true; setText(true); }
      renderer.render(scene, camera);
      if (t > DONE && !ended) { ended = true; finish(); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    (el as any)._skip = () => { if (!ended) { ended = true; cancelAnimationFrame(raf); finish(); } };
    function finish() {
      sessionStorage.setItem("gwu-splash", "1");
      document.body.style.overflow = "";
      setOut(true);
      setTimeout(() => setVisible(false), 900);
    }

    return () => {
      cancelAnimationFrame(raf); window.removeEventListener("resize", resize);
      [gGeo, qGeo, ringGeo, pGeo].forEach((x) => x.dispose());
      [gMat, qMat, ringMat, pMat].forEach((x) => x.dispose());
      renderer.dispose(); document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible) return null;
  return (
    <div
      ref={wrap}
      role="status"
      aria-label="Loading GetwithUs"
      style={{
        position: "fixed", inset: 0, zIndex: 9999, opacity: out ? 0 : 1, transition: "opacity .8s ease",
        background: "radial-gradient(90% 70% at 50% 40%, #17304a 0%, #0f1a2b 55%, #0a1220 100%)",
        pointerEvents: out ? "none" : "auto",
      }}
    >
      <canvas ref={canvas} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: "63%", textAlign: "center", color: "#fff", pointerEvents: "none" }}>
        <div style={{ fontSize: "clamp(34px,6vw,60px)", fontWeight: 800, letterSpacing: "-.02em", opacity: text ? 1 : 0, transform: text ? "none" : "translateY(14px)", transition: "all .8s ease" }}>
          Get<span style={{ color: "#19a5b0" }}>with</span>Us
        </div>
        <div style={{ marginTop: 10, fontSize: "clamp(14px,2vw,18px)", color: "#a9b8cc", opacity: text ? 1 : 0, transition: "opacity .8s ease .25s" }}>
          Build with us. Grow with us.
        </div>
      </div>
      <div style={{ position: "absolute", left: "50%", bottom: "9%", width: "min(240px,50vw)", transform: "translateX(-50%)", height: 3, borderRadius: 3, background: "rgba(255,255,255,.12)", overflow: "hidden" }}>
        <div ref={fill} style={{ height: "100%", width: 0, background: "#19a5b0" }} />
      </div>
      <button
        type="button"
        onClick={() => (wrap.current as any)?._skip?.()}
        style={{ position: "absolute", right: 16, top: 14, background: "rgba(255,255,255,.1)", color: "#cfe0f0", border: 0, borderRadius: 999, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}
      >
        Skip
      </button>
    </div>
  );
}
