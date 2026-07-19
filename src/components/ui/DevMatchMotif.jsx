import React from "react";

/*
  DevMatchMotif
  -------------
  Decorative "match score" bars for the DevMatch project. A skyline of thin
  vertical bars rises along each side edge and gently breathes up and down,
  evoking the app's ATS match scores and analytics. Rendered in DevMatch's brand
  cyan + pink. Purely decorative (aria-hidden), flanks the expanded detail view
  and fades inward toward the centred content.
*/

const CYAN = "#00D4FF";
const PINK = "#FF2D8A";

const VB_W = 200;
const VB_H = 680;

// A little skyline: [x, base height 0..1, animation duration, delay]. Heights
// and speeds vary so the bars never pulse in unison.
const BARS = [
  [14, 0.42, 5.2, 0.0],
  [34, 0.7, 6.8, 0.6],
  [54, 0.3, 4.6, 1.1],
  [74, 0.85, 7.6, 0.3],
  [94, 0.5, 5.8, 0.9],
  [114, 0.66, 6.2, 1.4],
  [134, 0.36, 4.9, 0.5],
  [154, 0.74, 7.1, 1.2],
  [174, 0.46, 5.5, 0.2],
];
const BAR_W = 8;

function BarColumn({ accent, accent2, mirror }) {
  return (
    <svg
      className="h-full w-full"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMinYMax slice"
      fill="none"
      aria-hidden="true"
      style={mirror ? { transform: "scaleX(-1)" } : undefined}
    >
      <defs>
        <linearGradient id="dm-bar-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={accent} />
          <stop offset="1" stopColor={accent2} />
        </linearGradient>
      </defs>
      {BARS.map(([x, h, dur, delay], i) => {
        const full = VB_H * 0.7; // tallest a bar can reach
        const height = full * h;
        return (
          <rect
            key={i}
            className="dm-bar"
            x={x}
            y={VB_H - height}
            width={BAR_W}
            height={height}
            rx={BAR_W / 2}
            fill="url(#dm-bar-grad)"
            opacity={0.28 + 0.12 * (i % 3)}
            style={{
              transformOrigin: `${x + BAR_W / 2}px ${VB_H}px`, // grow from the base
              animation: `dm-bar ${dur}s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}
    </svg>
  );
}

export default function DevMatchMotif({ accent = CYAN, accent2 = PINK }) {
  // Fade the bars inward (toward the centred content) so nothing crowds the text.
  const leftMask = {
    WebkitMaskImage: "linear-gradient(to right, #000 10%, transparent 90%)",
    maskImage: "linear-gradient(to right, #000 10%, transparent 90%)",
  };
  const rightMask = {
    WebkitMaskImage: "linear-gradient(to left, #000 10%, transparent 90%)",
    maskImage: "linear-gradient(to left, #000 10%, transparent 90%)",
  };
  const stripW = "hidden sm:block w-24 md:w-40 lg:w-60";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`absolute inset-y-0 left-0 ${stripW}`} style={leftMask}>
        <BarColumn accent={accent} accent2={accent2} />
      </div>
      <div className={`absolute inset-y-0 right-0 ${stripW}`} style={rightMask}>
        <BarColumn accent={accent} accent2={accent2} mirror />
      </div>
    </div>
  );
}
