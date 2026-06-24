"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

export default function Footer() {
  const { resolvedTheme } = useTheme();
  
  const [position, setPosition] = useState(15);
  const [direction, setDirection] = useState(1);
  const [frame, setFrame] = useState(0);
  const [dust, setDust] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [mounted, setMounted] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(Date.now());
  const dustIdRef = useRef(0);
  const directionRef = useRef(1);
  const positionRef = useRef(15);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic Theme Styling Profiles
  const themeStyles = {
    dark: {
      footerBg: "bg-black",
      borderColor: "border-zinc-900",
      textColor: "text-zinc-500",
      groundLine1: "via-zinc-600",
      groundLine2: "bg-zinc-800",
      textureColor: "#52525b",
      dinoColor: "text-zinc-500",
      humanColor: "text-sky-400",
      dustColor: "bg-zinc-600/70"
    },
    light: {
      footerBg: "bg-[#f4f4f5]",
      borderColor: "border-zinc-200",
      textColor: "text-zinc-400",
      groundLine1: "via-zinc-400",
      groundLine2: "bg-zinc-300",
      textureColor: "#a1a1aa",
      dinoColor: "text-zinc-600",
      humanColor: "text-blue-500",
      dustColor: "bg-zinc-400/70"
    },
    forest: {
      footerBg: "bg-[#0c1e12]",
      borderColor: "border-[#14321d]",
      textColor: "text-[#4a6b53]",
      groundLine1: "via-[#2d5a39]",
      groundLine2: "bg-[#1b3d24]",
      textureColor: "#22c55e",
      dinoColor: "text-[#3fae4f]",
      humanColor: "text-[#a7f3d0]",
      dustColor: "bg-[#2d5a39]/70"
    }
  };

  // Safe fallback resolver for custom theme setups (e.g., matching "forest")
  const currentTheme = (mounted && (resolvedTheme === "light" || resolvedTheme === "dark" || resolvedTheme === "forest")) 
    ? resolvedTheme 
    : "dark";

  const style = themeStyles[currentTheme];

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    const animate = () => {
      const now = Date.now();

      if (now - lastTimeRef.current > 30) {
        setPosition((prev) => {
          let next = prev + directionRef.current * 0.55;

          if (next >= 88) {
            directionRef.current = -1;
            setDirection(-1);
            next = 88;
          }

          if (next <= 8) {
            directionRef.current = 1;
            setDirection(1);
            next = 8;
          }

          positionRef.current = next;
          return next;
        });

        // Dust Generator
        if (Math.random() < 0.22) {
          dustIdRef.current += 1;
          const id = dustIdRef.current;

          setDust((prev) => [
            ...prev,
            {
              id,
              x: positionRef.current - 2,
              y: 68 + Math.random() * 5,
            },
          ]);

          setTimeout(() => {
            setDust((prev) => prev.filter((d) => d.id !== id));
          }, 700);
        }

        lastTimeRef.current = now;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 2);
    }, 120);

    return () => clearInterval(interval);
  }, []);

  const humanOffset = direction === 1 ? -10 : 10;
  const humanPosition = Math.min(Math.max(position + humanOffset, 0), 100);

  const flip = (dir: number) =>
    `translateX(-50%) ${dir === -1 ? "scaleX(-1)" : "scaleX(1)"}`;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
        rel="stylesheet"
      />

      <footer className={`relative w-full overflow-hidden border-t ${style.borderColor} ${style.footerBg} py-6 transition-colors duration-300`}>
        <div className="relative mx-auto max-w-6xl px-6">

          {/* Compact Scene Canvas */}
          <div className="relative mb-3 h-24 w-full overflow-hidden">

            {/* Base Tracks / Ground systems */}
            <div className={`absolute bottom-5 left-0 right-0 h-px bg-gradient-to-r from-transparent ${style.groundLine1} to-transparent`} />
            <div className={`absolute bottom-4 left-0 right-0 h-px ${style.groundLine2}`} />

            {/* Micro-tiled walking trail texture */}
            <div
              className="absolute bottom-4 left-0 right-0 h-2 opacity-20"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, ${style.textureColor} 0px, ${style.textureColor} 3px, transparent 3px, transparent 18px)`,
                animation: "scrollGround 2.2s linear infinite",
              }}
            />

            {/* Pixel Dino Entity */}
            <div
              className="absolute bottom-3 animate-none"
              style={{
                left: `${position}%`,
                transform: flip(direction),
                transition: "left 0.03s linear"
              }}
            >
              <svg
                width="68"
                height="68"
                viewBox="0 0 28 26"
                fill="currentColor"
                className={`${style.dinoColor} transition-colors duration-300`}
                style={{ imageRendering: "pixelated" }}
              >
                <rect x="13" y="1" width="9" height="6" />
                <rect x="15" y="0" width="4" height="2" />
                <rect x="17" y="3" width="1.5" height="1.5" className={currentTheme === "light" ? "fill-zinc-900" : "fill-zinc-100"} />
                <rect x="20" y="6" width="5" height="2" />
                <rect x="18" y="8" width="6" height="2" />
                <rect x="12" y="7" width="4" height="5" />
                <rect x="7" y="10" width="12" height="7" />
                <rect x="3" y="12" width="6" height="3" />
                <rect x="2" y="14" width="4" height="2" />
                <rect x="15" y="12" width="3" height="1.5" />
                <rect x="16" y="13.5" width="1.5" height="1.5" />

                {frame === 0 ? (
                  <>
                    <rect x="9" y="17" width="2.5" height="6" />
                    <rect x="8" y="22" width="4" height="1.5" />
                    <rect x="14" y="17" width="2.5" height="4" />
                  </>
                ) : (
                  <>
                    <rect x="9" y="17" width="2.5" height="4" />
                    <rect x="14" y="17" width="2.5" height="6" />
                    <rect x="13" y="22" width="4" height="1.5" />
                  </>
                )}
              </svg>
            </div>

            {/* Mini Escorting Human */}
            <div
              className="absolute bottom-3"
              style={{
                left: `${humanPosition}%`,
                transform: flip(direction),
                transition: "left 0.03s linear"
              }}
            >
              <svg
                width="32"
                height="44"
                viewBox="0 0 14 22"
                fill="currentColor"
                className={`${style.humanColor} transition-colors duration-300`}
              >
                <rect x="3" y="0" width="8" height="7" rx="3" />
                <rect x="4" y="7" width="6" height="7" />

                {frame === 0 ? (
                  <>
                    <rect x="1" y="8" width="3" height="2" />
                    <rect x="10" y="11" width="3" height="2" />
                    <rect x="4" y="14" width="2" height="6" />
                    <rect x="8" y="14" width="2" height="5" />
                  </>
                ) : (
                  <>
                    <rect x="10" y="8" width="3" height="2" />
                    <rect x="1" y="11" width="3" height="2" />
                    <rect x="4" y="14" width="2" height="5" />
                    <rect x="8" y="14" width="2" height="6" />
                  </>
                )}
              </svg>
            </div>

            {/* Particle Kicks / Dust Systems */}
            {dust.map((d) => (
              <div
                key={d.id}
                className={`absolute h-1 w-1 rounded-full ${style.dustColor}`}
                style={{
                  left: `${d.x}%`,
                  top: `${d.y}%`,
                  animation: "dustFade 0.7s forwards",
                }}
              />
            ))}
          </div>

          {/* Signature Credit Section */}
          <div className="flex justify-end">
            <p
              className={`text-[8px] tracking-wider ${style.textColor}`}
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              built with{" "}
              <span className="text-rose-500 animate-pulse">&lt;3</span>{" "}
              by{" "}
              <span className={currentTheme === "forest" ? "text-emerald-300" : "text-emerald-400"}>
                eshan with 🦖
              </span>
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes scrollGround {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          @keyframes dustFade {
            to {
              opacity: 0;
              transform: translateY(-10px) scale(0.5);
            }
          }
        `}</style>
      </footer>
    </>
  );
}