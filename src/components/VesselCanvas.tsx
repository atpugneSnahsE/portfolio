"use client";
import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function PlanetFace() {
  const { pointer } = useThree();
  const headRef = useRef<THREE.Group>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const satellitesRef = useRef<THREE.Group>(null);
  const cloudGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Smooth head tracking
    if (headRef.current) {
      const targetX = -pointer.y * 0.09;
      const targetY = pointer.x * 0.09;
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        targetX,
        0.08
      );
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        targetY,
        0.08
      );
      headRef.current.position.y = Math.sin(t * 1.2) * 0.0025;
    }

    // 2. Pupil tracking
    const pupilX = pointer.x * 0.03;
    const pupilY = pointer.y * 0.03;
    [leftPupilRef.current, rightPupilRef.current].forEach((eye) => {
      if (!eye) return;
      eye.position.x = THREE.MathUtils.lerp(eye.position.x, pupilX, 0.12);
      eye.position.y = THREE.MathUtils.lerp(eye.position.y, pupilY, 0.12);
    });

    // 3. Constrained satellite orbits (Tightened distance so they stay inside the frame)
    if (satellitesRef.current) {
      satellitesRef.current.rotation.y += 0.0012;
      satellitesRef.current.rotation.x = Math.sin(t * 0.2) * 0.03;
    }

    // 4. Global Cloud Group Rotation + Independent drifting animations via child nodes
    if (cloudGroupRef.current) {
      cloudGroupRef.current.rotation.y = t * 0.015;

      // Animate each cloud group child safely without triggering React Hook errors
      const c1 = cloudGroupRef.current.children[0];
      const c2 = cloudGroupRef.current.children[1];
      const c3 = cloudGroupRef.current.children[2];
      const c4 = cloudGroupRef.current.children[3];
      const c5 = cloudGroupRef.current.children[4];

      if (c1) c1.position.x = -0.35 + Math.sin(t * 0.4) * 0.03;
      if (c2) c2.position.y = 0.55 + Math.cos(t * 0.3) * 0.02;
      if (c3) c3.position.x = -0.65 + Math.sin(t * 0.5) * 0.04;
      if (c4) c4.position.y = -0.75 + Math.cos(t * 0.4) * 0.03;
      if (c5) c5.position.x = 0.7 + Math.sin(t * 0.3) * 0.02;
    }
  });

  return (
    // Larger Earth Scale boosted to 1.2
    <group ref={headRef} scale={1.2}>
      {/* Subtle atmosphere */}
      <mesh scale={1.08}>
        <sphereGeometry args={[0.95, 64, 64]} />
        <meshBasicMaterial color="#bae6fd" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>

      {/* Planet base - brighter ocean blue */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.95, 96, 96]} />
        <meshStandardMaterial color="#2389da" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Continents - vivid green */}
      <Continent position={[-0.52, 0.32, 0.72]} scale={[0.32, 0.19, 0.055]} rotation={[0.25, 0.55, 0.1]} color="#3fae4f" />
      <Continent position={[0.48, 0.05, 0.78]} scale={[0.27, 0.21, 0.045]} rotation={[0.15, -0.45, -0.1]} color="#5cc265" />
      <Continent position={[0.1, -0.65, 0.68]} scale={[0.35, 0.18, 0.05]} rotation={[0.6, 0.2, 0.15]} color="#8ad17a" />
      <Continent position={[-0.68, -0.28, 0.62]} scale={[0.19, 0.14, 0.04]} rotation={[0.3, 0.35, -0.2]} color="#3fae4f" />
      <Continent position={[0.65, -0.45, 0.55]} scale={[0.12, 0.09, 0.03]} rotation={[0.4, -0.6, 0]} color="#5cc265" />
      <Continent position={[-0.25, 0.65, 0.55]} scale={[0.16, 0.11, 0.035]} rotation={[-0.2, 0.8, 0.1]} color="#8ad17a" />

      {/* Drifting Clouds container group */}
      <group ref={cloudGroupRef}>
        <group position={[-0.35, 0.75, 0.82]}><Cloud scale={1.1} /></group>
        <group position={[0.48, 0.55, 0.79]}><Cloud scale={0.85} /></group>
        <group position={[-0.65, -0.4, 0.85]}><Cloud scale={0.65} /></group>
        <group position={[0.22, -0.75, 0.78]}><Cloud scale={0.9} /></group>
        <group position={[0.7, 0.25, 0.65]}><Cloud scale={0.55} /></group>
      </group>

      {/* Eyes & Brows */}
      <Eye position={[-0.24, 0.15, 0.86]} pupilRef={leftPupilRef} />
      <Eye position={[0.24, 0.15, 0.86]} pupilRef={rightPupilRef} />
      <Eyebrow position={[-0.24, 0.39, 0.88]} rotation={0.25} />
      <Eyebrow position={[0.24, 0.39, 0.88]} rotation={-0.22} />

      {/* Smile */}
      <mesh position={[0, -0.23, 0.89]} rotation={[0.1, 0, Math.PI]}>
        <torusGeometry args={[0.17, 0.023, 18, 120, Math.PI * 0.78]} />
        <meshStandardMaterial color="#0f766e" roughness={0.6} />
      </mesh>

      {/* Cheeks */}
      <mesh position={[-0.41, -0.03, 0.82]}>
        <circleGeometry args={[0.085, 48]} />
        <meshBasicMaterial color="#fda4af" transparent opacity={0.18} />
      </mesh>
      <mesh position={[0.41, -0.03, 0.82]}>
        <circleGeometry args={[0.085, 48]} />
        <meshBasicMaterial color="#fda4af" transparent opacity={0.18} />
      </mesh>

      {/* Satellites - Radii tightened to ensure they rotate strictly inside the frame boundaries */}
      <group ref={satellitesRef}>
        <OrbitingSatellite
          angle={0}
          color="#e5e7eb"
          distance={1.38}
          speedMod={0.85}
        />

        <OrbitingSatellite
          angle={Math.PI}
          color="#94a3b8"
          distance={1.48}
          speedMod={0.75}
        />
      </group>
    </group>
  );
}

