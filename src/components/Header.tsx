import ThemeToggle from "./ThemeToggle";
import { Menu } from "lucide-react";

export default function Header() {
  return (
    <header
      className="
        fixed top-0 z-50 w-full
        border-b
        border-zinc-200/40
        bg-white/70
        backdrop-blur-2xl
        transition-all
        duration-300
        dark:border-zinc-900/50
        dark:bg-black/40
      "
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">

        {/* Logo */}
        <a
          href="/"
          className="
            text-xl
            font-semibold
            tracking-tight
            text-zinc-900
            transition
            hover:text-emerald-500
            dark:text-white
          "
        >
          ES
        </a>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Menu Button */}
          <button
            className="
              group
              flex
              items-center
              gap-2
              rounded-2xl
              border
              border-zinc-300
              bg-white/70
              px-5
              py-2.5
              text-sm
              font-medium
              text-zinc-900
              backdrop-blur-xl
              transition-all
              duration-300
              hover:scale-105
              hover:border-emerald-500
              hover:text-emerald-500
              dark:border-zinc-800
              dark:bg-zinc-900/70
              dark:text-white
            "
          >
            <Menu
              size={16}
              className="
                transition-transform
                duration-300
                group-hover:rotate-90
              "
            />
            Menu
          </button>
        </div>
      </div>
    </header>
  );
}