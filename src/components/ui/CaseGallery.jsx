import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { hexA } from "./notes/utils";

/*
  CaseGallery
  -----------
  A coverflow carousel of captioned screenshots, for projects with a story to
  walk through rather than a few shots to show off. Used by ProjectExpand when
  a project sets galleryLayout: "rail".

  The frame you are reading sits centre and full size; the one before and the
  one after flank it, smaller and faded, so there is always visible evidence
  that the set continues in both directions. It advances itself every 3.5s,
  because the captions carry an argument and the argument should start making
  itself without anyone having to find a control first.

  Autoplay is the part worth being careful about. It stops while a pointer is
  over it, while anything inside it has focus, while the tab is in the
  background, whenever the reader takes manual control, and entirely under
  prefers-reduced-motion — plus there is an explicit pause button, because
  "hover to pause" is not a mechanism a keyboard or touch reader can use.

  Everything animates with transform and opacity only, one transition per
  slide, which is what keeps it cheap on the weak phones this site targets.
*/

const INTERVAL = 3500;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

// Signed distance from the centre, taking the shorter way around the loop, so
// the first and last frames are neighbours rather than a long scroll apart.
const offsetOf = (i, index, n) => {
  let off = i - index;
  if (off > n / 2) off -= n;
  if (off < -n / 2) off += n;
  return off;
};

const poseOf = (off) => {
  const d = Math.abs(off);
  if (d === 0) return { scale: 1, opacity: 1 };
  if (d === 1) return { scale: 0.78, opacity: 0.4 };
  return { scale: 0.64, opacity: 0.14 };
};

