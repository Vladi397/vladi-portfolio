import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points } from "@react-three/drei";
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

/*
  The vignette, lifted out of the render loop.

  These alphas were not derived from the shader, they were measured off it:
  shoot the scene with the pass running and again with nothing over it at all,
  and the ratio between the two at each radius is the veil the pass actually
  drew — blending, premultiplied alpha and all. Working it out on paper gave a
  curve half again too dark through the middle.

  The themes need separate curves because the pass does different things to
  them. Over the dark ground it fades the canvas into the page, so the veil is
  the page colour at full strength. Over paper it multiplies toward black, so
  the corners end up BELOW paper white — a faint grey wash rather than a fade,
  and a black veil five percent thick at its heaviest.

  100% is the farthest corner, which is where a CSS ellipse gradient ends and
  where the shader distance reaches 0.707, so the two line up without scaling.
*/
const VIGNETTE_DARK = [
  [0, 0], [25, 0.01], [30, 0.046], [35, 0.09], [40, 0.141], [45, 0.202],
  [50, 0.271], [55, 0.349], [60, 0.44], [65, 0.535], [70, 0.631], [75, 0.737],
  [80, 0.846], [85, 0.932], [90, 0.981], [95, 1], [100, 1],
];

const VIGNETTE_LIGHT = [
  [0, 0], [30, 0.0004], [35, 0.0016], [40, 0.003], [45, 0.0047], [50, 0.0081],
  [55, 0.0126], [60, 0.0177], [65, 0.0232], [70, 0.0286], [75, 0.0339],
  [80, 0.0401], [85, 0.0465], [90, 0.0505], [95, 0.0515], [100, 0.0515],
];

/*
  Light only: the wash that bloom left behind.

  On paper, bloom at threshold zero blurs a near-white frame and adds it back,
  which saturates the middle of the screen to pure white and cancels the tint
  the haze lays over everything. Measured the same way as the curves above —
  the picture with the pass against the picture without it — and it comes out
  as a broad white veil, heaviest in the middle. It sits under the vignette,
  which is the order the two passes ran in.

  It goes UNDER the canvas rather than over it. Bloom brightened the ground
  the scene stands on; it did not flatten the scene. Laid over the top the
  same veil washes the stars out along with everything else, and they go from
  crisp specks to barely there. Underneath, the paper lifts to white and the
  stars keep every bit of their contrast.
*/
const WASH_STOPS = [
  [0, 1], [40, 1], [50, 0.95], [60, 0.85], [70, 0.68], [80, 0.47],
  [90, 0.3], [100, 0.22],
];

const washOf = (stops) =>
  "radial-gradient(ellipse farthest-corner at 50% 50%, " +
  stops.map(([p, a]) => `rgba(255, 255, 255, ${a}) ${p}%`).join(", ") +
  ")";

const vignetteOf = ({ veil, vignette }) =>
  "radial-gradient(ellipse farthest-corner at 50% 50%, " +
  vignette.map(([p, a]) => `rgba(${veil}, ${a}) ${p}%`).join(", ") +
  ")";

// Scene colours per theme. Dark is the original sky/indigo space; light is the
// warm off-white page with teal stars, lines and haze to match the light UI.
// Haze tints line up with the HAZE entries below.
const SPACE = {
  dark: {
    ground: "#050505",
    veil: "5, 5, 5",
    vignette: VIGNETTE_DARK,
    wash: null,
    accent: "#0EA5E9",
    haze: ["#0EA5E9", "#6366f1", "#38bdf8", "#4f46e5"],
  },
  light: {
    ground: "#FAF9F6",
    veil: "0, 0, 0",
    vignette: VIGNETTE_LIGHT,
    wash: WASH_STOPS,
    accent: "#0A7A85",
    // Soft, desaturated teals plus one warm sand cloud that ties the haze to
    // the off-white page. Saturated cyan here flooded the glass panels.
    haze: ["#7CC2C6", "#E3D6BC", "#9FD0CF", "#5FA8AE"],
  },
};

/*
  What the bloom pass used to contribute, dialled back into the scene itself.

  Bloom at a luminance threshold of zero did not pick out highlights, it took
  the whole frame, blurred it and added it back — so it was brightening and
  spreading everything at once, and most of what you see was coming from it
  rather than from the materials. Every number here was found by shooting the
  two builds at the same second of scene time, on the same seeded star field,
  and comparing them ring by ring out from the middle of the screen.

  Dark needed the clouds roughly four times stronger and a little wider, and
  the wireframe three times stronger, to put back the glow that was lost.
  Light barely moved: on paper, bloom was not making anything glow, it was
  flooding the frame with light, which the wash above handles instead.
*/
const WIRE_OP_DARK = 0.1;
const WIRE_OP_LIGHT = 0.28;
const HAZE_OP_DARK = 0.25;
const HAZE_OP_LIGHT = 0.34;
const HAZE_SPREAD_DARK = 1.15;
const HAZE_SPREAD_LIGHT = 1;
const STAR_OP_DARK = 1;
const STAR_OP_LIGHT = 1;

