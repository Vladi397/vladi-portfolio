import React, { useState, useEffect, useRef } from "react";

/*
  The intro is a first-impression flourish, so it is paced for the place it
  makes that impression. On a desktop it takes its 3 seconds. On a phone —
  where this is almost always a tap straight out of a link, on a connection and
  a CPU that are already slower — the whole thing is under a second, because
  past that it stops reading as an intro and starts reading as a site that
  won't load. App.jsx also plays it only on a visitor's first visit.
*/
const FAST = (() => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(
    "(max-width: 820px), (pointer: coarse), (prefers-reduced-motion: reduce)"
  ).matches;
})();

// duration = the progress fill, hold = the beat at 100%, exit = the slide off.
const TIMING = FAST
  ? { duration: 560, hold: 90, exit: 240 } // ~0.9s all in
  : { duration: 3000, hold: 500, exit: 1000 };

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const doneRef = useRef(false);

  // INVITING WORDS SEQUENCE
  const phrases = [
    "Initializing",
    "Syncing",
    "Connecting",
    "Online",
  ];

  // One timer for the whole load. This effect used to depend on [progress], so
  // every single tick tore the interval down and built a fresh one: each step
  // then cost a full React render plus a new 30ms wait. On a busy machine the
  // intro crawled instead of finishing in its nominal time.
  useEffect(() => {
    const intervalTime = 30;
    const increment = 100 / (TIMING.duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Completion. Guarded so a re-render at 100 cannot schedule the exit twice.
  useEffect(() => {
    if (progress < 100 || doneRef.current) return;
    doneRef.current = true;
    const hold = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, TIMING.exit); // Wait for exit animation
    }, TIMING.hold); // Pause briefly at 100%
    return () => clearTimeout(hold);
  }, [progress, onComplete]);

  // Derived from progress rather than a second piece of state, which also
  // removes the set-state-inside-an-effect the linter was flagging.
  const textIndex = progress < 33 ? 0 : progress < 66 ? 1 : progress < 90 ? 2 : 3;

  return (
    <div
      // The intro is the very first thing anyone sees, so it wears the same
      // theme as the page behind it: warm paper by default, black only for a
      // visitor who has saved dark. A black intro in front of a light site read
      // as the page failing to load rather than as an opening.
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-all ease-[cubic-bezier(0.76,0,0.24,1)]
        bg-paper text-stone-900 dark:bg-black dark:text-white ${
        isExiting ? "translate-y-[-100%]" : "translate-y-0"
      }`}
      style={{ transitionDuration: `${TIMING.exit}ms` }}
    >
      {/* Background Gradient Spot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none bg-lagoon-300/40 dark:bg-blue-900/20" />

      {/* Main Container */}
      <div className="relative z-10 font-black tracking-tighter uppercase text-center cursor-default">
        
        {/* The Text Container */}
        {/* Phones get a smaller size: Unbounded is wide, and "INITIALIZING" at
            text-6xl is ~460px, wider than a 390px screen. */}
        <div className="relative text-[2.625rem] sm:text-6xl md:text-9xl leading-none">
          
          {/* Layer 1: The "Hollow" Text (Always visible background) */}
          <span 
            className="intro-stroke block text-transparent bg-clip-text opacity-30"
            style={{ fontFamily: "'Unbounded Variable', sans-serif" }}
          >
            {phrases[textIndex]}
          </span>

          {/* Layer 2: The "Liquid" Fill (Overlays Layer 1) */}
          <div 
            className="absolute top-0 left-0 w-full overflow-hidden transition-all duration-75"
            style={{ height: `${progress}%` }} 
          >
            <span 
                className="block text-stone-900 dark:text-white"
                style={{ fontFamily: "'Unbounded Variable', sans-serif" }}
            >
              {phrases[textIndex]}
            </span>
          </div>
          
        </div>
      </div>

      {/* Percentage Counter */}
      <div className="absolute bottom-10 right-10 flex flex-col items-end">
        <span className="text-6xl font-mono font-bold text-stone-900/20 dark:text-white/20">
            {Math.round(progress)}
        </span>
        <span className="text-xs font-mono tracking-widest uppercase mt-2 text-stone-500 dark:text-white/40">
            System Ready
        </span>
      </div>
    </div>
  );
};

export default LoadingScreen;
