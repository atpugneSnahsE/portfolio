"use client";

import { useEffect, useRef, useState } from "react";

const lines = [
  { text: "> Booting ESHAN.SYS kernel...", delay: 80 },
  { text: "> Loading neural network weights...", delay: 100 },
  { text: "> Initializing quantum core...", delay: 90 },
  { text: "> Calibrating retro encabulator...", delay: 120 },
  { text: "> Establishing secure channel...", delay: 80 },
  { text: "", delay: 50 },
  { text: "> All systems nominal.", delay: 60 },
  { text: "", delay: 40 },
  { text: "> Welcome.", delay: 60 },
  { text: "> Eshan Sengupta", delay: 150, final: true },
];

export default function LoadingScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const [done, setDone] = useState(false);
  const [fading, setFading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const container = containerRef.current;
      if (!container) return;

      for (const line of lines) {
        if (cancelled) return;
        if (!line.text) {
          await sleep(line.delay);
          continue;
        }

        const p = document.createElement("div");
        p.className =
          "text-emerald-500/90";
        container.appendChild(p);

        if (line.final) {
          p.className =
            "text-emerald-400 font-bold text-lg mt-1 tracking-wide";
        }

        for (let i = 0; i < line.text.length; i++) {
          if (cancelled) return;
          p.textContent = line.text.slice(0, i + 1);
          await sleep(8 + Math.random() * 8);
        }

        const cursor = document.createElement("span");
        cursor.className =
          "inline-block w-[2px] h-[1.1em] bg-emerald-500 ml-[2px] align-middle animate-pulse";
        cursor.id = "boot-cursor";
        if (line.final) p.appendChild(cursor);

        await sleep(line.delay);

        const c = document.getElementById("boot-cursor");
        if (c) c.remove();
      }

      if (cancelled) return;
      await sleep(250);
      if (cancelled) return;
      setFading(true);
      await sleep(400);
      if (cancelled) return;
      setDone(true);
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {children}
      {!done && (
        <div
          className={`fixed inset-0 z-[999999] flex items-center justify-center bg-black transition-opacity duration-700 ${
            fading ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="w-full max-w-xl px-6">
            <pre className="mb-8 text-center text-xs text-emerald-600/50 font-mono leading-tight">
{`  ╔══════════════════════════════════╗
  ║     ESHAN SYSTEMS  v2.0.4       ║
  ╚══════════════════════════════════╝`}
            </pre>
            <div
              ref={containerRef}
              className="font-mono text-sm leading-relaxed min-h-[200px]"
            />
            <div className="mt-8 flex items-center gap-3 text-emerald-600/40 text-xs font-mono">
              <span className="animate-pulse">■</span>
              <span>SESSION — PORTFOLIO v2</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
