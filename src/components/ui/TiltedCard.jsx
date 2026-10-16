import React, { useState } from "react";
import useScrollSpotlight from "../../hooks/useScrollSpotlight";

/*
  TiltedCard
  ----------
  Leans toward the cursor on a mouse. On touch there is no cursor, so the lean
  comes from the scroll position instead: the card tips in and lights up while
  it crosses the middle of the screen, then settles flat as it leaves. Cards
  alternate which way they lean (tiltIndex) so a column of them doesn't move as
  one slab.

  The touch tilt is a fixed pair of angles on a slow transition — not a value
  recomputed per frame — so the whole effect is one compositor transform per
  card, which is what keeps it free on a weak phone.
*/

const TiltedCard = ({ children, className = "", tiltIndex = 0 }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const { ref, active, touch } = useScrollSpotlight({ band: 0.32 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const centerX = width / 2;
    const centerY = height / 2;

    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setScale(1.05);
  };

  const handleMouseLeave = () => {
    setScale(1);
    setRotate({ x: 0, y: 0 });
  };

  // Scroll-driven pose on touch; cursor-driven pose everywhere else.
  const lean = tiltIndex % 2 === 0 ? 1 : -1;
  const pose = active ? { x: -7, y: 6 * lean } : rotate;
  const poseScale = active ? 1.03 : scale;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-200 ease-out preserve-3d group ${className}`}
      style={{
        perspective: "1000px",
      }}
    >
      <div
        className={`w-full h-full rounded-[20px] p-6 sm:p-8 shadow-sm transition-all ease-out bg-white/50 dark:bg-white/[0.06] backdrop-blur-xl border ${
          active
            ? "border-sky-400/40 shadow-2xl shadow-sky-500/20"
            : "border-slate-900/10 dark:border-white/12 group-hover:border-sky-400/40 group-hover:shadow-2xl group-hover:shadow-sky-500/20"
        }`}
        style={{
          transform: `rotateX(${pose.x}deg) rotateY(${pose.y}deg) scale(${poseScale})`,
          transformStyle: "preserve-3d",
          // Slow and soft when the scroll is driving it, snappy under a cursor.
          transitionDuration: touch ? "700ms" : "200ms",
        }}
      >
        <div style={{ transform: "translateZ(30px)" }}>{children}</div>
      </div>
    </div>
  );
};

export default TiltedCard;
