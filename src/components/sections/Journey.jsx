import React, { useRef, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import SectionTitle from "../ui/SectionTitle";
import { useTranslation } from 'react-i18next'; // <--- Import

// Presentational item — visibility is computed by the parent, which only flips
// state when a reveal threshold is actually crossed. (The old version pushed the
// raw line height through React on every scrolled pixel, re-rendering the whole
// section at 60fps for the entire page scroll.)
const TimelineItem = ({ item, isVisible, innerRef }) => (
  <div ref={innerRef} className="group relative z-10 mb-12 sm:mb-16 md:mb-24 md:flex">
    <div
      className={[
        "md:hidden absolute left-4 top-7 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-4 z-20 shadow-sm transition-all duration-300",
        "bg-[#0EA5E9] border-white dark:border-slate-800",
        isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0",
      ].join(" ")}
    />

    <div
      className={[
        "hidden md:block w-20 sm:w-24 md:w-32 flex-shrink-0 text-right pr-4 sm:pr-8 pt-2 transition-all duration-500 ease-out",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10",
      ].join(" ")}
    >
      <span className="text-xl sm:text-2xl md:text-3xl font-black text-[#0EA5E9]">
        {item.year}
      </span>
    </div>

    <div className="relative hidden md:flex flex-col items-center w-0 md:w-auto">
      <div
        className={[
          "absolute top-3 -left-[9px] w-5 h-5 rounded-full border-4 shadow-md z-20 transition-transform duration-300",
          "bg-[#0EA5E9] border-white dark:border-slate-800",
          isVisible ? "scale-100" : "scale-0",
        ].join(" ")}
      />
    </div>

    <div
      className={[
        "relative pl-12 sm:pl-14 md:pl-12 pt-1 transition-all duration-500 ease-out delay-75",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
      ].join(" ")}
    >
      <div
        className={[
          "md:hidden mb-3 transition-all duration-500 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        ].join(" ")}
      >
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-black tracking-wide border bg-sky-500/10 text-[#0EA5E9] border-sky-500/20">
          {item.year}
        </span>
      </div>

      <div className="rounded-2xl p-0 md:p-0">
        <h3 className="text-lg sm:text-xl font-black mb-2 sm:mb-3 transition-colors text-gray-900 dark:text-white">
          {item.title}
        </h3>
        <p className="leading-relaxed font-medium text-sm sm:text-base transition-colors text-gray-600 dark:text-slate-400">
          {item.desc}
        </p>
      </div>
    </div>
  </div>
);

const Journey = () => {
  const { t } = useTranslation(); // <--- Init hook
  const sectionRef = useRef(null);
  const rafRef = useRef(null);
  const itemRefs = useRef([]);
  const fillRefs = useRef([]); // [mobile, desktop] blue line fills
  const chevRefs = useRef([]); // [mobile, desktop] chevron wrappers
  const triggersRef = useRef([]);
  const maxHRef = useRef(Infinity);
  const lastHRef = useRef(-1);
  const isDesktopRef = useRef(false);

  // MOVED ARRAY INSIDE
  const timeline = [
    {
      year: "2019",
      title: t('journey.2019_title'),
      desc: t('journey.2019_desc'),
    },
    {
      year: "2023",
      title: t('journey.2023_title'),
      desc: t('journey.2023_desc'),
    },
    {
      year: "2024",
      title: t('journey.2024_title'),
      desc: t('journey.2024_desc'),
    },
    {
      year: "2025",
      title: t('journey.2025_title'),
      desc: t('journey.2025_desc'),
    },
    {
      year: "2025",
      title: t('journey.2025_work_title'),
      desc: t('journey.2025_work_desc'),
    },
    {
      year: "2026",
      title: t('journey.2026_title'),
      desc: t('journey.2026_desc'),
    },
  ];

  const [visible, setVisible] = useState(() => timeline.map(() => false));
  const visibleRef = useRef(visible);

  // Scroll-driven line + reveals. The blue line height and chevron opacity are
  // written straight to the DOM (no re-render); item visibility goes through
  // setState only when a boolean actually flips (a handful of times total).
  useEffect(() => {
    const measure = () => {
      triggersRef.current = itemRefs.current.map((el) =>
        el ? el.offsetTop + 60 : Infinity
      );
      // Only one of the two line containers is displayed per breakpoint — the
      // hidden one measures 0, so take the max.
      const hA = fillRefs.current[0]?.parentElement?.offsetHeight || 0;
      const hB = fillRefs.current[1]?.parentElement?.offsetHeight || 0;
      maxHRef.current = Math.max(hA, hB) || Infinity;
    };

    const calc = () => {
      const sec = sectionRef.current;
      if (!sec) return;
      const rect = sec.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const raw = Math.max(0, windowHeight - rect.top - windowHeight / 2);
      // Clamp to the line's own height so scrolling far past the section stops
      // producing new values (and therefore any work at all).
      const h = Math.min(raw, maxHRef.current);
      if (h === lastHRef.current) return;
      lastHRef.current = h;

      for (const el of fillRefs.current) {
        if (el) el.style.height = `${h}px`;
      }
      const chevOpacity = h > 10 ? "1" : "0";
      for (const el of chevRefs.current) {
        if (el && el.style.opacity !== chevOpacity) el.style.opacity = chevOpacity;
      }

      const prev = visibleRef.current;
      let changed = false;
      const next = prev.map((v, i) => {
        const on = h > triggersRef.current[i];
        const nv = on ? true : isDesktopRef.current ? false : v;
        if (nv !== v) changed = true;
        return nv;
      });
      if (changed) {
        visibleRef.current = next;
        setVisible(next);
      }
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        calc();
      });
    };
    const onResize = () => {
      measure();
      lastHRef.current = -1; // force a re-apply with the fresh geometry
      calc();
    };

    const mq = window.matchMedia("(min-width: 768px)");
    const onMq = () => {
      isDesktopRef.current = mq.matches;
      onResize();
    };
    isDesktopRef.current = mq.matches;

    const raf0 = requestAnimationFrame(() => {
      measure();
      calc();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    mq.addEventListener?.("change", onMq);

    return () => {
      cancelAnimationFrame(raf0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      mq.removeEventListener?.("change", onMq);
    };
  }, []);

  return (
    <section
      id="journey"
      className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-24 md:scroll-mt-32"
      ref={sectionRef}
    >
      <SectionTitle title={t('journey.title')} num="05" kicker={t('journey.kicker')} />

      <div className="max-w-4xl relative">
        {/* MOBILE GRAY LINE */}
        <div className="absolute left-4 top-6 bottom-0 w-[2px] h-full z-0 md:hidden">
          <div className="absolute top-0 left-0 w-full h-full transition-colors bg-gray-200 dark:bg-slate-800" />
          <div
            ref={(el) => (fillRefs.current[0] = el)}
            className="absolute top-0 left-0 w-full bg-[#0EA5E9] transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(14,165,233,0.55)]"
            style={{ height: 0, maxHeight: "100%" }}
          >
            <div
              ref={(el) => (chevRefs.current[0] = el)}
              className="absolute -bottom-4 -left-[9px] text-[#0EA5E9] transition-opacity duration-300"
              style={{ opacity: 0 }}
            >
              <ChevronDown size={20} strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* DESKTOP GRAY LINE */}
        <div className="absolute left-[80px] sm:left-[96px] md:left-[128px] top-2 bottom-0 w-[2px] h-full z-0 hidden md:block">
          <div className="absolute top-0 left-0 w-full h-full transition-colors bg-gray-200 dark:bg-slate-800"></div>
          <div
            ref={(el) => (fillRefs.current[1] = el)}
            className="absolute top-0 left-0 w-full bg-[#0EA5E9] transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(14,165,233,0.55)]"
            style={{ height: 0, maxHeight: "100%" }}
          >
            <div
              ref={(el) => (chevRefs.current[1] = el)}
              className="absolute -bottom-4 -left-[9px] text-[#0EA5E9] transition-opacity duration-300"
              style={{ opacity: 0 }}
            >
              <ChevronDown size={20} strokeWidth={3} />
            </div>
          </div>
        </div>

        <div className="relative pb-10 md:pb-16">
          {timeline.map((item, index) => (
            <TimelineItem
              key={index}
              item={item}
              isVisible={visible[index]}
              innerRef={(el) => (itemRefs.current[index] = el)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Journey;
