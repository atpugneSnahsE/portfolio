"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function ResearchParticles({
  isDark,
  color,
  opacity,
}: {
  isDark: boolean;
  color?: string;
  opacity?: number;
}) {
  const points1 = useRef<THREE.Points>(null);
  const points2 = useRef<THREE.Points>(null);

  const particleCount = 1200;

  const [particles1, particles2] = useMemo(() => {
    const half = Math.floor(particleCount / 2);
    const positions1 = new Float32Array(half * 3);
    const positions2 = new Float32Array(half * 3);

    for (let i = 0; i < half; i++) {
      positions1[i * 3] = (Math.random() - 0.5) * 14;
      positions1[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions1[i * 3 + 2] = (Math.random() - 0.5) * 14;

      positions2[i * 3] = (Math.random() - 0.5) * 14;
      positions2[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions2[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }

    return [positions1, positions2];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const c1 = color ?? (isDark ? "#34D399" : "#059669");
  const c2 = color ?? (isDark ? "#6ee7b7" : "#047857");
  const o1 = opacity ?? (isDark ? 0.65 : 0.55);
  const o2 = opacity ?? (isDark ? 0.55 : 0.45);

  useFrame((state) => {
    const elapsedTime = state.clock.elapsedTime;

    if (points1.current) {
      points1.current.rotation.y = elapsedTime * 0.012;
      points1.current.rotation.x = Math.sin(elapsedTime * 0.06) * 0.03;
    }

    if (points2.current) {
      points2.current.rotation.y = -elapsedTime * 0.016;
      points2.current.rotation.z = Math.cos(elapsedTime * 0.04) * 0.02;
    }
  });

  return (
    <group>
      <points ref={points1}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles1, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          color={c1}
          transparent
          opacity={o1}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points ref={points2}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles2, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.075}
          color={c2}
          transparent
          opacity={o2}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
