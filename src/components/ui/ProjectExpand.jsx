import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink, Github, Sparkles, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProjectCardInner from "./ProjectCardInner";
import OurGridMotif from "./OurGridMotif";
import VisiobalMotif from "./VisiobalMotif";
import DevMatchMotif from "./DevMatchMotif";
import FanGallery from "./FanGallery";

/*
  ProjectExpand
  -------------
  Full-screen "click-to-expand" detail view for a project card.

  Motion (full): a slow, multi-stage flourish driven by the Web Animations API
  (dynamically computed keyframes — no animation library). The panel grows from
  the clicked card's exact rect to full screen while flipping 180° on its X axis,
  lifting gently toward the camera (translateZ) and back. A brand glow pulses
  behind it and a light sheen sweeps the front face; once it lands upright the
  detail content (header → gallery → facts) staggers in. Closing re-measures the
  card and reverses the arc cleanly back into its slot.

  Smoothness notes: the dim backdrop animates opacity only (no animated
  backdrop-filter — that was the lag); the frosted blur is applied statically
  only while settled. On close the detail is hidden immediately (no stagger) so
  the reverse flip stays light.

  A11y/UX: focus trapped + close button focused on open; Esc / X / backdrop
  close; body scroll locked. prefers-reduced-motion → plain cross-fade.
*/

const DURATION = 920; // ms — slow, deliberate open
const CLOSE_DURATION = 640; // ms — close (lighter, so a touch quicker)
const SPRING = "cubic-bezier(0.22, 1, 0.36, 1)";
const STEPS = 16;

const lerp = (a, b, t) => a + (b - a) * t;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const liftPeak = () => Math.min(Math.max((typeof window !== "undefined" ? window.innerHeight : 800) * 0.09, 56), 130);

// Per-project accent palette for the expanded detail view. Projects can supply
// their own brand colours via `project.theme`; anything omitted falls back to
// the portfolio's default sky/indigo so untouched cards look unchanged.
const DEFAULT_THEME = { accent: "#0EA5E9", accent2: "#6366F1", deep: "#0B1120" };