export default function CaseGallery({ items, title, accent, accent2, t, reduce = false }) {
  const n = items ? items.length : 0;
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [held, setHeld] = useState(false); // pointer over, or focus inside
  const [tabVisible, setTabVisible] = useState(true);
  const stageRef = useRef(null);
  // Set while a finger is dragging sideways, so the click that a touch always
  // ends with cannot also count as "tap the neighbour to bring it to centre".
  const draggedRef = useRef(false);

  const go = useCallback((dir) => setIndex((i) => (i + dir + n) % n), [n]);

  // Pause while the tab is in the background — an unseen carousel advancing is
  // pure waste, and the reader would come back to a frame they never chose.
  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const playing = !reduce && !userPaused && !held && tabVisible && n > 1;

  // Keyed on index as well as playing, so manual navigation restarts the
  // countdown instead of advancing again a moment later.
  useEffect(() => {
    if (!playing) return undefined;
    const id = setTimeout(() => setIndex((i) => (i + 1) % n), INTERVAL);
    return () => clearTimeout(id);
  }, [index, playing, n]);

  // Swipe. The first few pixels decide whether this gesture is ours or the
  // page's: sideways turns the carousel, up/down is a scroll we never touch.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const SLOP = 10;
    let x0 = 0, y0 = 0, axis = null, used = false;

    const onStart = (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      x0 = touch.clientX; y0 = touch.clientY; axis = null; used = false;
      draggedRef.current = false;
    };
    const onMove = (e) => {
      const touch = e.touches[0];
      if (!touch || used) return;
      const dx = touch.clientX - x0;
      const dy = touch.clientY - y0;
      if (!axis) {
        if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (axis !== "x") return;
      e.preventDefault();
      draggedRef.current = true;
      if (Math.abs(dx) > 45) {
        go(dx < 0 ? 1 : -1);
        setUserPaused(true); // they are driving now
        used = true;
      }
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
    };
  }, [go]);

  const onKeyDown = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    go(e.key === "ArrowRight" ? 1 : -1);
    setUserPaused(true);
  };

  const manual = (dir) => {
    go(dir);
    setUserPaused(true);
  };

  if (!n) return null;

  // Smaller and pushed further out on a phone. At 390px the centre frame is
  // almost as wide as the column, so a desktop-sized arrow at the edge lands
  // on the screenshot instead of beside it.
  const btn =
    "inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border backdrop-blur-sm transition-all " +
    "border-stone-200 bg-white/90 text-stone-700 hover:bg-white hover:scale-105 active:scale-95 shadow-lg " +
    "dark:border-white/15 dark:bg-[#0B1120]/85 dark:text-slate-200 dark:hover:bg-[#0B1120] " +
    "focus:outline-none focus-visible:ring-2";

  return (
    <section
      aria-roledescription="carousel"
      aria-label={title}
      className="mt-2"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      {/* Counter, and an explicit pause that does not depend on having a pointer. */}
      <div className="mb-4 flex items-center gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-stone-500 dark:text-slate-400">
          <span style={{ color: accent }}>{String(index + 1).padStart(2, "0")}</span>
          <span className="mx-1.5 opacity-40">/</span>
          {String(n).padStart(2, "0")}
        </p>
        {!reduce && n > 1 && (
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={
              userPaused
                ? t("projects.gallery_play", "Play slideshow")
                : t("projects.gallery_pause", "Pause slideshow")
            }
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors
              border-stone-200 text-stone-500 hover:bg-stone-100
              dark:border-white/15 dark:text-slate-400 dark:hover:bg-white/10
              focus:outline-none focus-visible:ring-2"
            style={{ "--tw-ring-color": accent }}
          >
            {userPaused ? <Play size={12} /> : <Pause size={12} />}
          </button>
        )}
      </div>

      {/* Stage. Overflow is hidden so the flanking frames run off both edges. */}
      <div className="relative">
        <div
          ref={stageRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          role="group"
          aria-label={title}
          className="relative h-[190px] sm:h-[330px] lg:h-[400px] overflow-hidden rounded-sm
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4
            focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0B1120]"
          style={{ "--tw-ring-color": accent, touchAction: "pan-y" }}
        >
          {items.map((item, i) => {
            const off = offsetOf(i, index, n);
            const { scale, opacity } = poseOf(off);
            const far = Math.abs(off) > 2;
            const isCurrent = off === 0;
            return (
              <figure
                key={i}
                aria-hidden={!isCurrent}
                onClick={() => {
                  if (draggedRef.current) { draggedRef.current = false; return; }
                  if (Math.abs(off) === 1) manual(off);
                }}
                className="absolute left-1/2 top-1/2 h-full"
                style={{
                  aspectRatio: "16 / 10",
                  transform: `translate(-50%, -50%) translateX(${off * 58}%) scale(${scale})`,
                  opacity: far ? 0 : opacity,
                  visibility: far ? "hidden" : "visible",
                  zIndex: 30 - Math.abs(off),
                  transition: reduce
                    ? "none"
                    : `transform 650ms ${EASE}, opacity 650ms ${EASE}, visibility 650ms`,
                  cursor: Math.abs(off) === 1 ? "pointer" : "default",
                  pointerEvents: Math.abs(off) <= 1 ? "auto" : "none",
                  // Only the frames on screen ask for a compositor layer.
                  // Promoting all fourteen made the browser carry fourteen
                  // layers through every scroll of the case study for the five
                  // that can actually be seen.
                  willChange: far ? "auto" : "transform, opacity",
                }}
              >
                <div
                  // The big shadow is for the frame being read. The neighbours
                  // sit at 0.4 and 0.14 opacity, where a 2xl shadow is paint
                  // work nobody can see.
                  className={`h-full w-full overflow-hidden rounded-2xl border bg-stone-50
                    dark:bg-white/[0.03] shadow-stone-900/10 dark:shadow-black/50
                    ${isCurrent ? "shadow-2xl" : "shadow-md"}`}
                  style={{ borderColor: hexA(accent, isCurrent ? 0.3 : 0.15) }}
                >
                  {/* <picture> with a media query rather than srcset: on a 3x
                      phone, srcset would weigh 193 CSS px against the device
                      pixel ratio and pick the 1400px frame anyway, which is
                      the exact decode this is meant to avoid. */}
                  <picture>
                    {item.srcSmall && <source media="(max-width: 767px)" srcSet={item.srcSmall} />}
                    <img
                      src={item.src}
                      alt={item.alt || item.caption || ""}
                      // One frame of lead was enough at 5s; at 3.5s, and with
                      // fourteen frames rather than nine, fetch two ahead so a
                      // slow connection never swings an empty box into centre.
                      loading={Math.abs(off) <= 2 ? "eager" : "lazy"}
                      decoding="async"
                      draggable="false"
                      className="block h-full w-full object-cover object-top select-none"
                    />
                  </picture>
                </div>
              </figure>
            );
          })}
        </div>

        {/* Arrows flank the stage, sitting over the faded neighbours. */}
        <button
          type="button"
          onClick={() => manual(-1)}
          aria-label={t("projects.gallery_prev", "Previous image")}
          className={`${btn} absolute -left-3 top-1/2 z-40 -translate-y-1/2 sm:-left-2`}
          style={{ "--tw-ring-color": accent }}
        >
          <ArrowLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => manual(1)}
          aria-label={t("projects.gallery_next", "Next image")}
          className={`${btn} absolute -right-3 top-1/2 z-40 -translate-y-1/2 sm:-right-2`}
          style={{ "--tw-ring-color": accent }}
        >
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Caption for the centre frame. Fixed minimum height so swapping
          between a short and a long caption does not shift the page. */}
      <figcaption
        aria-live={playing ? "off" : "polite"}
        className="mx-auto mt-5 flex min-h-[4.5rem] max-w-[58ch] gap-3 px-1 sm:min-h-[4rem]"
      >
        <span
          aria-hidden="true"
          className="mt-[3px] font-mono text-[11px] font-bold tabular-nums"
          style={{ color: accent }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-[13.5px] sm:text-sm leading-relaxed text-stone-600 dark:text-slate-300">
          {items[index].caption}
        </span>
      </figcaption>

      {/* Position bar, which doubles as the autoplay progress for the set. */}
      <div className="mt-1 flex gap-1.5" aria-hidden="true">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            onClick={() => {
              setIndex(i);
              setUserPaused(true);
            }}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              background: i === index ? hexA(accent2 || accent, 0.95) : "currentColor",
              opacity: i === index ? 1 : 0.12,
            }}
          />
        ))}
      </div>
    </section>
  );
}
