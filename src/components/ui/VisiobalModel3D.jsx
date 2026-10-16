import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useTranslation } from "react-i18next";

/*
  VisiobalModel3D
  ---------------
  A rotating 3D recreation of the Visiobal ball. There is no CAD file for the
  print, so the model is built procedurally: a printed shell perforated evenly
  all the way around, with the inner core showing through the holes. The holes
  are punched with an alpha map rather than boolean geometry — one sphere, no
  CSG, cheap to draw.

  Used by ProjectExpand when a project sets galleryLayout: "model3d". It renders
  frameless on a transparent canvas so the ball sits on the page rather than in
  a panel.

  Perf follows UniverseBackground: LOW_END trims the pixel ratio, the frameloop
  stops whenever the canvas is off-screen, reduced-motion holds it still, and no
  WebGL falls back to the photo.

  Spinning it by hand works on both: a mouse drags it through OrbitControls, and
  a finger flicks it horizontally. The touch version is hand-rolled rather than
  OrbitControls' own because OrbitControls swallows every gesture on the canvas,
  including the vertical ones that are the visitor trying to scroll the page —
  which is why touch dragging was switched off here in the first place.
*/

// Colours sampled from the actual print.
const SHELL = "#d2485f";
const INNER = "#bb3d58";

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

/*
  The shell perforation, as an alpha map: white keeps material, black is a hole
  (alphaTest, so edges stay crisp with no transparency sorting).

  Holes cover the whole ball evenly. A plain rectangular grid would bunch up and
  smear near the poles, so instead the count per ring follows sin(theta) and each
  hole is widened in u by 1/sin(theta) — that keeps them round and evenly spaced
  from pole to pole.
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

  const ROWS = 26; // rings of holes, pole to pole
  const AROUND = 48; // holes around the equator
  const R = 11; // hole radius in texture pixels

  const dot = (x, y, rx) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, R, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  for (let i = 0; i < ROWS; i++) {
    const v = (i + 0.5) / ROWS;
    const theta = v * Math.PI; // 0 at the north pole
    const s = Math.sin(theta);
    const n = Math.max(1, Math.round(AROUND * s));
    const y = v * H;
    const rx = R / Math.max(0.1, s);
    for (let j = 0; j < n; j++) {
      const x = ((j + (i % 2) * 0.5) / n) * W;
      dot(x, y, rx);
      // A hole straddling the seam has to be drawn from the other side too.
      if (x + rx > W) dot(x - W, y, rx);
      else if (x - rx < 0) dot(x + W, y, rx);
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

function Ball({ reduced, takeFlick }) {
  const group = useRef();
  const vel = useRef(0); // rad/s of hand-applied spin, on top of the idle turn
  const alphaMap = useMemo(() => makeShellAlpha(), []);
  const bump = useMemo(() => makeLayerBump(), []);

  // Dispose the generated textures when the card closes.
  useEffect(
    () => () => {
      alphaMap.dispose();
      bump.dispose();
    },
    [alphaMap, bump]
  );

  // Idle spin, plus whatever the last flick added. The flick decays
  // exponentially so a hard swipe coasts for about half a second and then hands
  // the ball back to its steady turn.
  useFrame((_, delta) => {
    if (!group.current) return;
    if (takeFlick) vel.current += takeFlick(); // whatever the finger just added
    const flick = vel.current;
    if (reduced) {
      // Reduced motion: no idle turn, but a deliberate swipe is still obeyed.
      if (flick) group.current.rotation.y += flick * delta;
    } else {
      group.current.rotation.y += (0.34 + flick) * delta;
    }
    if (flick) {
      vel.current = Math.abs(flick) < 0.01 ? 0 : flick * Math.exp(-delta * 2.6);
    }
  });

  // Three struts bridging the core to the shell, 120° apart.
  const struts = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

  return (
    <group ref={group} rotation={[0.2, 0, 0.1]}>
      {/* Printed shell, perforated all the way around. */}
      <mesh>
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

      {/* Inner core, seen through the holes. */}
      <mesh>
        <sphereGeometry args={[0.98, 64, 48]} />
        <meshStandardMaterial color={INNER} roughness={0.9} bumpMap={bump} bumpScale={0.007} />
      </mesh>

      {/* Tri-spoke struts. The far corner must stay inside radius 1.6,
          counting its z depth, or it pokes through the shell. */}
      {struts.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0.28]} rotation={[0, 0, a]}>
          <boxGeometry args={[0.5, 0.12, 0.46]} />
          <meshStandardMaterial color={SHELL} roughness={0.88} bumpMap={bump} bumpScale={0.007} />
        </mesh>
      ))}
    </group>
  );
}

