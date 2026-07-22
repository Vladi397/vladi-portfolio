import React, { useEffect, useRef, useState } from "react";

/*
  VisiobalGallery
  ---------------
  Entrance animation for Visiobal's two gallery images. Instead of the shots just
  sitting there, two pink balls fly in from the left and right, arc down and
  bounce once on the floor, converge toward the centre, and — just before the
  second bounce — burst in a little splash. The two images then appear from both
  sides and settle into place. Echoes Visiobal's "audio ball" idea.

  Used by ProjectExpand when a project sets galleryLayout: "bounce".

  Phases: idle -> drop (balls bounce in) -> reveal (splash + images slide in) ->
  done. Desktop only; on phones / reduced-motion the images are shown plainly
  (phase starts at "done"), so nothing animates where it isn't wanted.
*/

const BALL_PX = 34; // ball diameter

// Splash droplets: [dx, dy, size] — flung outward from the impact, biased up/out.
const DROPLETS = [
  [-40, -48, 8],
  [-8, -64, 9],
  [42, -46, 8],
  [-60, -14, 7],
  [58, -10, 7],
  [-34, 30, 6],
  [38, 26, 6],
  [12, -76, 6],
];

// What state the animation should begin in. Phones and reduced-motion users
// skip straight to the finished images — no balls, no splash.
function initialPhase() {
  if (typeof window === "undefined") return "done";
  const mm = window.matchMedia;
  if (!mm) return "done";
  if (mm("(prefers-reduced-motion: reduce)").matches) return "done";
  if (!mm("(min-width: 640px)").matches) return "done"; // desktop-only flourish
  return "idle";
}

export default function VisiobalGallery({ images, title, aspect = "4 / 3" }) {
  const wrapRef = useRef(null);
  const startedRef = useRef(false); // one-shot guard for the entrance
  const [phase, setPhase] = useState(initialPhase);
  const [vars, setVars] = useState(null); // ball travel distances, sized to the box

  // Size the ball motion to the actual gallery box (so it scales with the layout).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      setVars({
        "--vb-ex": `${Math.round(r.width * 0.46)}px`, // horizontal entry, off toward each edge
        "--vb-ey": `${-Math.round(r.height * 0.62)}px`, // entry height above the floor
        "--vb-apex": `${-Math.round(r.height * 0.44)}px`, // bounce apex above the floor
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Kick the sequence off when the gallery scrolls into view (once). Runs on
  // mount only — must NOT depend on phase, or advancing the phase would tear the
  // effect down and clear the reveal/done timers before they fire.
  useEffect(() => {
    if (initialPhase() !== "idle") return; // phones / reduced-motion: nothing to trigger
    const el = wrapRef.current;
    if (!el) return;
    let tDrop = 0;
    let tReveal = 0;
    let tDone = 0;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || startedRef.current) return;
          startedRef.current = true;
          io.disconnect();
          // Hold until the panel has finished opening, then bounce the balls in.
          tDrop = window.setTimeout(() => {
            setPhase("drop");
            tReveal = window.setTimeout(() => setPhase("reveal"), 880); // just before the 2nd bounce
            tDone = window.setTimeout(() => setPhase("done"), 880 + 720); // splash spent, images settled
          }, 750);
        });
      },
      { threshold: 0.45 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(tDrop);
      clearTimeout(tReveal);
      clearTimeout(tDone);
    };
  }, []);

  const revealed = phase === "reveal" || phase === "done";
  const showBalls = phase === "drop" && vars; // balls bounce in during "drop" only
  const showSplash = phase === "reveal"; // one-shot burst as the images take over

  return (
    <div
      ref={wrapRef}
      className="relative grid gap-5 sm:gap-6 sm:grid-cols-2"
      style={vars || undefined}
    >
      {images.slice(0, 2).map((src, i) => {
        const fromLeft = i === 0;
        return (
          <figure
            key={i}
            className="overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10
              bg-gray-50 dark:bg-white/[0.03] shadow-xl shadow-slate-900/5 dark:shadow-black/40"
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed
                ? "translateX(0) scale(1)"
                : `translateX(${fromLeft ? "-26px" : "26px"}) scale(0.92)`,
              transition:
                phase === "done" && !showSplash
                  ? undefined
                  : "opacity 480ms ease-out 130ms, transform 640ms cubic-bezier(0.22,1,0.36,1) 130ms",
            }}
          >
            <img
              src={src}
              alt={`${title} ${i + 1}`}
              loading="lazy"
              decoding="async"
              className="block w-full object-contain p-2"
              style={{ aspectRatio: aspect }}
            />
          </figure>
        );
      })}

      {/* Bouncing balls — fly in from both sides, bounce once, converge to centre. */}
      {showBalls && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {[-1, 1].map((dir) => (
            <div
              key={dir}
              className="absolute"
              style={{ left: "50%", top: "68%", transform: "translate(-50%, -50%)" }}
            >
              <span
                className="block rounded-full"
                style={{
                  width: BALL_PX,
                  height: BALL_PX,
                  "--vb-dir": dir,
                  background:
                    "radial-gradient(circle at 34% 30%, #fbcfe8, #f472b6 55%, #db2777 88%)",
                  boxShadow: "0 8px 18px rgba(219,39,119,0.45), 0 0 12px rgba(244,114,182,0.6)",
                  animation: "vb-ball 950ms cubic-bezier(0.5,0,0.4,1) forwards",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Little splash where the balls converge, right before the images arrive:
          a bright core, an expanding ring, and droplets flung outward. */}
      {showSplash && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <span
            className="absolute rounded-full"
            style={{
              left: "50%",
              top: "50%",
              width: 104,
              height: 104,
              background:
                "radial-gradient(circle, rgba(251,207,232,0.95), rgba(244,114,182,0.6) 40%, rgba(219,39,119,0.25) 65%, transparent 78%)",
              animation: "vb-splash-core 560ms ease-out forwards",
            }}
          />
          <span
            className="absolute rounded-full border-2"
            style={{
              left: "50%",
              top: "50%",
              width: 74,
              height: 74,
              borderColor: "rgba(244,114,182,0.85)",
              animation: "vb-splash-ring 620ms ease-out forwards",
            }}
          />
          {DROPLETS.map(([dx, dy, size], i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: "50%",
                top: "50%",
                width: size,
                height: size,
                "--vb-dx": `${dx}px`,
                "--vb-dy": `${dy}px`,
                background: "radial-gradient(circle at 35% 30%, #fbcfe8, #f472b6 70%)",
                boxShadow: "0 0 6px rgba(244,114,182,0.7)",
                animation: `vb-droplet ${480 + (i % 3) * 90}ms ease-out forwards`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
