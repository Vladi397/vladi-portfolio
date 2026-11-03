import React from "react";

const SecondaryButton = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={[
      "px-7 sm:px-8 py-3 rounded-full font-bold text-base md:text-lg",
      "border border-gray-200 bg-white/70 backdrop-blur",
      "text-gray-800 hover:bg-white hover:-translate-y-1",
      // Matches PrimaryButton: press reads at 150ms, and works on touch.
      "active:translate-y-0 active:scale-[0.97]",
      "transition-[transform,background-color] duration-150 motion-reduce:transition-none",
      "focus:outline-none focus:ring-2 focus:ring-sky-200",
      className,
    ].join(" ")}
  >
    {children}
  </button>
);

export default SecondaryButton;