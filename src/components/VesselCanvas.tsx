"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function PlanetFace() {
  const { pointer } = useThree();
  const headRef = useRef<THREE.Group>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const satellitesRef = useRef<THREE.Group>(null);
  const cloudGroupRef = useRef<THREE.Group>(null);

  // Fresnel atmosphere glow (camera-facing rim light around the silhouette).
  const atmosphereMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color("#5fb0ff") } },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vNormal;
          uniform vec3 uColor;
          void main() {
            float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.2);
            intensity = clamp(intensity, 0.0, 1.0);
            gl_FragColor = vec4(uColor, 1.0) * intensity;
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Smooth head tracking
    if (headRef.current) {
      const targetX = -pointer.y * 0.09;
      const targetY = pointer.x * 0.09;
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetX, 0.08);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetY, 0.08);
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

    // 3. Tilted, slowly precessing orbital plane (kept tight so sats stay in frame)
    if (satellitesRef.current) {
      satellitesRef.current.rotation.y += 0.0009;
      satellitesRef.current.rotation.x = 0.32 + Math.sin(t * 0.2) * 0.025;
    }

    // 4. Global cloud rotation + independent drift per child
    if (cloudGroupRef.current) {
      cloudGroupRef.current.rotation.y = t * 0.015;
      const c = cloudGroupRef.current.children;
      if (c[0]) c[0].position.x = -0.35 + Math.sin(t * 0.4) * 0.03;
      if (c[1]) c[1].position.y = 0.55 + Math.cos(t * 0.3) * 0.02;
      if (c[2]) c[2].position.x = -0.65 + Math.sin(t * 0.5) * 0.04;
      if (c[3]) c[3].position.y = -0.75 + Math.cos(t * 0.4) * 0.03;
      if (c[4]) c[4].position.x = 0.7 + Math.sin(t * 0.3) * 0.02;
    }
  });

  return (
    <group ref={headRef} scale={1.2}>
      {/* Fresnel atmosphere */}
      <mesh scale={1.16}>
        <sphereGeometry args={[0.95, 64, 64]} />
        <primitive object={atmosphereMat} attach="material" />
      </mesh>

      {/* Inner haze */}
      <mesh scale={1.045}>
        <sphereGeometry args={[0.95, 64, 64]} />
        <meshBasicMaterial color="#bae6fd" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

      {/* Ocean */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.95, 96, 96]} />
        <meshStandardMaterial color="#1c6fb5" roughness={0.5} metalness={0.18} />
      </mesh>

      {/* Continents */}
      <Continent position={[-0.52, 0.32, 0.72]} scale={[0.32, 0.19, 0.055]} rotation={[0.25, 0.55, 0.1]} color="#2f9e44" />
      <Continent position={[0.48, 0.05, 0.78]} scale={[0.27, 0.21, 0.045]} rotation={[0.15, -0.45, -0.1]} color="#51cf66" />
      <Continent position={[0.1, -0.65, 0.68]} scale={[0.35, 0.18, 0.05]} rotation={[0.6, 0.2, 0.15]} color="#8ce99a" />
      <Continent position={[-0.68, -0.28, 0.62]} scale={[0.19, 0.14, 0.04]} rotation={[0.3, 0.35, -0.2]} color="#2f9e44" />
      <Continent position={[0.65, -0.45, 0.55]} scale={[0.12, 0.09, 0.03]} rotation={[0.4, -0.6, 0]} color="#51cf66" />
      <Continent position={[-0.25, 0.65, 0.55]} scale={[0.16, 0.11, 0.035]} rotation={[-0.2, 0.8, 0.1]} color="#8ce99a" />

      {/* Drifting clouds */}
      <group ref={cloudGroupRef}>
        <group position={[-0.35, 0.75, 0.82]}><Cloud scale={1.1} /></group>
        <group position={[0.48, 0.55, 0.79]}><Cloud scale={0.85} /></group>
        <group position={[-0.65, -0.4, 0.85]}><Cloud scale={0.65} /></group>
        <group position={[0.22, -0.75, 0.78]}><Cloud scale={0.9} /></group>
        <group position={[0.7, 0.25, 0.65]}><Cloud scale={0.55} /></group>
      </group>

      {/* Face */}
      <Eye position={[-0.24, 0.15, 0.86]} pupilRef={leftPupilRef} />
      <Eye position={[0.24, 0.15, 0.86]} pupilRef={rightPupilRef} />
      <Eyebrow position={[-0.24, 0.39, 0.88]} rotation={0.25} />
      <Eyebrow position={[0.24, 0.39, 0.88]} rotation={-0.22} />

      <mesh position={[0, -0.23, 0.89]} rotation={[0.1, 0, Math.PI]}>
        <torusGeometry args={[0.17, 0.023, 18, 120, Math.PI * 0.78]} />
        <meshStandardMaterial color="#0f766e" roughness={0.6} />
      </mesh>

      <mesh position={[-0.41, -0.03, 0.82]}>
        <circleGeometry args={[0.085, 48]} />
        <meshBasicMaterial color="#fda4af" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0.41, -0.03, 0.82]}>
        <circleGeometry args={[0.085, 48]} />
        <meshBasicMaterial color="#fda4af" transparent opacity={0.2} />
      </mesh>

      {/* Satellites on a tilted, tight orbit */}
      <group ref={satellitesRef} rotation={[0.32, 0, 0.42]}>
        <OrbitingSatellite angle={0} bodyColor="#caa45a" distance={1.12} speedMod={0.9} />
        <OrbitingSatellite angle={Math.PI} bodyColor="#cdd2d8" distance={1.26} speedMod={0.72} />

        {/* Faint orbit traces */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.12, 0.0035, 8, 140]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.09} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.26, 0.0035, 8, 140]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.07} />
        </mesh>
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
        <meshStandardMaterial color="#1e293b" roughness={0.25} />
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
        <meshStandardMaterial color="#f0f9ff" roughness={0.95} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0.09, 0.01, 0.02]}>
        <sphereGeometry args={[0.065, 22, 22]} />
        <meshStandardMaterial color="#f0f9ff" roughness={0.95} transparent opacity={0.88} />
      </mesh>
      <mesh position={[-0.08, 0.03, -0.01]}>
        <sphereGeometry args={[0.055, 20, 20]} />
        <meshStandardMaterial color="#f0f9ff" roughness={0.95} transparent opacity={0.85} />
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
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}

