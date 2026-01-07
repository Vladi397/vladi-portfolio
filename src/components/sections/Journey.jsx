import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import { ChevronDown } from "lucide-react";
import SectionTitle from "../ui/SectionTitle";

// Sub-component specific to Journey
const TimelineItem = ({ item, parentLineHeight, isDesktop }) => {
  const itemRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [trigger, setTrigger] = useState(0);

  useLayoutEffect(() => {
    if (!itemRef.current) return;
    // Calculate when this item should light up
    setTrigger(itemRef.current.offsetTop + 60);
  }, []);

  useEffect(() => {
    // If the blue line has passed this item's trigger point, show it
    if (parentLineHeight > trigger) {
      setIsVisible(true);
      return;
    }
    // Only hide it again if we are on desktop (scrolling back up)
    // On mobile, once it's visible, let's keep it visible to avoid glitchy jumping
    if (isDesktop) setIsVisible(false);
  }, [parentLineHeight, trigger, isDesktop]);

  return (
    <div ref={itemRef} className="flex group relative z-10 mb-12 sm:mb-20 md:mb-24">
      {/* YEAR: Slide in animation */}
      <div
        className={[
          "w-20 sm:w-24 md:w-32 flex-shrink-0 text-right pr-4 sm:pr-8 pt-2 transition-all duration-500 ease-out",
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10",
        ].join(" ")}
      >
        <span className="text-xl sm:text-2xl md:text-3xl font-black text-[#0EA5E9]">{item.year}</span>
      </div>

      {/* DOT: Only visible on Desktop */}
      <div className="relative flex flex-col items-center w-0 md:w-auto">
        <div
          className={[
            "hidden md:flex absolute top-3 -left-[9px] w-5 h-5 rounded-full border-4 shadow-md z-20 transition-transform duration-300",
            "bg-[#0EA5E9] border-white dark:border-slate-800",
            isVisible ? "scale-100" : "scale-0",
          ].join(" ")}
        ></div>
      </div>

      {/* TEXT CONTENT */}
      {/* Mobile: Has a border-l-2 (static line). Desktop: No border (uses the main animated line) */}
      <div
        className={[
          "pl-6 sm:pl-8 md:pl-12 pt-1 border-l-2 md:border-none transition-all duration-500 ease-out delay-75",
          "border-gray-200 dark:border-slate-800", // Static gray line color for mobile
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
        ].join(" ")}
      >
        <h3 className="text-lg sm:text-xl font-black mb-2 sm:mb-3 transition-colors
          text-gray-900 dark:text-white"
        >
          {item.title}
        </h3>
        <p className="leading-relaxed font-medium text-sm sm:text-base transition-colors
          text-gray-600 dark:text-slate-400"
        >
          {item.desc}
        </p>
      </div>
    </div>
  );
};

const Journey = () => {
  const sectionRef = useRef(null);
  const rafRef = useRef(null);
  const [lineHeight, setLineHeight] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  const timeline = [
    {
      year: "2019",
      title: "Specialty: Electronic Trade",
      desc: "Started a multidisciplinary high school program combining Economy, Business, and Web Development. Graduated with a diploma as an Organizer of Internet Applications.",
    },
    {
      year: "2023",
      title: "International Exhibition & Fundamentals",
      desc: "Participated in the TF-FEST International Exhibition. Earned foundational certificates in Version Control and Introduction to Front-End.",
    },
    {
      year: "2024",
      title: "Graduation & Meta Certifications",
      desc: "Solidified front-end expertise by mastering HTML, CSS, and JavaScript. Earned Meta certificates in React Basics and Advanced React.",
    },
    {
      year: "2025",
      title: "Fontys University (ICT)",
      desc: "Expanding into full-stack development with C#, Razor, and Blazor. Focusing on UI/UX design and collaboration in agile teams.",
    },
  ];

  // Detect Desktop vs Mobile
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Animation Loop for the Blue Line
  useEffect(() => {
    const calc = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const startOffset = windowHeight / 2;
      const relativeY = windowHeight - rect.top - startOffset;
      setLineHeight(Math.max(0, relativeY));
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        calc();
        rafRef.current = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", calc);
    calc();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", calc);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      id="journey"
      className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-24 md:scroll-mt-32"
      ref={sectionRef}
    >
      <SectionTitle title="Journey" num="05" kicker="Timeline" />

      <div className="max-w-4xl relative">
        {/* DESKTOP GRAY LINE BACKGROUND */}
        <div className="absolute left-[80px] sm:left-[96px] md:left-[128px] top-2 bottom-0 w-[2px] h-full z-0 hidden md:block">
          <div className="absolute top-0 left-0 w-full h-full transition-colors bg-gray-200 dark:bg-slate-800"></div>

          {/* ANIMATED BLUE LINE (Desktop Only) */}
          <div
            className="absolute top-0 left-0 w-full bg-[#0EA5E9] transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(14,165,233,0.55)]"
            style={{ height: `${lineHeight}px`, maxHeight: "100%" }}
          >
            <div
              className={[
                "absolute -bottom-4 -left-[9px] text-[#0EA5E9] transition-opacity duration-300",
                lineHeight > 10 ? "opacity-100" : "opacity-0",
              ].join(" ")}
            >
              <ChevronDown size={20} strokeWidth={3} />
            </div>
          </div>
        </div>

        <div className="relative pb-10 md:pb-16">
          {timeline.map((item, index) => (
            <TimelineItem key={index} item={item} parentLineHeight={lineHeight} isDesktop={isDesktop} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Journey;