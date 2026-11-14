"use client";

/**
 * FlowScene  - shared R3F engine for prototype-ported "flow" models:
 *   AutomationFlow, SoftwareCloud, WhatsAppBot3D, CallingAgent3D, ServicesHub
 *
 * Each model is a data file that provides a FlowSpec; this component renders
 * and animates it without knowing which model it is.
 *
 * Animation loop (matches prototypes exactly):
 *   - t = seconds since run start, resets when t > spec.loop
 *   - node z  = za + (ze - za) * k
 *   - node y  = worldY + sin(now/900 + i*0.9) * 0.025 * k  (bob)
 *   - node scale = 1 + 0.12 * (1 - dt/0.45)  while dt = t - arrival in [0, 0.45]
 *   - pulse p = (t - win[0]) / win[1], visible while 0 <= p <= 1
 *   - pulse pos = curve.getPoint(smoothstep(p))
 *   - tilt: root.rotation.y -> baseY + mx*0.28,  root.rotation.x -> -0.1 + my*0.16
 *   - reduced motion: k = 0.3, one frame, no bob, no pulses, no pop
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CubicBezierCurve3,
  type Mesh,
  type PointLight,
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
import { buildPalette, type Palette, type PaletteKey } from "@/components/three/models/shared/palette";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One mesh within a node  - equivalent to one `rr(...)` call in the prototypes. */
export type MeshDef = {
  w: number; h: number; r: number; d: number;
  x: number; y: number; z: number;
  color: PaletteKey;
  emissive?: number;
  opacity?: number;
  rotZ?: number;
  noCast?: boolean;
};

/** A node group: positioned at (x, y) with za/ze depth and an arrival time. */
export type NodeDef = {
  x: number; y: number;
  za: number; ze: number;
  arrival: number;
  meshes: MeshDef[];
  /** Extra per-node refs collected during build (e.g. glow targets, wave bars). */
  extras?: ExtraDef[];
};

/** Curve: start point, start tangent, end point, end tangent  - all at z = -0.3. */
export type CurveDef = {
  ax: number; ay: number;
  tax: number; tay: number;
  bx: number; by: number;
  tbx: number; tby: number;
};

/** Pulse window: [startSeconds, durationSeconds] */
export type PulseWindow = [number, number];

/**
 * Optional per-frame extra animations (glow, wave bars, etc.).
 * The engine calls each with the current time t and accumulated now.
 */
export type ExtraDef = {
  type: "glow";
  triggerTime: number;
  /** Index into the extras mesh list that holds the glow target. */
  meshIndex: number;
  baseIntensity: number;
  peakIntensity: number;
};

