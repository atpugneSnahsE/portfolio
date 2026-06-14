"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { RoundedBox, Text } from "@react-three/drei";
import { useTheme } from "next-themes";
import ResearchParticles from "./ResearchParticles";

type Publication = {
  title: string;
  year: string;
  venue: string;
  url?: string;
};

// Each card gets a unique accent — cycling a curated palette
const ACCENT_COLORS = [
  "#10B981", // emerald
  "#6366F1", // indigo
  "#EC4899", // pink
  "#F59E0B", // amber
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#14B8A6", // teal
  "#F97316", // orange
];

function PublicationCard({
  publication,
  isDark,
  activeIndex,
  setActiveIndex,
  index,
  accentColor,
}: {
  publication: Publication;
  isDark: boolean;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  index: number;
  accentColor: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.MeshStandardMaterial>(null);
  const isHovered = activeIndex === index;

  const CARD_W = 4.2;
  const CARD_H = 2.4;

  useFrame(() => {
    if (!groupRef.current) return;
    const s = isHovered ? 1.09 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
    if (bodyRef.current) {
      bodyRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        bodyRef.current.emissiveIntensity,
        isHovered ? 0.22 : 0,
        0.1
      );
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => {
        document.body.style.cursor = "pointer";
        setActiveIndex(index);
      }}
      onPointerLeave={() => {
        document.body.style.cursor = "default";
        setActiveIndex(null);
      }}
      onClick={() => {
        if (publication.url) window.open(publication.url, "_blank");
      }}
    >
      {/* Card body */}
      <RoundedBox args={[CARD_W, CARD_H, 0.07]} radius={0.13}>
        <meshStandardMaterial
          ref={bodyRef}
          color={isDark ? "#0C0E12" : "#f7f7f8"}
          roughness={0.88}
          metalness={0.06}
          emissive={accentColor}
          emissiveIntensity={0}
        />
      </RoundedBox>

      {/* Colored top accent stripe */}
      <RoundedBox
        args={[CARD_W, 0.27, 0.09]}
        radius={0.07}
        position={[0, CARD_H / 2 - 0.135, 0.01]}
      >
        <meshStandardMaterial
          color={accentColor}
          roughness={0.5}
          metalness={0.15}
          emissive={accentColor}
          emissiveIntensity={0.45}
        />
      </RoundedBox>

      {/* Title */}
      <Text
        position={[0, 0.12, 0.05]}
        fontSize={0.152}
        maxWidth={3.5}
        lineHeight={1.32}
        color={isDark ? "#E4E6EA" : "#151515"}
        anchorX="center"
        anchorY="middle"
      >
        {publication.title.length > 82
          ? publication.title.slice(0, 82) + "…"
          : publication.title}
      </Text>

      {/* Year — accent color, bottom-left */}
      <Text
        position={[-CARD_W / 2 + 0.44, -CARD_H / 2 + 0.36, 0.05]}
        fontSize={0.135}
        color={accentColor}
        anchorX="center"
        anchorY="middle"
      >
        {publication.year}
      </Text>

      {/* Venue — muted, bottom-right area */}
      {publication.venue ? (
        <Text
          position={[0.18, -CARD_H / 2 + 0.36, 0.05]}
          fontSize={0.1}
          maxWidth={2.9}
          color={isDark ? "#4B5563" : "#9CA3AF"}
          anchorX="left"
          anchorY="middle"
        >
          {publication.venue.length > 42
            ? publication.venue.slice(0, 42) + "…"
            : publication.venue}
        </Text>
      ) : null}
    </group>
  );
}

function FloatingPublication({
  publication,
  index,
  total,
  isDark,
  activeIndex,
  setActiveIndex,
  scrollOffset,
  seed,
}: {
  publication: Publication;
  index: number;
  total: number;
  isDark: boolean;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  scrollOffset: number;
  seed: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Stable per-card pseudo-random offsets
  const randA = useMemo(() => Math.sin(seed * 127.1) * 2 - 1, [seed]);
  const randB = useMemo(() => Math.sin(seed * 311.7) * 2 - 1, [seed]);
  const randC = useMemo(() => Math.sin(seed * 43.3) * 2 - 1, [seed]);
  const floatSpeed = useMemo(() => 0.38 + Math.abs(randA) * 0.38, [randA]);
  const floatPhase = useMemo(() => seed * 0.85, [seed]);

  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.getElapsedTime();

    // Elliptical spiral — flatter on z gives more dramatic perspective
    const spiralRadius = 4.6 + randA * 0.7;
    const angle =
      (index / total) * Math.PI * 2 * 2.2 + t * 0.055 + scrollOffset;

    const x = Math.cos(angle) * spiralRadius;
    const z = Math.sin(angle) * spiralRadius * 0.62;

    // Infinite vertical wrap
    const totalHeight = 14;
    let y =
      ((index * (totalHeight / total) - scrollOffset * 9) % totalHeight);
    if (y < -totalHeight / 2) y += totalHeight;
    if (y > totalHeight / 2) y -= totalHeight;

    // Organic float per card
    const floatY = Math.sin(t * floatSpeed + floatPhase) * 0.17;
    const floatX = Math.cos(t * floatSpeed * 0.65 + floatPhase) * 0.07;

    groupRef.current.position.set(x + floatX, y + floatY, z);

    // Face toward center first…
    groupRef.current.lookAt(0, y + floatY, 0);

    // …then add organic tilts — THIS creates the pacomepertant.com feel
    groupRef.current.rotation.z +=
      randB * 0.24 + Math.sin(t * 0.28 + floatPhase) * 0.055;
    groupRef.current.rotation.x +=
      randC * 0.13 + Math.sin(t * 0.19 + floatPhase * 1.4) * 0.04;
  });

  return (
    <group ref={groupRef}>
      <PublicationCard
        publication={publication}
        isDark={isDark}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        index={index}
        accentColor={accentColor}
      />
    </group>
  );
}

export default function ResearchCanvas({
  publications,
}: {
  publications: Publication[];
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Golden-ratio seeds give evenly-spaced but varied randomness
  const seeds = useMemo(
    () => publications.slice(0, 14).map((_, i) => i * 1.6180339887),
    [publications]
  );

  return (
    <div
      className="relative h-[700px] w-full overflow-hidden"
      onWheel={(e) =>
        setScrollOffset((prev) => prev + e.deltaY * 0.0018)
      }
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 13], fov: 34 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Atmospheric fog */}
        <fog
          attach="fog"
          args={[isDark ? "#04050A" : "#ffffff", 9, 24]}
        />

        <ResearchParticles isDark={isDark} />

        {/* Three-point lighting for depth */}
        <ambientLight intensity={isDark ? 0.55 : 1.1} />
        <pointLight
          position={[0, 2, 4]}
          intensity={isDark ? 1.6 : 0.7}
          color="#10B981"
        />
        <pointLight
          position={[-7, -3, 2]}
          intensity={isDark ? 0.7 : 0.3}
          color="#6366F1"
        />
        <directionalLight position={[5, 5, 5]} intensity={1.1} />

        {publications.slice(0, 14).map((pub, index) => (
          <FloatingPublication
            key={index}
            publication={pub}
            index={index}
            total={Math.min(publications.length, 14)}
            isDark={isDark}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            scrollOffset={scrollOffset}
            seed={seeds[index]}
          />
        ))}
      </Canvas>
    </div>
  );
}