function Eye({ position, pupilRef }: { position: [number, number, number]; pupilRef: React.RefObject<THREE.Mesh | null> }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.175, 48, 48]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} />
      </mesh>
      <mesh ref={pupilRef} position={[0, 0, 0.115]}>
        <sphereGeometry args={[0.082, 36, 36]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} />
        <mesh position={[0.025, 0.028, 0.055]}>
          <sphereGeometry args={[0.019, 20, 20]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.1} />
        </mesh>
      </mesh>
    </group>
  );
}

function Eyebrow({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <mesh position={position} rotation={[0, 0, rotation]}>
      <torusGeometry args={[0.125, 0.022, 10, 32, Math.PI * 0.72]} />
      <meshStandardMaterial color="#134e4a" roughness={0.6} />
    </mesh>
  );
}

function Cloud({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <mesh>
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshStandardMaterial color="#f0f9ff" roughness={0.9} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0.09, 0.01, 0.02]}>
        <sphereGeometry args={[0.065, 22, 22]} />
        <meshStandardMaterial color="#f0f9ff" roughness={0.9} transparent opacity={0.88} />
      </mesh>
      <mesh position={[-0.08, 0.03, -0.01]}>
        <sphereGeometry args={[0.055, 20, 20]} />
        <meshStandardMaterial color="#f0f9ff" roughness={0.9} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function Continent({ position, rotation, scale, color = "#4ade80" }: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}

function OrbitingSatellite({ angle, color, distance = 2, speedMod = 1 }: {
  angle: number; color: string; distance?: number; speedMod?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = t * 0.8 * speedMod + angle;
      groupRef.current.rotation.z = Math.sin(t * 1.2) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <group position={[Math.cos(angle) * distance, Math.sin(angle) * 0.25, Math.sin(angle) * distance]}>
        <Satellite color={color} />
      </group>
    </group>
  );
}

function Satellite({ color }: { color: string }) {
  return (
    <group scale={0.24}>
      <mesh castShadow>
        <boxGeometry args={[0.38, 0.38, 0.32]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.62, 0.05, 0]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.62, 0.24, 0.04]} />
        <meshStandardMaterial color="#1e40af" metalness={0.8} />
      </mesh>
      <mesh position={[0.62, -0.05, 0]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.62, 0.24, 0.04]} />
        <meshStandardMaterial color="#1e40af" metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.012, 0.008, 0.35, 8]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
    </group>
  );
}

export default function VesselCanvas() {
  return (
    <div className="relative h-[480px] w-full overflow-visible bg-transparent">
      <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/5 blur-[100px]" />

      <Canvas
        camera={{
          position: [0, 0, 4.8],
          fov: 42,
        }}
        shadows
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        <ambientLight intensity={0.8} />

        <directionalLight
          position={[4, 5, 6]}
          intensity={2.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        <directionalLight
          position={[-3, -2, -4]}
          intensity={0.5}
          color="#bae6fd"
        />

        <PlanetFace />
      </Canvas>
    </div>
  );
}