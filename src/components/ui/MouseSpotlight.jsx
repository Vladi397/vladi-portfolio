import React, { useEffect, useState } from "react";

const MouseSpotlight = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      setOpacity(1);
    };

    const handleMouseLeave = () => {
      setOpacity(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-500 hidden md:block"
      style={{
        opacity: opacity,
        // CHANGED: 
        // 1. Size reduced to 200px (very compressed).
        // 2. Opacity increased to 0.25 (brighter blue).
        // 3. Cutoff changed to 60% (sharper edge).
        background: `radial-gradient(200px circle at ${pos.x}px ${pos.y}px, rgba(14, 165, 233, 0.25), transparent 60%)`,
      }}
    />
  );
};

export default MouseSpotlight;