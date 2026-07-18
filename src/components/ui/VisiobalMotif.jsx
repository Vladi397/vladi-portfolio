import React from "react";

/*
  VisiobalMotif
  -------------
  Decorative "sonar" pulse rings for the Visiobal project. Concentric rings
  expand outward from a source point on each side edge — echoing the app's radar
  scan screen and the idea of finding the ball by sound. Rendered in Visiobal's
  brand violet + pink. Purely decorative (aria-hidden), flanks the expanded
  detail view and fades inward toward the centred content.
*/

const VIOLET = "#A855F7";
const PINK = "#F472B6";

const VB_W = 340; // strip coordinate width
const VB_H = 680; // tall enough to cover any viewport via slice
const CY = VB_H / 2; // pulse origin sits at the vertical middle of the edge
const BASE_R = 150; // ring radius at scale 1

function RingColumn({ accent, accent2, mirror }) {
  // A train of rings on a shared origin, staggered so pulses emanate continuously.
  const rings = [
    { color: accent, delay: 0, op: 0.5 },
    { color: accent2, delay: 1.4, op: 0.42 },
    { color: accent, delay: 2.8, op: 0.34 },
    { color: accent2, delay: 4.2, op: 0.26 },
  ];
  const DUR = 5.6;
  return (
    <svg
      className="h-full w-full"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMinYMid slice"
      fill="none"
      aria-hidden="true"
      style={mirror ? { transform: "scaleX(-1)" } : undefined}
    >
      {/* faint source glow + dot at the edge origin */}
      <circle cx="0" cy={CY} r="26" fill={accent} opacity="0.12" />
      <circle cx="0" cy={CY} r="5" fill={accent} opacity="0.7" />

      {rings.map((r, i) => (
        <circle
          key={i}
          className="vb-ring"
          cx="0"
          cy={CY}
          r={BASE_R}
          stroke={r.color}
          strokeWidth="2"
          opacity={r.op}
          style={{
            transformOrigin: `0px ${CY}px`,
            animation: `vb-pulse ${DUR}s ease-out ${r.delay}s infinite`,
          }}
        />
      ))}
    </svg>
  );
}

export default function VisiobalMotif({ accent = VIOLET, accent2 = PINK }) {
  // Fade the rings inward (toward the centred content) so nothing crowds the text.
  const leftMask = {
    WebkitMaskImage: "linear-gradient(to right, #000 10%, transparent 85%)",
    maskImage: "linear-gradient(to right, #000 10%, transparent 85%)",
  };
  const rightMask = {
    WebkitMaskImage: "linear-gradient(to left, #000 10%, transparent 85%)",
    maskImage: "linear-gradient(to left, #000 10%, transparent 85%)",
  };
  const stripW = "hidden sm:block w-24 md:w-40 lg:w-64";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`absolute inset-y-0 left-0 ${stripW}`} style={leftMask}>
        <RingColumn accent={accent} accent2={accent2} />
      </div>
      <div className={`absolute inset-y-0 right-0 ${stripW}`} style={rightMask}>
        <RingColumn accent={accent} accent2={accent2} mirror />
      </div>
    </div>
  );
}
