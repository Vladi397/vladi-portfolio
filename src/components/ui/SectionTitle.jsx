import React from "react";

const SectionTitle = ({ title, num, kicker }) => (
  <div className="flex items-baseline gap-4 mb-8 sm:mb-10 md:mb-16">
    <div className="flex-1">
      {kicker && (
        <p className="text-xs tracking-[0.25em] uppercase font-bold text-sky-600 mb-2 sm:mb-3">
          {kicker}
        </p>
      )}
      {/* Added dark:text-white below */}
      <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
        {title}
      </h2>
    </div>
    {/* You might also want to make the number lighter in dark mode */}
    <span className="text-lg sm:text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-medium">
      ({num})
    </span>
  </div>
);

export default SectionTitle;