import React, { useRef, useState, useMemo } from "react";
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

  const initialPositions = useMemo(() => new Float32Array(positions), [positions]);

  useFrame((state, delta) => {
    // 1. Very slow, constant rotation (Just to keep it alive, not distracting)
    ref.current.rotation.x -= delta / 50;
    ref.current.rotation.y -= delta / 60;

    // 2. MOUSE PHYSICS (The "Get rid of stars" effect)
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

      // Distance from mouse
      const dx = mx - x;
      const dy = my - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // FORCE RADIUS: 6 units (Large "Clearance" area)
      if (dist < 6) {
         const force = (6 - dist) / 6;
         const angle = Math.atan2(dy, dx);
         
         // Push stars away strongly
         currentPositions[i3] -= Math.cos(angle) * force * 20 * delta; 
         currentPositions[i3 + 1] -= Math.sin(angle) * force * 20 * delta;
      } else {
         // Gently return to original spot
         currentPositions[i3] += (ix - x) * 2.5 * delta; 
         currentPositions[i3 + 1] += (iy - y) * 2.5 * delta;
         currentPositions[i3 + 2] += (iz - z) * 2.5 * delta;
      }
    }
    
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={theme === "dark" ? "#0EA5E9" : "#475569"}
          size={0.07}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={theme === "dark" ? 0.8 : 0.6}
        />
      </Points>
    </group>
  );
};

// --- 2. NETWORK LINES (Static) ---
const NetworkLines = ({ theme }) => {
    const lineRef = useRef();
    
    // Constant slow rotation, unaffected by mouse
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

// --- MAIN COMPONENT ---
const UniverseBackground = ({ theme }) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 45 }} 
        dpr={[1, 2]}
        // Listen to mouse on the whole body
        eventSource={document.getElementById('root')}
        eventPrefix="client"
      >
        <StarField theme={theme} />
        <NetworkLines theme={theme} />
        
        {/* REMOVED <Rig /> HERE - No more camera tilting! */}

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