// src/components/LeafParticlesClient.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

// Adjust the path to your leaf texture (place leaf.png in the public folder)
const LEAF_TEXTURE = "/leaf.png";

export default function LeafParticles({ 
  isActive, 
  mode = "swirl" 
}: { 
  isActive: boolean; 
  mode?: "swirl" | "background";
}) {
  // Load leaf texture (client‑only)
  const texture = useLoader(THREE.TextureLoader, LEAF_TEXTURE);

  // Generate leaf positions and speeds **once** on the client
  const [geo, setGeo] = useState<{ positions: Float32Array; speeds: Float32Array } | null>(null);

  useEffect(() => {
    const count = mode === "background" ? 80 : 200;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      if (mode === "background") {
        // Distribute in a box across the screen
        pos[i * 3] = (Math.random() - 0.5) * 40;     // X: -20 to 20
        pos[i * 3 + 1] = (Math.random() - 0.5) * 24; // Y: -12 to 12
        pos[i * 3 + 2] = Math.random() * 12 - 8;     // Z: -8 to 4
        spd[i] = 0.002 + Math.random() * 0.003;
      } else {
        // Swirl mode (cylinder distribution)
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 8 + 2;
        const height = (Math.random() - 0.5) * 12;
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 1] = height;
        pos[i * 3 + 2] = Math.sin(angle) * radius;
        spd[i] = 0.001 + Math.random() * 0.003;
      }
    }
    setGeo({ positions: pos, speeds: spd });
  }, [mode]);

  const pointsRef = useRef<THREE.Points>(null);

  // Animate leaves on each frame (client only)
  useFrame((state, delta) => {
    if (!isActive) return;
    if (!pointsRef.current || !geo) return;
    
    const d = Math.min(delta, 0.1); // Avoid giant jumps on tab unfocus
    const positions = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const speeds = geo.speeds;
    
    if (!speeds || speeds.length < positions.count) return;

    for (let i = 0; i < positions.count; i++) {
      if (mode === "background") {
        // Flow left to right:
        const x = positions.getX(i) + speeds[i] * d * 1200;
        // Sway gently on Y:
        const flutter = Math.sin(state.clock.getElapsedTime() * 2 + i * 0.7) * 0.02;
        const y = positions.getY(i) - (speeds[i] * 0.3) * d * 1200 + flutter;

        // Wrap around X
        if (x > 20) {
          positions.setX(i, -20);
          positions.setY(i, (Math.random() - 0.5) * 24);
        } else {
          positions.setX(i, x);
        }

        // Wrap around Y
        if (y < -12) {
          positions.setY(i, 12);
          positions.setX(i, (Math.random() - 0.5) * 40);
        } else {
          positions.setY(i, y);
        }
      } else {
        // Swirl mode (upward flow)
        const y = positions.getY(i) + speeds[i] * d * 2400;
        if (y > 8) {
          positions.setY(i, -8);
        } else {
          positions.setY(i, y);
        }
      }
    }
    positions.needsUpdate = true;
  });

  // While geometry is being generated, render nothing to avoid SSR mismatch
  if (!geo) return null;

  const { positions } = geo;

  return (
    <points ref={pointsRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        attach="material"
        map={texture}
        size={mode === "background" ? 0.36 : 0.3}
        transparent={true}
        depthWrite={false}
        opacity={mode === "background" ? 0.65 : 0.8}
      />
    </points>
  );
}
