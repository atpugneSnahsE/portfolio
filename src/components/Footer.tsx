"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTheme } from "next-themes";

/* ------------------------------------------------------------------ *
 *  Tunables
 * ------------------------------------------------------------------ */
const SPEED = 18; // % of track width travelled per second
const LEFT_BOUND = 8; // % minimum position
const RIGHT_BOUND = 88; // % maximum position
const LEG_INTERVAL = 0.12; // seconds between leg swaps
const HUMAN_TRAIL = 10; // % the human trails behind the dino
const DUST_POOL = 14; // recycled particle nodes

/* ------------------------------------------------------------------ *
 *  Theme profiles (defined once, outside the component)
 * ------------------------------------------------------------------ */
const THEME_STYLES = {
  dark: {
    footerBg: "bg-black",
    borderColor: "border-zinc-900",
    textColor: "text-zinc-500",
    groundLine1: "via-zinc-600",
    groundLine2: "bg-zinc-800",
    textureColor: "#52525b",
    dinoColor: "text-zinc-500",
    humanColor: "text-sky-400",
    dustColor: "bg-zinc-600/70",
    eyeFill: "fill-zinc-100",
    signature: "text-emerald-400",
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
    dustColor: "bg-zinc-400/70",
    eyeFill: "fill-zinc-900",
    signature: "text-emerald-400",
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
    dustColor: "bg-[#2d5a39]/70",
    eyeFill: "fill-zinc-100",
    signature: "text-emerald-300",
  },
} as const;

