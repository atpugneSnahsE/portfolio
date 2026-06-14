"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function PlanetFace() {
  const { pointer } = useThree();

  // Refs for tracking animations
  const headRef = useRef<THREE.Group>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const moon1Ref = useRef<THREE.Mesh>(null);
  const moon2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Smooth Head Parallax (Entire face tilts slightly toward cursor)
    if (headRef.current) {
      const targetRotationX = -pointer.y * 0.25;
      const targetRotationY = pointer.x * 0.25;

      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetRotationX, 0.1);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotationY, 0.1);

      // Gentle floating animation
      headRef.current.position.y = Math.sin(t * 1.5) * 0.05;
    }

    // 2. Eye Tracking (Pupils move inside the eyeballs toward cursor)
    const pupilTargetX = pointer.x * 0.12;
    const pupilTargetY = pointer.y * 0.12;

    if (leftPupilRef.current && rightPupilRef.current) {
      leftPupilRef.current.position.x = THREE.MathUtils.lerp(leftPupilRef.current.position.x, pupilTargetX, 0.15);
      leftPupilRef.current.position.y = THREE.MathUtils.lerp(leftPupilRef.current.position.y, pupilTargetY, 0.15);

      rightPupilRef.current.position.x = THREE.MathUtils.lerp(rightPupilRef.current.position.x, pupilTargetX, 0.15);
      rightPupilRef.current.position.y = THREE.MathUtils.lerp(rightPupilRef.current.position.y, pupilTargetY, 0.15);
    }

    // 3. Orbiting Rings & Moons Animation
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.15;
    }
    if (moon1Ref.current) {
      moon1Ref.current.position.x = Math.cos(t * 1.2) * 1.4;
      moon1Ref.current.position.z = Math.sin(t * 1.2) * 1.4;
    }
    if (moon2Ref.current) {
      moon2Ref.current.position.x = Math.cos(t * 0.8 + Math.PI) * 1.4;
      moon2Ref.current.position.z = Math.sin(t * 0.8 + Math.PI) * 1.4;
    }
  });

  return (
    <group ref={headRef}>
      {/* CENTRAL PLANET BODY (Emerald Green) */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.9, 64, 64]} />
        <meshStandardMaterial
          color="#22c55e"
          roughness={0.35}
          metalness={0.05}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* Subtle inner rim glow to add depth without harsh specular */}
      <mesh scale={1.015}>
        <sphereGeometry args={[0.9, 64, 64]} />
        <meshBasicMaterial
          color="#86efac"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* SATURN RINGS */}
      <group ref={ringRef} rotation={[Math.PI * 0.35, Math.PI * 0.15, 0]}>
        {/* Main flat planetary ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.35, 96]} />
          <meshStandardMaterial
            color="#f5f5f4"
            roughness={0.5}
            metalness={0.1}
            side={THREE.DoubleSide}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Thin inner ring accent */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.16, 96]} />
          <meshStandardMaterial
            color="#bbf7d0"
            roughness={0.5}
            side={THREE.DoubleSide}
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* Orbiting Moon 1 (Yellowish Core) */}
        <mesh ref={moon1Ref} castShadow>
          <sphereGeometry args={[0.12, 32, 32]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.4} roughness={0.4} />
        </mesh>

        {/* Orbiting Moon 2 (Soft Cream) */}
        <mesh ref={moon2Ref} castShadow>
          <sphereGeometry args={[0.09, 32, 32]} />
          <meshStandardMaterial color="#fef08a" emissive="#ca8a04" emissiveIntensity={0.25} roughness={0.4} />
        </mesh>
      </group>

      {/* EYES LAYER */}
      {/* Left Eyeball (White Background) */}
      <group position={[-0.32, 0.2, 0.72]}>
        <mesh>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        {/* Left Pupil (Interactive) */}
        <mesh ref={leftPupilRef} position={[0, 0, 0.14]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.2} />
          {/* Cute Catchlight reflection dot */}
          <mesh position={[0.03, 0.03, 0.08]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </mesh>
      </group>

      {/* Right Eyeball (White Background) */}
      <group position={[0.32, 0.2, 0.72]}>
        <mesh>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        {/* Right Pupil (Interactive) */}
        <mesh ref={rightPupilRef} position={[0, 0, 0.14]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.2} />
          {/* Cute Catchlight reflection dot */}
          <mesh position={[0.03, 0.03, 0.08]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </mesh>
      </group>

      {/* CUTE EYEBROWS */}
      <mesh position={[-0.32, 0.46, 0.7]} rotation={[0, 0, 0.25]}>
        <torusGeometry args={[0.12, 0.02, 8, 24, Math.PI * 0.7]} />
        <meshBasicMaterial color="#14532d" />
      </mesh>
      <mesh position={[0.32, 0.46, 0.7]} rotation={[0, 0, -0.25]} scale={[-1, 1, 1]}>
        <torusGeometry args={[0.12, 0.02, 8, 24, Math.PI * 0.7]} />
        <meshBasicMaterial color="#14532d" />
      </mesh>

      {/* HAPPY CURVED SMILE */}
      <mesh position={[0, -0.18, 0.82]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.16, 0.025, 16, 32, Math.PI * 0.85]} />
        <meshBasicMaterial color="#14532d" />
      </mesh>

      {/* Rosy cheeks for extra warmth */}
      <mesh position={[-0.42, -0.05, 0.68]}>
        <circleGeometry args={[0.09, 24]} />
        <meshBasicMaterial color="#fb7185" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0.42, -0.05, 0.68]}>
        <circleGeometry args={[0.09, 24]} />
        <meshBasicMaterial color="#fb7185" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export default function VesselCanvas() {
  return (
    <div className="relative h-[550px] w-full select-none overflow-hidden bg-transparent">
      {/* Ambient background studio light glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.08] blur-[100px]" />

      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        {/* Clean, low-intensity lighting setup to eliminate harsh over-glow */}
        <ambientLight intensity={0.55} />
        <directionalLight position={[2, 4, 3]} intensity={1.6} color="#ffffff" castShadow />
        <directionalLight position={[-2, -2, -2]} intensity={0.35} color="#86efac" />
        <pointLight position={[0, 0, 2]} intensity={0.35} />

        <PlanetFace />
      </Canvas>
    </div>
  );
}