function OrbitingSatellite({ angle, bodyColor, distance = 2, speedMod = 1 }: {
  angle: number; bodyColor: string; distance?: number; speedMod?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = t * 0.45 * speedMod + angle;
      groupRef.current.rotation.z = Math.sin(t * 1.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <group position={[Math.cos(angle) * distance, Math.sin(angle) * 0.18, Math.sin(angle) * distance]}>
        <Satellite bodyColor={bodyColor} />
      </group>
    </group>
  );
}

function SolarWing({ side }: { side: number }) {
  const dir = side; // -1 left, +1 right
  const seams = [-0.2, -0.1, 0, 0.1, 0.2];
  return (
    <group position={[dir * 0.66, 0, 0]}>
      {/* deployment boom */}
      <mesh position={[-dir * 0.26, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.34, 10]} />
        <meshStandardMaterial color="#aeb6bf" metalness={0.8} roughness={0.35} />
      </mesh>
      {/* metallic backing frame */}
      <mesh position={[0, 0, -0.008]}>
        <boxGeometry args={[0.63, 0.37, 0.008]} />
        <meshStandardMaterial color="#c7ccd2" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* photovoltaic panel */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.34, 0.012]} />
        <meshStandardMaterial color="#15244a" metalness={0.45} roughness={0.3} emissive="#0a1840" emissiveIntensity={0.35} />
      </mesh>
      {/* cell seams */}
      {seams.map((sx, i) => (
        <mesh key={i} position={[sx, 0, 0.009]}>
          <boxGeometry args={[0.004, 0.34, 0.002]} />
          <meshStandardMaterial color="#2b4a8c" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.009]}>
        <boxGeometry args={[0.6, 0.004, 0.002]} />
        <meshStandardMaterial color="#2b4a8c" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Satellite({ bodyColor = "#caa45a" }: { bodyColor?: string }) {
  return (
    <group scale={0.2}>
      {/* Main bus wrapped in thermal foil */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.46, 0.42]} />
        <meshStandardMaterial color={bodyColor} metalness={0.92} roughness={0.42} />
      </mesh>
      {/* foil seam on front face */}
      <mesh position={[0, 0, 0.212]}>
        <boxGeometry args={[0.42, 0.46, 0.004]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.65} />
      </mesh>
      {/* dark equipment band */}
      <mesh position={[0, -0.16, 0]}>
        <boxGeometry args={[0.44, 0.07, 0.44]} />
        <meshStandardMaterial color="#2c2c30" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* Solar wings */}
      <SolarWing side={-1} />
      <SolarWing side={1} />

      {/* High-gain dish */}
      <group position={[0, 0.12, 0.3]} rotation={[Math.PI / 2.4, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.17, 0.05, 0.07, 28, 1, true]} />
          <meshStandardMaterial color="#eef1f4" metalness={0.35} roughness={0.45} side={THREE.DoubleSide} />
        </mesh>
        {/* feed horn */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.012, 0.02, 0.12, 10]} />
          <meshStandardMaterial color="#9aa3ad" metalness={0.7} roughness={0.4} />
        </mesh>
      </group>

      {/* Omni antenna mast */}
      <mesh position={[0, 0.34, -0.06]}>
        <cylinderGeometry args={[0.008, 0.008, 0.3, 8]} />
        <meshStandardMaterial color="#7c858f" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.5, -0.06]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial color="#cfd4da" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Rear thruster nozzle */}
      <mesh position={[0, -0.26, 0]}>
        <cylinderGeometry args={[0.04, 0.07, 0.08, 16, 1, true]} />
        <meshStandardMaterial color="#3a3a3e" metalness={0.6} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function VesselCanvas() {
  return (
    <div className="relative h-[480px] w-full overflow-visible bg-transparent">
      <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/5 blur-[100px]" />

      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4.8], fov: 42 }}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
      >
        <ambientLight intensity={0.6} />

        {/* Key light */}
        <directionalLight position={[4, 5, 6]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]} />

        {/* Cool fill */}
        <directionalLight position={[-3, -2, -4]} intensity={0.45} color="#bae6fd" />

        {/* Back rim for separation against dark heroes */}
        <directionalLight position={[0, 2, -6]} intensity={1.1} color="#dbeafe" />

        {/* Soft catchlight near camera */}
        <pointLight position={[1.5, 1.5, 3]} intensity={0.5} />

        <PlanetFace />
      </Canvas>
    </div>
  );
}