import React from "react";

const SectionTitle = ({ title, num, kicker }) => (
  <div className="flex items-baseline gap-4 mb-10 md:mb-16">
    <div className="flex-1">
      {kicker && (
        <p className="text-xs tracking-[0.25em] uppercase font-bold text-sky-600 mb-3">
          {kicker}
        </p>
      )}
      <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 uppercase tracking-tight">
        {title}
      </h2>
    </div>
    <span className="text-lg sm:text-xl md:text-2xl text-gray-500 font-medium">
      ({num})
    </span>
  </div>
);

export default SectionTitle;