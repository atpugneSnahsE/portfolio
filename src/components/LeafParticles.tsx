"use client";

import dynamic from "next/dynamic";

const LeafParticlesClient = dynamic(() => import("./LeafParticlesClient"), {
  ssr: false,
});

export default function LeafParticles({ 
  isActive, 
  mode = "swirl" 
}: { 
  isActive: boolean; 
  mode?: "swirl" | "background";
}) {
  return <LeafParticlesClient isActive={isActive} mode={mode} />;
}
