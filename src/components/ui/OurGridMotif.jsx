import React, { useLayoutEffect, useRef, useState } from "react";

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
const LAMBDA = 130; // wavelength, in viewBox units
// Drawn well past the box at both ends. The flowing layer slides by a whole
// wavelength, so there has to be more curve beyond each edge than it can ever
// slide, or it drags its own end into view. Two wavelengths of overdraw each
// way is twice what the travel can use.
const OVERDRAW = LAMBDA * 2;
const DRAW_H = VB_H + OVERDRAW * 2;

// Smooth vertical sine polyline: x oscillates as it descends in y.
function wavePath(cx, amp, step = 8) {
  let d = "";
  for (let y = 0; y <= DRAW_H; y += step) {
    const x = cx + amp * Math.sin((2 * Math.PI * y) / LAMBDA);
    d += `${y === 0 ? "M" : "L"}${x.toFixed(1)} ${y} `;
  }
  return d.trim();
}

const LINES = (accent, accent2) => [
  { cx: 20, amp: 9, color: accent, w: 2, op: 0.55, dur: 9, dir: "up" },
  { cx: 38, amp: 12, color: accent2, w: 1.5, op: 0.45, dur: 13, dir: "down" },
  { cx: 52, amp: 7, color: accent, w: 1.25, op: 0.3, dur: 17, dir: "up" },
];

/*
  Each wave is its own <svg>, wrapped in a plain <div> that carries the
  animation, because only an ordinary HTML box gets handed to the compositor:
  the animation used to sit on a <g>, which Chrome will not composite, so
  scrolling the case study re-ran layout every single frame for a strip as tall
  as the viewport.

  That moved the transform out of viewBox units and into CSS pixels, and one
  wavelength is a different number of pixels depending on how "slice" scaled
  the drawing. It was written as a fixed 18.5714% of the height on the
  assumption that the strip is far taller than it is wide, so the scale would
  always come from the height. That was wrong: the strip is the height of the
  VIEWPORT, not of the page — the detail panel is fixed and scrolls its content
  underneath — so at 208x950 the scale comes from the WIDTH instead, one
  wavelength is 40.7% of the height, and the loop was travelling less than half
  of one before snapping back.

  So it is measured. Whichever way round the strip turns out to be, one cycle
  travels exactly one wavelength and the curve lands back on itself.
*/
function WaveColumn({ accent, accent2 }) {
  const boxRef = useRef(null);
  const [travel, setTravel] = useState(0);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;

    const measure = () => {
      // offsetWidth/Height rather than a bounding rect: the detail view opens
      // with a scale animation, and a rect read mid-flight comes back scaled.
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (!w || !h) return;
      // "slice" scales the drawing to cover the box, so the larger ratio wins.
      setTravel(LAMBDA * Math.max(w / VB_W, h / VB_H));
    };

    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={boxRef}
      className="absolute inset-0"
      style={{ "--og-travel": `${travel.toFixed(2)}px` }}
    >
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
              transform={`translate(0 ${-OVERDRAW})`}
              stroke={l.color}
              strokeWidth={l.w}
              strokeLinecap="round"
              opacity={l.op}
            />
          </svg>
        </div>
      ))}
    </div>
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
  // layer, "slice" lets them paint past the strip, and the sliding layer needs
  // that overspill to draw with. No "relative" here: the strip is already
  // absolute, which makes it a containing block anyway, and Tailwind emits
  // .relative after .absolute — so adding it would silently take the strip out
  // of position and the waves would vanish.
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
