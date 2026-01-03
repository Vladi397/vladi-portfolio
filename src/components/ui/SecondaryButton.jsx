import React from "react";

const SecondaryButton = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={[
      "px-7 sm:px-8 py-3 rounded-full font-bold text-base md:text-lg",
      "border border-gray-200 bg-white/70 backdrop-blur",
      "text-gray-800 hover:bg-white hover:-translate-y-1 active:translate-y-0",
      "transition-all duration-300 motion-reduce:transition-none",
      "focus:outline-none focus:ring-2 focus:ring-sky-200",
      className,
    ].join(" ")}
  >
    {children}
  </button>
);

export default SecondaryButton;