import React from "react";

/*
  VisiobalMotif
  -------------
  Decorative "sonar" pulse rings for the Visiobal project. Two sources on each
  side edge emit trains of concentric rings that expand outward and fade, echoing
  the app's radar scan and the idea of finding the ball by sound. Rings are drawn
  with a violet -> pink gradient stroke. Purely decorative (aria-hidden), flanks
  the expanded detail view and fades inward toward the centred content.
*/

const VIOLET = "#A855F7";
const PINK = "#F472B6";

const VB_W = 360;
const VB_H = 700;
const BASE_R = 165; // ring radius at scale 1

// Two ping sources per edge (fraction of height), each with a staggered train
// of rings [delay, peak opacity]. Different speeds so they never sync up.
const SOURCES = [
  { cy: 0.3, dur: 5.4, rings: [[0, 0.55], [1.8, 0.4], [3.6, 0.26]] },
  { cy: 0.72, dur: 6.6, rings: [[0.9, 0.5], [3.0, 0.36], [5.1, 0.22]] },
];

function RingColumn({ accent, accent2, gradId, mirror }) {
  return (
    <svg
      className="h-full w-full"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMinYMid slice"
      fill="none"
      aria-hidden="true"
      style={mirror ? { transform: "scaleX(-1)" } : undefined}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={accent} />
          <stop offset="1" stopColor={accent2} />
        </linearGradient>
      </defs>

      {SOURCES.map((s, si) => {
        const cy = VB_H * s.cy;
        return (
          <g key={si}>
            {/* soft source glow + core dot */}
            <circle cx="0" cy={cy} r="30" fill={accent} opacity="0.13" />
            <circle cx="0" cy={cy} r="6" fill={accent2} opacity="0.75" />

            {s.rings.map(([delay, peak], ri) => (
              <circle
                key={ri}
                className="vb-ring"
                cx="0"
                cy={cy}
                r={BASE_R}
                stroke={`url(#${gradId})`}
                strokeWidth="2.5"
                style={{
                  "--vb-peak": peak,
                  transformOrigin: `0px ${cy}px`,
                  animation: `vb-pulse ${s.dur}s ease-out ${delay}s infinite`,
                }}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export default function VisiobalMotif({ accent = VIOLET, accent2 = PINK }) {
  // Fade the rings inward (toward the centred content) so nothing crowds the text.
  const leftMask = {
    WebkitMaskImage: "linear-gradient(to right, #000 12%, transparent 92%)",
    maskImage: "linear-gradient(to right, #000 12%, transparent 92%)",
  };
  const rightMask = {
    WebkitMaskImage: "linear-gradient(to left, #000 12%, transparent 92%)",
    maskImage: "linear-gradient(to left, #000 12%, transparent 92%)",
  };
  const stripW = "hidden sm:block w-24 md:w-40 lg:w-64";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`absolute inset-y-0 left-0 ${stripW}`} style={leftMask}>
        <RingColumn accent={accent} accent2={accent2} gradId="vb-grad-l" />
      </div>
      <div className={`absolute inset-y-0 right-0 ${stripW}`} style={rightMask}>
        <RingColumn accent={accent} accent2={accent2} gradId="vb-grad-r" mirror />
      </div>
    </div>
  );
}
