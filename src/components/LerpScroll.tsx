"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const lerp = (current: number, target: number, factor: number) =>
  current + (target - current) * factor;

export default function LerpScroll({ children }: { children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const currentY = useRef(0);
  const targetY = useRef(0);
  const rafId = useRef<number | null>(null);
  const touchState = useRef({ lastY: 0 });
  const animateRef = useRef<() => void>(() => {});
  const shouldReduce = useReducedMotion();
  const [progress, setProgress] = useState(0);

  function getMax() {
    if (!contentRef.current) return 0;
    return Math.max(0, contentRef.current.scrollHeight - window.innerHeight);
  }

  function start() {
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(animateRef.current);
    }
  }

  useEffect(() => {
    animateRef.current = () => {
      const max = getMax();
      targetY.current = Math.max(0, Math.min(targetY.current, max));

      const diff = targetY.current - currentY.current;

      if (Math.abs(diff) < 0.5) {
        currentY.current = targetY.current;
        rafId.current = null;
      } else {
        const factor = Math.min(0.09, 0.05 + Math.abs(diff) * 0.0003);
        currentY.current = lerp(currentY.current, targetY.current, factor);
      }

      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${-currentY.current}px, 0)`;
      }

      setProgress(max > 0 ? currentY.current / max : 0);

      if (rafId.current !== null) {
        rafId.current = requestAnimationFrame(animateRef.current);
      }
    };
  });

  useEffect(() => {
    if (shouldReduce) return;

    const max = getMax();
    targetY.current = Math.min(targetY.current, max);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetY.current += e.deltaY;
      start();
    };

    const onKey = (e: KeyboardEvent) => {
      const actions: Record<string, number> = {
        ArrowDown: 100,
        ArrowUp: -100,
        PageDown: window.innerHeight * 0.8,
        PageUp: -window.innerHeight * 0.8,
      };
      const d = actions[e.key];
      if (d !== undefined) {
        e.preventDefault();
        targetY.current += d;
        start();
      } else if (e.key === "Home") {
        e.preventDefault();
        targetY.current = 0;
        start();
      } else if (e.key === "End") {
        e.preventDefault();
        targetY.current = getMax();
        start();
      } else if (
        e.key === " " &&
        document.activeElement === document.body
      ) {
        e.preventDefault();
        targetY.current += window.innerHeight * 0.8;
        start();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchState.current.lastY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = touchState.current.lastY - e.touches[0].clientY;
      touchState.current.lastY = e.touches[0].clientY;
      targetY.current += dy;
      start();
    };

    const onResize = () => {
      targetY.current = Math.min(targetY.current, getMax());
      start();
    };

    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
    document.body.style.touchAction = "none";

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("resize", onResize);

    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        targetY.current = rect.top + currentY.current;
        start();
      }
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.body.style.touchAction = "";
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [shouldReduce]);

  return (
    <>
      <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div
          ref={contentRef}
          className="will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          {children}
        </div>
      </div>
      {!shouldReduce && (
        <div
          className="fixed right-3 top-1/2 z-50 h-24 w-1 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: "rgba(0,0,0,0.12)" }}
        >
          <div
            className="w-full rounded-full bg-emerald-500 transition-all duration-150"
            style={{ height: `${Math.max(4, progress * 100)}%` }}
          />
        </div>
      )}
    </>
  );
}
