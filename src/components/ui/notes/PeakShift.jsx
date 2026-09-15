import React, { useEffect, useRef, useState } from "react";
import { hexA } from "./utils";

/*
  OurGrid figure: the transformer load curve from the prototype's demo data
  (server/data/demoData.json), the 16:00–18:00 window the resident view warns
  about, and an illustrative "after coordination" line that carries the same
  total energy with a lower peak. Below it, what each audience is shown.
*/

const TIMES = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
const BEFORE = [60, 72, 88, 95, 100, 84, 70]; // demo data, sum 569
const AFTER = [70, 80, 86, 84, 82, 82, 85]; // illustrative, sum 569

const W = 640;
const H = 250;
const PAD = { l: 44, r: 20, t: 26, b: 34 };
const Y_MIN = 40;
const Y_MAX = 105;

const xAt = (i) => PAD.l + (i * (W - PAD.l - PAD.r)) / (TIMES.length - 1);
const yAt = (v) => PAD.t + ((Y_MAX - v) * (H - PAD.t - PAD.b)) / (Y_MAX - Y_MIN);
const linePath = (vals) => vals.map((v, i) => `${i ? "L" : "M"}${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(" ");
const areaPath = (vals) =>
  `${linePath(vals)} L${xAt(vals.length - 1).toFixed(1)} ${H - PAD.b} L${xAt(0).toFixed(1)} ${H - PAD.b} Z`;

export default function PeakShift({ data, theme }) {
  const [after, setAfter] = useState(false);
  const scrollerRef = useRef(null);

  // On narrow screens the chart scrolls sideways; start it at the right-hand
  // end so the 16:00–18:00 peak window is what people see first.
  useEffect(() => {
    const el = scrollerRef.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = el.scrollWidth;
  }, []);
  const green = theme.accent; // OurGrid grid-green
  const amber = theme.accent2; // OurGrid amber
  const active = after ? AFTER : BEFORE;
  const peak = Math.max(...active);
  const peakIdx = active.indexOf(peak);

  const btn = (on) =>
    `px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
      on
        ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
        : "text-stone-600 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-white/10"
    }`;

  return (
    <div className="grid gap-10">
      <figure className="grid gap-4">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={data.title}>
          <button type="button" className={btn(!after)} aria-pressed={!after} onClick={() => setAfter(false)}>
            {data.before}
          </button>
          <button type="button" className={btn(after)} aria-pressed={after} onClick={() => setAfter(true)}>
            {data.after}
          </button>
        </div>

        <div ref={scrollerRef} className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full min-w-[520px] h-auto text-stone-400 dark:text-slate-500"
            role="img"
            aria-label={`${after ? data.after : data.before}: peak ${peak} at ${TIMES[peakIdx]}`}
          >
            {/* 16:00–18:00 window */}
            <rect
              x={xAt(4)}
              y={PAD.t - 10}
              width={xAt(5) - xAt(4)}
              height={H - PAD.b - PAD.t + 10}
              fill={hexA(amber, 0.18)}
            />
            <text x={(xAt(4) + xAt(5)) / 2} y={PAD.t - 14} textAnchor="middle" className="fill-current font-mono" fontSize="11">
              {data.window}
            </text>

            {/* grid + axis */}
            {[50, 75, 100].map((v) => (
              <g key={v}>
                <line x1={PAD.l} x2={W - PAD.r} y1={yAt(v)} y2={yAt(v)} stroke="currentColor" strokeOpacity="0.25" strokeDasharray="3 5" />
                <text x={PAD.l - 10} y={yAt(v) + 4} textAnchor="end" className="fill-current font-mono" fontSize="11">
                  {v}
                </text>
              </g>
            ))}
            {TIMES.map((tm, i) => (
              <text key={tm} x={xAt(i)} y={H - 10} textAnchor="middle" className="fill-current font-mono" fontSize="11">
                {tm}
              </text>
            ))}

            {/* inactive line, then the active one with its area */}
            <path
              d={linePath(after ? BEFORE : AFTER)}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="5 6"
              strokeOpacity="0.7"
            />
            <path d={areaPath(active)} fill={hexA(after ? green : amber, 0.14)} style={{ transition: "fill 400ms ease" }} />
            <path
              d={linePath(active)}
              fill="none"
              stroke={after ? green : amber}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {active.map((v, i) => (
              <circle key={i} cx={xAt(i)} cy={yAt(v)} r={i === peakIdx ? 5 : 3} fill={after ? green : amber} />
            ))}
            <text
              x={xAt(peakIdx)}
              y={yAt(peak) - 12}
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              className="fill-stone-900 dark:fill-white"
            >
              {data.peak || "peak"} {peak}
            </text>
          </svg>
        </div>
      </figure>

      <div className="grid gap-8 sm:grid-cols-2">
        {[
          { title: data.resident, items: data.resident_items },
          { title: data.municipality, items: data.municipality_items },
        ].map((col) => (
          <div key={col.title}>
            <p className="notes-ink mb-3 font-mono text-[11px] uppercase tracking-[0.14em]">{col.title}</p>
            <ul className="grid gap-2.5">
              {(col.items || []).map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-stone-700 dark:text-slate-300">
                  <span aria-hidden="true" className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: green }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
