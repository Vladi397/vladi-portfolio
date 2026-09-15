import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowDown, Play } from "lucide-react";
import { Rise } from "./shared";
import { hexA } from "./utils";
import { SONGS, SYNTH } from "../../../data/visiobalSongs";

/*
  Visiobal figure: the signal chain from a tap in the app to sound from the
  ball, then a small jukebox that plays the ball's five real tunes in the
  browser. Playback mirrors the firmware: one persistent triangle oscillator
  (lead) and one square oscillator (harmony, at the per-note ratio), a shared
  attack/decay/sustain/release envelope per note, LEAD_VOL 120 against
  HARM_VOL 50, and the pitch knob scaling every frequency like the ball's pot.
*/

const F_MIN = 140;
const F_MAX = 530;
const totalMs = (song) => song.durations.reduce((a, b) => a + b, 0);

function PianoRoll({ song, color, playing, reduce }) {
  const w = totalMs(song) / 10;
  const h = 34;
  // Start time of each note, in tenths of a second (the roll is 1 unit = 10 ms).
  const starts = song.durations.map((_, i) => song.durations.slice(0, i).reduce((a, b) => a + b, 0) / 10);
  const bars = song.melody.map((f, i) => {
    const d = song.durations[i] / 10;
    const y = h - 4 - (Math.log2(f / F_MIN) / Math.log2(F_MAX / F_MIN)) * (h - 8);
    return <rect key={i} x={starts[i] + 0.5} y={y - 1.5} width={Math.max(d - 2.5, 2)} height="3" rx="1.5" fill={color} />;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-8 w-full" aria-hidden="true">
      {bars}
      {playing && !reduce && (
        <rect
          x="0"
          y="0"
          width={w}
          height={h}
          fill={hexA(color, 0.14)}
          style={{
            transformBox: "fill-box",
            transformOrigin: "left center",
            animation: `jukebox-progress ${totalMs(song)}ms linear forwards`,
          }}
        />
      )}
    </svg>
  );
}

function startSong(ctx, song, pitch) {
  const master = ctx.createGain();
  master.gain.value = 0.16;
  const tone = ctx.createBiquadFilter(); // a small speaker in a plastic ball, not a studio monitor
  tone.type = "lowpass";
  tone.frequency.value = 3400;
  const env = ctx.createGain();
  env.gain.value = 0;

  const lead = ctx.createOscillator();
  lead.type = "triangle";
  const harm = ctx.createOscillator();
  harm.type = "square";
  const leadGain = ctx.createGain();
  const harmGain = ctx.createGain();
  const mixMax = SYNTH.leadVolume + SYNTH.harmonyVolume;
  leadGain.gain.value = SYNTH.leadVolume / mixMax;
  harmGain.gain.value = SYNTH.harmonyVolume / mixMax;

  lead.connect(leadGain).connect(env);
  harm.connect(harmGain).connect(env);
  env.connect(tone).connect(master).connect(ctx.destination);

  const cents = 1200 * Math.log2(pitch);
  lead.detune.value = cents;
  harm.detune.value = cents;

  const a = SYNTH.attackMs / 1000;
  const dcy = SYNTH.decayMs / 1000;
  const rel = SYNTH.releaseMs / 1000;
  const gap = SYNTH.noteGapMs / 1000;
  const sustainLevel = SYNTH.decayLevel / SYNTH.attackLevel;

  let t = ctx.currentTime + 0.05;
  song.melody.forEach((f, i) => {
    const d = song.durations[i] / 1000;
    lead.frequency.setValueAtTime(f, t);
    harm.frequency.setValueAtTime(f * song.harmony[i], t);
    const sustainEnd = t + Math.max(a + dcy, d - gap - rel);
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(1, t + a);
    env.gain.linearRampToValueAtTime(sustainLevel, t + a + dcy);
    env.gain.setValueAtTime(sustainLevel, sustainEnd);
    env.gain.linearRampToValueAtTime(0, sustainEnd + rel);
    t += d;
  });
  lead.start();
  harm.start();
  lead.stop(t + 0.1);
  harm.stop(t + 0.1);

  return {
    setPitch(k) {
      const c = 1200 * Math.log2(k);
      lead.detune.setTargetAtTime(c, ctx.currentTime, 0.03);
      harm.detune.setTargetAtTime(c, ctx.currentTime, 0.03);
    },
    stop() {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(0, now, 0.02);
      try {
        lead.stop(now + 0.1);
        harm.stop(now + 0.1);
      } catch {
        // already stopped
      }
    },
    endsInMs: (t - ctx.currentTime) * 1000,
  };
}

function Jukebox({ data, accent, reduce }) {
  const ctxRef = useRef(null);
  const voiceRef = useRef(null);
  const endTimer = useRef(0);
  const [playing, setPlaying] = useState(-1);
  const [pitch, setPitch] = useState(100);
  const names = data.songs || [];
  const blurbs = data.song_notes || [];

  const stop = () => {
    window.clearTimeout(endTimer.current);
    voiceRef.current?.stop();
    voiceRef.current = null;
    setPlaying(-1);
  };

  const play = (i) => {
    if (playing === i) {
      stop();
      return;
    }
    stop();
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ctxRef.current) ctxRef.current = new AC();
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    const voice = startSong(ctx, SONGS[i], pitch / 100);
    voiceRef.current = voice;
    setPlaying(i);
    endTimer.current = window.setTimeout(() => {
      voiceRef.current = null;
      setPlaying(-1);
    }, voice.endsInMs + 150);
  };

  // Stop the music (and free the audio device) when the detail view closes.
  useEffect(
    () => () => {
      window.clearTimeout(endTimer.current);
      voiceRef.current?.stop();
      ctxRef.current?.close?.();
    },
    []
  );

  const onPitch = (e) => {
    const v = Number(e.target.value);
    setPitch(v);
    voiceRef.current?.setPitch(v / 100);
  };

  return (
    <div className="mt-12 sm:mt-14">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <p className="notes-ink font-mono text-[11px] uppercase tracking-[0.14em]">{data.jukebox}</p>
        <label htmlFor="visiobal-pitch" className="flex items-center gap-3 text-sm text-stone-600 dark:text-slate-300">
          {data.pitch}
          <input
            id="visiobal-pitch"
            type="range"
            min="50"
            max="100"
            step="1"
            value={pitch}
            onChange={onPitch}
            className="w-32 sm:w-40"
            style={{ accentColor: accent }}
          />
          <span className="w-10 text-right font-mono text-xs tabular-nums">{pitch}%</span>
        </label>
      </div>

      <ul className="border-t" style={{ borderColor: hexA(accent, 0.18) }}>
        {SONGS.map((song, i) => {
          const on = playing === i;
          const name = names[i] || song.id;
          return (
            <li
              key={song.id}
              className="grid grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,14rem)_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3.5 border-b"
              style={{ borderColor: hexA(accent, 0.18) }}
            >
              <button
                type="button"
                onClick={() => play(i)}
                aria-pressed={on}
                aria-label={`${on ? data.stop : data.play} ${name}`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2"
                style={{
                  borderColor: hexA(accent, on ? 0.9 : 0.4),
                  background: on ? accent : "transparent",
                  color: on ? "#0b0b0f" : undefined,
                  "--tw-ring-color": accent,
                }}
              >
                {on ? (
                  <span aria-hidden="true" className="h-3 w-3 rounded-[2px] bg-current" />
                ) : (
                  <Play size={16} className="ml-0.5 notes-ink" />
                )}
              </button>
              <div className="min-w-0">
                <p className="font-semibold text-stone-900 dark:text-white">
                  {name} <span className="ml-1 font-mono text-[11px] font-normal text-stone-500 dark:text-slate-400">{song.id}</span>
                </p>
                <p className="text-sm text-stone-500 dark:text-slate-400">{blurbs[i]}</p>
              </div>
              <div className="col-span-2 sm:col-span-1 min-w-0">
                <PianoRoll song={song} color={accent} playing={on} reduce={reduce} />
              </div>
              <span className="hidden sm:block font-mono text-xs tabular-nums text-stone-500 dark:text-slate-400">
                {song.melody.length} {data.notes} · {(totalMs(song) / 1000).toFixed(1)} s
              </span>
            </li>
          );
        })}
      </ul>
      <p className="sr-only" aria-live="polite">
        {playing >= 0 ? `${data.now_playing} ${names[playing] || SONGS[playing].id}` : ""}
      </p>
    </div>
  );
}

export default function SignalChain({ data, theme, reduce }) {
  const accent = theme.accent;
  const chain = Array.isArray(data.chain) ? data.chain : [];

  return (
    <div>
      {/* One row of equal steps on wide screens (arrows sit in the gaps),
          a vertical chain on narrow ones. */}
      <ol className="grid gap-2 lg:grid-cols-6 lg:gap-5">
        {chain.map((node, i) => (
          <Rise as="li" key={i} reduce={reduce} delay={i * 60} className="relative flex flex-col">
            <div
              className="h-full rounded-xl border px-3.5 py-3 bg-white dark:bg-white/[0.03]"
              style={{ borderColor: hexA(accent, i === 1 ? 0.6 : 0.22) }}
            >
              <p
                className={`font-semibold text-stone-900 dark:text-white ${
                  i === 1 ? "font-mono text-[15px] notes-ink" : ""
                }`}
              >
                {node.name}
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-stone-500 dark:text-slate-400">{node.detail}</p>
            </div>
            {i < chain.length - 1 && (
              <>
                <span aria-hidden="true" className="notes-ink flex justify-center pt-2 lg:hidden">
                  <ArrowDown size={16} />
                </span>
                <span
                  aria-hidden="true"
                  className="notes-ink hidden lg:flex absolute top-1/2 -right-5 w-5 -translate-y-1/2 justify-center"
                >
                  <ArrowRight size={14} />
                </span>
              </>
            )}
          </Rise>
        ))}
      </ol>
      {data.knobs && <p className="mt-5 text-sm text-stone-600 dark:text-slate-400">{data.knobs}</p>}

      <Jukebox data={data} accent={accent} reduce={reduce} />
    </div>
  );
}
