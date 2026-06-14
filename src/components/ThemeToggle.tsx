"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const THEMES = [
  { key: "light",  label: "Light",  icon: "🌤" },
  { key: "dark",   label: "Dark",   icon: "🌙" },
  { key: "forest", label: "Forest", icon: "🌿" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const current = THEMES.find((t) => t.key === theme) ?? THEMES[1];
  const next    = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];

  return (
    <button
      onClick={() => setTheme(next.key)}
      className="
        flex items-center gap-2
        rounded-2xl border border-zinc-200 bg-zinc-100/70 px-4 py-2
        text-sm font-medium transition-all duration-300
        hover:border-emerald-500/40
        dark:border-zinc-800 dark:bg-zinc-900/70
      "
    >
      <span>{current.icon}</span>
      <span>{current.label}</span>
    </button>
  );
}