export type FlowSpec = {
  /** Initial y rotation of the root group. */
  baseRotY: number;
  /** Loop period in seconds. */
  loop: number;
  nodes: NodeDef[];
  curves: CurveDef[];
  pulseWindows: PulseWindow[];
  glowTargets?: Array<{ nodeIndex: number; meshIndex: number; triggerTime: number; base: number; peak: number }>;
  /** Called each frame with (t, now_ms, k) for model-specific extras (bar scales, wave, etc.) */
  onFrame?: (t: number, nowMs: number, k: number) => void;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function smoothstep(x: number): number {
  return x * x * (3 - 2 * x);
}

const BACK_GLASS_GEO = rg(6.0, 3.9, 0.3, 0.06);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export type FlowSceneProps = {
  spec: FlowSpec;
  /** k = explode amount, default 0.5. */
  k?: number;
  /** Incrementing this value restarts the run. */
  runKey?: number;
};

export default function FlowScene({ spec, k: kProp = 0.5, runKey = 0 }: FlowSceneProps) {
  const quality = useModelQuality();
  const tubeSegs = quality === "high" ? 32 : quality === "medium" ? 24 : 16;
  // Live palette
  const [pal, setPal] = useState<Palette>(buildPalette);
  useEffect(() => {
    const update = () => setPal(buildPalette());
    window.addEventListener(THEME_EVENT, update);
    return () => window.removeEventListener(THEME_EVENT, update);
  }, []);

  // ---- Materials ----
  // Back glass
  const bgMat = useMemo(() => buildMat(pal, "tint", { opacity: 0.5 }), [pal]);
  useEffect(() => () => bgMat.dispose(), [bgMat]);

  // Per-node materials (flat array parallel to all MeshDefs across all nodes)
  const nodeMats = useMemo(() => {
    const mats: TrackedMat[] = [];
    for (const node of spec.nodes) {
      for (const m of node.meshes) {
        mats.push(buildMat(pal, m.color, { emissive: m.emissive, opacity: m.opacity }));
      }
    }
    return mats;
  }, [spec.nodes, pal]);
  useEffect(() => () => { for (const m of nodeMats) m.dispose(); }, [nodeMats]);

  // Tube + pulse materials (soft for tube, teal emissive for pulse)
  const tubeMat  = useMemo(() => buildMat(pal, "soft"), [pal]);
  const pulseMat = useMemo(() => {
    const m = buildMat(pal, "teal", { emissive: 0.9 });
    return m;
  }, [pal]);
  useEffect(() => () => { tubeMat.dispose(); pulseMat.dispose(); }, [tubeMat, pulseMat]);

  // Recolour on palette change
  useEffect(() => {
    recolourMats([bgMat, tubeMat, pulseMat, ...nodeMats], pal);
  }, [pal, bgMat, tubeMat, pulseMat, nodeMats]);

  // Update point light colour
  const plRef = useRef<PointLight>(null);
  useEffect(() => {
    if (plRef.current) plRef.current.color.set(pal.teal);
  }, [pal]);

  // ---- Curves + pulse spheres ----
  const { curves, pulseGeos, tubeGeos } = useMemo(() => {
    const segs = tubeSegs;
    const curves: CubicBezierCurve3[] = [];
    const tubeGeos: TubeGeometry[] = [];
    const pulseGeos: SphereGeometry[] = [];

    for (const def of spec.curves) {
      const p0 = new Vector3(def.ax, def.ay, -0.3);
      const p1 = new Vector3(def.bx, def.by, -0.3);
      const c = new CubicBezierCurve3(
        p0,
        p0.clone().add(new Vector3(def.tax, def.tay, 0)),
        p1.clone().add(new Vector3(def.tbx, def.tby, 0)),
        p1,
      );
      curves.push(c);
      tubeGeos.push(new TubeGeometry(c, segs, 0.028, 8, false));
      pulseGeos.push(new SphereGeometry(0.075, 16, 12));
    }
    return { curves, pulseGeos, tubeGeos };
  }, [spec.curves, tubeSegs]);
  useEffect(() => () => {
    for (const g of tubeGeos) g.dispose();
    for (const g of pulseGeos) g.dispose();
  }, [tubeGeos, pulseGeos]);

  // ---- Refs ----
  const root = useRef<Group>(null);
  const nodeGroupRefs = useRef<(Group | null)[]>(spec.nodes.map(() => null));
  const pulseMeshRefs = useRef<(Mesh | null)[]>(spec.curves.map(() => null));
  const pointer = useRef(new Vector2(0, 0));
  const runStart = useRef(0);
  const shadowLightRef = useRef<DirectionalLight>(null);

  // Shadow light configuration
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
    light.shadow.mapSize.set(quality === "high" ? 1024 : 512, quality === "high" ? 1024 : 512);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    runStart.current = performance.now() / 1000;
  }, [runKey]);

  // Pointer tracking
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.set(
        (e.clientX / window.innerWidth  - 0.5) * 2,
        -(e.clientY / window.innerHeight - 0.5) * 2,
      );
    };
    const onLeave = () => pointer.current.set(0, 0);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // ---- Glow targets: collect direct material references (not from useMemo return) ----
  // We need a stable ref-based array so the frame loop can mutate emissiveIntensity
  // without triggering the react-hooks/immutability rule.
  const glowData = useRef<Array<{
    getIntensity: (t: number) => number;
    setIntensity: (v: number) => void;
  }>>([]);

  useEffect(() => {
    if (!spec.glowTargets) { glowData.current = []; return; }
    let globalIdx = 0;
    const idxByNodeMesh = new Map<string, number>();
    spec.nodes.forEach((node, ni) => {
      node.meshes.forEach((_m, mi) => {
        idxByNodeMesh.set(`${ni}:${mi}`, globalIdx++);
      });
    });
    // Capture material references into closures  - the closure holds the ref,
    // the frame loop calls the setter (a closure is not a hook-derived mutation).
    glowData.current = (spec.glowTargets ?? []).flatMap((gt) => {
      const idx = idxByNodeMesh.get(`${gt.nodeIndex}:${gt.meshIndex}`) ?? -1;
      if (idx < 0 || idx >= nodeMats.length) return [];
      const m = nodeMats[idx];
      return [{
        getIntensity: (t: number) => {
          const gd = t - gt.triggerTime;
          return gt.base + (t >= 0 && gd >= 0 && gd <= 0.8 ? gt.peak * (1 - gd / 0.8) : 0);
        },
        setIntensity: (v: number) => { m.emissiveIntensity = v; },
      }];
    });
  }, [spec.glowTargets, spec.nodes, nodeMats]);

  useModelFrame((_, elapsed) => {
    const isStill = elapsed === 0;
    const now = elapsed * 1000; // ms, for sin()

    let t = -1;
    if (!isStill) {
      const wall = performance.now() / 1000;
      t = wall - runStart.current;
      if (t > spec.loop) {
        runStart.current = wall;
        t = 0;
      }
    }

    const k = isStill ? 0.3 : kProp;

    // Nodes
    nodeGroupRefs.current.forEach((g, i) => {
      if (!g) return;
      const nd = spec.nodes[i];
      const z = nd.za + (nd.ze - nd.za) * k;
      const bob = isStill ? 0 : Math.sin(now / 900 + i * 0.9) * 0.025 * k;
      g.position.set(nd.x, nd.y + bob, z);

      // Arrival pop
      const dt = t - nd.arrival;
      const pop = t >= 0 && dt >= 0 && dt <= 0.45 ? 1 + 0.12 * (1 - dt / 0.45) : 1;
      g.scale.setScalar(pop);
    });

    // Pulses
    pulseMeshRefs.current.forEach((m, i) => {
      if (!m) return;
      const win = spec.pulseWindows[i];
      if (!win) { m.visible = false; return; }
      const p = (t - win[0]) / win[1];
      if (isStill || p < 0 || p > 1) {
        m.visible = false;
      } else {
        m.visible = true;
        m.position.copy(curves[i].getPoint(smoothstep(p)));
      }
    });

    // Glow targets  - call setter closures (not direct mutation of hook-derived value)
    for (const gd of glowData.current) {
      gd.setIntensity(gd.getIntensity(t));
    }

    // Per-model extras
    if (!isStill && spec.onFrame) spec.onFrame(t, now, k);

    // Root tilt
    if (root.current) {
      root.current.rotation.y += (spec.baseRotY + pointer.current.x * 0.28 - root.current.rotation.y) * 0.08;
      root.current.rotation.x += (-0.1 + pointer.current.y * 0.16 - root.current.rotation.x) * 0.08;
    }
  });

  // ---- JSX ----
  // Build node mesh JSX with correct material indices
  const nodeJsx = useMemo(() => {
    let matIdx = 0;
    return spec.nodes.map((nd, ni) => {
      const meshes = nd.meshes.map((m, mi) => {
        const idx = matIdx++;
        return (
          <mesh
            key={mi}
            geometry={rg(m.w, m.h, m.r, m.d)}
            material={nodeMats[idx]}
            position={[m.x, m.y, m.z]}
            rotation={m.rotZ != null ? [0, 0, m.rotZ] : undefined}
            castShadow={!m.noCast}
            receiveShadow
          />
        );
      });
      return (
        <group
          key={ni}
          ref={(g) => { nodeGroupRefs.current[ni] = g; }}
          position={[nd.x, nd.y, nd.za]}
        >
          {meshes}
        </group>
      );
    });
  }, [spec.nodes, nodeMats]);

  return (
    <>
      {/* Prototype-exact lights */}
      <hemisphereLight args={[0xffffff, 0x9fb8c2, 0.6]} />
      <directionalLight
        ref={shadowLightRef}
        position={[-3, 4, 8]}
        intensity={0.6}
        castShadow
      />
      <pointLight
        ref={plRef}
        color={pal.teal}
        intensity={0.5}
        distance={12}
        position={[-3, -2, 4]}
      />

      <group ref={root} rotation={[-0.1, spec.baseRotY, 0]}>
        {/* Back glass  - static, noCast */}
        <mesh
          geometry={BACK_GLASS_GEO}
          material={bgMat}
          position={[0, 0.05, -0.5]}
          receiveShadow
        />

        {/* Nodes */}
        {nodeJsx}

        {/* Connectors (tubes) */}
        {tubeGeos.map((geo, i) => (
          <mesh key={i} geometry={geo} material={tubeMat} receiveShadow />
        ))}

        {/* Pulses */}
        {pulseGeos.map((geo, i) => (
          <mesh
            key={i}
            ref={(m) => { pulseMeshRefs.current[i] = m; }}
            geometry={geo}
            material={pulseMat}
            visible={false}
          />
        ))}
      </group>
    </>
  );
}
