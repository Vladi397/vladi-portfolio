import React, { useState, useEffect, useRef } from "react";

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
  // intro crawled instead of finishing in its nominal 3 seconds.
  useEffect(() => {
    const duration = 3000; // 3 seconds total load time
    const intervalTime = 30;
    const increment = 100 / (duration / intervalTime);

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
      setTimeout(onComplete, 1000); // Wait for exit animation
    }, 500); // Pause briefly at 100%
    return () => clearTimeout(hold);
  }, [progress, onComplete]);

  // Derived from progress rather than a second piece of state, which also
  // removes the set-state-inside-an-effect the linter was flagging.
  const textIndex = progress < 33 ? 0 : progress < 66 ? 1 : progress < 90 ? 2 : 3;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        isExiting ? "translate-y-[-100%]" : "translate-y-0"
      }`}
    >
      {/* Background Gradient Spot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 font-black tracking-tighter uppercase text-center cursor-default">
        
        {/* The Text Container */}
        <div className="relative text-6xl md:text-9xl leading-none">
          
          {/* Layer 1: The "Hollow" Text (Always visible background) */}
          <span 
            className="block text-transparent bg-clip-text opacity-30"
            style={{ 
                WebkitTextStroke: "2px white",
                fontFamily: "'Inter', sans-serif" 
            }}
          >
            {phrases[textIndex]}
          </span>

          {/* Layer 2: The "Liquid" Fill (Overlays Layer 1) */}
          <div 
            className="absolute top-0 left-0 w-full overflow-hidden transition-all duration-75"
            style={{ height: `${progress}%` }} 
          >
            <span 
                className="block text-white"
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {phrases[textIndex]}
            </span>
          </div>
          
        </div>
      </div>

      {/* Percentage Counter */}
      <div className="absolute bottom-10 right-10 flex flex-col items-end">
        <span className="text-6xl font-mono font-bold text-white/20">
            {Math.round(progress)}
        </span>
        <span className="text-xs text-white/40 font-mono tracking-widest uppercase mt-2">
            System Ready
        </span>
      </div>
    </div>
  );
};

export default LoadingScreen;