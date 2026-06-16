import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

// --- 1. THE STARS (With Mouse Repulsion) ---
const StarField = ({ count = 5000, theme }) => {
  const ref = useRef();
  const { viewport } = useThree();

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 40 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    return pos;
  });

  // Re-memoize if count changes (though typically count stays stable after mount)
  const initialPositions = useMemo(() => new Float32Array(positions), [positions]);

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 50;
    ref.current.rotation.y -= delta / 60;

    const xMult = viewport.width / 2;
    const yMult = viewport.height / 2;
    const mx = state.pointer.x * xMult;
    const my = state.pointer.y * yMult;

    const currentPositions = ref.current.geometry.attributes.position.array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = currentPositions[i3];
      const y = currentPositions[i3 + 1];
      const z = currentPositions[i3 + 2];

      const ix = initialPositions[i3];
      const iy = initialPositions[i3 + 1];
      const iz = initialPositions[i3 + 2];

      const dx = mx - x;
      const dy = my - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 6) {
         const force = (6 - dist) / 6;
         const angle = Math.atan2(dy, dx);
         currentPositions[i3] -= Math.cos(angle) * force * 20 * delta; 
         currentPositions[i3 + 1] -= Math.sin(angle) * force * 20 * delta;
      } else {
         currentPositions[i3] += (ix - x) * 2.5 * delta; 
         currentPositions[i3 + 1] += (iy - y) * 2.5 * delta;
         currentPositions[i3 + 2] += (iz - z) * 2.5 * delta;
      }
    }
    
    ref.current.geometry.attributes.position.needsUpdate = true;
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
                    color={theme === "dark" ? "#0EA5E9" : "#94a3b8"} 
                    transparent 
                    opacity={theme === "dark" ? 0.03 : 0.05} 
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
            blending={theme === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending}
          />
        </sprite>
      ))}
    </group>
  );
};

// --- MAIN COMPONENT ---
const UniverseBackground = ({ theme }) => {
  // OPTIMIZATION: Detect mobile screen to reduce particle count
  const [starCount, setStarCount] = useState(5000);
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const handleResize = () => {
      // If width < 768px (Mobile), use 1500 stars. Else 5000.
      setStarCount(window.innerWidth < 768 ? 1500 : 5000);
    };

    // Run once on mount
    handleResize();

    // Optional: Update on resize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        dpr={[1, 2]}
        eventSource={document.getElementById('root')}
        eventPrefix="client"
      >
        {/* Pass the dynamic count here */}
        <StarField count={starCount} theme={theme} />
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

export default UniverseBackground;