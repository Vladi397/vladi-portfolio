import React from "react";

const TechGrid = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none">
      <div 
        className="absolute inset-0"
        style={{
          // 1. Grid Pattern
          backgroundImage: `
            linear-gradient(to right, rgba(120, 116, 139, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(120, 116, 139, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          
          // 2. The "Side Fade" (Mask) you asked for
          // This creates a circle of visibility in the center and fades to transparent on sides
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 100%)"
        }}
      />
    </div>
  );
};

export default TechGrid;