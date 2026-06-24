"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Canvas } from "@react-three/fiber";
import LeafParticles from "./LeafParticles";

export default function ForestBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || resolvedTheme !== "forest") return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        style={{ width: "100vw", height: "100vh" }}
      >
        <LeafParticles isActive={true} mode="background" />
      </Canvas>
    </div>
  );
}
