import React from "react";
import { Rise, SectionHead } from "./notes/shared";
import { hexA } from "./notes/utils";

/*
  CaseStudy
  ---------
  The design argument for a project, as opposed to ProjectNotebook's build log.
  Where the notebook answers "what did you make it out of", this answers "why
  is it shaped like this" — the brief, the people it was for, what testing
  changed, the decision that followed, and what is still wrong with it.

  Content comes from i18n as projects.<id>.case: an array of
    { label, title, body: [paragraph, ...] }
  rendered as a label column beside the prose, matching the notebook's log.

  A paragraph that starts with "TODO" is a draft note to self. In development
  it renders as a dashed box so it is impossible to miss; in a production build
  it is stripped, and a section with nothing but drafts left is dropped whole.

  That asymmetry is the point. These sections make claims about user research
  and about a named client, so a half-written one must never quietly read as
  finished work to a visitor — but it also must not go missing while it is
  being written.
*/

const isDraft = (s) => typeof s === "string" && s.trim().startsWith("TODO");
const SHOW_DRAFTS = import.meta.env.DEV;

export default function CaseStudy({ sections, theme, t, reduce }) {
  if (!Array.isArray(sections) || sections.length === 0) return null;
  const accent = theme.accent;
  const rule = hexA(accent, 0.18);

  // Published builds only ever see finished prose.
  const visible = SHOW_DRAFTS
    ? sections
    : sections
        .map((s) => ({ ...s, body: (Array.isArray(s.body) ? s.body : [s.body]).filter((p) => !isDraft(p)) }))
        .filter((s) => s.body.length > 0);
  if (visible.length === 0) return null;

  return (
    <section className="mt-14 sm:mt-24" aria-labelledby="case-study" style={{ "--acc": accent }}>
      <SectionHead accent={accent} id="case-study">
        {t("projects.case_title", "How it was designed")}
      </SectionHead>

      <ol className="border-t" style={{ borderColor: rule }}>
        {visible.map((s, i) => {
          const body = Array.isArray(s.body) ? s.body : [s.body];
          return (
            <Rise
              as="li"
              key={i}
              reduce={reduce}
              className="grid gap-1.5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-10 py-7 sm:py-9 border-b"
              style={{ borderColor: rule }}
            >
              <p className="notes-ink font-mono text-[13px] leading-6 sm:pt-1 break-words">{s.label}</p>

              <div>
                <h4 className="text-lg sm:text-xl font-semibold tracking-tight text-stone-900 dark:text-white">
                  {s.title}
                </h4>

                <div className="mt-2.5 space-y-3.5">
                  {body.map((p, j) =>
                    isDraft(p) ? (
                      <p
                        key={j}
                        className="rounded-xl border border-dashed px-4 py-3 text-[13.5px] leading-relaxed
                          text-stone-500 dark:text-slate-400"
                        style={{ borderColor: hexA(accent, 0.5), background: hexA(accent, 0.05) }}
                      >
                        <span
                          className="mr-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
                          style={{ color: accent }}
                        >
                          {t("projects.case_draft", "Draft")}
                        </span>
                        {p.replace(/^TODO:?\s*/i, "")}
                      </p>
                    ) : (
                      <p
                        key={j}
                        className="max-w-[62ch] text-[15px] sm:text-base leading-relaxed text-stone-600 dark:text-slate-300"
                      >
                        {p}
                      </p>
                    )
                  )}
                </div>

                {/* Optional pull-out: a short list of concrete findings. */}
                {Array.isArray(s.points) && s.points.length > 0 && (
                  <ul className="mt-4 grid gap-2.5">
                    {s.points.map((pt, k) => (
                      <li key={k} className="flex gap-3 text-[15px] leading-relaxed text-stone-700 dark:text-slate-300">
                        <span
                          aria-hidden="true"
                          className="mt-[9px] h-1.5 w-1.5 flex-shrink-0 rounded-full"
                          style={{ background: accent }}
                        />
                        <span className="max-w-[58ch]">{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Rise>
          );
        })}
      </ol>
    </section>
  );
}
