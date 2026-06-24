"use client";

/* ------------------------------------------------------------------ *
 *  Happy Mac — a love letter to the 1984 Macintosh                    *
 * ------------------------------------------------------------------ *
 *  Deps (in your app):
 *    npm i three @react-three/fiber @react-three/drei @react-three/postprocessing
 *
 *  The <EffectComposer> block is self-contained — delete it and the
 *  scene still renders (you just lose bloom/vignette).
 *
 *  Signature moment: the CRT "powers on" — the screen scales up from a
 *  hairline with a brightness flash, then the Happy Mac fades in and
 *  blinks occasionally. Everything else stays quiet on purpose.
 * ------------------------------------------------------------------ */

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  ContactShadows,
  RoundedBox,
  Float,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing";
import * as THREE from "three";

/* ---- design tokens ------------------------------------------------ */
const BEIGE = "#e7e4d4";
const BEIGE_LIGHT = "#efece0";
const BEIGE_DARK = "#cfccb9";
const BEIGE_SHADOW = "#b6b2a0";
const PHOSPHOR_A = "#dcd9f4";
const PHOSPHOR_B = "#a7a3d6";
const INK = "#191921";

/* ================================================================== *
 *  Screen content — phosphor lavender + crisp pixel Happy Mac face    *
 * ================================================================== */
function useScreen() {
  return useMemo(() => {
    const W = 512;
    const H = 410;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d")!;

    const draw = (blink: boolean) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, PHOSPHOR_A);
      g.addColorStop(0.55, "#bcb8e6");
      g.addColorStop(1, PHOSPHOR_B);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      const glow = ctx.createRadialGradient(W / 2, 110, 20, W / 2, 110, 320);
      glow.addColorStop(0, "rgba(255,255,255,0.22)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      ctx.globalAlpha = 0.05;
      ctx.fillStyle = "#000";
      for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
      ctx.globalAlpha = 1;

      // ---- pixel face (centered) ----
      const px = (x: number, y: number, w: number, h: number) => ctx.fillRect(x, y, w, h);
      ctx.fillStyle = INK;
      const cx = W / 2;
      const top = 120;

      if (blink) {
        px(cx - 120, top + 22, 56, 12);
        px(cx + 64, top + 22, 56, 12);
      } else {
        px(cx - 120, top, 56, 56);
        px(cx + 64, top, 56, 56);
      }
      // nose
      px(cx - 14, top + 64, 30, 92);
      px(cx - 62, top + 128, 48, 28);
      // smile
      px(cx - 118, top + 184, 34, 28);
      px(cx - 86, top + 212, 172, 28);
      px(cx + 84, top + 184, 34, 28);

      // inner vignette so the tube reads as curved
      const v = ctx.createRadialGradient(cx, H / 2, H * 0.25, cx, H / 2, H * 0.72);
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(20,16,40,0.45)");
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, W, H);
    };

    draw(false);

    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return { tex, draw };
  }, []);
}

/* ================================================================== *
 *  Rainbow six-color Apple logo                                       *
 * ================================================================== */
function useAppleTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 300;
    const ctx = c.getContext("2d")!;
    const apple = new Path2D(
      "M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C32.3 141.2 0 184.8 0 244.7c0 24.5 4.5 49.8 13.5 75.9 12 34.4 55.3 118.9 100.5 117.5 23.6-.6 40.3-16.8 71-16.8 29.8 0 45.3 16.8 71.5 16.8 45.6-.7 84.8-77.5 96.2-112-61.1-28.8-58.9-84.4-58.9-85.4zm-52.5-156.5c25.3-30 23-57.3 22.3-67.1-22.4 1.3-48.3 15.3-63 32.5-16.2 18.5-25.7 41.4-23.7 65.9 24.2 1.9 46.3-10.5 64.4-31.3z"
    );
    ctx.save();
    ctx.translate(18, 8);
    ctx.scale(0.6, 0.6);
    ctx.clip(apple);
    const bands: [string, number, number][] = [
      ["#5fb04a", 38, 70],
      ["#f6b322", 108, 68],
      ["#f08321", 176, 68],
      ["#e23c3e", 244, 68],
      ["#963d97", 312, 68],
      ["#0a9ddd", 380, 80],
    ];
    bands.forEach(([col, y, h]) => {
      ctx.fillStyle = col;
      ctx.fillRect(-40, y, 470, h);
    });
    ctx.restore();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

/* ================================================================== *
 *  Geometry helpers                                                   *
 * ================================================================== */

// rounded rectangle path (centered at origin)
function roundRect(p: THREE.Shape | THREE.Path, w: number, h: number, r: number) {
  const x = -w / 2;
  const y = -h / 2;
  p.moveTo(x + r, y);
  p.lineTo(x + w - r, y);
  p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r);
  p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h);
  p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r);
  p.quadraticCurveTo(x, y, x + r, y);
}

