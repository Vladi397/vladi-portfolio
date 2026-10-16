import React, { useEffect, useRef } from "react";
import useScrollSpotlight from "../../hooks/useScrollSpotlight";

const GlareHover = ({
  children,
  className = "",
  // Default Background: A subtle silver gradient makes the white glare pop (Metal look)
  background = "linear-gradient(145deg, #ffffff 0%, #e6e6e6 100%)",
  borderRadius = "22px",
  borderColor = "rgba(255, 255, 255, 0.5)",
  glareColor = "#ffffff",
  glareOpacity = 0.8, // High opacity for a strong reflection
  glareSize = 150,
  glareAngle = 110,
  transitionDuration = 700, // Fast duration = sharper, more metallic feel
}) => {
  const ref = useRef(null);
  // On touch there is no mouseenter to catch, so the sweep fires once as the
  // element scrolls into the middle of the screen — same reflection, triggered
  // by the scroll instead of the pointer. `once` keeps it from re-firing every
  // time you scroll back past. Pointer devices never arm the observer.
  const { ref: spotRef, active, touch } = useScrollSpotlight({ band: 0.25, once: true });

  const trigger = () => {
    if (!ref.current) return;
    ref.current.classList.remove("shine");
    void ref.current.offsetWidth; // Trigger reflow to restart animation
    ref.current.classList.add("shine");
  };

  // Keep both refs pointing at the one node.
  const attach = (node) => {
    ref.current = node;
    spotRef.current = node;
  };

  useEffect(() => {
    if (active) trigger();
  }, [active]);

  return (
    <div
      ref={attach}
      onMouseEnter={trigger}
      // A tap should glint too, so the surface feels like a surface.
      onPointerDown={touch ? trigger : undefined}
      className={`relative isolate overflow-hidden border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${className}`}
      style={{
        background,
        borderColor,
        borderRadius,
        borderStyle: "solid",
        borderWidth: 1,
        "--glare-color": glareColor,
        "--glare-opacity": glareOpacity,
        "--glare-angle": `${glareAngle}deg`,
        "--glare-duration": `${transitionDuration}ms`,
      }}
    >
      {/* Glare Layer */}
      <div className="glare-wrapper absolute inset-0 pointer-events-none overflow-hidden z-20">
        <div className="glare-light" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>

      <style jsx>{`
        .glare-light {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 150%;
          /* METALLIC GRADIENT PROFILE:
             Tight, sharp transition from transparent to 100% white.
             This mimics a polished metal surface reflecting a single light source.
          */
          background: linear-gradient(
            var(--glare-angle),
            transparent 40%,
            rgba(255, 255, 255, 0) 45%,
            rgba(255, 255, 255, 1) 50%,
            rgba(255, 255, 255, 0) 55%,
            transparent 60%
          );
          opacity: 0;
          transform: translateX(-150%) skewX(-15deg);
          /* Minimal blur to keep the "polished" look */
          filter: blur(2px);
        }

        .shine .glare-light {
          animation: shineSweep var(--glare-duration) cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        @keyframes shineSweep {
          0% {
            opacity: 0;
            transform: translateX(-150%) skewX(-15deg);
          }
          30% {
            opacity: var(--glare-opacity);
          }
          100% {
            opacity: 0;
            transform: translateX(150%) skewX(-15deg);
          }
        }
      `}</style>
    </div>
  );
};

export default GlareHover;