export default function VisiobalModel3D({ fallbackImage, title, ready = true }) {
  const { t } = useTranslation();
  const wrapRef = useRef(null);
  const stageRef = useRef(null); // the box the canvas fills — the swipe target
  const flick = useRef(0); // spin the finger has added but the ball hasn't taken
  const [paused, setPaused] = useState(true); // starts parked until scrolled to

  // The swipe handler banks an impulse here and the ball claims it on its next
  // frame; it owns the decay from then on.
  const takeFlick = useCallback(() => {
    const v = flick.current;
    flick.current = 0;
    return v;
  }, []);
  const [webgl] = useState(supportsWebGL);
  const [lost, setLost] = useState(false);
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  // OrbitControls is mouse-only: it claims every gesture on the canvas, so on a
  // phone it would trap the page scroll. Touch gets the hand-rolled swipe below
  // instead, which only claims the horizontal ones.
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

  /*
    Swipe to spin, on touch only.

    The whole trick is deciding, once per gesture, whether the finger is turning
    the ball or scrolling the page. The first few pixels pick an axis: mostly
    sideways means this gesture is ours and we preventDefault it; mostly
    up/down means it is a scroll and we never touch it again, so the page moves
    exactly as if the ball weren't there. Hence the non-passive listener — we
    have to keep the option of cancelling, but we only ever use it on the
    horizontal gestures.
  */
  useEffect(() => {
    if (canDrag) return undefined; // the mouse has OrbitControls
    const el = stageRef.current;
    if (!el) return undefined;

    const SLOP = 8; // px of travel before committing to an axis
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let axis = null;

    const onStart = (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      startX = lastX = touch.clientX;
      startY = touch.clientY;
      axis = null;
      flick.current = 0; // grab it: kill the coast from the previous flick
    };

    const onMove = (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      if (!axis) {
        const dx = Math.abs(touch.clientX - startX);
        const dy = Math.abs(touch.clientY - startY);
        if (dx < SLOP && dy < SLOP) return; // too early to tell
        axis = dx > dy ? "x" : "y";
      }
      if (axis !== "x") return; // a scroll — leave it completely alone
      e.preventDefault();
      const step = touch.clientX - lastX;
      lastX = touch.clientX;
      // px of drag → rad/s, clamped so a frantic swipe can't blur the ball.
      flick.current = Math.max(-14, Math.min(14, flick.current + step * 0.07));
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
    };
  }, [canDrag]);

  // No WebGL (or the GPU dropped the context): show the photo instead.
  if (!webgl || lost) {
    return (
      <figure className="rounded-2xl sm:rounded-3xl overflow-hidden">
        <img src={fallbackImage} alt={title} loading="lazy" decoding="async" className="block w-full h-auto" />
      </figure>
    );
  }

  return (
    // No frame, no fill: the ball floats on the page.
    <figure ref={wrapRef} className="relative">
      {/* The canvas measures itself with getBoundingClientRect, so mounting it
          while the detail panel is still scaling up from the card gives it the
          card-sized viewport and the ball renders small until something forces
          a re-measure. Wait for the flip to land. */}
      <div
        ref={stageRef}
        className="h-[340px] sm:h-[460px] lg:h-[520px]"
        // Let the browser keep vertical panning (the page scroll) while the
        // horizontal axis is left to the swipe handler.
        style={canDrag ? undefined : { touchAction: "pan-y" }}
      >
        {!ready ? null : (
        <Canvas
          camera={{ position: [0, 0, 5.6], fov: 40 }}
          dpr={LOW_END ? 1 : [1, 1.75]}
          gl={{
            alpha: true, // transparent clear — the page shows through
            antialias: !LOW_END,
            powerPreference: "high-performance",
            stencil: false,
          }}
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

          <Ball reduced={reduced} takeFlick={canDrag ? undefined : takeFlick} />

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
        )}
      </div>

      <figcaption className="pointer-events-none absolute bottom-1 left-0 right-0 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400/80 dark:text-white/35">
        {canDrag
          ? t("projects.detail_drag", "Drag to spin")
          : t("projects.detail_swipe", "Swipe to spin")}
      </figcaption>
    </figure>
  );
}
