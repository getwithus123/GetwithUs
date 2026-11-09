"use client";

import { RoundedBox } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import type { Group } from "three";
import { useThree } from "@react-three/fiber";
import { useModelFrame, useModelPalette } from "@/components/three/models/context";

/** The four commitments in a word or two, orbiting the cube. */
const WORDS = ["Price in writing", "You own it", "Weekly demos", "No lock-in"];
const RADIUS = 2.4;

/**
 * Renders the orbiting word chips as plain DOM elements positioned by
 * projecting the 3D world positions onto the canvas each frame.
 * This avoids @react-three/drei <Html>, which creates a separate React root
 * and races with R3F canvas teardown (synchronous-unmount warning).
 */
function WordChips({ ringRef }: { ringRef: React.RefObject<Group | null> }) {
  const { camera, gl } = useThree();
  const chipsRef = useRef<HTMLDivElement | null>(null);

  // Build angles once (stable across renders)
  const angles = WORDS.map((_, i) => (i / WORDS.length) * Math.PI * 2);

  // Mount a container div as a sibling of the canvas
  useEffect(() => {
    const canvas = gl.domElement;
    const container = document.createElement("div");
    container.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;";
    canvas.parentElement?.appendChild(container);
    chipsRef.current = container;

    const _chips = WORDS.map((word) => {
      const chip = document.createElement("span");
      chip.textContent = word;
      chip.style.cssText =
        "position:absolute;transform:translate(-50%,-50%);" +
        "border-radius:9999px;border:1px solid var(--color-line);" +
        "background:var(--color-card);padding:0.375rem 0.75rem;" +
        "font-size:0.8125rem;font-weight:600;white-space:nowrap;" +
        "color:var(--color-ink);box-shadow:var(--shadow-soft);";
      container.appendChild(chip);
      return chip;
    });

    return () => {
      container.remove();
      chipsRef.current = null;
    };
  }, [gl]);

  const _v = useRef(new Vector3());

  useModelFrame(() => {
    const container = chipsRef.current;
    const ring = ringRef.current;
    if (!container || !ring) return;

    const chips = container.children as HTMLCollectionOf<HTMLSpanElement>;
    const canvas = gl.domElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    angles.forEach((angle, i) => {
      const chip = chips[i];
      if (!chip) return;

      // World position of this chip
      _v.current.set(Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS);
      _v.current.applyMatrix4(ring.matrixWorld);
      _v.current.project(camera);

      const x = (_v.current.x * 0.5 + 0.5) * w;
      const y = (1 - (_v.current.y * 0.5 + 0.5)) * h;

      // Hide chips that project behind the camera
      if (_v.current.z > 1) {
        chip.style.opacity = "0";
        return;
      }
      chip.style.opacity = "1";
      chip.style.left = `${x}px`;
      chip.style.top = `${y}px`;
    });
  });

  return null;
}

/** /about: the brand cube, larger, with the four commitment words orbiting it on a tilted ring. */
export default function AboutCube() {
  const palette = useModelPalette();
  const cube = useRef<Group>(null);
  const ring = useRef<Group>(null);

  useModelFrame((_, time) => {
    if (cube.current) cube.current.rotation.y = -0.6 + time * 0.25;
    if (ring.current) ring.current.rotation.y = time * 0.3;
  });

  return (
    <group rotation={[0.25, 0, 0]}>
      <group ref={cube} rotation={[0, -0.6, 0]}>
        <RoundedBox args={[1.8, 1.8, 1.8]} radius={0.18} smoothness={4}>
          <meshStandardMaterial color={palette.card} roughness={0.5} />
        </RoundedBox>
        {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((angle) => (
          <group key={angle} rotation={[0, angle, 0]}>
            <RoundedBox
              args={[0.86, 0.86, 0.14]}
              radius={0.12}
              smoothness={3}
              position={[0, 0, 0.9]}
            >
              <meshStandardMaterial color={palette.accent} roughness={0.35} />
            </RoundedBox>
          </group>
        ))}
      </group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[RADIUS, 0.012, 8, 160]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={0.5} />
      </mesh>
      <group ref={ring}>
        {/* Invisible anchor meshes so ring.matrixWorld stays in sync with R3F's scene graph */}
        {WORDS.map((word, index) => {
          const angle = (index / WORDS.length) * Math.PI * 2;
          return (
            <mesh
              key={word}
              position={[Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS]}
              visible={false}
            >
              <boxGeometry args={[0.01, 0.01, 0.01]} />
              <meshBasicMaterial />
            </mesh>
          );
        })}
      </group>
      <WordChips ringRef={ring} />
    </group>
  );
}
