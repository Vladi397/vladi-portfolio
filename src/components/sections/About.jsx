import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Download, Eye, FileText } from "lucide-react";
import Reveal from "../ui/Reveal";
import SectionTitle from "../ui/SectionTitle";
import Vladi2 from "../../assets/vladi-profile2.webp"; 
import { useTranslation } from 'react-i18next';

// --- UPDATED IMPORT: New CV File ---
import ResumePDF from "../../assets/vladi-cv.pdf"; 

// Matches .modal-out / .backdrop-out in index.css.
const EXIT_MS = 180;

const About = () => {
  const { t } = useTranslation();
  const [showResume, setShowResume] = useState(false);
  const [closingResume, setClosingResume] = useState(false);

  /*
    Closing plays an exit and then unmounts, rather than unmounting on the
    spot. The unmount runs off a timer rather than animationend, because the
    animation can legitimately never fire — reduced motion, a backgrounded
    tab — and a modal that will not close is a worse bug than one that closes
    abruptly. The ref guard stops a second click inside those 180ms from
    queueing a second timer.
  */
  const closingRef = useRef(false);
  const exitTimer = useRef(0);

  // The open panel and its close button, for the focus handling below.
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);

  const closeResume = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosingResume(true);
    exitTimer.current = setTimeout(() => {
      setShowResume(false);
      setClosingResume(false);
      closingRef.current = false;
    }, EXIT_MS);
  }, []);

  useEffect(() => () => clearTimeout(exitTimer.current), []);

  // While the resume modal is open: lock scroll and let Escape close it.
  // The previous overflow is restored rather than forced to "unset", so an
  // outer lock (mobile menu, project detail) is not released by accident.
  useEffect(() => {
    if (!showResume) return;
    const opener = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const raf = requestAnimationFrame(() => closeBtnRef.current?.focus());

    /*
      Visible focusables only. The panel carries both layouts at once — the
      desktop iframe and the phone's "open the PDF" link — and whichever is
      not in use is display:none rather than unmounted, so counting it would
      put the last tab stop on an element that can never hold focus and the
      wrap would never fire.
    */
    const trapTab = (e) => {
      const root = panelRef.current;
      if (!root) return;
      const f = [
        ...root.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea'
        ),
      ].filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const onKey = (e) => {
      if (e.key === "Escape") closeResume();
      else if (e.key === "Tab") trapTab(e);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      // The panel is already unmounted by the time this runs, so focus has
      // fallen to <body>; put it back on the button that opened the resume.
      if (opener?.isConnected) opener.focus?.();
    };
  }, [showResume, closeResume]);

  return (
    <>
      <section id="about" className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-24 md:scroll-mt-32">
        <SectionTitle title={t('about.title')} num="01" kicker={t('about.kicker')} />

        <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">
          
          {/* LEFT SIDE: TEXT */}
          <div className="flex-1 space-y-6 text-base sm:text-lg leading-relaxed transition-colors text-stone-600 dark:text-slate-400">
            <Reveal>
              <p>{t('about.p1')}</p>
            </Reveal>
            <Reveal delay={80}>
              <p>{t('about.p2')}</p>
            </Reveal>

            <Reveal delay={140}>
              <div className="pt-3 flex flex-wrap gap-2 sm:gap-3">
                {[
                  "React + Next.js",
                  "TypeScript",
                  "Expo + React Native",
                  "UI/UX in Figma",
                ].map((skill) => (
                  <span key={skill} className="px-4 py-2 rounded-full font-semibold text-sm border transition-colors
                    bg-lagoon-50 text-lagoon-700 border-lagoon-100
                    dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="relative group inline-block mt-4">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-600 to-brand2-600 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
                <button
                  onClick={() => setShowResume(true)}
                  className="relative flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all active:scale-95
                    bg-white text-stone-800 border border-stone-100
                    hover:bg-stone-50 
                    dark:bg-[#0B1120] dark:text-white dark:border-white/10 dark:hover:bg-slate-800"
                >
                  <Eye size={18} className="text-brand-500" /> 
                  {t('about.btn_resume')}
                </button>
              </div>
            </Reveal>
          </div>

          {/* RIGHT SIDE: PHOTO */}
          <div className="flex-1 relative w-full flex justify-center md:justify-end">
            <Reveal className="w-full max-w-sm sm:max-w-md md:max-w-sm relative">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-brand2-600 rounded-[32px] blur opacity-25 dark:opacity-40 transition duration-1000 group-hover:opacity-75 group-hover:duration-200"></div>
                <div className="relative rounded-[32px] overflow-hidden bg-stone-100 dark:bg-slate-800">
                   <img
                    src={Vladi2}
                    alt="About Vladi"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105 select-none"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --- RESUME MODAL ---
          Portalled to <body>, like the certificate viewer. Rendered in place
          it sat inside <main>, whose `relative z-10` opens a stacking context
          the modal cannot escape, so the fixed z-50 navbar painted over the
          panel and stayed clickable — the nav links scrolled the page behind
          an open resume. */}
      {showResume && createPortal(
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={t('about.modal_title')}
          ref={panelRef}
        >
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${
              closingResume ? "backdrop-out" : "backdrop-in"
            }`}
            onClick={closeResume}
          ></div>

          <div className={`relative w-full max-w-5xl h-[70vh] sm:h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
            closingResume ? "modal-out" : "modal-in"
          }`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
              <h3 className="text-xl font-bold text-stone-800 dark:text-slate-100">
                {t('about.modal_title')}
              </h3>
              <div className="flex items-center gap-3">
                <a 
                  href={ResumePDF} 
                  download="Vladi_Georgiev_CV.pdf" 
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
                >
                  <Download size={16} /> {t('about.download')}
                </a>
                <button
                  ref={closeBtnRef}
                  onClick={closeResume}
                  aria-label={t('about.btn_close', 'Close resume')}
                  className="p-2 text-stone-500 hover:text-stone-700 dark:text-gray-400 dark:hover:text-white bg-stone-100 dark:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-stone-50 dark:bg-slate-950 relative flex flex-col justify-center">
              <iframe 
                src={`${ResumePDF}#toolbar=0`} 
                title="Resume PDF"
                className="hidden sm:block w-full h-full border-0"
              />
              <div className="sm:hidden flex flex-col items-center text-center p-6 gap-4">
                <div className="w-16 h-16 bg-lagoon-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center text-lagoon-600 dark:text-sky-400">
                   <FileText size={32} />
                </div>
                <div>
                   <h4 className="text-lg font-bold text-stone-900 dark:text-white">{t('about.modal_title')}</h4>
                   <p className="text-stone-500 dark:text-slate-400 text-sm mt-1 max-w-[200px] mx-auto">
                     {t('about.mobile_msg')}
                   </p>
                </div>
                <a 
                  href={ResumePDF} 
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-full shadow-lg shadow-brand-500/20"
                >
                  <Eye size={18} /> {t('about.btn_open')}
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default About;