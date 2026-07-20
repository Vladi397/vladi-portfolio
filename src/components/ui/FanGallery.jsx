import React, { useEffect, useRef, useState } from "react";

/*
  FanGallery
  ----------
  A spread of phone screenshots fanned out like a hand of cards: the centre
  card sits upright and on top, the earlier cards fan to the left and the later
  ones to the right. On scroll-into-view the deck starts stacked at the centre
  and springs open (centre first, outer cards trailing) until fully spread.

  Used by ProjectExpand when a project sets galleryLayout: "fan".
*/

// Fan geometry, tuned per breakpoint. tx/ty are percentages of the card's own
// size so the whole fan scales with the responsive card width.
const GEO = {
  wide: { rot: 8, tx: 60, ty: 9, scale: 0.05 },
  compact: { rot: 6, tx: 40, ty: 7, scale: 0.06 },
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

  // Card sizing (portrait phone shots). Height follows via the natural ratio.
  const cardW = "w-[40vw] max-w-[120px] sm:max-w-[190px] md:max-w-[240px]";

  return (
    <div
      ref={ref}
      className="relative w-full flex justify-center overflow-x-clip
        h-[300px] sm:h-[440px] md:h-[540px]"
    >
      {images.map((src, i) => {
        const d = i - center; // -2 .. 2 for a 5-card deck
        const step = Math.abs(d);
        const rot = spread ? d * g.rot : 0;
        const tx = spread ? d * g.tx : 0;
        const ty = spread ? step * g.ty : 0;
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
              transform: `translateX(-50%) translateX(${tx}%) translateY(${ty}%) rotate(${rot}deg) scale(${sc})`,
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