/*
  The scene drifts rather than moves: the stars turn about a degree every few
  seconds and the haze breathes over half a minute. Nothing in it asks for
  sixty frames a second, and a frame costs the same whether anything moved or
  not — so the loop is driven by hand at a fixed rate instead of by the
  display.

  Nothing about the motion changes. Every animation in here is a function of
  elapsed time, not of how many frames have gone by: the rotations accumulate
  delta and the haze reads the clock directly, so the scene arrives in the
  same place at the same second whatever rate it is drawn at.

  Both rates divide evenly into 60Hz and 120Hz displays, so frames land on
  real display ticks instead of beating against them.
*/
const FPS = LOW_END ? 20 : 30;

const FrameLimiter = ({ fps, active }) => {
  const advance = useThree((s) => s.advance);
  // The scene time, kept across pauses. It has to be ours and it has to
  // persist: in "never" mode the loop works the delta out as the timestamp
  // minus the clock it already holds, so a counter that restarted at zero on
  // resume would hand it a large NEGATIVE delta and throw the scene backwards.
  const elapsed = useRef(0);

  useEffect(() => {
    if (!active) return undefined;
    let raf = 0;
    let prev = performance.now();
    let since = 0;
    const step = 1 / fps;

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      since += (now - prev) / 1000;
      prev = now;
      // A tenth of a step of slack: without it a display tick landing a hair
      // early is dropped and a 30fps gate on a 60Hz screen halves again to 20.
      if (since < step * 0.9) return;
      elapsed.current += since;
      since = 0;
      advance(elapsed.current);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fps, active, advance]);

  // Time spent paused is simply not counted — prev starts afresh on resume —
  // so the scene picks up where it left off instead of lurching forward by
  // however long the overlay was open.
  return null;
};

/*
  The star sprites, one per theme.

  Dark gets the halo painted into the texture. That halo used to come from the
  bloom pass, which re-rendered the scene into a stack of blurred buffers and
  added it back every frame; a point carrying its own glow needs none of that,
  and the stops below are that blur, baked once at startup. STAR_CORE is where
  the core ends as a fraction of the sprite radius, so the sprite is drawn that
  much bigger to keep the original 0.07-wide core.

  Light gets a hard-edged dot instead, which is what it had: on paper there was
  never a glow to bake, because bloom cannot brighten what is already white. A
  halo there reads as a grey smudge rather than a star. The dot is the round
  mask drei PointMaterial was applying, drawn once into a texture so that one
  plain material can serve both themes.
*/
const STAR_CORE = 0.13;
const STAR_SIZE_DARK = 0.07 / (STAR_CORE * 2);
const STAR_SIZE_LIGHT = 0.07;

const paintSprite = (size, stops) => {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([at, alpha]) => g.addColorStop(at, `rgba(255,255,255,${alpha})`));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
};

const STAR_TEX_DARK = typeof document !== "undefined"
  ? paintSprite(64, [[0, 1], [STAR_CORE, 0.92], [0.3, 0.3], [0.6, 0.07], [1, 0]])
  : null;

// Solid to 0.44, gone by 0.5: a disc with one texel of feather on it.
const STAR_TEX_LIGHT = typeof document !== "undefined"
  ? paintSprite(32, [[0, 1], [0.44, 1], [0.5, 0], [1, 0]])
  : null;

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

  const color = theme === "dark" ? SPACE.dark.accent : SPACE.light.accent;

  return (
    <group>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        {/* Plain pointsMaterial rather than drei PointMaterial: the round mask
            that one applies is exactly what the halo texture already does, and
            it would clip the halo back off. */}
        <pointsMaterial
          transparent
          map={theme === "dark" ? STAR_TEX_DARK : STAR_TEX_LIGHT}
          color={color}
          size={theme === "dark" ? STAR_SIZE_DARK : STAR_SIZE_LIGHT}
          sizeAttenuation={true}
          depthWrite={false}
          fog={false} /* stars stay crisp at any depth — only the wireframe fogs */
          blending={theme === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending}
          opacity={theme === "dark" ? STAR_OP_DARK : STAR_OP_LIGHT}
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
                    // bg — use the site's accent, a touch stronger so they read but
                    // stay in the background. Dark mode unchanged.
                    color={theme === "dark" ? SPACE.dark.accent : SPACE.light.accent}
                    transparent
                    // Teal is darker than the old sky blue, so light mode needs less.
                    opacity={theme === "dark" ? WIRE_OP_DARK : WIRE_OP_LIGHT}
                />
            </mesh>
        </group>
    )
}

