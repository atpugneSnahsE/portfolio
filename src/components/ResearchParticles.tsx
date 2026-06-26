"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

let _starTex: THREE.CanvasTexture | null = null;
function starTexture() {
  if (_starTex) return _starTex;
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const cx = size / 2, cy = size / 2;

  // Soft glow base
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.1, "rgba(255,255,255,0.5)");
  g.addColorStop(0.5, "rgba(255,255,255,0.05)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  // 4-point star spikes
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath();
  const spikes = 4;
  const outerR = size / 2 - 2;
  const innerR = 5;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  _starTex = new THREE.CanvasTexture(c);
  return _starTex;
}

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

  const map = useMemo(() => starTexture(), []);

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
          size={0.09}
          map={map}
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
          size={0.1}
          map={map}
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
