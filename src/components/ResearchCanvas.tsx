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

const ACCENT_COLORS = [
  "#00FF87", // Vivid Neon Green
  "#00A8FF", // Bright Electric Blue
  "#00FFD2", // Cyan/Teal Mint
  "#3B82F6", // Classic Royal Blue
];

function PublicationCard({
  publication,
  resolvedTheme,
  activeIndex,
  setActiveIndex,
  index,
  accentColor,
}: {
  publication: Publication;
  resolvedTheme: string | undefined;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  index: number;
  accentColor: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.MeshStandardMaterial>(null);
  const pillRef = useRef<THREE.MeshStandardMaterial>(null);
  const isHovered = activeIndex === index;

  const CARD_W = 4.6;
  const CARD_H = 2.4;
  const CARD_D = 0.06;

  const cardColor = useMemo(() => {
    if (resolvedTheme === "dark") return "#1e2538"; // Visible dark grayish-blue
    if (resolvedTheme === "forest") return "#142c1c"; // Organic deep forest green
    return "#fbfcfd"; 
  }, [resolvedTheme]);

  const titleColor = useMemo(() => {
    if (resolvedTheme === "dark") return "#FFFFFF";
    if (resolvedTheme === "forest") return "#f0fdf4";
    return "#0f1115";
  }, [resolvedTheme]);

  const subtitleColor = useMemo(() => {
    if (resolvedTheme === "dark") return "#94a3b8"; 
    if (resolvedTheme === "forest") return "#81b29a";
    return "#4A5262";
  }, [resolvedTheme]);

  const buttonBg = useMemo(() => {
    if (resolvedTheme === "dark") return "#2a344d"; 
    if (resolvedTheme === "forest") return "#1f442b";
    return "#eaeef3";
  }, [resolvedTheme]);

  useFrame(() => {
    if (!groupRef.current) return;
    
    const targetScale = isHovered ? 1.05 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
    
    if (pillRef.current) {
      pillRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        pillRef.current.emissiveIntensity,
        isHovered ? 2.5 : 1.2,
        0.12
      );
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerEnter={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        setActiveIndex(index);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "default";
        setActiveIndex(null);
      }}
      onClick={() => {
        if (publication.url) window.open(publication.url, "_blank");
      }}
    >
      <RoundedBox args={[CARD_W, CARD_H, CARD_D]} radius={0.06}>
        <meshStandardMaterial
          ref={bodyRef}
          color={cardColor}
          roughness={0.4}
          metalness={0.02}
        />
      </RoundedBox>

      <group position={[-CARD_W / 2 + 0.3, CARD_H / 2 - 0.35, CARD_D / 2 + 0.005]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.21}
          maxWidth={4.0}
          lineHeight={1.2}
          color={titleColor}
          anchorX="left"
          anchorY="top"
          fontWeight="bold"
        >
          {publication.title.length > 60
            ? publication.title.slice(0, 60) + "…"
            : publication.title}
        </Text>

        <group position={[0, -0.62, 0]}>
          <primitive 
            object={new THREE.CapsuleGeometry(0.026, 0.36, 6, 12)} 
            rotation={[0, 0, Math.PI / 2]}
            position={[0.18, 0, 0]}
          >
            <meshStandardMaterial
              ref={pillRef}
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={1.2}
            />
          </primitive>
        </group>

        <Text
          position={[0, -0.82, 0]}
          fontSize={0.13}
          maxWidth={3.9}
          color={subtitleColor}
          anchorX="left"
          anchorY="top"
        >
          {`${publication.venue || "IEEE Trans"}, ${publication.year}`}
        </Text>

        <group position={[0.42, -1.45, 0.005]}>
          <RoundedBox args={[0.95, 0.32, 0.02]} radius={0.04}>
            <meshStandardMaterial color={buttonBg} roughness={0.5} />
          </RoundedBox>
          <Text
            position={[0, 0, 0.015]}
            fontSize={0.075}
            color={resolvedTheme === "light" ? "#374151" : "#e2f0d9"}
            fontWeight="bold"
            anchorX="center"
            anchorY="middle"
          >
            READ MORE
          </Text>
        </group>
      </group>
    </group>
  );
}

function FloatingPublication({
  publication,
  index,
  total,
  resolvedTheme,
  activeIndex,
  setActiveIndex,
  scrollOffset,
  seed,
}: {
  publication: Publication;
  index: number;
  total: number;
  resolvedTheme: string | undefined;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  scrollOffset: number;
  seed: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const randA = useMemo(() => Math.sin(seed * 127.1) * 2 - 1, [seed]);
  const randB = useMemo(() => Math.sin(seed * 311.7) * 2 - 1, [seed]);
  const randC = useMemo(() => Math.sin(seed * 43.3) * 2 - 1, [seed]);
  const floatSpeed = useMemo(() => 0.2 + Math.abs(randA) * 0.2, [randA]);
  const floatPhase = useMemo(() => seed * 1.5, [seed]);

  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.getElapsedTime();
    const baseRadius = 6.8; 
    const spiralRadius = baseRadius + randA * 1.5;
    const angle = (index / total) * Math.PI * 2 * 2.5 + t * 0.022 + scrollOffset;

    const x = Math.cos(angle) * spiralRadius;
    const z = Math.sin(angle) * spiralRadius * 0.7;

    const totalHeight = 18;
    let y = ((index * (totalHeight / total) - scrollOffset * 8.5) % totalHeight);
    if (y < -totalHeight / 2) y += totalHeight;
    if (y > totalHeight / 2) y -= totalHeight;

    const floatY = Math.sin(t * floatSpeed + floatPhase) * 0.1;
    const floatX = Math.cos(t * floatSpeed * 0.5 + floatPhase) * 0.04;

    groupRef.current.position.set(x + floatX, y + floatY, z);
    groupRef.current.lookAt(0, y * 0.88, 0);

    groupRef.current.rotation.z += randB * 0.08 + Math.sin(t * 0.15 + floatPhase) * 0.015;
    groupRef.current.rotation.x += randC * 0.04 + Math.sin(t * 0.12 + floatPhase) * 0.01;
  });

  return (
    <group ref={groupRef}>
      <PublicationCard
        publication={publication}
        resolvedTheme={resolvedTheme}
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

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  const displayCount = 12;
  const seeds = useMemo(
    () => Array.from({ length: displayCount }).map((_, i) => i * 2.381966),
    []
  );

  // 1. Matches the WebGL fog directly to the target theme background colors
  const environmentColor = useMemo(() => {
    if (resolvedTheme === "dark") return "#060913";
    if (resolvedTheme === "forest") return "#f0fdf4"; // Exact Tailwind green 'bg-emerald-50/50' or 'bg-green-50' backdrop color
    return "#ffffff";
  }, [resolvedTheme]);

  // 2. CSS-based Dynamic Tailwind Mask Styles to override and erase any external white frame lines
  const maskClasses = useMemo(() => {
    if (resolvedTheme === "dark") {
      return {
        top: "from-[#060913] to-transparent",
        bottom: "from-transparent to-[#060913]"
      };
    }
    if (resolvedTheme === "forest") {
      return {
        top: "from-[#f0fdf4] to-transparent", // Dynamic green gradient fade-in
        bottom: "from-transparent to-[#f0fdf4]" // Dynamic green gradient fade-out
      };
    }
    return {
      top: "from-white to-transparent",
      bottom: "from-transparent to-white"
    };
  }, [resolvedTheme]);

  const isDark = resolvedTheme === "dark";
  const isForest = resolvedTheme === "forest";

  return (
    <div
      className="relative h-[740px] w-full overflow-hidden"
      onWheel={(e) => setScrollOffset((prev) => prev + e.deltaY * 0.0012)}
    >
      {/* Dynamic Top Flush Gradient Shield */}
      <div className={`absolute top-0 left-0 right-0 z-10 h-24 bg-gradient-to-b ${maskClasses.top} pointer-events-none`} />

      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 13.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <fog attach="fog" args={[environmentColor, 11, 24]} />

        <ResearchParticles isDark={isDark} />

        <ambientLight intensity={isDark ? 0.95 : isForest ? 1.3 : 1.4} />
        <pointLight position={[0, 5, 5]} intensity={isDark ? 1.8 : 1.0} color="#ffffff" />
        <pointLight position={[-10, 3, 2]} intensity={0.6} color={isForest ? "#10b981" : "#6366F1"} />
        <pointLight position={[10, -3, 2]} intensity={0.6} color="#00FF87" />
        <directionalLight position={[0, 10, 3]} intensity={isDark ? 0.5 : 0.8} />

        {publications.slice(0, displayCount).map((pub, index) => (
          <FloatingPublication
            key={index}
            publication={pub}
            index={index}
            total={Math.min(publications.length, displayCount)}
            resolvedTheme={resolvedTheme}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            scrollOffset={scrollOffset}
            seed={seeds[index]}
          />
        ))}
      </Canvas>

      {/* Dynamic Bottom Flush Gradient Shield */}
      <div className={`absolute bottom-0 left-0 right-0 z-10 h-24 bg-gradient-to-b ${maskClasses.bottom} pointer-events-none`} />
    </div>
  );
}