// --- 3. NEBULA HAZE (soft atmospheric depth) ---
// A handful of large, very low-opacity colour clouds drifting slowly far behind
// the stars. Adds depth and richness without drawing attention. Built once from
// a canvas radial gradient (no shaders); honours prefers-reduced-motion.
/*
  The nebula clouds, one gradient per theme.

  Dark keeps the original long, soft tail: added onto near-black it reads as
  depth. Light needs the same core and far less tail — over paper the tail is
  not glow but a grey cast over the whole screen, and in the original bloom
  cancelled exactly that by flooding the frame with light. Pulling the falloff
  in gets the clean paper back without washing the stars out with it.
*/
const makeGlowTexture = (stops) => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([at, alpha]) => g.addColorStop(at, `rgba(255,255,255,${alpha})`));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
};
const GLOW_TEX_DARK = typeof document !== "undefined"
  ? makeGlowTexture([[0, 1], [0.35, 0.35], [1, 0]])
  : null;
const GLOW_TEX_LIGHT = typeof document !== "undefined"
  ? makeGlowTexture([[0, 1], [0.2, 0.4], [0.45, 0.08], [1, 0]])
  : null;

// Clustered toward the upper-left so the glow is a contained accent, not a
// full-screen wash. Hand-placed for a calm, intentional composition.
const HAZE = [
  { x: -4.5, y: 4,   z: -7,  s: 20, spd: 0.8 },
  { x: -1,   y: 5.5, z: -10, s: 26, spd: -0.6 },
  { x: -3,   y: 2.5, z: -6,  s: 15, spd: 0.5 },
  { x: 1.5,  y: 5,   z: -9,  s: 18, spd: -0.45 },
];

const NebulaHaze = ({ theme, reduced = false }) => {
  const spriteRefs = useRef([]);
  // Dark: faint additive glow. Light: normal-blended blue on a near-white bg needs
  // far more opacity to be visible at all (0.11 was imperceptible).
  const baseOp = theme === "dark" ? HAZE_OP_DARK : HAZE_OP_LIGHT;
  const spread = theme === "dark" ? HAZE_SPREAD_DARK : HAZE_SPREAD_LIGHT;

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
          scale={[h.s * spread, h.s * spread, 1]}
        >
          <spriteMaterial
            map={theme === "dark" ? GLOW_TEX_DARK : GLOW_TEX_LIGHT}
            color={(theme === "dark" ? SPACE.dark : SPACE.light).haze[i]}
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
  const [hidden, setHidden] = useState(false);
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

  // A background tab renders frames nobody can see and keeps a laptop fan
  // spinning. Nothing changes on screen: the scene resumes on return.
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // No WebGL, or the GPU dropped the context (driver reset, too many tabs):
  // fall back to the static glow instead of a blank/black background.
  if (!supported || contextLost) return <StaticBackdrop />;

  const palette = theme === "dark" ? SPACE.dark : SPACE.light;
  const running = !paused && !hidden;

  /*
    The ground colour is painted on this wrapper as well as on the page layer
    below it. That changes nothing to look at, and it gives the grain an
    opaque backdrop to blend against: overlay blending works on what is
    painted beneath it inside this stacking context, and over nothing at all
    it simply lays grey on top — which lifted the middle of the frame by about
    seven levels in 255 and left the corners, where the veil is solid, alone.
    The classes are the ones the page layer uses, so the two stay in step
    through a theme change.
  */
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-paper dark:bg-[#050505] transition-colors duration-300">
      {palette.wash && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: washOf(palette.wash) }}
        />
      )}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        // 1.5x pixel cap (1x on low-end): the soft background looks the same,
        // at roughly half the retina pixel work.
        dpr={LOW_END ? 1 : [1, 1.5]}
        // MSAA never survives the post-processing chain, so the default
        // antialias buffer was pure cost.
        gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
        // The loop is ours now — see FrameLimiter. Paused (detail overlay
        // covering the screen) or hidden tab: it stops asking for frames and
        // the canvas keeps the last one it drew.
        frameloop="never"
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
        <FrameLimiter fps={FPS} active={running} />

        {/* Distance fog matched to the page background: the wireframe's far
            edges dissolve into it instead of ending in a hard line. Stars and
            nebula opt out (fog={false}) so only the wireframe is affected. */}
        <fog attach="fog" args={[palette.ground, 16, 50]} />

        {/* Re-keyed on count so the star buffer is rebuilt at the right size */}
        <StarField key={starCount} count={starCount} theme={theme} />
        <NetworkLines theme={theme} />
        <NebulaHaze theme={theme} reduced={reduced} />

      </Canvas>

      {/* Both of these were full-screen GPU passes re-rendering every frame.
          They are screen-space effects with nothing to do with the 3D scene,
          so out here they cost nothing per frame. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: vignetteOf(palette) }}
      />
      {/* Overlay blending is what makes one grain work for both themes: it
          leaves the mean brightness where it was and scales the speckle with
          whatever is underneath, so it textures the lit middle and all but
          disappears over bare page — which is exactly what the pass it
          replaces did, having only ever touched pixels the scene had drawn. */}
      <div aria-hidden="true" className="ub-grain absolute" />
    </div>
  );
};

export default UniverseBackground;
