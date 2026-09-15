import React from "react";
import { Rise, SectionHead } from "./shared";
import { hexA } from "./utils";
import JobTrace from "./JobTrace";
import PeakShift from "./PeakShift";
import SignalChain from "./SignalChain";

/*
  ProjectNotebook
  ---------------
  The written half of a project's detail view, in an engineer's-notebook voice:
    1. log      — dated/marked entries, the marker is a real thing from the build
    2. figure   — one visual that only this project could have
    3. snags    — what broke and how it was fixed
    4. sheet    — the build sheet: each tool and what it actually did
  Content comes from i18n (projects.<id>.notes); colours from the project theme.
  Marker/ink colours go through .notes-ink so light mode gets a darkened,
  readable version of bright project accents.
*/

const FIGURES = { jobtrace: JobTrace, peakshift: PeakShift, signalchain: SignalChain };

export default function ProjectNotebook({ notes, figure, theme, t, reduce }) {
  if (!notes || typeof notes !== "object") return null;
  const accent = theme.accent;
  const Figure = FIGURES[figure];
  const vars = { "--acc": accent, "--acc2": theme.accent2 };
  const rule = hexA(accent, 0.18);

  return (
    <div style={vars}>
      {/* 1. Log */}
      {Array.isArray(notes.log) && notes.log.length > 0 && (
        <section className="mt-14 sm:mt-24" aria-labelledby="notes-log">
          <SectionHead accent={accent} id="notes-log">
            {t("projects.notes_log", "From the notebook")}
          </SectionHead>
          <ol className="border-t" style={{ borderColor: rule }}>
            {notes.log.map((entry, i) => (
              <Rise
                as="li"
                key={i}
                reduce={reduce}
                className="grid gap-1.5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-10 py-6 sm:py-8 border-b"
                style={{ borderColor: rule }}
              >
                <p className="notes-ink font-mono text-[13px] leading-6 sm:pt-0.5 break-words">{entry.marker}</p>
                <div>
                  <h4 className="text-lg sm:text-xl font-semibold tracking-tight text-stone-900 dark:text-white">
                    {entry.title}
                  </h4>
                  <p className="mt-2 max-w-[62ch] text-[15px] sm:text-base leading-relaxed text-stone-600 dark:text-slate-300">
                    {entry.body}
                  </p>
                </div>
              </Rise>
            ))}
          </ol>
        </section>
      )}

      {/* 2. Project figure */}
      {Figure && notes.figure && (
        <section className="mt-14 sm:mt-24" aria-labelledby="notes-figure">
          <SectionHead accent={accent} id="notes-figure">
            {notes.figure.title}
          </SectionHead>
          {notes.figure.caption && (
            <p className="-mt-3 sm:-mt-4 mb-7 sm:mb-9 max-w-[62ch] text-sm sm:text-[15px] leading-relaxed text-stone-500 dark:text-slate-400">
              {notes.figure.caption}
            </p>
          )}
          <Figure data={notes.figure} theme={theme} t={t} reduce={reduce} />
        </section>
      )}

      {/* 3. Snags */}
      {Array.isArray(notes.snags) && notes.snags.length > 0 && (
        <section className="mt-14 sm:mt-24" aria-labelledby="notes-snags">
          <SectionHead accent={accent} id="notes-snags">
            {t("projects.notes_snags", "What broke, and the fix")}
          </SectionHead>
          <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
            {notes.snags.map((snag, i) => (
              <Rise key={i} reduce={reduce} delay={(i % 2) * 70} className="grid gap-3">
                <p className="text-[15px] sm:text-base leading-relaxed text-stone-900 dark:text-white">
                  <span className="mr-2 font-mono text-[11px] uppercase tracking-wider text-stone-500 dark:text-slate-400">
                    {t("projects.notes_snag_problem", "Snag")}
                  </span>
                  {snag.problem}
                </p>
                <p
                  className="pl-4 text-[15px] leading-relaxed text-stone-600 dark:text-slate-300 border-l"
                  style={{ borderColor: hexA(accent, 0.45) }}
                >
                  <span className="notes-ink mr-2 font-mono text-[11px] uppercase tracking-wider">
                    {t("projects.notes_snag_fix", "Fix")}
                  </span>
                  {snag.fix}
                </p>
              </Rise>
            ))}
          </div>
        </section>
      )}

      {/* 4. Build sheet */}
      {Array.isArray(notes.sheet) && notes.sheet.length > 0 && (
        <section className="mt-14 sm:mt-24" aria-labelledby="notes-sheet">
          <SectionHead accent={accent} id="notes-sheet">
            {t("projects.notes_sheet", "Build sheet")}
          </SectionHead>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-12">
            {notes.sheet.map((group, gi) => (
              <Rise key={gi} reduce={reduce} className={notes.sheet.length % 2 === 1 && gi === 0 ? "lg:row-span-2" : ""}>
                <p className="notes-ink mb-2 font-mono text-[11px] uppercase tracking-[0.14em]">{group.group}</p>
                <table className="w-full text-left border-t" style={{ borderColor: rule }}>
                  <thead className="sr-only">
                    <tr>
                      <th scope="col">{t("projects.notes_sheet_tool", "Tool")}</th>
                      <th scope="col">{t("projects.notes_sheet_role", "What it did")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((row, ri) => (
                      <tr key={ri} className="border-b align-top" style={{ borderColor: rule }}>
                        <th
                          scope="row"
                          className="w-[45%] py-3 pr-4 font-mono text-[13px] font-medium leading-6 text-stone-900 dark:text-white"
                        >
                          {row.tool}
                        </th>
                        <td className="py-3 text-sm sm:text-[15px] leading-6 text-stone-600 dark:text-slate-300">
                          {row.role}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Rise>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
