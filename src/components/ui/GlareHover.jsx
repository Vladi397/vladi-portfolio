import React, { useRef } from "react";

const GlareHover = ({
  children,
  className = "",
  background = "#fff",
  borderRadius = "22px",
  borderColor = "#e5e7eb",
  glareColor = "#ffffff",
  glareOpacity = 0.3,
  glareSize = 300,
  glareAngle = -45,
  transitionDuration = 800,
  playOnce = false,
}) => {
  const ref = useRef(null);

  const trigger = () => {
    if (!ref.current) return;
    ref.current.classList.remove("shine");
    void ref.current.offsetWidth;
    ref.current.classList.add("shine");
  };

  return (
    <div
      ref={ref}
      onMouseEnter={trigger}
      className={`relative overflow-hidden border transition-transform duration-300 hover:scale-[1.02] ${className}`}
      style={{
        background,
        borderColor,
        borderRadius,
        borderStyle: "solid",
        borderWidth: 1,
        "--glare-color": glareColor,
        "--glare-opacity": glareOpacity,
        "--glare-size": `${glareSize}%`,
        "--glare-angle": `${glareAngle}deg`,
        "--glare-speed": `${transitionDuration}ms`,
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="glare-light" />
      </div>

      <div className="relative z-10 h-full">{children}</div>

      <style jsx>{`
        .glare-light {
          position: absolute;
          inset: -50%;
          background-image: repeating-linear-gradient(
              var(--glare-angle),
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, var(--glare-opacity)) 3%,
              rgba(255, 255, 255, 0) 6%,
              rgba(255, 255, 255, 0) 9%
            ),
            linear-gradient(
              var(--glare-angle),
              rgba(255, 255, 255, 0) 0%,
              var(--glare-color) 50%,
              rgba(255, 255, 255, 0) 100%
            );
          background-size: var(--glare-size) var(--glare-size);
          opacity: 0;
          transform: translateX(-150%) rotate(var(--glare-angle));
        }

        .shine .glare-light {
          animation: glareSweep var(--glare-speed) ease-in-out forwards;
        }

        @keyframes glareSweep {
          0% {
            opacity: 0;
            transform: translateX(-150%) rotate(var(--glare-angle));
          }
          10% {
            opacity: var(--glare-opacity);
          }
          50% {
            opacity: var(--glare-opacity);
            transform: translateX(0%) rotate(var(--glare-angle));
          }
          90% {
            opacity: 0.25;
            transform: translateX(150%) rotate(var(--glare-angle));
          }
          100% {
            opacity: 0;
            transform: translateX(150%) rotate(var(--glare-angle));
          }
        }
      `}</style>
    </div>
  );
};

export default GlareHover;