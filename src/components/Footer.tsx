"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import { useTheme } from "next-themes";

const COMMANDS = [
  { cmd: "whoami", output: "Eshan. AI engineer. Professional bug collector." },
  { cmd: "cat about/skills", output: "Machine Learning · Computer Vision · React · SQL · Coffee" },
  { cmd: "git status", output: "On branch main. Still debugging life." },
  { cmd: "echo $CURRENT_MOOD", output: "training... epoch 937/∞" },
  { cmd: "sudo make me famous", output: "Permission denied." },
  { cmd: "python train.py", output: "GPU: crying. Fan: screaming." },
  { cmd: "ls publications/", output: "Springer said yes. Reviewer #2 said no." },
  { cmd: "grep -r 'motivation' .", output: "Found in coffee.txt" },
  { cmd: "nvidia-smi", output: "VRAM full. Dreams larger." },
  { cmd: "cv --detect-plate", output: "License plate found. Driver still missing." },
  { cmd: "cat /dev/brain", output: "Loading... please wait." },
  { cmd: "ping reality", output: "Request timed out." },
  { cmd: "history | tail -5", output: "git commit, train model, fix bug, break model, repeat." },
  { cmd: "echo $LOCATION", output: "Probably somewhere between Vilnius and Stack Overflow." },
  { cmd: "uptime", output: "Building weird things since 2019." },
  { cmd: "rm -rf bugs", output: "Nice try." },
  { cmd: "find . -name 'free_time'", output: "No such file or directory." },
  { cmd: "docker ps", output: "Running: 12 containers. Sleeping: 0 hours." },
  { cmd: "paper publish", output: "Waiting for Reviewer #2..." },
  { cmd: "fortune", output: "Your next model will converge. Probably." }
];

const CURSOR_BLINK_MS = 530;
const TYPING_SPEED_MS = 65;
const POST_TYPING_DELAY_MS = 500;
const OUTPUT_DURATION_MS = 3500;
const CLEAR_DURATION_MS = 300;

type Phase = "typing" | "waiting" | "output" | "clear";
type ThemeName = "dark" | "light" | "forest";

const THEME: Record<
  ThemeName,
  {
    bg: string;
    border: string;
    text: string;
    prompt: string;
    output: string;
    cursor: string;
    glow: string;
    scanLine: string;
  }
> = {
  dark: {
    bg: "bg-zinc-950",
    border: "border-zinc-800",
    text: "text-zinc-500",
    prompt: "text-emerald-400",
    output: "text-zinc-200",
    cursor: "bg-emerald-400",
    glow: "0 0 16px rgba(52,211,153,0.08)",
    scanLine: "rgba(255,255,255,0.03)",
  },
  light: {
    bg: "bg-zinc-900",
    border: "border-zinc-700",
    text: "text-zinc-400",
    prompt: "text-emerald-400",
    output: "text-zinc-100",
    cursor: "bg-emerald-400",
    glow: "0 2px 12px rgba(0,0,0,0.1)",
    scanLine: "rgba(255,255,255,0.04)",
  },
  forest: {
    bg: "bg-[#0a1a0f]",
    border: "border-[#1a3a22]",
    text: "text-[#4a8b5a]",
    prompt: "text-emerald-300",
    output: "text-[#d4edda]",
    cursor: "bg-emerald-300",
    glow: "0 0 16px rgba(16,185,129,0.1)",
    scanLine: "rgba(255,255,255,0.03)",
  },
};

export default function Footer() {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const theme: ThemeName =
    mounted && ["dark", "light", "forest"].includes(resolvedTheme ?? "")
      ? (resolvedTheme as ThemeName)
      : "dark";
  const s = THEME[theme];

  const [cmdIdx, setCmdIdx] = useState(0);
  const [typed, setTyped] = useState(0);
  const [showOutput, setShowOutput] = useState(false);
  const [cursor, setCursor] = useState(true);
  const [phase, setPhase] = useState<Phase>("typing");
  const [isReduced, setIsReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const current = COMMANDS[cmdIdx];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setIsReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isReduced) return;
    const id = setInterval(() => setCursor((c) => !c), CURSOR_BLINK_MS);
    return () => clearInterval(id);
  }, [isReduced]);

  useEffect(() => {
    if (isReduced) return;

    let timer: ReturnType<typeof setTimeout>;

    switch (phase) {
      case "typing":
        if (typed < current.cmd.length) {
          timer = setTimeout(() => setTyped((t) => t + 1), TYPING_SPEED_MS);
        } else {
          timer = setTimeout(
            () => setPhase("waiting"),
            POST_TYPING_DELAY_MS,
          );
        }
        break;
      case "waiting":
        timer = setTimeout(() => {
          setShowOutput(true);
          setPhase("output");
        }, 500);
        break;
      case "output":
        timer = setTimeout(() => setPhase("clear"), OUTPUT_DURATION_MS);
        break;
      case "clear":
        timer = setTimeout(() => {
          setCmdIdx((i) => (i + 1) % COMMANDS.length);
          setTyped(0);
          setShowOutput(false);
          setPhase("typing");
        }, CLEAR_DURATION_MS);
        break;
    }

    return () => clearTimeout(timer);
  }, [phase, typed, current.cmd.length, isReduced]);

  const displayCmd = isReduced
    ? current.cmd
    : current.cmd.slice(0, typed);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <footer
        className={`relative w-full overflow-hidden border-t py-5 transition-colors duration-300 ${s.border} ${mounted ? s.bg : "bg-zinc-950"}`}
      >
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 1px, ${s.scanLine} 1px, ${s.scanLine} 2px)`,
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div
            className={`rounded-lg border overflow-hidden ${s.border}`}
            style={{ boxShadow: s.glow }}
          >
            <div
              className={`flex items-center border-b ${s.border} px-3 py-1 ${s.bg}`}
            >
              <div className="flex gap-1.5">
                {["#ff5f56", "#ffbd2e", "#27c93f"].map((c, i) => (
                  <div
                    key={i}
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <span
                className={`ml-3 text-[10px] font-medium tracking-wide ${s.text}`}
              >
                eshan@portfolio:~
              </span>
            </div>

            <div className="min-h-[3.25rem] px-4 py-2 font-mono text-sm leading-relaxed flex flex-col justify-center">
              <div className="flex items-baseline gap-2">
                <span
                  className={`shrink-0 select-none font-medium ${s.prompt}`}
                >
                  $
                </span>
                <span className={s.output}>{displayCmd}</span>
                {(phase === "typing" || phase === "waiting") && cursor && (
                  <span
                    className={`inline-block w-[0.55em] h-[1.1em] translate-y-0.5 ${s.cursor}`}
                  />
                )}
              </div>
              {showOutput && (
                <div className={`mt-1 flex gap-2 ${s.text}`}>
                  <span className="select-none opacity-40">&rarr;</span>
                  <span>{current.output}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 flex justify-end">
            <p className={`font-mono text-[10px] tracking-wider ${s.text}`}>
              built with{" "}
              <span className="motion-safe:animate-pulse text-rose-400">
                &lt;3
              </span>{" "}
              by eshan
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
