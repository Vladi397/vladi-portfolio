import React from "react";
import { ExternalLink, Github, ChevronRight } from "lucide-react";

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

const TAG_COLORS = {
  "React":          "bg-cyan-50   text-cyan-700   border-cyan-200   dark:bg-cyan-500/10   dark:text-cyan-400   dark:border-cyan-500/20",
  "Tailwind":       "bg-sky-50    text-sky-700    border-sky-200    dark:bg-sky-500/10    dark:text-sky-400    dark:border-sky-500/20",
  "JavaScript":     "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20",
  "Figma":          "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  "Python Flask":   "bg-blue-50   text-blue-700   border-blue-200   dark:bg-blue-500/10   dark:text-blue-400   dark:border-blue-500/20",
  "HTML/CSS":       "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  "HTML5":          "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  "C# Razor Pages": "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
  "C# .NET":        "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
  "Unity":          "bg-gray-100  text-gray-700   border-gray-200   dark:bg-white/5       dark:text-slate-300  dark:border-white/10",
  "SQL":            "bg-amber-50  text-amber-700  border-amber-200  dark:bg-amber-500/10  dark:text-amber-400  dark:border-amber-500/20",
  "Canvas API":     "bg-green-50  text-green-700  border-green-200  dark:bg-green-500/10  dark:text-green-400  dark:border-green-500/20",
  "Game Dev":       "bg-red-50    text-red-700    border-red-200    dark:bg-red-500/10    dark:text-red-400    dark:border-red-500/20",
  "Team Lead":      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  "User Testing":   "bg-pink-50   text-pink-700   border-pink-200   dark:bg-pink-500/10   dark:text-pink-400   dark:border-pink-500/20",
  "Swagger UI":     "bg-teal-50   text-teal-700   border-teal-200   dark:bg-teal-500/10   dark:text-teal-400   dark:border-teal-500/20",
  "ESP32":          "bg-rose-50   text-rose-700   border-rose-200   dark:bg-rose-500/10   dark:text-rose-400   dark:border-rose-500/20",
  "C++":            "bg-blue-50   text-blue-700   border-blue-200   dark:bg-blue-500/10   dark:text-blue-400   dark:border-blue-500/20",
  "Bluetooth LE":   "bg-sky-50    text-sky-700    border-sky-200    dark:bg-sky-500/10    dark:text-sky-400    dark:border-sky-500/20",
  "Mozzi Audio":    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
  "Accessibility":  "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  "PlatformIO":     "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
};

const DEFAULT_TAG =
  "bg-gray-50 text-gray-600 border-gray-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10";

const LIVE_BTN =
  "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500";
const CODE_BTN =
  "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border font-bold transition-all w-full sm:w-auto hover:scale-105 active:scale-95 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10";

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
      <div className={`relative z-10 flex flex-col gap-8 md:gap-14 w-full ${isFlipped ? "md:flex-row-reverse" : "md:flex-row"}`}>
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
            <div className="aspect-[4/3] min-h-[240px] sm:min-h-[300px] relative overflow-hidden group/image bg-gray-50 dark:bg-slate-800/50">
              <img
                src={project.img}
                alt={project.title}
                className={`w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-[1.04] ${project.customImgClass || ""}`}
              />
            </div>
          </div>
        </div>

        {/* ── Text content ── */}
        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-5">
          <div className="flex flex-col items-start">
            <span className="text-[#0EA5E9] font-black tracking-widest uppercase text-xs mb-2 bg-sky-50 dark:bg-sky-900/20 px-3 py-1 rounded-full">
              {project.role}
            </span>
            <h3 className="text-3xl md:text-4xl font-black leading-tight text-gray-900 dark:text-white">
              {project.title}
            </h3>
          </div>

          <p className="leading-relaxed text-base sm:text-lg text-gray-600 dark:text-slate-300">{project.desc}</p>

          <ul className="space-y-2">
            {project.outcomes.map((o) => (
              <li key={o} className="flex gap-2 items-start text-gray-700 dark:text-slate-400">
                <ChevronRight size={16} className="text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                <span className="font-medium text-sm sm:text-base">{o}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2 pt-1">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${TAG_COLORS[tag] || DEFAULT_TAG}`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="pt-3 flex flex-col sm:flex-row flex-wrap gap-3">
            {hasLive &&
              (interactive ? (
                <a
                  href={project.liveUrl}
                  onClick={(e) => onLinkClick && onLinkClick(e, project.liveUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className={LIVE_BTN}
                >
                  {t("projects.btn_live")} <ExternalLink size={18} />
                </a>
              ) : (
                <span className={LIVE_BTN} aria-hidden="true">
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
