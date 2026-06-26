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

  const current = THEMES.find((t) => t.key === theme) ?? THEMES[0];
  const activeIndex = THEMES.indexOf(current);

  return (
    <div className="relative flex rounded-full border border-zinc-200 bg-zinc-100/70 p-0.5 transition-all duration-300 dark:border-zinc-700 dark:bg-zinc-900/70">
      <div
        className="absolute top-0.5 bottom-0.5 rounded-full bg-white shadow-sm transition-all duration-300 dark:bg-zinc-600"
        style={{
          width: `${100 / THEMES.length}%`,
          left: `${(activeIndex * 100) / THEMES.length}%`,
        }}
      />
      {THEMES.map((t) => {
        const isActive = t.key === theme;
        return (
          <button
            key={t.key}
            onClick={() => setTheme(t.key)}
            className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all duration-300 ${
              isActive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
            aria-label={`Switch to ${t.label} theme`}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}