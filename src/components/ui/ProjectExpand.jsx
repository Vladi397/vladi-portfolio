import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink, Github, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProjectCardInner from "./ProjectCardInner";

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

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function ProjectExpand({ project, cardEl, isFlipped = false, onClose }) {
  const { t } = useTranslation();
  const reduce = useRef(prefersReducedMotion()).current;

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

  const [backdropOn, setBackdropOn] = useState(false);
  const [revealed, setRevealed] = useState(reduce); // detail content stagger
  const [settled, setSettled] = useState(reduce); // open finished → static blur ok
  const [closing, setClosing] = useState(false);
  const [geom, setGeom] = useState(null); // drives the front-face counter-scale

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
    clearTimeout(revealTimer.current);
    setClosing(true); // hide detail instantly so the reverse flip stays light
    setRevealed(false);
    setBackdropOn(false);

    const panel = panelRef.current;
    if (reduce || !panel || typeof panel.animate !== "function") {
      window.setTimeout(onClose, 300);
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
    if (!reduce && panel && typeof panel.animate === "function") {
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

  const gallery = project.gallery && project.gallery.length ? project.gallery : [project.img];
  const gBase = 150;
  const fBase = gBase + gallery.length * 110 + 170;

  const detail = (
    <div className="min-h-full text-gray-900 dark:text-white">
      {/* Sticky top bar */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between gap-4 px-5 sm:px-8 py-3.5
          bg-white/75 dark:bg-[#0B1120]/75 backdrop-blur-xl border-b border-gray-200/70 dark:border-sky-900/40"
      >
        <div className="min-w-0 flex items-center gap-3">
          <span className="hidden sm:inline text-[#0EA5E9] font-bold tracking-[0.18em] uppercase text-[11px]">
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
            focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <X size={20} />
        </button>
      </div>

      <article className="mx-auto w-full max-w-5xl px-5 sm:px-8 pb-16 sm:pb-24">
        {/* Header — eyebrow, display title, lead, tags, actions */}
        <header className="pt-10 sm:pt-16 pb-10 sm:pb-14" style={rv(0)}>
          <p className="text-[#0EA5E9] font-bold tracking-[0.22em] uppercase text-xs sm:text-sm">
            {project.role}
          </p>
          <h2 className="font-black tracking-tight leading-[1.03] text-4xl sm:text-6xl mt-4 text-gray-900 dark:text-white">
            {project.title}
          </h2>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed text-gray-600 dark:text-slate-300">
            {project.desc}
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-7 flex flex-col sm:flex-row flex-wrap gap-3">
            {project.liveUrl && project.liveUrl !== "#" && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-sky-500/20 transition-transform hover:scale-105 active:scale-95 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500"
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

        {/* Big imagery — uncropped, framed. Side-by-side when there are several. */}
        <div className={gallery.length > 1 ? "grid gap-5 sm:gap-6 sm:grid-cols-2 items-start" : "space-y-6"}>
          {gallery.map((src, i) => (
            <figure
              key={i}
              style={rv(gBase + i * 110)}
              className="overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10
                bg-gray-50 dark:bg-white/[0.03] shadow-xl shadow-slate-900/5 dark:shadow-black/40"
            >
              <img
                src={src}
                alt={`${project.title} — ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="block w-full h-auto"
              />
            </figure>
          ))}
        </div>

        {/* Interesting facts — numbered cards */}
        <section className="mt-16 sm:mt-24">
          <h3
            className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3 mb-8"
            style={rv(fBase - 90)}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-[#0EA5E9]">
              <Sparkles size={18} />
            </span>
            {t("projects.detail_facts", "Interesting facts")}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {(project.facts || []).map((fact, i) => {
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
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-[#0EA5E9] text-xs font-black">
                      {i + 1}
                    </span>
                    <p className="text-[15px] sm:text-base leading-relaxed">{fact}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </article>
    </div>
  );

  // ---- Reduced motion: plain cross-fade ----
  if (reduce) {
    return createPortal(
      <div className="fixed inset-0 z-[999]">
        <div
          className={`absolute inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity duration-300 ${
            backdropOn ? "opacity-100" : "opacity-0"
          }`}
          onClick={requestClose}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
          className={`absolute inset-0 overflow-y-auto overscroll-contain bg-white dark:bg-[#0B1120] transition-opacity duration-300 ${
            backdropOn ? "opacity-100" : "opacity-0"
          }`}
        >
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
          background:
            "radial-gradient(120% 90% at 50% -10%, rgba(14,165,233,0.20), rgba(99,102,241,0.10) 38%, rgba(2,6,23,0) 60%), rgba(2,6,23,0.82)",
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
          background:
            "radial-gradient(closest-side, rgba(14,165,233,0.55), rgba(99,102,241,0.28) 55%, rgba(99,102,241,0) 75%)",
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
          className="absolute inset-0 overflow-y-auto overscroll-contain bg-white dark:bg-[#0B1120]"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateX(180deg)",
          }}
        >
          {detail}
        </div>
      </div>
    </div>,
    document.body
  );
}
