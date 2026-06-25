"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";
import ResearchParticles from "./ResearchParticles";

/* ------------------------------------------------------------------ *
 *  Types
 * ------------------------------------------------------------------ */
type Publication = {
  title: string;
  year: string;
  venue: string;
  url?: string;
  type?: string;
};

type ThemeName = "dark" | "light" | "forest";

/* ------------------------------------------------------------------ *
 *  Planet colour palette
 * ------------------------------------------------------------------ */
const DARK_COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF",
  "#FF8A5C", "#7C4DFF", "#FF4081", "#00BCD4",
  "#CDDC39", "#E91E63", "#3F51B5", "#FF9800",
];

const LIGHT_COLORS = [
  "#C62828", "#00695C", "#F9A825", "#2E7D32",
  "#E65100", "#4527A0", "#AD1457", "#00838F",
  "#9E9D24", "#880E4F", "#283593", "#EF6C00",
];

/* ------------------------------------------------------------------ *
 *  Deterministic pseudo-random
 * ------------------------------------------------------------------ */
function seedRand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ------------------------------------------------------------------ *
 *  Glow sprite texture (singleton)
 * ------------------------------------------------------------------ */
let _glowTex: THREE.CanvasTexture | null = null;
function glowTex() {
  if (_glowTex) return _glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.2, "rgba(255,255,255,0.6)");
  g.addColorStop(0.5, "rgba(255,255,255,0.1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  _glowTex = new THREE.CanvasTexture(c);
  return _glowTex;
}

/* ------------------------------------------------------------------ *
 *  Theme environment
 * ------------------------------------------------------------------ */
const ENV = {
  dark:   { bg: "#000000", fogNear: 3, fogFar: 9,  particles: "#38bdf8", particleOpacity: 0.35, hintColor: "text-zinc-300", sunGlow: "#ffcc80" },
  light:  { bg: "#ffffff", fogNear: 3, fogFar: 8.5, particles: "#6366f1", particleOpacity: 0.25, hintColor: "text-zinc-500", sunGlow: "#ffcc02" },
  forest: { bg: "#f2f7f4", fogNear: 2.5, fogFar: 7.5, particles: "#22c55e", particleOpacity: 0.3,  hintColor: "text-emerald-800", sunGlow: "#fbbf24" },
} as const;

/* ------------------------------------------------------------------ *
 *  CentralStar — glowing sun at the centre
 * ------------------------------------------------------------------ */
function CentralStar({ theme }: { theme: ThemeName }) {
  const ref = useRef<THREE.Group>(null);
  const glowC = ENV[theme].sunGlow;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = 1 + 0.05 * Math.sin(clock.elapsedTime * 1.2);
    ref.current.scale.setScalar(pulse);
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color={glowC} />
      </mesh>
      <Billboard>
        <sprite scale={1.5}>
          <spriteMaterial map={glowTex()} color={glowC} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      </Billboard>
      <Billboard>
        <sprite scale={3}>
          <spriteMaterial map={glowTex()} color={glowC} transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      </Billboard>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  OrbitRing — visible path for a planet
 * ------------------------------------------------------------------ */
function OrbitRing({ radius, color, opacity }: { radius: number; color: string; opacity: number }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      pts.push([Math.cos(theta) * radius, 0, Math.sin(theta) * radius]);
    }
    return pts;
  }, [radius]);

  return <Line points={points} color={color} transparent opacity={opacity} depthWrite={false} />;
}

/* ------------------------------------------------------------------ *
 *  Planet — orbiting publication node
 * ------------------------------------------------------------------ */
