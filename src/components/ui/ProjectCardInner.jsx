import React from "react";
import { ExternalLink, Github } from "lucide-react";

/*
  ProjectCardInner
  ----------------
  The visual *contents* of a project card (everything inside the rounded card
  box): decorations + the image-with-browser-chrome + the text column. Shared by
  the Projects grid (interactive) and by ProjectExpand's flip FRONT face
  (non-interactive), so the card you click is exactly the card that flips.

  Props:
    project      – the project data object
    isFlipped    – alternating left/right layout (grid uses index % 2)
    urlLabel     – text shown in the fake browser address bar
    t            – i18next translate fn
    interactive  – true in the grid (real links); false on the flip face (spans)
    onLinkClick  – (e, url) handler for the links when interactive
*/

const LIVE_BTN =
  "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 w-full sm:w-auto";
// Solid brand light-blue via inline style so it can never be purged/overridden.
const LIVE_BG = { backgroundColor: "#0EA5E9" };
const CODE_BTN =
  "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border font-bold transition-all w-full sm:w-auto hover:scale-105 active:scale-95 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700";

export default function ProjectCardInner({ project, isFlipped, urlLabel, t, interactive = false, onLinkClick }) {
  const hasLive = project.liveUrl && project.liveUrl !== "#";
  return (
    <>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent pointer-events-none" />

      {/* Grid texture */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] pointer-events-none" />

      {/* Decorative concentric rings */}
      <div className={`absolute pointer-events-none select-none ${isFlipped ? "-bottom-20 -left-20" : "-bottom-20 -right-20"}`}>
        <div className="relative w-72 h-72">
          <div className="absolute inset-0 rounded-full border border-gray-200/50 dark:border-white/[0.05]" />
          <div className="absolute inset-6 rounded-full border border-gray-200/40 dark:border-white/[0.04]" />
          <div className="absolute inset-12 rounded-full border border-gray-200/30 dark:border-white/[0.03]" />
          <div className="absolute inset-[4.5rem] rounded-full border border-gray-200/20 dark:border-white/[0.02]" />
        </div>
      </div>

      {/* Corner glows */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-sky-400/5 dark:bg-sky-500/8 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-500/5 dark:bg-indigo-500/8 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />

      {/* Content row — alternates direction on desktop */}
      <div className={`relative z-10 flex flex-col gap-6 md:gap-10 w-full ${isFlipped ? "md:flex-row-reverse" : "md:flex-row"}`}>
        {/* ── Image with browser chrome ── */}
        <div className="w-full md:w-1/2">
          <div className="rounded-2xl overflow-hidden border shadow-md border-gray-200 dark:border-slate-700/60">
            {/* Browser bar */}
            <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 border-b border-gray-200 dark:bg-slate-800 dark:border-slate-700/60">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 flex-shrink-0" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80 flex-shrink-0" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/80 flex-shrink-0" />
              <div className="flex-1 mx-2 px-3 h-5 rounded-full flex items-center bg-gray-200 dark:bg-slate-700">
                <span className="text-[10px] font-mono truncate text-gray-400 dark:text-slate-500">{urlLabel}</span>
              </div>
            </div>

            {/* Screenshot */}
            <div className="aspect-[16/10] min-h-[180px] sm:min-h-[220px] relative overflow-hidden group/image bg-gray-50 dark:bg-slate-800/50">
              <img
                src={project.img}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className={`w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-[1.04] ${project.customImgClass || ""}`}
              />
            </div>
          </div>
        </div>

        {/* ── Text content ── */}
        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4">
          <div className="flex flex-col items-start">
            <span className="text-[#0EA5E9] font-black tracking-widest uppercase text-xs mb-2 bg-sky-50 dark:bg-sky-900/20 px-3 py-1 rounded-full">
              {project.role}
            </span>
            <h3 className="text-2xl md:text-3xl font-black leading-tight text-gray-900 dark:text-white">
              {project.title}
            </h3>
          </div>

          <p className="leading-relaxed text-base sm:text-lg text-gray-600 dark:text-slate-300">{project.desc}</p>

          <ul className="space-y-2">
            {project.outcomes.map((o) => (
              <li key={o} className="flex gap-3 items-start text-gray-700 dark:text-slate-400">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0EA5E9]"
                />
                <span className="font-medium text-sm sm:text-base">{o}</span>
              </li>
            ))}
          </ul>

          {/* Tech, set as plain separated text in the site blue rather than
              a row of coloured pills. */}
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-1">
            {project.tags.map((tag, i) => (
              <li key={tag} className="flex items-center gap-3">
                {i > 0 && (
                  <span aria-hidden="true" className="h-3 w-px bg-gray-300 dark:bg-white/15" />
                )}
                <span className="text-sm font-bold tracking-tight text-[#0EA5E9]">{tag}</span>
              </li>
            ))}
          </ul>

          <div className="pt-3 flex flex-col sm:flex-row flex-wrap gap-3">
            {hasLive &&
              (interactive ? (
                <a
                  href={project.liveUrl}
                  onClick={(e) => onLinkClick && onLinkClick(e, project.liveUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className={LIVE_BTN}
                  style={LIVE_BG}
                >
                  {t("projects.btn_live")} <ExternalLink size={18} />
                </a>
              ) : (
                <span className={LIVE_BTN} style={LIVE_BG} aria-hidden="true">
                  {t("projects.btn_live")} <ExternalLink size={18} />
                </span>
              ))}
            {interactive ? (
              <a
                href={project.repoUrl}
                onClick={(e) => onLinkClick && onLinkClick(e, project.repoUrl)}
                target="_blank"
                rel="noreferrer"
                className={CODE_BTN}
              >
                {t("projects.btn_code")} <Github size={18} />
              </a>
            ) : (
              <span className={CODE_BTN} aria-hidden="true">
                {t("projects.btn_code")} <Github size={18} />
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
