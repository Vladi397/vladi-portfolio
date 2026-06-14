import React, { useRef, useState } from "react";

const TiltedCard = ({ children, className = "" }) => {
  const ref = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

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
        className="w-full h-full rounded-[20px] p-6 sm:p-8 shadow-sm transition-all duration-200 ease-out bg-white/50 dark:bg-white/[0.06] backdrop-blur-xl border border-slate-900/10 dark:border-white/12 group-hover:border-sky-400/40 group-hover:shadow-2xl group-hover:shadow-sky-500/20"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(${scale})`,
          transformStyle: "preserve-3d",
        }}
      >
        <div style={{ transform: "translateZ(30px)" }}>{children}</div>
      </div>
    </div>
  );
};

export default TiltedCard;