function Planet({
  pub, color, orbitRadius, speed, phase, size, index, hovered, selected, onEnter, onLeave, onClick,
}: {
  pub: Publication;
  color: string;
  orbitRadius: number;
  speed: number;
  phase: number;
  size: number;
  index: number;
  hovered: boolean;
  selected: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const active = hovered || selected;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime * speed + phase;
    groupRef.current.position.x = orbitRadius * Math.cos(t);
    groupRef.current.position.z = orbitRadius * Math.sin(t);
  });

  const s = active ? 1.5 : 1;

  return (
    <group ref={groupRef}>
      <group scale={[s, s, s]}>
        <mesh onPointerEnter={onEnter} onPointerLeave={onLeave} onClick={onClick}>
          <sphereGeometry args={[size, 14, 14]} />
          <meshBasicMaterial color={color} />
        </mesh>

        {/* Planetary ring on every 3rd planet */}
        {index % 3 === 0 && (
          <mesh rotation={[Math.PI / 2.5, 0, 0]}>
            <ringGeometry args={[size * 1.6, size * 1.9, 24]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        )}
      </group>

      <Billboard>
        <sprite scale={active ? size * 15 : size * 8}>
          <spriteMaterial map={glowTex()} color={color} transparent opacity={active ? 0.7 : 0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      </Billboard>

      {hovered && (
        <Billboard>
          <Text
            position={[0, size * 7 + 0.15, 0]}
            fontSize={0.08}
            color="#ffffff"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.015}
            outlineColor="#000000"
            maxWidth={2.0}
          >
            {pub.title.length > 45 ? pub.title.slice(0, 45) + "\u2026" : pub.title}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ *
 *  SolarSystemScene — all 3D content
 * ------------------------------------------------------------------ */
function SolarSystemScene({
  publications, theme, selected, hovered, setHovered, onSelect, tourHighlight,
}: {
  publications: Publication[];
  theme: ThemeName;
  selected: number | null;
  hovered: number | null;
  setHovered: (i: number | null) => void;
  onSelect: (i: number | null) => void;
  tourHighlight: number | null;
}) {
  const env = ENV[theme];
  const isDark = theme === "dark";
  const effectiveHover = hovered ?? tourHighlight;

  const orbits = useMemo(() => {
    const count = publications.length;
    return publications.map((_, i) => {
      const orbitRadius = 0.6 + (i / Math.max(count - 1, 1)) * 3.4;
      return {
        orbitRadius,
        speed: 0.3 / orbitRadius,
        phase: (i / Math.max(count, 1)) * Math.PI * 2,
        size: 0.04 + (i / Math.max(count, 1)) * 0.04,
        tiltX: (seedRand(i * 3.1) - 0.5) * 0.12,
        tiltZ: (seedRand(i * 7.3) - 0.5) * 0.12,
      };
    });
  }, [publications]);

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const ringBase = isDark ? 0.18 : 0.28;

  return (
    <>
      <fog attach="fog" args={[env.bg, env.fogNear, env.fogFar]} />

      <ResearchParticles isDark={isDark} color={env.particles} opacity={env.particleOpacity} />

      <ambientLight intensity={isDark ? 0.4 : 0.35} />
      <pointLight position={[0, 0, 0]} intensity={0.6} color={isDark ? "#ffcc80" : "#ffecb3"} />

      <CentralStar theme={theme} />

      {publications.map((pub, i) => {
        const o = orbits[i];
        const color = colors[i % colors.length];
        const isHov = effectiveHover === i;
        const isSel = selected === i;

        return (
          <group key={i} rotation={[o.tiltX, 0, o.tiltZ]}>
            <OrbitRing radius={o.orbitRadius} color={color} opacity={isHov || isSel ? ringBase + 0.22 : ringBase} />
            <Planet
              pub={pub}
              color={color}
              orbitRadius={o.orbitRadius}
              speed={o.speed}
              phase={o.phase}
              size={o.size}
              index={i}
              hovered={isHov}
              selected={isSel}
              onEnter={() => setHovered(i)}
              onLeave={() => setHovered(null)}
              onClick={() => onSelect(i === selected ? null : i)}
            />
          </group>
        );
      })}

        <OrbitControls
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.06}
        enableZoom={false}
        enablePan={false}
      />
    </>
  );
}

/* ------------------------------------------------------------------ *
 *  InfoPanel — HTML overlay for selected publication
 * ------------------------------------------------------------------ */
function InfoPanel({
  publication,
  onClose,
}: {
  publication: Publication | null;
  onClose: () => void;
}) {
  if (!publication) return null;

  return (
    <div
      className="pointer-events-auto absolute right-6 top-6 z-20 w-72 rounded-xl border border-zinc-700/50 bg-zinc-950/90 p-5 backdrop-blur-lg transition-all duration-300"
      style={{ boxShadow: "0 0 30px rgba(0,0,0,0.5)" }}
    >
      <button
        onClick={onClose}
        className="absolute right-3 top-3 text-zinc-500 transition-colors hover:text-white"
        aria-label="Close"
      >
        ✕
      </button>

      <h3 className="mb-2 pr-4 text-sm font-semibold leading-snug text-white">
        {publication.title}
      </h3>

      {publication.venue && (
        <p className="mb-1 text-xs text-zinc-400">{publication.venue}</p>
      )}

      {publication.year && (
        <p className="mb-3 text-xs text-zinc-500">{publication.year}</p>
      )}

      {publication.url && (
        <a
          href={publication.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/30"
        >
          Read more →
        </a>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  ResearchCanvas — main exported component
 * ------------------------------------------------------------------ */
export default function ResearchCanvas({
  publications,
}: {
  publications: Publication[];
}) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    useCallback(() => () => {}, []),
    () => true,
    () => false,
  );

  const theme: ThemeName =
    mounted && ["dark", "light", "forest"].includes(resolvedTheme ?? "")
      ? (resolvedTheme as ThemeName)
      : "light";

  const env = ENV[theme];
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [tourHighlight, setTourHighlight] = useState<number | null>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const [hintFading, setHintFading] = useState(false);
  const displayPubs = useMemo(() => publications.slice(0, 12), [publications]);

  const userInteracted = useRef(false);

  // Intro tour
  useEffect(() => {
    if (displayPubs.length === 0 || userInteracted.current) return;

    const showDelay = setTimeout(() => setHintFading(true), 2000);

    const tourDelay = setTimeout(() => {
      setHintVisible(false);
      let idx = 0;
      const tick = () => {
        if (userInteracted.current || idx >= displayPubs.length) {
          setTourHighlight(null);
          return;
        }
        setTourHighlight(idx);
        idx++;
        setTimeout(tick, 2200);
      };
      setTimeout(tick, 600);
    }, 2500);

    const hideHint = setTimeout(() => setHintVisible(false), 4000);

    return () => { clearTimeout(showDelay); clearTimeout(tourDelay); clearTimeout(hideHint); };
  }, [displayPubs.length]);

  const handleHover = useCallback((i: number | null) => {
    userInteracted.current = true;
    setTourHighlight(null);
    setHintVisible(false);
    setHovered(i);
  }, []);

  const handleSelect = useCallback((i: number | null) => {
    userInteracted.current = true;
    setTourHighlight(null);
    setHintVisible(false);
    setSelected(i);
  }, []);

  return (
    <div
      className="relative h-[480px] w-full overflow-hidden"
      style={{ backgroundColor: env.bg, touchAction: "pan-y" }}
    >
      {mounted && (
        <>
          {/* Edge fades */}
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-16"
            style={{ background: `linear-gradient(to bottom, ${env.bg} 0%, ${env.bg}00 100%)` }} />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-16"
            style={{ background: `linear-gradient(to top, ${env.bg} 0%, ${env.bg}00 100%)` }} />
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16"
            style={{ background: `linear-gradient(to right, ${env.bg} 0%, ${env.bg}00 100%)` }} />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16"
            style={{ background: `linear-gradient(to left, ${env.bg} 0%, ${env.bg}00 100%)` }} />

          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 1.5, 6.5], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
          >
            <SolarSystemScene
              publications={displayPubs}
              theme={theme}
              selected={selected}
              hovered={hovered}
              setHovered={handleHover}
              onSelect={handleSelect}
              tourHighlight={tourHighlight}
            />
          </Canvas>

          <InfoPanel
            publication={selected !== null ? displayPubs[selected] : null}
            onClose={() => setSelected(null)}
          />

          {hintVisible && (
            <div className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity duration-700 ${
              hintFading ? "opacity-0" : "opacity-100"
            }`}>
              <div className={`text-center ${env.hintColor}`}>
                <p className="font-mono text-base font-semibold tracking-widest">
                  ✦ Explore My Research
                </p>
                <p className="mt-2 font-mono text-xs tracking-wide opacity-60">
                  Hover the planets to see each publication
                </p>
              </div>
            </div>
          )}

          {/* Scroll-down button */}
          <button
            onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
            className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 cursor-pointer transition-opacity hover:opacity-100 motion-safe:animate-bounce"
            style={{ opacity: 0.3 }}
            aria-label="Scroll to next section"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={theme === "dark" ? "text-zinc-400" : "text-zinc-500"}
            >
              <path d="M7 13l5 5 5-5" />
              <path d="M7 6l5 5 5-5" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