type ThemeName = keyof typeof THEME_STYLES;

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Footer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  /* --- DOM refs: everything animation-related is driven through these,
         so the component never re-renders while the scene is moving --- */
  const sceneRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(0);

  const dinoRef = useRef<HTMLDivElement>(null);
  const dinoFlipRef = useRef<HTMLDivElement>(null);
  const dinoLegA = useRef<SVGGElement>(null);
  const dinoLegB = useRef<SVGGElement>(null);

  const humanRef = useRef<HTMLDivElement>(null);
  const humanFlipRef = useRef<HTMLDivElement>(null);
  const humanLegA = useRef<SVGGElement>(null);
  const humanLegB = useRef<SVGGElement>(null);

  const dustNodes = useRef<Array<HTMLDivElement | null>>([]);
  const dustCursor = useRef(0);

  // Mutable simulation state — lives outside React's render cycle.
  const sim = useRef({
    pos: LEFT_BOUND + 7,
    dir: 1,
    frame: 0,
    legAcc: 0,
    dustAcc: 0,
    dustGap: 0.13,
  });

  useEffect(() => setMounted(true), []);

  const currentTheme: ThemeName =
    mounted &&
    (resolvedTheme === "light" ||
      resolvedTheme === "dark" ||
      resolvedTheme === "forest")
      ? resolvedTheme
      : "dark";
  const style = THEME_STYLES[currentTheme];

  /* ---------------------------------------------------------------- *
   *  Imperative helpers (read refs only — never stale)
   * ---------------------------------------------------------------- */
  const place = (
    outer: HTMLDivElement | null,
    flip: HTMLDivElement | null,
    posPct: number,
    dir: number,
  ) => {
    if (!outer || !flip) return;
    const x = (posPct / 100) * widthRef.current;
    // translate3d keeps movement on the compositor (no layout per frame)
    outer.style.transform = `translate3d(${x}px,0,0)`;
    flip.style.transform = `translateX(-50%) scaleX(${dir})`;
  };

  const showLeg = (
    a: SVGGElement | null,
    b: SVGGElement | null,
    frame: number,
  ) => {
    if (a) a.style.display = frame === 0 ? "" : "none";
    if (b) b.style.display = frame === 0 ? "none" : "";
  };

  const placeAll = (pos: number, dir: number) => {
    place(dinoRef.current, dinoFlipRef.current, pos, dir);
    const humanPos = clamp(
      pos + (dir === 1 ? -HUMAN_TRAIL : HUMAN_TRAIL),
      0,
      100,
    );
    place(humanRef.current, humanFlipRef.current, humanPos, dir);
  };

  const emitDust = (xPct: number, yPct: number) => {
    const pool = dustNodes.current;
    if (!pool.length) return;
    const el = pool[dustCursor.current % pool.length];
    dustCursor.current += 1;
    if (!el) return;
    el.style.left = `${xPct}%`;
    el.style.top = `${yPct}%`;
    // Web Animations API: one-off, runs off the main thread, self-cleans.
    el.animate(
      [
        { opacity: 0.7, transform: "translateY(0) scale(1)" },
        { opacity: 0, transform: "translateY(-10px) scale(0.5)" },
      ],
      { duration: 700, easing: "ease-out", fill: "forwards" },
    );
  };

  /* ---------------------------------------------------------------- *
   *  Measure + initial paint (before first frame, so there's no flash)
   * ---------------------------------------------------------------- */
  useIsoLayoutEffect(() => {
    const el = sceneRef.current;
    if (!el) return;

    const sync = () => {
      widthRef.current = el.offsetWidth;
      const s = sim.current;
      placeAll(s.pos, s.dir);
    };
    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------------------------------------------- *
   *  Main loop — single rAF, delta-timed, reduced-motion aware
   * ---------------------------------------------------------------- */
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      // Hold a calm, static pose instead of animating.
      showLeg(dinoLegA.current, dinoLegB.current, 0);
      showLeg(humanLegA.current, humanLegB.current, 0);
      return;
    }

    let raf = 0;
    let last = performance.now();

    const tick = (t: number) => {
      const s = sim.current;
      const dt = Math.min((t - last) / 1000, 0.05); // clamp tab-switch gaps
      last = t;

      // Move + bounce off the bounds
      s.pos += s.dir * SPEED * dt;
      if (s.pos >= RIGHT_BOUND) {
        s.pos = RIGHT_BOUND;
        s.dir = -1;
      } else if (s.pos <= LEFT_BOUND) {
        s.pos = LEFT_BOUND;
        s.dir = 1;
      }
      placeAll(s.pos, s.dir);

      // Leg swap
      s.legAcc += dt;
      if (s.legAcc >= LEG_INTERVAL) {
        s.legAcc = 0;
        s.frame ^= 1;
        showLeg(dinoLegA.current, dinoLegB.current, s.frame);
        showLeg(humanLegA.current, humanLegB.current, s.frame);
      }

      // Dust kicks from the dino's trailing foot
      s.dustAcc += dt;
      if (s.dustAcc >= s.dustGap) {
        s.dustAcc = 0;
        s.dustGap = 0.1 + Math.random() * 0.07;
        emitDust(s.pos - 2, 68 + Math.random() * 5);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
        rel="stylesheet"
      />

      <footer
        className={`relative w-full overflow-hidden border-t ${style.borderColor} ${style.footerBg} py-6 transition-colors duration-300`}
      >
        <div className="relative mx-auto max-w-6xl px-6">
          {/* Scene canvas */}
          <div
            ref={sceneRef}
            className="relative mb-3 h-24 w-full overflow-hidden"
            aria-hidden="true"
          >
            {/* Ground */}
            <div
              className={`absolute bottom-5 left-0 right-0 h-px bg-gradient-to-r from-transparent ${style.groundLine1} to-transparent`}
            />
            <div
              className={`absolute bottom-4 left-0 right-0 h-px ${style.groundLine2}`}
            />

            {/* Trail texture */}
            <div
              className="absolute bottom-4 left-0 right-0 h-2 opacity-20 motion-reduce:animate-none"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, ${style.textureColor} 0px, ${style.textureColor} 3px, transparent 3px, transparent 18px)`,
                animation: "scrollGround 2.2s linear infinite",
              }}
            />

            {/* Dino */}
            <div
              ref={dinoRef}
              className="absolute bottom-3 left-0 will-change-transform"
            >
              <div ref={dinoFlipRef} style={{ transform: "translateX(-50%)" }}>
                <svg
                  width="68"
                  height="68"
                  viewBox="0 0 28 26"
                  fill="currentColor"
                  className={`${style.dinoColor} transition-colors duration-300`}
                  style={{ imageRendering: "pixelated" }}
                >
                  {/* Body */}
                  <rect x="13" y="1" width="9" height="6" />
                  <rect x="15" y="0" width="4" height="2" />
                  <rect
                    x="17"
                    y="3"
                    width="1.5"
                    height="1.5"
                    className={style.eyeFill}
                  />
                  <rect x="20" y="6" width="5" height="2" />
                  <rect x="18" y="8" width="6" height="2" />
                  <rect x="12" y="7" width="4" height="5" />
                  <rect x="7" y="10" width="12" height="7" />
                  <rect x="3" y="12" width="6" height="3" />
                  <rect x="2" y="14" width="4" height="2" />
                  <rect x="15" y="12" width="3" height="1.5" />
                  <rect x="16" y="13.5" width="1.5" height="1.5" />

                  {/* Legs — frame A */}
                  <g ref={dinoLegA}>
                    <rect x="9" y="17" width="2.5" height="6" />
                    <rect x="8" y="22" width="4" height="1.5" />
                    <rect x="14" y="17" width="2.5" height="4" />
                  </g>
                  {/* Legs — frame B */}
                  <g ref={dinoLegB} style={{ display: "none" }}>
                    <rect x="9" y="17" width="2.5" height="4" />
                    <rect x="14" y="17" width="2.5" height="6" />
                    <rect x="13" y="22" width="4" height="1.5" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Human */}
            <div
              ref={humanRef}
              className="absolute bottom-3 left-0 will-change-transform"
            >
              <div ref={humanFlipRef} style={{ transform: "translateX(-50%)" }}>
                <svg
                  width="32"
                  height="44"
                  viewBox="0 0 14 22"
                  fill="currentColor"
                  className={`${style.humanColor} transition-colors duration-300`}
                >
                  <rect x="3" y="0" width="8" height="7" rx="3" />
                  <rect x="4" y="7" width="6" height="7" />

                  {/* Limbs — frame A */}
                  <g ref={humanLegA}>
                    <rect x="1" y="8" width="3" height="2" />
                    <rect x="10" y="11" width="3" height="2" />
                    <rect x="4" y="14" width="2" height="6" />
                    <rect x="8" y="14" width="2" height="5" />
                  </g>
                  {/* Limbs — frame B */}
                  <g ref={humanLegB} style={{ display: "none" }}>
                    <rect x="10" y="8" width="3" height="2" />
                    <rect x="1" y="11" width="3" height="2" />
                    <rect x="4" y="14" width="2" height="5" />
                    <rect x="8" y="14" width="2" height="6" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Dust — fixed recycled pool, animated via WAAPI */}
            {Array.from({ length: DUST_POOL }).map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  dustNodes.current[i] = el;
                }}
                className={`pointer-events-none absolute h-1 w-1 rounded-full ${style.dustColor}`}
                style={{ left: 0, top: "70%", opacity: 0 }}
              />
            ))}
          </div>

          {/* Credit */}
          <div className="flex justify-end">
            <p
              className={`text-[8px] tracking-wider ${style.textColor}`}
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              built with{" "}
              <span className="text-rose-500 motion-safe:animate-pulse">
                &lt;3
              </span>{" "}
              by <span className={style.signature}>eshan with 🦖</span>
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes scrollGround {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            * {
              animation: none !important;
            }
          }
        `}</style>
      </footer>
    </>
  );
}