import React from "react";

const TechGrid = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none">
      <div 
        className="absolute inset-0"
        style={{
          // Use a stronger color (slate-900 / slate-100) and higher opacity
          backgroundImage: `
            linear-gradient(to right, rgba(100, 116, 139, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(100, 116, 139, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px", // Size of the squares
        }}
      >
        {/* Optional: Add a subtle pulse animation to the grid so you know it's alive */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/0 to-white/0 dark:from-slate-950/0" />
      </div>
    </div>
  );
};

export default TechGrid;