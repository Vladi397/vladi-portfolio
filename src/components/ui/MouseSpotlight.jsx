import React, { useEffect, useRef } from "react";

/*
  MouseSpotlight
  --------------
  A 200px-radius sky glow that follows the cursor. The gradient is painted once
  onto a fixed-size layer and moved with a compositor-only transform — the old
  version re-rendered React state and rewrote a full-viewport radial-gradient on
  every mousemove, repainting the whole screen (a big frame cost on weak GPUs).
  Visually identical.
*/

const SIZE = 400; // px — the 200px gradient circle lives centered in this square

const MouseSpotlight = () => {
  const ref = useRef(null);
  const raf = useRef(0);
  const xy = useRef({ x: -SIZE, y: -SIZE });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = () => {
      raf.current = 0;
      el.style.transform = `translate3d(${xy.current.x - SIZE / 2}px, ${xy.current.y - SIZE / 2}px, 0)`;
    };
    const onMove = (e) => {
      xy.current.x = e.clientX;
      xy.current.y = e.clientY;
      if (el.style.opacity !== "1") el.style.opacity = "1";
      if (!raf.current) raf.current = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed top-0 left-0 z-30 transition-opacity duration-500 hidden md:block will-change-transform"
      style={{
        width: SIZE,
        height: SIZE,
        opacity: 0,
        transform: `translate3d(-${SIZE}px, -${SIZE}px, 0)`,
        background:
          "radial-gradient(200px circle at center, rgba(14, 165, 233, 0.25), transparent 60%)",
      }}
    />
  );
};

export default MouseSpotlight;
