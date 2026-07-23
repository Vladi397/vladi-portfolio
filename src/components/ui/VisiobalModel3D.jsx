import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useTranslation } from "react-i18next";

/*
  VisiobalModel3D
  ---------------
  A rotating 3D recreation of the Visiobal ball. There is no CAD file for the
  print, so the model is built procedurally from the hardware photo: an FDM
  printed shell with a big circular mouth, a ring of slots on the band around
  it, and honeycomb perforations over the flanks — punched out with an alpha
  map rather than boolean geometry (one sphere, no CSG, cheap). Inside sits the
  housing with the speaker (chrome rim + black cone), the AA battery pack, and
  the tri-spoke struts that bridge housing to shell.

  Used by ProjectExpand when a project sets galleryLayout: "model3d".

  Perf follows UniverseBackground: LOW_END trims the pixel ratio, the frameloop
  stops whenever the canvas is off-screen, reduced-motion holds it still, and no
  WebGL falls back to the photo.
*/

// Colours sampled from the actual print.
const SHELL = "#d2485f";
const INNER = "#bb3d58";
const CHROME = "#c9ced6";

// Same rough low-end detection UniverseBackground uses.
const LOW_END = (() => {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency || 8;
  const mem = navigator.deviceMemory; // undefined outside Chromium
  return cores <= 4 || (mem !== undefined && mem <= 4);
})();

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