// The iconic sloped case as an extruded, bevelled silhouette.
// Returns the geometry AND its real front-face Z so we can mount the
// screen/bezel/logo flush against it instead of guessing.
function useCaseGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.0, -1.62);
    s.lineTo(1.0, -1.62);
    s.lineTo(1.0, 1.28); // vertical front face
    s.lineTo(0.62, 1.5);
    s.lineTo(-0.86, 1.5);
    s.lineTo(-1.0, 1.36);
    s.lineTo(-1.0, -1.62);

    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 2.32,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.07,
      bevelSegments: 5,
      steps: 1,
      curveSegments: 8,
    });
    geo.rotateY(-Math.PI / 2);
    geo.center();
    geo.computeBoundingBox();
    geo.computeVertexNormals();
    const frontZ = geo.boundingBox!.max.z;
    return { geo, frontZ };
  }, []);
}

// Recessed bezel: an extruded rounded frame with a rounded hole.
function useBezelGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    roundRect(shape, 2.0, 1.68, 0.13);
    const hole = new THREE.Path();
    roundRect(hole, 1.72, 1.4, 0.08);
    shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 3,
      steps: 1,
    });
    geo.computeVertexNormals();
    return geo;
  }, []);
}

// Gently domed plane so the CRT reads as glass, not a sticker.
function useCurvedPlane(w: number, h: number, bulge: number, seg = 24) {
  return useMemo(() => {
    const geo = new THREE.PlaneGeometry(w, h, seg, seg);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const nx = p.getX(i) / (w / 2);
      const ny = p.getY(i) / (h / 2);
      p.setZ(i, bulge * (1 - nx * nx) * (1 - ny * ny));
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [w, h, bulge, seg]);
}

/* ================================================================== *
 *  The Mac                                                            *
 * ================================================================== */
function HappyMac() {
  const tilt = useRef<THREE.Group>(null);
  const screenGroup = useRef<THREE.Group>(null);
  const screenMat = useRef<THREE.MeshBasicMaterial>(null);
  const ledMat = useRef<THREE.MeshStandardMaterial>(null);

  const { geo: caseGeo, frontZ } = useCaseGeometry();
  const bezelGeo = useBezelGeometry();
  const screenGeo = useCurvedPlane(1.62, 1.32, 0.05);
  const glassGeo = useCurvedPlane(1.7, 1.4, 0.08);
  const { tex: screenTex, draw } = useScreen();
  const appleTex = useAppleTexture();

  // front-mount reference planes (relative to the real case face)
  const FACE = frontZ + 0.002; // flush parts (logo, slot, seam)
  const SY = 0.46; // screen vertical center

  const start = useRef<number | null>(null);
  const blink = useRef({ on: false, next: 2.5 });

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (start.current === null) start.current = t;
    const age = t - start.current;

    if (tilt.current) {
      const tx = -state.pointer.y * 0.1;
      const ty = state.pointer.x * 0.22;
      tilt.current.rotation.x = THREE.MathUtils.lerp(tilt.current.rotation.x, tx, 0.06);
      tilt.current.rotation.y = THREE.MathUtils.lerp(tilt.current.rotation.y, ty, 0.06);
    }

    // CRT power-on: scale up from a hairline with an overshoot
    if (screenGroup.current) {
      const k = THREE.MathUtils.clamp((age - 0.35) / 0.55, 0, 1);
      const eased = k < 1 ? 1 - Math.pow(1 - k, 3) : 1;
      const overshoot = 1 + Math.sin(k * Math.PI) * 0.06;
      screenGroup.current.scale.y = Math.max(0.012, eased * overshoot);
      screenGroup.current.scale.x = THREE.MathUtils.lerp(0.985, 1, eased);
    }

    // brightness: power-on flash, then gentle breathing + flicker
    if (screenMat.current) {
      const flash = age < 0.35 ? 0 : age < 0.5 ? 1.3 : 1;
      const breathe = 0.95 + Math.sin(t * 2.1) * 0.015;
      const flicker = Math.random() < 0.015 ? -0.05 : 0;
      screenMat.current.color.setScalar(flash * breathe + flicker);
    }

    // blink
    if (age > 1) {
      const b = blink.current;
      if (!b.on && t > b.next) {
        b.on = true;
        draw(true);
        screenTex.needsUpdate = true;
        b.next = t + 0.12;
      } else if (b.on && t > b.next) {
        b.on = false;
        draw(false);
        screenTex.needsUpdate = true;
        b.next = t + 2.5 + Math.random() * 3.5;
      }
    }

    if (ledMat.current) {
      ledMat.current.emissiveIntensity = 1.4 + Math.sin(t * 1.6) * 0.35;
    }
  });

  return (
    <Float speed={1.3} rotationIntensity={0.15} floatIntensity={0.35} floatingRange={[-0.08, 0.12]}>
      <group ref={tilt} scale={0.9} position={[0, 0.13, 0]}>
        {/* base / foot */}
        <RoundedBox
          args={[2.22, 0.42, 1.86]}
          radius={0.09}
          smoothness={4}
          position={[0, -1.74, -0.04]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={BEIGE_DARK} roughness={0.85} envMapIntensity={0.4} />
        </RoundedBox>

        {/* main case */}
        <mesh geometry={caseGeo} castShadow receiveShadow>
          <meshStandardMaterial
            color={BEIGE}
            roughness={0.66}
            metalness={0.02}
            envMapIntensity={0.45}
          />
        </mesh>

        {/* dark CRT cavity seen through the bezel hole */}
        <mesh position={[0, SY, FACE + 0.01]}>
          <planeGeometry args={[1.78, 1.46]} />
          <meshStandardMaterial color="#141319" roughness={0.5} metalness={0.2} />
        </mesh>

        {/* screen + glass — this group "powers on" */}
        <group ref={screenGroup} position={[0, SY, FACE]}>
          <mesh geometry={screenGeo} position={[0, 0, 0.04]}>
            <meshBasicMaterial ref={screenMat} map={screenTex} toneMapped={false} />
          </mesh>
          <mesh geometry={glassGeo} position={[0, 0, 0.085]}>
            <meshPhysicalMaterial
              transparent
              opacity={0.14}
              color="#0c0c12"
              roughness={0.05}
              metalness={0}
              clearcoat={1}
              clearcoatRoughness={0.07}
              ior={1.45}
              envMapIntensity={1.4}
            />
          </mesh>
        </group>

        {/* raised recessed bezel (frame with a hole) */}
        <mesh geometry={bezelGeo} position={[0, SY, FACE]} castShadow>
          <meshStandardMaterial color={BEIGE_LIGHT} roughness={0.6} envMapIntensity={0.5} />
        </mesh>

        {/* seam below the screen */}
        <mesh position={[0, -0.62, FACE]}>
          <boxGeometry args={[2.04, 0.018, 0.02]} />
          <meshStandardMaterial color={BEIGE_SHADOW} roughness={0.85} />
        </mesh>

        {/* floppy slot */}
        <mesh position={[0.36, -0.96, FACE]}>
          <boxGeometry args={[0.96, 0.08, 0.06]} />
          <meshStandardMaterial color="#1c1c22" roughness={0.6} />
        </mesh>

        {/* power LED */}
        <mesh position={[-0.74, -0.96, FACE + 0.01]}>
          <sphereGeometry args={[0.028, 16, 16]} />
          <meshStandardMaterial
            ref={ledMat}
            color="#bff6c4"
            emissive="#5fe07a"
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>

        {/* rainbow Apple logo */}
        <mesh position={[-0.74, -1.02, FACE + 0.005]}>
          <planeGeometry args={[0.32, 0.38]} />
          <meshBasicMaterial map={appleTex} transparent toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

/* ================================================================== *
 *  Scene                                                              *
 * ================================================================== */
export default function VesselCanvas() {
  return (
    <div className="relative h-[500px] w-full overflow-hidden">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(196,176,255,0.28), rgba(255,210,140,0.08) 60%, transparent 75%)",
        }}
      />

      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ position: [0, 0, 6.6], fov: 36 }}
        gl={{
          antialias: false,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[4, 5.5, 6]}
          intensity={1.7}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0002}
        />
        <directionalLight position={[-4, -1, -3]} intensity={0.45} color="#bfe2ff" />
        <directionalLight position={[0, 2, -6]} intensity={0.9} color="#ffe6c2" />

        {/* reflections (no external HDRI / no network) */}
        <Environment resolution={256} frames={1}>
          <color attach="background" args={["#141019"]} />
          <Lightformer form="rect" intensity={1.6} position={[0, 3, 3]} scale={[7, 4, 1]} />
          <Lightformer
            form="rect"
            intensity={1.0}
            color="#cdb8ff"
            position={[-4, 1, 2]}
            scale={[3, 5, 1]}
          />
          <Lightformer
            form="rect"
            intensity={0.9}
            color="#ffd9a8"
            position={[4, 0, 1]}
            scale={[3, 5, 1]}
          />
        </Environment>

        <HappyMac />

        <EffectComposer multisampling={0}>
          <Bloom
            mipmapBlur
            intensity={0.6}
            luminanceThreshold={0.8}
            luminanceSmoothing={0.25}
            radius={0.6}
          />
          <Vignette offset={0.3} darkness={0.7} eskil={false} />
          <SMAA />
        </EffectComposer>
      </Canvas>
    </div>
  );
}