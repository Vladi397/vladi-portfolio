import React, { useEffect, useRef, useState } from "react";

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    if (isMobile) return;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    const onEnter = () => setIsVisible(true);
    const onLeave = () => setIsVisible(false);

    const loop = () => {
      const lerp = 0.12;
      ringPos.current.x += (pos.current.x - ringPos.current.x) * lerp;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * lerp;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    const addHover = () => {
      const targets = document.querySelectorAll(
        "a, button, [role='button'], input, textarea, select, label, [tabindex]"
      );
      targets.forEach((el) => {
        el.addEventListener("mouseenter", () => setIsHovering(true));
        el.addEventListener("mouseleave", () => setIsHovering(false));
      });
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);
    rafRef.current = requestAnimationFrame(loop);
    addHover();

    const observer = new MutationObserver(addHover);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
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