/*
  The shell cut-outs, as an alpha map: white keeps material, black is a hole
  (alphaTest, so the edges stay crisp and there is no transparency sorting).
  On a 2:1 canvas an equatorial circle maps to a real circle on the sphere, so
  the mouth is drawn as a plain arc. u = 0.5 lands on +X, and the mesh is turned
  a quarter turn so the mouth ends up facing the camera.
*/
function makeShellAlpha() {
  const W = 2048;
  const H = 1024;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#000000";

  const cx = W / 2;
  const cy = H / 2;
  // How much longitude is squeezed at this row — keeps polar holes round.
  const lat = (y) => Math.max(0.3, Math.sin((y / H) * Math.PI));

  // The mouth.
  ctx.beginPath();
  ctx.arc(cx, cy, 248, 0, Math.PI * 2);
  ctx.fill();

  // Ring of tangential slots on the band around the mouth.
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.32;
    ctx.save();
    ctx.translate(cx + Math.cos(a) * 352, cy + Math.sin(a) * 352);
    ctx.rotate(a);
    roundRect(ctx, -26, -60, 52, 120, 20);
    ctx.restore();
  }

  // The honeycomb vent: a single patch on the back, the way the real print has
  // one mesh region rather than holes all over. The mouth sits at u=0.5, so its
  // antipode is the canvas seam — measure from there, wrapping in x.
  const step = 40;
  let row = 0;
  for (let y = H * 0.2; y <= H * 0.8; y += step * 0.87, row++) {
    for (let x = row % 2 ? step / 2 : 0; x < W; x += step) {
      if (Math.hypot(Math.min(x, W - x), y - cy) > 340) continue;
      ctx.beginPath();
      ctx.ellipse(x, y, 9 / lat(y), 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

// Fine horizontal ridges — the FDM layer lines that make it read as printed.
function makeLayerBump() {
  const H = 256;
  const c = document.createElement("canvas");
  c.width = 2;
  c.height = H;
  const ctx = c.getContext("2d");
  for (let y = 0; y < H; y++) {
    const v = Math.round(132 + Math.sin((y / H) * Math.PI * 2 * 64) * 30);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(0, y, 2, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

function Ball({ reduced }) {
  const group = useRef();
  const alphaMap = useMemo(() => makeShellAlpha(), []);
  const bump = useMemo(() => makeLayerBump(), []);

  // Dispose the generated textures when the card closes.
  useEffect(() => () => {
    alphaMap.dispose();
    bump.dispose();
  }, [alphaMap, bump]);

  useFrame((_, delta) => {
    if (reduced || !group.current) return;
    group.current.rotation.y += delta * 0.34;
  });

  // Three struts bridging the housing to the shell, 120° apart.
  const struts = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

  return (
    <group ref={group} rotation={[0.2, 0, 0.1]}>
      {/* Printed shell. Turned a quarter turn so the mouth faces the camera. */}
      <mesh rotation={[0, -Math.PI / 2, 0]}>
        <sphereGeometry args={[1.6, 96, 64]} />
        <meshStandardMaterial
          color={SHELL}
          alphaMap={alphaMap}
          alphaTest={0.5}
          side={THREE.DoubleSide}
          roughness={0.86}
          metalness={0.02}
          bumpMap={bump}
          bumpScale={0.01}
        />
      </mesh>

      {/* Inner housing that carries the speaker. */}
      <mesh>
        <sphereGeometry args={[0.98, 64, 48]} />
        <meshStandardMaterial color={INNER} roughness={0.9} bumpMap={bump} bumpScale={0.007} />
      </mesh>

      {/* Speaker on the front of the housing: chrome rim, dark basket, cone. */}
      <group position={[0, 0, 0.9]}>
        <mesh>
          <torusGeometry args={[0.3, 0.045, 16, 48]} />
          <meshStandardMaterial color={CHROME} metalness={0.95} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0, -0.04]}>
          <cylinderGeometry args={[0.29, 0.29, 0.08, 40]} />
          <meshStandardMaterial color="#1b1b20" roughness={0.5} metalness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.17, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
          <meshStandardMaterial color="#141418" roughness={0.34} metalness={0.5} />
        </mesh>
      </group>

      {/* AA battery pack tucked up inside, visible through the mouth. */}
      <group position={[0.05, 1.02, 0.42]} rotation={[0.35, 0, 0.12]}>
        <mesh>
          <boxGeometry args={[0.52, 0.1, 0.3]} />
          <meshStandardMaterial color="#15151a" roughness={0.6} />
        </mesh>
        {[-0.1, 0, 0.1].map((z) => (
          <mesh key={z} position={[0, 0.11, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.44, 20]} />
            <meshStandardMaterial color="#8dc63f" roughness={0.45} metalness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Tri-spoke struts. */}
      {struts.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0.28]} rotation={[0, 0, a]}>
          {/* spans housing (0.98) toward the shell — the far corner must stay
              inside radius 1.6, counting its z depth, or it pokes through */}
          <boxGeometry args={[0.5, 0.12, 0.46]} />
          <meshStandardMaterial color={SHELL} roughness={0.88} bumpMap={bump} bumpScale={0.007} />
        </mesh>
      ))}
    </group>
  );
}

export default function VisiobalModel3D({ fallbackImage, title }) {
  const { t } = useTranslation();
  const wrapRef = useRef(null);
  const [paused, setPaused] = useState(true); // starts parked until scrolled to
  const [webgl] = useState(supportsWebGL);
  const [lost, setLost] = useState(false);
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  // Dragging to spin is a nice touch with a mouse, but on touch it would eat
  // the page scroll — so it is pointer:fine only.
  const [canDrag] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: fine)").matches
  );

  // Only burn frames while the ball is actually on screen.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setPaused(!e.isIntersecting)),
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const frame = "rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl shadow-slate-900/5 dark:shadow-black/40 overflow-hidden";

  // No WebGL (or the GPU dropped the context): show the photo instead.
  if (!webgl || lost) {
    return (
      <figure className={`${frame} bg-gray-50 dark:bg-white/[0.03]`}>
        <img src={fallbackImage} alt={title} loading="lazy" decoding="async" className="block w-full h-auto" />
      </figure>
    );
  }

  return (
    <figure ref={wrapRef} className={`${frame} relative bg-gradient-to-b from-slate-900 to-slate-950`}>
      <div className="h-[340px] sm:h-[460px] lg:h-[520px]">
        <Canvas
          camera={{ position: [0, 0, 5.6], fov: 40 }}
          dpr={LOW_END ? 1 : [1, 1.75]}
          gl={{ antialias: !LOW_END, powerPreference: "high-performance", stencil: false }}
          frameloop={paused ? "never" : "always"}
          onCreated={({ gl }) =>
            gl.domElement.addEventListener("webglcontextlost", () => setLost(true), { once: true })
          }
        >
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 5, 6]} intensity={2.1} />
          {/* Violet rim light, picking up the Visiobal palette. */}
          <directionalLight position={[-5, -2, -3]} intensity={0.8} color="#a855f7" />
          {/* Warm glow from inside, spilling through the perforations. */}
          <pointLight position={[0, 0, 0]} intensity={1.4} distance={3.4} color="#ff8fb0" />

          <Ball reduced={reduced} />

          {canDrag && (
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableDamping
              dampingFactor={0.08}
              rotateSpeed={0.6}
            />
          )}
        </Canvas>
      </div>

      {canDrag && (
        <figcaption className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
          {t("projects.detail_drag", "Drag to spin")}
        </figcaption>
      )}
    </figure>
  );
}