// hex (#rgb or #rrggbb) → rgba() string, so we can control alpha for glows/tints.
const hexA = (hex, a) => {
  const n = String(hex).replace("#", "");
  const f = n.length === 3 ? n.split("").map((c) => c + c).join("") : n;
  const r = parseInt(f.slice(0, 2), 16);
  const g = parseInt(f.slice(2, 4), 16);
  const b = parseInt(f.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function ProjectExpand({ project, cardEl, isFlipped = false, onClose }) {
  const { t } = useTranslation();
  const reduce = useRef(prefersReducedMotion()).current;
  // Phones skip the heavy 3D flip and get a clean sheet instead — the flip's
  // card→fullscreen morph is a desktop flourish that feels like too much on a
  // small screen. Short viewports (landscape phones) count as phones too.
  const isMobile = useRef(
    typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 640px), (max-height: 520px)").matches
  ).current;
  const lite = reduce || isMobile;

  // Resolve this project's brand palette (falls back to the default sky/indigo).
  const theme = { ...DEFAULT_THEME, ...(project.theme || {}) };
  // Per-project decorative side motif (OurGrid → electric waves, Visiobal → sonar).
  const MotifComp =
    project.motif === "grid"
      ? OurGridMotif
      : project.motif === "sonar"
        ? VisiobalMotif
        : project.motif === "match"
          ? DevMatchMotif
          : null;

  // Address-bar label shown on the flip's front-face card (mirrors the grid).
  const urlLabel =
    project.liveUrl && project.liveUrl !== "#"
      ? project.liveUrl.replace("https://", "").replace(/\/$/, "")
      : "localhost:3000";

  const panelRef = useRef(null);
  const glowRef = useRef(null);
  const sheenRef = useRef(null);
  const closeBtnRef = useRef(null);
  const closingRef = useRef(false);
  const animsRef = useRef([]);
  const revealTimer = useRef(0);
  const geomRef = useRef({ dx: 0, dy: 0, sx: 1, sy: 1 });

  // Scroll-driven story timeline ("journey" line that draws in on scroll).
  const scrollRef = useRef(null); // the scrollable detail container
  const timelineRef = useRef(null); // the <ol>
  const railRef = useRef(null); // faint full rail (node 1 → node 5)
  const fillRef = useRef(null); // bright brand fill that grows with scroll
  const firstNodeRef = useRef(null);
  const lastNodeRef = useRef(null);
  const chapterRefs = useRef([]); // each story <li>, for scroll-in reveal

  const [backdropOn, setBackdropOn] = useState(false);
  const [revealed, setRevealed] = useState(reduce); // detail content stagger
  const [settled, setSettled] = useState(reduce); // open finished → static blur ok
  const [closing, setClosing] = useState(false);

  // A viewport-pinned decorative layer that flanks the content as you scroll.
  // Mounted only once the open flip has SETTLED: rendering the SVG while the
  // panel is still scaling during the flip rasterises it at low resolution
  // (the "pixely on first open, crisp on second" bug). Fades in when it lands.
  const motifLayer =
    MotifComp && settled && !closing ? (
      <div
        className="pointer-events-none sticky top-0 -z-10"
        style={{ height: "100vh", marginBottom: "-100vh", animation: "motif-in 600ms ease both" }}
      >
        <MotifComp accent={theme.accent} accent2={theme.accent2} />
      </div>
    ) : null;
  const [geom, setGeom] = useState(null); // drives the front-face counter-scale
  const [revealedChapters, setRevealedChapters] = useState(() => new Set()); // story steps scrolled into view

  // Measure the *live* card rect → FLIP geometry (origin = panel centre).
  const measure = () => {
    if (!cardEl) return geomRef.current;
    const r = cardEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const g = {
      dx: r.left + r.width / 2 - vw / 2,
      dy: r.top + r.height / 2 - vh / 2,
      sx: Math.max(r.width / vw, 0.0001),
      sy: Math.max(r.height / vh, 0.0001),
      vw,
      vh,
      cardW: r.width,
      cardH: r.height,
    };
    geomRef.current = g;
    setGeom(g);
    return g;
  };

  // Multi-keyframe path for the flipping panel (card → full screen).
  const buildPanelKeyframes = (g, zPeak) => {
    const frames = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      const e = easeInOutCubic(t);
      const tx = lerp(g.dx, 0, e);
      const ty = lerp(g.dy, 0, e);
      const scx = lerp(g.sx, 1, e);
      const scy = lerp(g.sy, 1, e);
      const rot = lerp(0, 180, e);
      const z = Math.sin(Math.PI * t) * zPeak;
      frames.push({
        transform: `translate(${tx}px, ${ty}px) scale(${scx}, ${scy}) translateZ(${z}px) rotateX(${rot}deg)`,
        offset: t,
      });
    }
    return frames;
  };

  const trapTab = (e) => {
    const root = panelRef.current;
    if (!root) return;
    const f = root.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea'
    );
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const requestClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    // Consume the history entry pushed on open (no-op when closing came from
    // the back button itself — the browser already popped it).
    if (window.history.state && window.history.state.projectExpand) {
      window.history.back();
    }
    clearTimeout(revealTimer.current);
    setClosing(true); // hide detail instantly so the reverse flip stays light
    setRevealed(false);
    setBackdropOn(false);

    const panel = panelRef.current;
    if (lite || !panel || typeof panel.animate !== "function") {
      window.setTimeout(onClose, reduce ? 240 : 320); // sheet slide-out / fade
      return;
    }
    const g = measure(); // re-measure the card's CURRENT position → lands in place
    const frames = buildPanelKeyframes(g, liftPeak() * 0.45); // softer lift on close
    const closeFrames = frames
      .slice()
      .reverse()
      .map((f, i) => ({ transform: f.transform, offset: i / (frames.length - 1) }));

    const a = panel.animate(closeFrames, { duration: CLOSE_DURATION, easing: "linear", fill: "forwards" });
    if (glowRef.current) {
      glowRef.current.animate([{ opacity: 0.4 }, { opacity: 0 }], {
        duration: CLOSE_DURATION * 0.6,
        fill: "forwards",
      });
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onClose();
    };
    a.onfinish = finish;
    window.setTimeout(finish, CLOSE_DURATION + 140); // safety net
  };

  // Open choreography + scroll lock (one layout effect so the measurement
  // reflects the locked layout the card will keep while open).
  useLayoutEffect(() => {
    const { body, documentElement } = document;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    const sbw = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (sbw > 0) body.style.paddingRight = `${sbw}px`;

    setBackdropOn(true);
    const g = measure();

    const panel = panelRef.current;
    if (!lite && panel && typeof panel.animate === "function") {
      animsRef.current.forEach((x) => x.cancel());
      animsRef.current = [];

      const pa = panel.animate(buildPanelKeyframes(g, liftPeak()), {
        duration: DURATION,
        easing: "linear",
        fill: "forwards",
      });
      pa.onfinish = () => setSettled(true);
      animsRef.current.push(pa);

      if (glowRef.current) {
        animsRef.current.push(
          glowRef.current.animate(
            [
              { opacity: 0, transform: "translate(-50%, -50%) scale(0.6)" },
              { opacity: 0.85, offset: 0.42, transform: "translate(-50%, -50%) scale(1.05)" },
              { opacity: 0, transform: "translate(-50%, -50%) scale(1.25)" },
            ],
            { duration: DURATION, easing: "ease-out", fill: "forwards" }
          )
        );
      }
      if (sheenRef.current) {
        animsRef.current.push(
          sheenRef.current.animate(
            [
              { transform: "translateX(-160%) skewX(-12deg)", opacity: 0, offset: 0 },
              { opacity: 0.8, offset: 0.18 },
              { transform: "translateX(160%) skewX(-12deg)", opacity: 0, offset: 0.5 },
              { transform: "translateX(160%) skewX(-12deg)", opacity: 0, offset: 1 },
            ],
            { duration: DURATION, easing: "ease-in-out", fill: "forwards" }
          )
        );
      }
      revealTimer.current = window.setTimeout(() => setRevealed(true), DURATION * 0.52);
    } else {
      setRevealed(true);
      setSettled(true);
    }

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
      clearTimeout(revealTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus the close button on open; handle Esc + focus trap.
  useEffect(() => {
    const id = requestAnimationFrame(() => closeBtnRef.current?.focus());
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
      } else if (e.key === "Tab") {
        trapTab(e);
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("keydown", onKey, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw the story timeline as the reader scrolls: a faint rail spans node 1 →
  // node 5 (and stops there), while a brand-coloured fill grows to track how far
  // down the journey they've read. Geometry is measured live so it survives the
  // open flip, the entrance stagger, and resizes. reduced-motion → fully drawn.
  useEffect(() => {
    if (!story) return;
    const rail = railRef.current;
    const fill = fillRef.current;
    const ol = timelineRef.current;
    const first = firstNodeRef.current;
    const last = lastNodeRef.current;
    if (!rail || !fill || !ol || !first || !last) return;

    const update = () => {
      const olRect = ol.getBoundingClientRect();
      const fr = first.getBoundingClientRect();
      const lr = last.getBoundingClientRect();
      const firstCenter = fr.top + fr.height / 2;
      const lastCenter = lr.top + lr.height / 2;
      const railTop = firstCenter - olRect.top; // relative to the <ol>
      const railHeight = Math.max(lastCenter - firstCenter, 0);
      rail.style.top = `${railTop}px`;
      rail.style.height = `${railHeight}px`;
      fill.style.top = `${railTop}px`;
      if (reduce) {
        fill.style.height = `${railHeight}px`;
        return;
      }
      // Fill up to a trigger line ~72% down the viewport, so the last node lands
      // "read" only once it has scrolled up into view.
      const trigger = window.innerHeight * 0.72;
      const filled = Math.min(Math.max(trigger - firstCenter, 0), railHeight);
      fill.style.height = `${filled}px`;
    };

    const scroller = scrollRef.current || panelRef.current;
    update();
    const raf1 = requestAnimationFrame(update);
    const raf2 = requestAnimationFrame(() => requestAnimationFrame(update));
    const settle = window.setTimeout(update, DURATION + 40); // after the open flip
    scroller && scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(settle);
      scroller && scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reveal each story chapter (its node + text) as it scrolls into view, and
  // hide it again when it scrolls back out — so the journey folds and unfolds
  // with the reader both ways. The panel is a full-viewport fixed layer, so a
  // null (viewport) root tracks the internal scroll correctly.
  useEffect(() => {
    if (!story) return;
    if (reduce) {
      setRevealedChapters(new Set(story.map((_, i) => i)));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.dataset.idx);
          setRevealedChapters((prev) => {
            if (entry.isIntersecting === prev.has(idx)) return prev; // no change
            const next = new Set(prev);
            if (entry.isIntersecting) next.add(idx);
            else next.delete(idx);
            return next;
          });
        });
      },
      { root: null, rootMargin: "0px 0px -25% 0px", threshold: 0.01 }
    );
    chapterRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While the settled panel fully covers the viewport, pause the WebGL universe
  // behind it — it would otherwise keep rendering frames nobody can see.
  // Resumes the moment closing starts (the backdrop turns translucent again).
  useEffect(() => {
    if (!settled || closing) return undefined;
    window.dispatchEvent(new Event("universe:pause"));
    return () => window.dispatchEvent(new Event("universe:resume"));
  }, [settled, closing]);

  // The browser/Android back button should close the overlay, not leave the
  // site: push one history entry on open (guarded so StrictMode's double-mount
  // doesn't push twice) and close on popstate. requestClose consumes the entry
  // itself, so this cleanup never navigates — a cleanup-time history.back()
  // would fire popstate into the remounted listener and instantly self-close.
  useEffect(() => {
    const onPop = () => requestClose();
    if (!(window.history.state && window.history.state.projectExpand)) {
      window.history.pushState({ projectExpand: true }, "");
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // staggered reveal style helper (instant uniform hide while closing)
  const rv = (delay) => {
    if (reduce) return undefined;
    const shown = revealed && !closing;
    return {
      opacity: shown ? 1 : 0,
      transform: shown ? "translateY(0)" : "translateY(18px)",
      transition: closing
        ? "opacity 130ms ease, transform 130ms ease"
        : `opacity 620ms ${SPRING} ${delay}ms, transform 620ms ${SPRING} ${delay}ms`,
      willChange: "opacity, transform",
    };
  };

  // Per-chapter reveal — driven by scroll position, not a timed stagger. Each
  // step stays hidden until the observer marks it in view (see effect above).
  const chapterStyle = (i) => {
    if (reduce) return undefined;
    const shown = revealedChapters.has(i) && !closing;
    return {
      opacity: shown ? 1 : 0,
      transform: shown ? "translateY(0)" : "translateY(26px)",
      transition: closing
        ? "opacity 130ms ease, transform 130ms ease"
        : `opacity 640ms ${SPRING}, transform 640ms ${SPRING}`,
      willChange: "opacity, transform",
    };
  };

  const gallery = project.gallery && project.gallery.length ? project.gallery : [project.img];
  const story = project.story && project.story.length ? project.story : null;
  const gBase = 150;
  const storyBase = gBase + gallery.length * 110 + 60;
  const storyCount = story ? story.length : 0;
  const fBase = storyBase + storyCount * 90 + 190;

  // Reusable brand gradient (accent → accent2) for buttons, nodes, accents.
  const brandGradient = `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`;

  const detail = (
    <div className="min-h-full text-gray-900 dark:text-white">
      {/* Sticky top bar */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between gap-4 px-5 sm:px-8 py-3.5
          bg-white/75 dark:bg-[#0B1120]/75 backdrop-blur-xl border-b border-gray-200/70 dark:border-white/10"
      >
        <div className="min-w-0 flex items-center gap-3">
          <span
            className="hidden sm:inline font-bold tracking-[0.18em] uppercase text-[11px]"
            style={{ color: theme.accent }}
          >
            {project.role}
          </span>
          <span className="font-bold truncate text-sm sm:text-base">{project.title}</span>
        </div>
        <button
          ref={closeBtnRef}
          onClick={requestClose}
          aria-label={t("projects.close", "Close")}
          className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors
            bg-gray-100 hover:bg-gray-200 text-gray-700
            dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-200
            focus:outline-none focus-visible:ring-2"
          style={{ "--tw-ring-color": theme.accent }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Brand wash across the top of the story, tinted with the project colours */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{
          background: `radial-gradient(80% 100% at 50% 0%, ${hexA(theme.accent, 0.16)}, ${hexA(
            theme.accent2,
            0.08
          )} 45%, transparent 72%)`,
        }}
      />

      <article className="relative mx-auto w-full max-w-5xl px-5 sm:px-8 pb-14 sm:pb-24">
        {/* Header — eyebrow, display title, lead, tags, actions */}
        <header className="pt-8 sm:pt-16 pb-8 sm:pb-14" style={rv(0)}>
          <p
            className="font-bold tracking-[0.22em] uppercase text-xs sm:text-sm"
            style={{ color: theme.accent }}
          >
            {project.role}
          </p>
          <h2 className="font-black tracking-tight leading-[1.05] sm:leading-[1.03] text-3xl sm:text-6xl mt-3 sm:mt-4 text-gray-900 dark:text-white">
            {project.title}
          </h2>
          {/* Brand underline */}
          <div
            className="mt-4 sm:mt-5 h-1.5 w-20 sm:w-24 rounded-full"
            style={{ background: brandGradient }}
          />
          <p className="mt-5 sm:mt-6 max-w-2xl text-base sm:text-xl leading-relaxed text-gray-600 dark:text-slate-300">
            {project.desc}
          </p>
          <div className="mt-6 sm:mt-7 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border"
                style={{
                  color: theme.accent,
                  background: hexA(theme.accent, 0.1),
                  borderColor: hexA(theme.accent, 0.28),
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row flex-wrap gap-3">
            {project.liveUrl && project.liveUrl !== "#" && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 hover:brightness-110 active:scale-95 shadow-lg shadow-sky-500/30"
                style={{ backgroundColor: "#0EA5E9" }}
              >
                {t("projects.btn_live", "Live Demo")} <ExternalLink size={18} />
              </a>
            )}
            {project.repoUrl && project.repoUrl !== "#" && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border font-bold transition-transform hover:scale-105 active:scale-95 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                {t("projects.btn_code", "View Code")} <Github size={18} />
              </a>
            )}
          </div>
        </header>

        {/* Big imagery. galleryLayout:"fan" spreads the shots like a hand of
            cards; otherwise a framed grid (with a per-project aspect ratio so
            mixed portrait/landscape shots share one size and never crop). */}
        {project.galleryLayout === "fan" ? (
          <div style={rv(gBase)}>
            <FanGallery images={gallery} title={project.title} />
          </div>
        ) : (
          (() => {
            const multi = gallery.length > 1;
            const aspect = project.galleryAspect || "4 / 3";
            return (
              <div className={multi ? "grid gap-5 sm:gap-6 sm:grid-cols-2" : "space-y-6"}>
                {gallery.map((src, i) => (
                  <figure
                    key={i}
                    style={rv(gBase + i * 110)}
                    className="overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10
                      bg-gray-50 dark:bg-white/[0.03] shadow-xl shadow-slate-900/5 dark:shadow-black/40"
                  >
                    <img
                      src={src}
                      alt={`${project.title} ${i + 1}`}
                      loading="lazy"
                      decoding="async"
                      className={multi ? "block w-full object-contain p-2" : "block w-full h-auto"}
                      style={multi ? { aspectRatio: aspect } : undefined}
                    />
                  </figure>
                ))}
              </div>
            );
          })()
        )}

        {/* The story — a chapter timeline, threaded with the brand gradient */}
        {story && (
          <section className="mt-12 sm:mt-24">
            <h3
              className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3 mb-8 sm:mb-10"
              style={rv(storyBase - 60)}
            >
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ color: theme.accent, background: hexA(theme.accent, 0.12) }}
              >
                <BookOpen size={18} />
              </span>
              {t("projects.detail_story", "The story")}
            </h3>

            <ol ref={timelineRef} className="relative">
              {/* faint rail — measured to start at node 1 and stop at node 5 */}
              <span
                ref={railRef}
                aria-hidden="true"
                className="absolute left-[17px] sm:left-[21px] w-[2px] rounded-full"
                style={{ top: 0, height: 0, background: hexA(theme.accent, 0.15) }}
              />
              {/* brand fill — draws downward as the reader scrolls the journey */}
              <span
                ref={fillRef}
                aria-hidden="true"
                className="absolute left-[17px] sm:left-[21px] w-[2px] rounded-full"
                style={{
                  top: 0,
                  height: 0,
                  background: `linear-gradient(to bottom, ${theme.accent}, ${theme.accent2})`,
                  transition: "height 90ms linear",
                  willChange: "height",
                }}
              />
              {story.map((ch, i) => (
                <li
                  key={i}
                  ref={(el) => (chapterRefs.current[i] = el)}
                  data-idx={i}
                  className="relative pl-11 sm:pl-16 pb-8 sm:pb-12 last:pb-0"
                  style={chapterStyle(i)}
                >
                  <span
                    ref={i === 0 ? firstNodeRef : i === story.length - 1 ? lastNodeRef : null}
                    className="absolute left-0 top-0 inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full text-sm font-black text-white"
                    style={{ background: brandGradient, boxShadow: `0 8px 20px ${hexA(theme.accent, 0.35)}` }}
                  >
                    {i + 1}
                  </span>
                  {ch.kicker && (
                    <p
                      className="text-[11px] font-black uppercase tracking-[0.2em]"
                      style={{ color: theme.accent }}
                    >
                      {ch.kicker}
                    </p>
                  )}
                  <h4 className="mt-1.5 text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    {ch.title}
                  </h4>
                  <p className="mt-2.5 max-w-2xl text-[15px] sm:text-base leading-relaxed text-gray-600 dark:text-slate-300">
                    {ch.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Interesting facts — numbered cards */}
        {project.facts && project.facts.length > 0 && (
          <section className="mt-12 sm:mt-24">
            <h3
              className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3 mb-8"
              style={rv(fBase - 90)}
            >
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ color: theme.accent, background: hexA(theme.accent, 0.12) }}
              >
                <Sparkles size={18} />
              </span>
              {t("projects.detail_facts", "Interesting facts")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {project.facts.map((fact, i) => {
                const isTodo = /^todo/i.test(String(fact).trim());
                return (
                  <div
                    key={i}
                    style={rv(fBase + i * 70)}
                    className={`rounded-2xl p-5 sm:p-6 border ${
                      isTodo
                        ? "border-dashed border-amber-300/70 bg-amber-50/60 text-amber-700 italic dark:border-amber-400/30 dark:bg-amber-400/5 dark:text-amber-300/90"
                        : "border-gray-200 bg-gray-50/80 text-gray-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <span
                        className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black"
                        style={
                          isTodo
                            ? undefined
                            : { color: theme.accent, background: hexA(theme.accent, 0.12) }
                        }
                      >
                        {i + 1}
                      </span>
                      <p className="text-[15px] sm:text-base leading-relaxed">{fact}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </article>
    </div>
  );

  // ---- Lite mode: phones + reduced-motion. A clean sheet, no 3D flip. ----
  if (lite) {
    return createPortal(
      <div className="fixed inset-0 z-[999]">
        <div
          onClick={requestClose}
          className={`absolute inset-0 transition-opacity duration-300 ${
            backdropOn ? "opacity-100" : "opacity-0"
          }`}
          style={{ background: "rgba(2,6,23,0.80)" }}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
          className={`absolute inset-0 overflow-y-auto overscroll-contain isolate bg-white dark:bg-[#0B1120] ${
            reduce ? `transition-opacity duration-300 ${backdropOn ? "opacity-100" : "opacity-0"}` : ""
          }`}
          style={
            reduce
              ? undefined
              : {
                  animation: closing
                    ? "pe-sheet-out 220ms ease forwards"
                    : "pe-sheet-in 320ms cubic-bezier(0.22, 1, 0.36, 1) both",
                }
          }
        >
          {motifLayer}
          {detail}
        </div>
      </div>,
      document.body
    );
  }

  // ---- Full motion: depth flip + expand ----
  return createPortal(
    <div className="fixed inset-0 z-[999]" style={{ perspective: "1500px" }}>
      {/* dim backdrop — opacity only; static frosted blur applied only when settled */}
      <div
        onClick={requestClose}
        className={`absolute inset-0 transition-opacity duration-[600ms] ease-out ${
          settled && !closing ? "backdrop-blur-md" : ""
        }`}
        style={{
          opacity: backdropOn ? 1 : 0,
          background: `radial-gradient(120% 90% at 50% -10%, ${hexA(theme.accent, 0.2)}, ${hexA(
            theme.accent2,
            0.1
          )} 38%, rgba(2,6,23,0) 60%), rgba(2,6,23,0.82)`,
        }}
      />

      {/* glow aura that pulses behind the panel during the turn */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 w-[58vw] h-[58vh] rounded-full blur-3xl pointer-events-none"
        style={{
          transform: "translate(-50%, -50%) scale(0.6)",
          opacity: 0,
          background: `radial-gradient(closest-side, ${hexA(theme.accent, 0.55)}, ${hexA(
            theme.accent2,
            0.28
          )} 55%, ${hexA(theme.accent2, 0)} 75%)`,
        }}
      />

      {/* the flipping panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        {/* FRONT face — the WHOLE card, laid out at the card's true size via a
            counter-scale so it matches the grid card while it turns. */}
        <div
          className="absolute inset-0 overflow-hidden"
          aria-hidden="true"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateX(0deg)",
          }}
        >
          {geom && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${geom.cardW}px`,
                height: `${geom.cardH}px`,
                transform: `scale(${1 / geom.sx}, ${1 / geom.sy})`,
                transformOrigin: "top left",
              }}
            >
              <div
                className="relative w-full h-full overflow-hidden rounded-[32px] p-7 sm:p-10 md:p-14
                  bg-white shadow-xl border border-sky-100
                  dark:bg-[#0B1120] dark:shadow-none dark:border-sky-900/40"
              >
                <ProjectCardInner
                  project={project}
                  isFlipped={isFlipped}
                  urlLabel={urlLabel}
                  t={t}
                  interactive={false}
                />
              </div>
            </div>
          )}

          {/* light sweep across the card during the turn */}
          <div
            ref={sheenRef}
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1/2 pointer-events-none z-10"
            style={{
              opacity: 0,
              transform: "translateX(-160%) skewX(-12deg)",
              background:
                "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.45) 50%, transparent 65%)",
              mixBlendMode: "overlay",
            }}
          />
        </div>

        {/* BACK face — detail, counter-rotated so it lands upright */}
        <div
          ref={scrollRef}
          className="absolute inset-0 overflow-y-auto overscroll-contain isolate bg-white dark:bg-[#0B1120]"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateX(180deg)",
          }}
        >
          {motifLayer}
          {detail}
        </div>
      </div>
    </div>,
    document.body
  );
}
