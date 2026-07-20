import React, { useEffect, useRef, useState } from "react";

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const visibleRef = useRef(false); // mirrors isVisible so mousemove never churns state
  const hoverRef = useRef(false); // mirrors isHovering — state flips only on change

  useEffect(() => {
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    if (isMobile) return;

    const setVisible = (v) => {
      if (visibleRef.current === v) return;
      visibleRef.current = v;
      setIsVisible(v);
    };

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      setVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);

    const loop = () => {
      const lerp = 0.12;
      const dx = pos.current.x - ringPos.current.x;
      const dy = pos.current.y - ringPos.current.y;
      ringPos.current.x += dx * lerp;
      ringPos.current.y += dy * lerp;

      // Skip the style write once the ring has visually settled on the target —
      // avoids invalidating styles 60×/s while the mouse is idle.
      if ((Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) && ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    // One delegated listener instead of per-element listeners plus a
    // MutationObserver rescan — the old approach re-attached duplicate handlers
    // to every interactive element on every DOM change.
    const HOVERABLE =
      "a, button, [role='button'], input, textarea, select, label, [tabindex]";
    const onOver = (e) => {
      const hovering = e.target instanceof Element && !!e.target.closest(HOVERABLE);
      if (hoverRef.current !== hovering) {
        hoverRef.current = hovering;
        setIsHovering(hovering);
      }
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseover", onOver, { passive: true });
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] will-change-transform"
        style={{
          transform: "translate(-100px, -100px)",
          marginLeft: "-4px",
          marginTop: "-4px",
        }}
      >
        <div
          className={`rounded-full transition-all duration-150 ${
            isHovering
              ? "w-2.5 h-2.5 bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]"
              : "w-2 h-2 bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]"
          } ${isVisible ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {/* Ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] will-change-transform"
        style={{
          transform: "translate(-100px, -100px)",
          marginLeft: isHovering ? "-20px" : "-16px",
          marginTop: isHovering ? "-20px" : "-16px",
        }}
      >
        <div
          className={`rounded-full border transition-all duration-300 ${
            isHovering
              ? "w-10 h-10 border-violet-400/60 shadow-[0_0_12px_rgba(167,139,250,0.3)]"
              : "w-8 h-8 border-sky-400/50"
          } ${isVisible ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </>
  );
};

export default CustomCursor;
