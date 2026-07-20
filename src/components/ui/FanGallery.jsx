import React, { useEffect, useRef, useState } from "react";

/*
  FanGallery
  ----------
  A spread of phone screenshots fanned out like a hand of cards: the centre
  card sits upright and on top, the earlier cards fan to the left and the later
  ones to the right. On scroll-into-view the deck starts stacked at the centre
  and springs open (centre first, outer cards trailing) until fully spread.

  Geometry notes: cards are anchored at bottom-centre and rotate around that
  pivot, which alone gives the arc (centre card highest, outer cards lower) and
  keeps every card inside the box — no downward translate that would spill into
  the section below. The spread is tuned to fit within the content column so
  nothing needs clipping at the sides.

  Used by ProjectExpand when a project sets galleryLayout: "fan".
*/

// tx is a percentage of the card's own width, so the fan scales with the
// responsive card size. rot is degrees per step out from the centre.
const GEO = {
  wide: { rot: 8, tx: 55, scale: 0.05 },
  compact: { rot: 6, tx: 44, scale: 0.06 },
};

export default function FanGallery({ images, title }) {
  const ref = useRef(null);
  // Reduced-motion users start fully spread (no springing open).
  const [spread, setSpread] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
  const [compact, setCompact] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Spring the fan open when it scrolls into view (reduced motion already spread).
  useEffect(() => {
    const el = ref.current;
    if (!el || spread) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setSpread(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const g = compact ? GEO.compact : GEO.wide;
  const n = images.length;
  const center = (n - 1) / 2;

  // Card sizing (portrait phone shots). Height follows via the natural ratio;
  // the container height below leaves room for the tallest (centre) card.
  const cardW = "w-[34vw] max-w-[92px] sm:max-w-[165px] md:max-w-[200px]";

  return (
    <div ref={ref} className="relative w-full h-[230px] sm:h-[350px] md:h-[420px]">
      {images.map((src, i) => {
        const d = i - center; // -2 .. 2 for a 5-card deck
        const step = Math.abs(d);
        const rot = spread ? d * g.rot : 0;
        const tx = spread ? d * g.tx : 0;
        const sc = spread ? 1 - step * g.scale : 1;
        return (
          <img
            key={i}
            src={src}
            alt={`${title} ${i + 1}`}
            loading="lazy"
            decoding="async"
            className={`absolute bottom-0 left-1/2 ${cardW} rounded-[20px] border border-white/12 bg-[#0D0F1E] shadow-2xl shadow-black/50`}
            style={{
              transform: `translateX(-50%) translateX(${tx}%) rotate(${rot}deg) scale(${sc})`,
              transformOrigin: "bottom center",
              zIndex: 20 - Math.round(step),
              transition: `transform 750ms cubic-bezier(0.22, 1, 0.36, 1) ${step * 70}ms`,
              willChange: "transform",
            }}
          />
        );
      })}
    </div>
  );
}
