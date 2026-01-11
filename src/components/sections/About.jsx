import React, { useState } from "react";
import { X, Download, Eye, FileText } from "lucide-react";
import Reveal from "../ui/Reveal";
import SectionTitle from "../ui/SectionTitle";
import Vladi2 from "../../assets/vladi-profile2.JPG"; 
import { useTranslation } from 'react-i18next';

// --- FIXED: Import the new resume file name from assets ---
import ResumePDF from "../../assets/vladi-resume1.pdf"; 

const About = () => {
  const { t } = useTranslation();
  const [showResume, setShowResume] = useState(false);

  return (
    <>
      <section id="about" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-24 md:scroll-mt-32">
        <SectionTitle title={t('about.title')} num="01" kicker={t('about.kicker')} />

        <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">
          
          {/* LEFT SIDE: TEXT */}
          <div className="flex-1 space-y-6 text-base sm:text-lg leading-relaxed transition-colors text-gray-600 dark:text-slate-400">
            <Reveal>
              <p>{t('about.p1')}</p>
            </Reveal>
            <Reveal delay={80}>
              <p>{t('about.p2')}</p>
            </Reveal>

            <Reveal delay={140}>
              <div className="pt-3 flex flex-wrap gap-2 sm:gap-3">
                {[
                  "React + Tailwind",
                  "UI/UX in Figma",
                  t('about.skill_csharp') 
                ].map((skill) => (
                  <span key={skill} className="px-4 py-2 rounded-full font-semibold text-sm border transition-colors
                    bg-sky-50 text-sky-700 border-sky-100
                    dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="relative group inline-block mt-4">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
                <button
                  onClick={() => setShowResume(true)}
                  className="relative flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all active:scale-95
                    bg-white text-slate-800 border border-gray-100
                    hover:bg-gray-50 
                    dark:bg-[#0B1120] dark:text-white dark:border-white/10 dark:hover:bg-slate-800"
                >
                  <Eye size={18} className="text-sky-500" /> 
                  {t('about.btn_resume')}
                </button>
              </div>
            </Reveal>
          </div>

          {/* RIGHT SIDE: PHOTO */}
          <div className="flex-1 relative w-full flex justify-center md:justify-end">
            <Reveal className="w-full max-w-sm sm:max-w-md md:max-w-sm relative">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-[32px] blur opacity-25 dark:opacity-40 transition duration-1000 group-hover:opacity-75 group-hover:duration-200"></div>
                <div className="relative rounded-[32px] overflow-hidden bg-gray-100 dark:bg-slate-800">
                   <img
                    src={Vladi2}
                    alt="About Vladi"
                    className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105 select-none"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --- RESUME MODAL --- */}
      {showResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowResume(false)}
          ></div>

          <div className="relative w-full max-w-5xl h-[70vh] sm:h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {t('about.modal_title')}
              </h3>
              <div className="flex items-center gap-3">
                <a 
                  href={ResumePDF} 
                  download="Vladi_Georgiev_Resume.pdf"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
                >
                  <Download size={16} /> {t('about.download')}
                </a>
                <button 
                  onClick={() => setShowResume(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-gray-50 dark:bg-slate-950 relative flex flex-col justify-center">
              <iframe 
                src={`${ResumePDF}#toolbar=0`} 
                title="Resume PDF"
                className="hidden sm:block w-full h-full border-0"
              />
              <div className="sm:hidden flex flex-col items-center text-center p-6 gap-4">
                <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400">
                   <FileText size={32} />
                </div>
                <div>
                   <h4 className="text-lg font-bold text-slate-900 dark:text-white">{t('about.modal_title')}</h4>
                   <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-[200px] mx-auto">
                     {t('about.mobile_msg')}
                   </p>
                </div>
                <a 
                  href={ResumePDF} 
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-full shadow-lg shadow-sky-500/20"
                >
                  <Eye size={18} /> {t('about.btn_open')}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default About;