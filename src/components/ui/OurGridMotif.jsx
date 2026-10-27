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

/*
  Each wave is its own <svg>, wrapped in a plain <div> that carries the
  animation. Both parts of that matter, and both were measured:

   - the animation used to sit on a <g> inside one shared <svg>. Chrome will
     not composite a transform animation there, so every frame re-ran layout
     for a strip as tall as the whole case study: 144 layouts per scroll, and
     63% of the page's entire scrolling render cost for a decoration.
   - moving it onto the <svg> element killed the layouts (144 -> 2) but still
     repainted every frame. Only an ordinary HTML box gets handed to the
     compositor, which took paint time during a scroll from 129ms to 34ms —
     level with the motif being switched off altogether.

  The travel is a percentage because the transform now applies in CSS pixels
  rather than viewBox units. With preserveAspectRatio "slice" on a strip far
  taller than it is wide the scale comes from the height, so one wavelength is
  always LAMBDA/VB_H of the element's height — a constant fraction, whatever
  the page's length. (Holds while height > 10x width, which a detail page at
  ~8700px against a 208px strip clears many times over.)
*/
const LINES = (accent, accent2) => [
  { cx: 20, amp: 9, color: accent, w: 2, op: 0.55, dur: 9, dir: "up" },
  { cx: 38, amp: 12, color: accent2, w: 1.5, op: 0.45, dur: 13, dir: "down" },
  { cx: 52, amp: 7, color: accent, w: 1.25, op: 0.3, dur: 17, dir: "up" },
];

function WaveColumn({ accent, accent2 }) {
  return (
    <>
      {LINES(accent, accent2).map((l, i) => (
        <div
          key={i}
          className="og-wave absolute inset-0"
          style={{ animation: `og-flow-${l.dir} ${l.dur}s linear infinite` }}
        >
          <svg
            className="h-full w-full"
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            aria-hidden="true"
          >
            <path
              d={wavePath(l.cx, l.amp)}
              transform={`translate(0 ${-LAMBDA})`}
              stroke={l.color}
              strokeWidth={l.w}
              strokeLinecap="round"
              opacity={l.op}
            />
          </svg>
        </div>
      ))}
    </>
  );
}

export default function OurGridMotif({ accent = GREEN, accent2 = AMBER }) {
  // Fade the waves inward (toward the centred content) so nothing crowds the text.
  const leftMask = {
    WebkitMaskImage: "linear-gradient(to right, #000 15%, transparent)",
    maskImage: "linear-gradient(to right, #000 15%, transparent)",
  };
  // The right strip is the left one flipped, and the flip carries the mask with
  // it — so it reuses leftMask rather than declaring a mirrored one.
  // overflow-hidden because each wave is now its own absolutely positioned
  // layer and "slice" lets them paint past the strip. No "relative" here: the
  // strip is already absolute, which makes it a containing block anyway, and
  // Tailwind emits .relative after .absolute — so adding it would silently
  // take the strip out of position and the waves would vanish.
  // The right-hand column is mirrored on the strip rather than on the svg,
  // because the svg's transform now belongs to the animation.
  const stripW = "hidden sm:block overflow-hidden w-20 md:w-32 lg:w-52";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`absolute inset-y-0 left-0 ${stripW}`} style={leftMask}>
        <WaveColumn accent={accent} accent2={accent2} />
      </div>
      <div
        className={`absolute inset-y-0 right-0 ${stripW}`}
        style={{ ...leftMask, transform: "scaleX(-1)" }}
      >
        <WaveColumn accent={accent} accent2={accent2} />
      </div>
    </div>
  );
}
