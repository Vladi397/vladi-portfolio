import React, { useState, useEffect } from "react";
import { ExternalLink, Github } from "lucide-react";
import Reveal from "../ui/Reveal";
import SectionTitle from "../ui/SectionTitle";
import { useTranslation } from 'react-i18next'; // <--- Import

// Imports
import ourGridImg from "../../assets/OurGrid.png";
import marioPizzaImg from "../../assets/MarioPizza.png";
import fitFusionImg from "../../assets/FirFusion.png";
import spaceInvasionImg from "../../assets/spaceinvasion.png";

const Projects = () => {
  const { t } = useTranslation(); // <--- Init hook
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // MOVED INSIDE COMPONENT so we can use t()
  const projects = [
    {
      title: t('projects.ourgrid.title'),
      desc: t('projects.ourgrid.desc'),
      role: t('projects.ourgrid.role'),
      img: ourGridImg,
      outcomes: [
        t('projects.ourgrid.outcome1'),
        t('projects.ourgrid.outcome2'),
        t('projects.ourgrid.outcome3'),
      ],
      tags: ["React", "Tailwind", "User Testing", "Figma"],
      liveUrl: "https://ourgrid.vercel.app/",
      repoUrl: "https://github.com/Marto8090/OurGrid_Website",
    },
    {
      title: t('projects.mario.title'),
      desc: t('projects.mario.desc'),
      role: t('projects.mario.role'),
      img: marioPizzaImg,
      customImgClass: "object-[center_35%] scale-110", 
      outcomes: [
        t('projects.mario.outcome1'),
        t('projects.mario.outcome2'),
        t('projects.mario.outcome3'),
      ],
      tags: ["Figma", "Python Flask", "JavaScript", "HTML/CSS"],
      liveUrl: "#", 
      repoUrl: "#", 
    },
    {
      title: t('projects.fitfusion.title'),
      desc: t('projects.fitfusion.desc'),
      role: t('projects.fitfusion.role'),
      img: fitFusionImg,
      outcomes: [
        t('projects.fitfusion.outcome1'),
        t('projects.fitfusion.outcome2'),
        t('projects.fitfusion.outcome3'),
      ],
      tags: ["Team Lead", "C# Razor Pages", "Figma", "Unity"],
      liveUrl: "#", 
      repoUrl: "#",
    },
    {
      title: t('projects.space.title'),
      desc: t('projects.space.desc'),
      role: t('projects.space.role'),
      img: spaceInvasionImg,
      outcomes: [
        t('projects.space.outcome1'),
        t('projects.space.outcome2'),
        t('projects.space.outcome3'),
      ],
      tags: ["Game Dev", "JavaScript", "Canvas API", "HTML5"],
      liveUrl: "#", 
      repoUrl: "#",
    },
  ];

  return (
    <section id="projects" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto relative scroll-mt-24 md:scroll-mt-32">
      <SectionTitle title={t('projects.title')} num="03" kicker={t('projects.kicker')} />

      <div className="flex flex-col">
        {projects.map((p, index) => {
          return (
            <div 
              key={index} 
              className={isMobile ? "relative mb-12" : "sticky top-28 md:top-32"}
              style={{ 
                zIndex: index + 1,
                marginBottom: isMobile ? "4rem" : "40vh"
              }}
            >
              <Reveal delay={index * 90}>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-[40px] blur opacity-0 group-hover:opacity-40 transition duration-1000"></div>

                  <div className="relative rounded-[32px] p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12 overflow-hidden transition-all duration-500
                    bg-white shadow-xl border border-gray-100
                    dark:bg-[#0B1120] dark:shadow-none dark:border-white/5"
                  >
                    <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 w-full">
                      <div className="w-full md:w-1/2">
                        <div className="rounded-2xl overflow-hidden shadow-sm aspect-[4/3] border flex items-center justify-center relative transition-colors group/image
                          bg-gray-50 border-gray-100
                          dark:bg-slate-800/50 dark:border-slate-700/50"
                        >
                          <img 
                            src={p.img} 
                            alt={p.title} 
                            className={`w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-[1.03] ${p.customImgClass || ''}`}
                          />
                          <div
                            className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-20 -z-10 ${
                              index % 2 === 0 ? "bg-indigo-500" : "bg-sky-500"
                            }`}
                          ></div>
                        </div>
                      </div>

                      <div className="w-full md:w-1/2 flex flex-col justify-center space-y-5">
                        <div className="flex flex-col items-start">
                          <span className="text-[#0EA5E9] font-black tracking-widest uppercase text-xs mb-2 bg-sky-50 dark:bg-sky-900/20 px-3 py-1 rounded-full">
                            {p.role}
                          </span>
                          <h3 className="text-3xl md:text-4xl font-black leading-tight transition-colors
                            text-gray-900 dark:text-white"
                          >
                            {p.title}
                          </h3>
                        </div>

                        <p className="leading-relaxed text-base sm:text-lg transition-colors
                          text-gray-600 dark:text-slate-300"
                        >
                          {p.desc}
                        </p>

                        <ul className="space-y-2 mt-1">
                          {p.outcomes.map((o) => (
                            <li key={o} className="flex gap-3 items-start transition-colors text-gray-700 dark:text-slate-400">
                              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#0EA5E9] flex-shrink-0"></span>
                              <span className="font-medium text-sm sm:text-base">{o}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {p.tags.map((t) => (
                            <span
                              key={t}
                              className="px-3 py-1 rounded-lg text-xs font-bold border transition-colors
                              bg-gray-50 text-gray-600 border-gray-200
                              dark:bg-white/5 dark:text-slate-300 dark:border-white/10"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row flex-wrap gap-3">
                          
                          {p.liveUrl && p.liveUrl !== "#" && (
                            <a
                              href={p.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto
                              bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500"
                            >
                              {t('projects.btn_live')} <ExternalLink size={18} />
                            </a>
                          )}

                          <a
                            href={p.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border font-bold transition-all w-full sm:w-auto hover:scale-105 active:scale-95
                            bg-white border-gray-200 text-gray-700 hover:bg-gray-50
                            dark:bg-white/5 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                          >
                            {t('projects.btn_code')} <Github size={18} />
                          </a>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Projects;