import React, { useEffect, useRef, useState } from "react";

/*
  LightningGallery
  ----------------
  A single project image that gets struck by lightning as it scrolls into view,
  then settles into a scorched / burned state with glowing embers. Fits OurGrid's
  grid-and-electricity theme. Used by ProjectExpand when a project sets
  galleryLayout: "lightning".

  Layers (back to front): the image (burns via a CSS filter), a scorch vignette
  that fades in, ember dots that flicker afterward, the lightning bolt SVG, an
  impact glow at the strike point, and a full-frame white flash. The bolt / flash
  / shake only play once; reduced-motion users get the burned result with no
  strike animation.
*/

// Strike point in the SVG's 0..100 space (also anchors the scorch + embers).
const HIT_X = 43;
const HIT_Y = 62;

// Ember positions (x, y in %, animation delay s) clustered near the strike.
const EMBERS = [
  [43, 62, 0.0],
  [38, 68, 0.5],
  [49, 58, 0.9],
  [34, 55, 1.3],
  [52, 70, 0.7],
  [46, 74, 1.6],
  [30, 66, 1.1],
];

export default function LightningGallery({ images, title }) {
  const ref = useRef(null);
  // Reduced-motion users start already burned (no strike animation).
  const [struck, setStruck] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
  const [playing, setPlaying] = useState(false); // bolt / flash / shake window

  useEffect(() => {
    const el = ref.current;
    if (!el || struck) return; // already burned (reduced motion) — nothing to trigger

    let startTimer = 0;
    let flashTimer = 0;
    let burnTimer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          // Hold a beat so the panel has finished opening and the image has
          // revealed — then the bolt actually hits something the viewer can see.
          startTimer = window.setTimeout(() => {
            setPlaying(true);
            burnTimer = window.setTimeout(() => setStruck(true), 170); // burn sets in on impact
            flashTimer = window.setTimeout(() => setPlaying(false), 1400); // end the flicker window
          }, 650);
        });
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(startTimer);
      clearTimeout(flashTimer);
      clearTimeout(burnTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <figure
      ref={ref}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 bg-slate-950 shadow-xl shadow-slate-900/10 dark:shadow-black/40"
      style={playing ? { animation: "lg-shake 650ms cubic-bezier(0.36,0.07,0.19,0.97)" } : undefined}
    >
      <img
        src={images[0]}
        alt={title}
        loading="lazy"
        decoding="async"
        className={`block w-full h-auto transition-[filter] duration-[1500ms] ease-out ${struck ? "lg-burned" : ""}`}
      />

      {/* Scorch vignette — darkest at the strike point and the edges. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-[1500ms] ease-out"
        style={{
          opacity: struck ? 1 : 0,
          background: `radial-gradient(90% 80% at ${HIT_X}% ${HIT_Y}%, rgba(20,10,4,0.15), rgba(12,6,3,0.55) 55%, rgba(4,2,1,0.9) 100%)`,
          mixBlendMode: "multiply",
        }}
      />
      {/* A hotter charred core right where it hit. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-[1500ms] ease-out"
        style={{
          opacity: struck ? 1 : 0,
          background: `radial-gradient(28% 26% at ${HIT_X}% ${HIT_Y}%, rgba(0,0,0,0.75), rgba(40,18,6,0.35) 60%, transparent 80%)`,
        }}
      />

      {/* Embers — glow in after the burn, keep flickering. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{ opacity: struck ? 1 : 0 }}
      >
        {EMBERS.map(([x, y, d], i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: 4,
              height: 4,
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, #fde68a, #f59e0b 45%, #b45309 75%, transparent)",
              boxShadow: "0 0 6px 2px rgba(245,158,11,0.7)",
              animation: `lg-ember ${1.6 + (i % 3) * 0.5}s ease-in-out ${d}s infinite`,
            }}
          />
        ))}
      </div>

      {/* The bolt + impact glow + flash — only during the strike window. */}
      {playing && (
        <>
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 w-full h-full"
            fill="none"
            style={{
              animation: "lg-bolt 1400ms ease-out",
              filter: "drop-shadow(0 0 2px #e0f2fe) drop-shadow(0 0 6px #7dd3fc) drop-shadow(0 0 14px #0ea5e9)",
            }}
          >
            <path
              d="M 52 -6 L 46 24 L 55 30 L 44 48 L 51 54 L 43 62 L 49 78 L 41 104"
              stroke="#ffffff"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* branches */}
            <path d="M 46 24 L 34 38" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 43 62 L 58 72" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {/* impact flash at the strike point */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              left: `${HIT_X}%`,
              top: `${HIT_Y}%`,
              width: "42%",
              height: "42%",
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, rgba(255,255,255,0.95), rgba(125,211,252,0.5) 35%, transparent 70%)",
              animation: "lg-bolt 1400ms ease-out",
            }}
          />

          {/* full-frame white flash */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-white"
            style={{ animation: "lg-flash 1400ms ease-out" }}
          />
        </>
      )}
    </figure>
  );
}
