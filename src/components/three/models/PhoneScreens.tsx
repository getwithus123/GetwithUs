"use client";

import { RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import type { Group } from "three";
import { useModelFrame, useModelPalette } from "@/components/three/models/context";

const SCREEN_Z = 0.1;

/**
 * App development: a phone turning slowly, its screen cycling through sign-in,
 * booking, payment success, and a push notification dropping in.
 */
export default function PhoneScreens() {
  const palette = useModelPalette();
  const phone = useRef<Group>(null);
  const screens = useRef<(Group | null)[]>([]);
  const push = useRef<Group>(null);

  useModelFrame((_, time) => {
    if (phone.current) phone.current.rotation.y = -0.35 + Math.sin(time * 0.4) * 0.45;
    const state = Math.floor(time / 2.2) % 4;
    screens.current.forEach((screen, index) => {
      if (screen) screen.visible = index === Math.min(state, 2);
    });
    if (push.current) {
      const shown = state === 3;
      const target = shown ? 1.05 : 1.7;
      push.current.position.y += (target - push.current.position.y) * 0.15;
      push.current.visible = push.current.position.y < 1.6;
    }
  });

  const bar = (x: number, y: number, w: number, h: number, color: typeof palette.ink) => (
    <mesh position={[x, y, 0]}>
      <boxGeometry args={[w, h, 0.02]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );

  return (
    <group ref={phone} rotation={[0.12, -0.35, 0]}>
      <RoundedBox args={[1.55, 3.1, 0.18]} radius={0.2} smoothness={4}>
        <meshStandardMaterial color={palette.ink} roughness={0.35} metalness={0.2} />
      </RoundedBox>
      <mesh position={[0, 0, SCREEN_Z]}>
        <planeGeometry args={[1.36, 2.88]} />
        {/* Unlit, so the screen reads as a lit display in the page's card colour. */}
        <meshBasicMaterial color={palette.card} toneMapped={false} />
      </mesh>
      <group position={[0, 0, SCREEN_Z + 0.02]}>
        <group ref={(group) => void (screens.current[0] = group)}>
          {bar(-0.2, 0.75, 0.7, 0.1, palette.ink)}
          {bar(0, 0.35, 1.05, 0.26, palette.line)}
          {bar(0, -0.02, 1.05, 0.26, palette.line)}
          {bar(0, -0.5, 1.05, 0.28, palette.accent)}
        </group>
        <group ref={(group) => void (screens.current[1] = group)} visible={false}>
          {bar(-0.2, 0.85, 0.7, 0.1, palette.ink)}
          {[0, 1, 2, 3, 4, 5].map((index) =>
            <mesh
              key={index}
              position={[
                -0.34 + (index % 3) * 0.34,
                0.45 - Math.floor(index / 3) * 0.34,
                0,
              ]}
            >
              <boxGeometry args={[0.28, 0.26, 0.02]} />
              <meshStandardMaterial color={index === 4 ? palette.accent : palette.line} />
            </mesh>
          )}
          {bar(0, -0.5, 1.05, 0.28, palette.accent)}
        </group>
        <group ref={(group) => void (screens.current[2] = group)} visible={false}>
          <mesh position={[0, 0.3, 0]}>
            <torusGeometry args={[0.32, 0.05, 12, 48]} />
            <meshStandardMaterial color={palette.ok} />
          </mesh>
          {bar(0, -0.3, 0.8, 0.1, palette.ink)}
          {bar(0, -0.5, 0.55, 0.07, palette.line)}
        </group>
        <group ref={push} position={[0, 1.7, 0.06]} visible={false}>
          <RoundedBox args={[1.25, 0.42, 0.06]} radius={0.08} smoothness={3}>
            <meshStandardMaterial color={palette.card} />
          </RoundedBox>
          <mesh position={[-0.42, 0, 0.04]}>
            <boxGeometry args={[0.24, 0.24, 0.02]} />
            <meshStandardMaterial color={palette.accent} />
          </mesh>
          {bar(0.12, 0.06, 0.65, 0.07, palette.ink)}
          {bar(0.05, -0.08, 0.5, 0.05, palette.line)}
        </group>
      </group>
    </group>
  );
}
