import React, { useEffect, useState } from "react";
import { Rise } from "./shared";
import { hexA, useInViewOnce } from "./utils";

/*
  DevMatch figure: one listing's path through the system, beside an example job
  card whose match badge does what the real app does. It first shows the
  on-device estimate, then Gemini's batch score replaces it a moment later.
*/

const ESTIMATE = 74;
const AI_SCORE = 81;

export default function JobTrace({ data, theme, t, reduce }) {
  const accent = theme.accent;
  const [cardRef, inView] = useInViewOnce(false, "0px 0px -25% 0px");
  const [scored, setScored] = useState(!!reduce);

  useEffect(() => {
    if (!inView || scored) return undefined;
    const id = window.setTimeout(() => setScored(true), 1600);
    return () => window.clearTimeout(id);
  }, [inView, scored]);

  const score = scored ? AI_SCORE : ESTIMATE;
  const steps = Array.isArray(data.steps) ? data.steps : [];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14 items-start">
      <ol className="grid">
        {steps.map((step, i) => (
          <Rise
            as="li"
            key={i}
            reduce={reduce}
            delay={i * 40}
            className="grid grid-cols-[4.75rem_minmax(0,1fr)] sm:grid-cols-[6rem_minmax(0,1fr)] gap-4"
          >
            <span className="notes-ink pt-3.5 text-right font-mono text-xs tabular-nums">{step.at}</span>
            <div
              className={`relative border-l pl-5 py-3 ${i === steps.length - 1 ? "border-transparent" : ""}`}
              style={i === steps.length - 1 ? undefined : { borderColor: hexA(accent, 0.3) }}
            >
              <span
                aria-hidden="true"
                className="absolute -left-[5px] top-[1.15rem] h-[9px] w-[9px] rounded-full ring-4 ring-white dark:ring-[#0B1120]"
                style={{ background: accent }}
              />
              <p className="font-semibold text-stone-900 dark:text-white">{step.name}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-stone-600 dark:text-slate-400">{step.detail}</p>
            </div>
          </Rise>
        ))}
      </ol>

      {/* Example card, sticky beside the trace on wide screens */}
      <figure
        ref={cardRef}
        className="lg:sticky lg:top-24 rounded-2xl border p-5 sm:p-6 bg-white dark:bg-white/[0.03] border-stone-200 dark:border-white/10"
        aria-label={`${data.card_role}, ${data.card_company}`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-stone-500 dark:text-slate-400">
            {t("projects.notes_example", "Example")}
          </span>
          {/* Estimate: tinted chip. Gemini: solid project colour with dark text
              (the project accents are bright, so dark text keeps contrast). */}
          <span
            className={`rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors duration-500 ${
              scored ? "text-stone-950" : "notes-ink"
            }`}
            style={{ background: scored ? accent : hexA(accent, 0.12) }}
          >
            {scored ? data.card_ai : data.card_estimate}
          </span>
        </div>
        <p className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">{data.card_role}</p>
        <p className="text-sm text-stone-500 dark:text-slate-400">{data.card_company}</p>

        <div className="mt-6 flex items-baseline gap-1" aria-live="polite">
          <span className="font-display text-5xl font-bold tabular-nums text-stone-900 dark:text-white">{score}</span>
          <span className="text-lg text-stone-500 dark:text-slate-400">%</span>
          <span className="sr-only">
            {scored ? data.card_ai : data.card_estimate}
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-white/10">
          <div
            className="h-full w-full origin-left rounded-full"
            style={{
              background: accent,
              transform: `scaleX(${score / 100})`,
              transition: reduce ? undefined : "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>
      </figure>
    </div>
  );
}
