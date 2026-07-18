import React from "react";

/*
  OurGridMotif
  ------------
  Decorative "electric current" waves for the OurGrid project. Thin SVG sine
  paths flow gently up / down both side edges in OurGrid's brand green + amber,
  evoking energy moving through a grid. Purely decorative (aria-hidden).

  variant:
    "page" (default) — flanks the expanded detail view; wide strips that fade
                        inward toward the centred content, hidden on phones.
*/

const GREEN = "#01AC51";
const AMBER = "#F4B14A";

const VB_W = 70; // strip coordinate width
const VB_H = 700; // tall enough to cover any card via slice
const LAMBDA = 130; // wavelength — must match the og-flow keyframes (130px)
const DRAW_H = VB_H + LAMBDA * 2; // draw past the box so the flow tiles seamlessly

// Smooth vertical sine polyline: x oscillates as it descends in y.
function wavePath(cx, amp, step = 8) {
  let d = "";
  for (let y = 0; y <= DRAW_H; y += step) {
    const x = cx + amp * Math.sin((2 * Math.PI * y) / LAMBDA);
    d += `${y === 0 ? "M" : "L"}${x.toFixed(1)} ${y} `;
  }
  return d.trim();
}

function WaveColumn({ accent, accent2, mirror }) {
  // A few waves across the strip — alternating colour, weight, speed, direction.
  const lines = [
    { cx: 20, amp: 9, color: accent, w: 2, op: 0.55, dur: 9, dir: "up" },
    { cx: 38, amp: 12, color: accent2, w: 1.5, op: 0.45, dur: 13, dir: "down" },
    { cx: 52, amp: 7, color: accent, w: 1.25, op: 0.3, dur: 17, dir: "up" },
  ];
  return (
    <svg
      className="h-full w-full"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
      style={mirror ? { transform: "scaleX(-1)" } : undefined}
    >
      {lines.map((l, i) => (
        <g
          key={i}
          className="og-wave"
          style={{ animation: `og-flow-${l.dir} ${l.dur}s linear infinite` }}
        >
          <path
            d={wavePath(l.cx, l.amp)}
            transform={`translate(0 ${-LAMBDA})`}
            stroke={l.color}
            strokeWidth={l.w}
            strokeLinecap="round"
            opacity={l.op}
          />
        </g>
      ))}
    </svg>
  );
}

export default function OurGridMotif({ accent = GREEN, accent2 = AMBER }) {
  // Fade the waves inward (toward the centred content) so nothing crowds the text.
  const leftMask = {
    WebkitMaskImage: "linear-gradient(to right, #000 15%, transparent)",
    maskImage: "linear-gradient(to right, #000 15%, transparent)",
  };
  const rightMask = {
    WebkitMaskImage: "linear-gradient(to left, #000 15%, transparent)",
    maskImage: "linear-gradient(to left, #000 15%, transparent)",
  };
  const stripW = "hidden sm:block w-20 md:w-32 lg:w-52";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`absolute inset-y-0 left-0 ${stripW}`} style={leftMask}>
        <WaveColumn accent={accent} accent2={accent2} />
      </div>
      <div className={`absolute inset-y-0 right-0 ${stripW}`} style={rightMask}>
        <WaveColumn accent={accent} accent2={accent2} mirror />
      </div>
    </div>
  );
}
