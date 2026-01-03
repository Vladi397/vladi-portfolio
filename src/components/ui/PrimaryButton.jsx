import React from "react";

const PrimaryButton = ({ children, onClick, className = "", type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    className={[
      "bg-[#0EA5E9] text-white px-7 sm:px-8 py-3 rounded-full font-bold text-base md:text-lg",
      "shadow-lg hover:bg-sky-500 hover:-translate-y-1 active:translate-y-0",
      "transition-all duration-300 motion-reduce:transition-none",
      "focus:outline-none focus:ring-2 focus:ring-sky-300",
      className,
    ].join(" ")}
  >
    {children}
  </button>
);

export default PrimaryButton;