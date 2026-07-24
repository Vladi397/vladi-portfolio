import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import StaticBackdrop from "./StaticBackdrop";

// Machines with WebGL blocked or broken (old GPUs, remote desktop, strict
// policies) get the static CSS backdrop instead of a crash.
const supportsWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl"))
    );
  } catch {
    return false;
  }
};

// Rough low-end detection (few cores / little RAM). Used to trim pixel count
// and star density on machines that would otherwise drop frames — the scene
// and animations themselves stay identical.
const LOW_END = (() => {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency || 8;
  const mem = navigator.deviceMemory; // undefined outside Chromium
  return cores <= 4 || (mem !== undefined && mem <= 4);
})();

const pickStarCount = () =>
  typeof window !== "undefined" &&
  (window.innerWidth < 768 || window.innerHeight < 520) // phones incl. landscape
    ? 1500
    : LOW_END
      ? 3000
      : 5000;

// --- 1. THE STARS (With Mouse Repulsion) ---
const StarField = ({ count = 5000, theme }) => {
  const ref = useRef();
  const { viewport } = useThree();

  // Built once per mount at the current count — the parent re-keys this whole
  // component when the count changes (breakpoint crossings), so the buffer is
  // always the right size from the first frame.
  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 40 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  });

  const initialPositions = useMemo(() => new Float32Array(positions), [positions]);

  // Idle bookkeeping: the per-star loop + GPU buffer upload only run while the
  // pointer is moving or stars are still drifting home. In steady state the
  // group rotation (a free GPU transform) is the only per-frame work.
  const lastPointer = useRef({ x: NaN, y: NaN });
  const dirtyRef = useRef(false);

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 50;
    ref.current.rotation.y -= delta / 60;

    const mx = state.pointer.x * (viewport.width / 2);
    const my = state.pointer.y * (viewport.height / 2);
    const pointerMoved = mx !== lastPointer.current.x || my !== lastPointer.current.y;
    if (!pointerMoved && !dirtyRef.current) return;
    lastPointer.current.x = mx;
    lastPointer.current.y = my;

    const arr = ref.current.geometry.attributes.position.array;
    let active = false;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = arr[i3];
      const y = arr[i3 + 1];
      const z = arr[i3 + 2];

      const dx = mx - x;
      const dy = my - y;
      const dSq = dx * dx + dy * dy;

      if (dSq < 36) {
        // (dx/dist, dy/dist) is exactly (cos, sin) of the old atan2 — same
        // push, no trig, and sqrt only runs for the few stars near the cursor.
        const dist = Math.sqrt(dSq) || 0.0001;
        const push = ((6 - dist) / 6) * 20 * delta;
        arr[i3] -= (dx / dist) * push;
        arr[i3 + 1] -= (dy / dist) * push;
        active = true;
      } else {
        const rx = initialPositions[i3] - x;
        const ry = initialPositions[i3 + 1] - y;
        const rz = initialPositions[i3 + 2] - z;
        if (rx * rx + ry * ry + rz * rz > 1e-6) {
          arr[i3] += rx * 2.5 * delta;
          arr[i3 + 1] += ry * 2.5 * delta;
          arr[i3 + 2] += rz * 2.5 * delta;
          active = true;
        }
      }
    }

    dirtyRef.current = active;
    if (active) ref.current.geometry.attributes.position.needsUpdate = true;
  });

  const color = "#0EA5E9";

  return (
    <group>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={color}
          size={0.07}
          sizeAttenuation={true}
          depthWrite={false}
          fog={false} /* stars stay crisp at any depth — only the wireframe fogs */
          opacity={theme === "dark" ? 0.8 : 1.0}
        />
      </Points>
    </group>
  );
};

// --- 2. NETWORK LINES (Static) ---
const NetworkLines = ({ theme }) => {
    const lineRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        lineRef.current.rotation.y = t * 0.02;
    });

    return (
        <group ref={lineRef}>
            <mesh>
                <icosahedronGeometry args={[30, 2]} />
                <meshBasicMaterial
                    wireframe
                    // Light mode: the slate-grey lines were invisible on the near-white
                    // bg — use the site's light blue, a touch stronger so they read but
                    // stay in the background. Dark mode unchanged.
                    color="#0EA5E9"
                    transparent
                    opacity={theme === "dark" ? 0.03 : 0.5}
                />
            </mesh>
        </group>
    )
}

// --- 3. NEBULA HAZE (soft atmospheric depth) ---
// A handful of large, very low-opacity colour clouds drifting slowly far behind
// the stars. Adds depth and richness without drawing attention. Built once from
// a canvas radial gradient (no shaders); honours prefers-reduced-motion.
const makeGlowTexture = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
};
const GLOW_TEX = typeof document !== "undefined" ? makeGlowTexture() : null;

