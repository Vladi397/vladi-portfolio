import React, { useState, useEffect } from "react";
import { ExternalLink, Github } from "lucide-react";
import Reveal from "../ui/Reveal";
import SectionTitle from "../ui/SectionTitle";

// Imports
import ourGridImg from "../../assets/OurGrid.png";
import marioPizzaImg from "../../assets/MarioPizza.png";
import fitFusionImg from "../../assets/FirFusion.png";
import spaceInvasionImg from "../../assets/spaceinvasion.png";

const Projects = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const projects = [
    {
      title: "OurGrid (OpenRemote)",
      desc: "A platform demystifying 'grid congestion' for OpenRemote. I designed the UI and validated the UX with real users (students & coaches) to translate complex data into a clean React interface.",
      role: "Frontend Lead • UI/UX Designer • Research",
      img: ourGridImg,
      outcomes: [
        "Validated UX via testing with real users",
        "Architected a split-view UI for Residents vs. Municipalities",
        "Translated technical IoT data into accessible web components",
      ],
      tags: ["React", "Tailwind", "User Testing", "Figma"],
      liveUrl: "https://ourgrid.vercel.app/",
      repoUrl: "https://github.com/Marto8090/OurGrid_Website",
    },
    {
      title: "Mario & Luigi's Pizza",
      desc: "A full-stack Italian restaurant app with auth and a shopping cart. I designed the authentic visual identity in Figma and built the responsive frontend connected to a Python Flask backend.",
      role: "UI Designer & Frontend Lead",
      img: marioPizzaImg,
      customImgClass: "object-[center_35%] scale-110", 
      outcomes: [
        "Designed the UI/UX & assets in Figma",
        "Developed the product card grid & cart logic",
        "Integrated Python Flask for routing & auth",
      ],
      tags: ["Figma", "Python Flask", "JavaScript", "HTML/CSS"],
      liveUrl: "#", // Button will hide
      repoUrl: "#", 
    },
    {
      title: "Fit Fusion",
      desc: "A gamified health ecosystem where physical steps nurture a virtual pet. I led a 6-person agile team and handled the technical integration between the Unity game and the Web platform.",
      role: "Team Lead • Full Stack Web",
      img: fitFusionImg,
      outcomes: [
        "Led the agile team & coordinated integration",
        "Developed the Web Frontend & C# Razor Pages",
        "Designed game characters (Tamagotchis) & UI",
      ],
      tags: ["Team Lead", "C# Razor Pages", "Figma", "Unity"],
      liveUrl: "#", // Button will hide
      repoUrl: "#",
    },
    {
      title: "Space Invasion",
      desc: "A classic arcade shooter reimagined with modern web technologies. Players defend Earth from waves of alien invaders using a custom-built game engine on the HTML5 Canvas.",
      role: "Game Developer",
      img: spaceInvasionImg,
      outcomes: [
        "Implemented collision detection & physics from scratch",
        "Designed pixel art assets & animations",
        "Managed game state, levels, and local high scores",
      ],
      tags: ["Game Dev", "JavaScript", "Canvas API", "HTML5"],
      liveUrl: "#", // Button will hide
      repoUrl: "#",
    },
  ];

  return (
    <section id="projects" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto relative scroll-mt-24 md:scroll-mt-32">
      <SectionTitle title="Projects" num="03" kicker="Selected work" />

      <div className="flex flex-col">
        {projects.map((p, index) => {
          return (
            <div 
              key={p.title} 
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
                          
                          {/* CHANGED: Only render Live Demo if there is a real URL */}
                          {p.liveUrl && p.liveUrl !== "#" && (
                            <a
                              href={p.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto
                              bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500"
                            >
                              Live Demo <ExternalLink size={18} />
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
                            Code <Github size={18} />
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