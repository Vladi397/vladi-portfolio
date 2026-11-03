import React from "react";

const PrimaryButton = ({ children, onClick, className = "", type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    className={[
      "bg-accent text-white px-7 sm:px-8 py-3 rounded-full font-bold text-base md:text-lg",
      "shadow-lg hover:bg-brand-500 hover:-translate-y-1",
      // A press has to be felt, and felt at once. 300ms reads as lag on a
      // press, and on touch there is no hover, so dropping the lift was the
      // only feedback there was and amounted to nothing. Scale is the idiom
      // the rest of the site already uses.
      "active:translate-y-0 active:scale-[0.97]",
      "transition-[transform,background-color] duration-150 motion-reduce:transition-none",
      "focus:outline-none focus:ring-2 focus:ring-brand-300",
      className,
    ].join(" ")}
  >
    {children}
  </button>
);

export default PrimaryButton;