// Clustered toward the upper-left so the glow is a contained accent, not a
// full-screen wash. Hand-placed for a calm, intentional composition.
const HAZE = [
  { x: -4.5, y: 4,   z: -7,  s: 20, tint: "#0EA5E9", spd: 0.8 },
  { x: -1,   y: 5.5, z: -10, s: 26, tint: "#6366f1", spd: -0.6 },
  { x: -3,   y: 2.5, z: -6,  s: 15, tint: "#38bdf8", spd: 0.5 },
  { x: 1.5,  y: 5,   z: -9,  s: 18, tint: "#4f46e5", spd: -0.45 },
];

const NebulaHaze = ({ theme, reduced = false }) => {
  const spriteRefs = useRef([]);
  // Dark: faint additive glow. Light: normal-blended blue on a near-white bg needs
  // far more opacity to be visible at all (0.11 was imperceptible).
  const baseOp = theme === "dark" ? 0.06 : 0.34;

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.getElapsedTime();
    for (let i = 0; i < HAZE.length; i++) {
      const m = spriteRefs.current[i];
      if (!m) continue;
      const h = HAZE[i];
      m.position.x = h.x + Math.sin(t * 0.06 * h.spd + i) * 1.6;
      m.position.y = h.y + Math.cos(t * 0.05 * h.spd + i * 1.3) * 1.2;
      m.material.opacity = baseOp * (0.65 + 0.35 * Math.sin(t * 0.3 + i)); // gentle breathing
    }
  });

  return (
    <group>
      {HAZE.map((h, i) => (
        <sprite
          key={i}
          ref={(el) => (spriteRefs.current[i] = el)}
          position={[h.x, h.y, h.z]}
          scale={[h.s, h.s, 1]}
        >
          <spriteMaterial
            map={GLOW_TEX}
            color={h.tint}
            transparent
            opacity={baseOp}
            depthWrite={false}
            fog={false}
            blending={theme === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending}
          />
        </sprite>
      ))}
    </group>
  );
};

// --- MAIN COMPONENT ---
const UniverseBackground = ({ theme }) => {
  // Star density picked synchronously so the buffer is built at the right size
  // from the start (the old resize-effect version ran after the geometry was
  // already created, so mobile silently kept the full 5000).
  const [starCount, setStarCount] = useState(pickStarCount);
  const [paused, setPaused] = useState(false);
  const [supported] = useState(supportsWebGL);
  const [contextLost, setContextLost] = useState(false);
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const handleResize = () => setStarCount(pickStarCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // The project-detail overlay dispatches these while it fully covers the
  // viewport — no point rendering a universe nobody can see. Resumes the moment
  // the overlay starts closing.
  useEffect(() => {
    const pause = () => setPaused(true);
    const resume = () => setPaused(false);
    window.addEventListener("universe:pause", pause);
    window.addEventListener("universe:resume", resume);
    return () => {
      window.removeEventListener("universe:pause", pause);
      window.removeEventListener("universe:resume", resume);
    };
  }, []);

  // No WebGL, or the GPU dropped the context (driver reset, too many tabs):
  // fall back to the static glow instead of a blank/black background.
  if (!supported || contextLost) return <StaticBackdrop />;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        // 1.5x pixel cap (1x on low-end): the bloom-blurred background looks the
        // same, at roughly half the retina pixel work.
        dpr={LOW_END ? 1 : [1, 1.5]}
        // MSAA never survives the post-processing chain, so the default
        // antialias buffer was pure cost.
        gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
        frameloop={paused ? "never" : "always"}
        onCreated={({ gl }) =>
          gl.domElement.addEventListener(
            "webglcontextlost",
            () => setContextLost(true),
            { once: true }
          )
        }
        eventSource={document.getElementById('root')}
        eventPrefix="client"
      >
        {/* Distance fog matched to the page background: the wireframe's far
            edges dissolve into it instead of ending in a hard line. Stars and
            nebula opt out (fog={false}) so only the wireframe is affected. */}
        <fog
          attach="fog"
          args={[theme === "dark" ? "#050505" : "#f8fafc", 16, 50]}
        />

        {/* Re-keyed on count so the star buffer is rebuilt at the right size */}
        <StarField key={starCount} count={starCount} theme={theme} />
        <NetworkLines theme={theme} />
        <NebulaHaze theme={theme} reduced={reduced} />

        <EffectComposer multisampling={0} disableNormalPass={true}>
            <Bloom
                luminanceThreshold={0}
                mipmapBlur
                intensity={theme === "dark" ? 1.5 : 0.5}
                radius={0.6}
            />
            <Noise opacity={0.025} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

// Memoised on purpose: toggling the theme calls flushSync inside a view
// transition, and without this the whole three.js scene re-rendered
// synchronously inside that blocking frame. See the deferred theme in App.
export default React.memo(UniverseBackground);
