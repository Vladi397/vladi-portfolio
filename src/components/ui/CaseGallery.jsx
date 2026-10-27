import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { hexA } from "./notes/utils";

/*
  CaseGallery
  -----------
  A sideways rail of captioned screenshots, for projects that have a story to
  walk through rather than a few shots to show off. Used by ProjectExpand when
  a project sets galleryLayout: "rail".

  Why a rail and not a grid: the captions carry the argument, and a rail forces
  them to be read one at a time and in order. A grid lets the eye skip, which
  is fine for a portfolio of images and wrong for a sequence of findings.

  It is a plain scroll container, so swipe, trackpad, shift-wheel and the
  arrow keys all work without any of it being reimplemented. The buttons are a
  pointer convenience on top, hidden where there is no pointer to use them.
*/

export default function CaseGallery({ items, title, accent, accent2, t }) {
  const railRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [index, setIndex] = useState(0);
  const raf = useRef(0);

  const measure = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft >= max - 8);
    // Which card is nearest the left edge of the viewport box.
    const first = el.firstElementChild;
    const step = first ? first.getBoundingClientRect().width + 20 : 1;
    setIndex(Math.min(items.length - 1, Math.max(0, Math.round(el.scrollLeft / step))));
  }, [items.length]);

  const onScroll = () => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      measure();
    });
  };

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [measure]);

  const nudge = (dir) => {
    const el = railRef.current;
    if (!el) return;
    const first = el.firstElementChild;
    const step = first ? first.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (!items || !items.length) return null;

  const btn =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all " +
    "border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:scale-105 active:scale-95 " +
    "dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 " +
    "disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-default";

  return (
    <section aria-label={title} className="mt-2">
      {/* Rail controls: a counter, and arrows for people using a mouse. */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-stone-500 dark:text-slate-400">
          <span style={{ color: accent }}>{String(index + 1).padStart(2, "0")}</span>
          <span className="mx-1.5 opacity-40">/</span>
          {String(items.length).padStart(2, "0")}
        </p>
        <div className="hidden sm:flex items-center gap-2">
          <button type="button" className={btn} onClick={() => nudge(-1)} disabled={atStart}
            aria-label={t("projects.gallery_prev", "Previous image")}>
            <ArrowLeft size={17} />
          </button>
          <button type="button" className={btn} onClick={() => nudge(1)} disabled={atEnd}
            aria-label={t("projects.gallery_next", "Next image")}>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {/* The rail itself. Negative margins let the cards bleed to the panel
          edge while the padding keeps the first and last one inset. */}
      <div
        ref={railRef}
        onScroll={onScroll}
        tabIndex={0}
        role="group"
        aria-label={title}
        className="swipe-row -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2
          sm:-mx-8 sm:px-8
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 rounded-sm
          focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0B1120]"
        style={{ "--tw-ring-color": accent }}
      >
        {items.map((item, i) => (
          <figure
            key={i}
            className="w-[84vw] max-w-[680px] shrink-0 snap-start sm:w-[62vw] lg:w-[640px]"
          >
            <div
              className="overflow-hidden rounded-2xl border shadow-xl
                border-stone-200 bg-stone-50 shadow-stone-900/5
                dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/40"
              style={{ borderColor: hexA(accent, 0.22) }}
            >
              <img
                src={item.src}
                alt={item.alt || item.caption}
                loading="lazy"
                decoding="async"
                className="block aspect-[16/10] w-full object-cover object-top"
              />
            </div>
            <figcaption className="mt-3.5 flex gap-3">
              <span
                aria-hidden="true"
                className="mt-[3px] font-mono text-[11px] font-bold tabular-nums"
                style={{ color: accent }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="max-w-[52ch] text-[13.5px] sm:text-sm leading-relaxed text-stone-600 dark:text-slate-300">
                {item.caption}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Position bar — a quieter stand-in for a scrollbar we hid. */}
      <div className="mt-3 flex gap-1.5" aria-hidden="true">
        {items.map((_, i) => (
          <span
            key={i}
            className="h-0.5 flex-1 rounded-full transition-all duration-300"
            style={{
              background: i <= index ? hexA(accent2 || accent, 0.85) : "currentColor",
              opacity: i <= index ? 1 : 0.12,
            }}
          />
        ))}
      </div>
    </section>
  );
}
