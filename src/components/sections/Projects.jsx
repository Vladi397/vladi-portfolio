import React from "react";
import { ExternalLink, Github } from "lucide-react";
import Reveal from "../ui/Reveal";
import SectionTitle from "../ui/SectionTitle";

const Projects = () => {
  const projects = [
    {
      title: "OurGrid (OpenRemote)",
      desc: "A platform demystifying 'grid congestion' for OpenRemote. I designed the UI and validated the UX with real users (students & coaches) to translate complex data into a clean React interface.",
      role: "Frontend Lead • UI/UX Designer • Research",
      outcomes: [
        "Validated UX via testing with real users",
        "Architected a split-view UI for Residents vs. Municipalities",
        "Translated technical IoT data into accessible web components",
      ],
      tags: ["React", "Tailwind", "User Testing", "Figma"],
      liveUrl: "#",
      repoUrl: "#",
    },
    {
      title: "Mario & Luigi's Pizza",
      desc: "A full-stack Italian restaurant app with auth and a shopping cart. I designed the authentic visual identity in Figma and built the responsive frontend connected to a Python Flask backend.",
      role: "UI Designer & Frontend Lead",
      outcomes: [
        "Designed the UI/UX & assets in Figma",
        "Developed the product card grid & cart logic",
        "Integrated Python Flask for routing & auth",
      ],
      tags: ["Figma", "Python Flask", "JavaScript", "HTML/CSS"],
      liveUrl: "#",
      repoUrl: "#",
    },
    {
      title: "Fit Fusion",
      desc: "A gamified health ecosystem where physical steps nurture a virtual pet. I led a 6-person agile team and handled the technical integration between the Unity game and the Web platform.",
      role: "Team Lead • Full Stack Web",
      outcomes: [
        "Led the agile team & coordinated integration",
        "Developed the Web Frontend & C# Razor Pages",
        "Designed game characters (Tamagotchis) & UI",
      ],
      tags: ["Team Lead", "C# Razor Pages", "Figma", "Unity"],
      liveUrl: "#",
      repoUrl: "#",
    },
  ];

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto relative scroll-mt-24 md:scroll-mt-32">
      <SectionTitle title="Projects" num="03" kicker="Selected work" />

      <div className="flex flex-col gap-10 pb-10 md:pb-20">
        {projects.map((p, index) => (
          <div key={p.title} className="md:sticky md:top-28">
            <Reveal delay={index * 90}>
              <div className="backdrop-blur-xl border shadow-xl rounded-3xl p-6 sm:p-7 md:p-10 flex flex-col md:flex-row gap-8 md:gap-10 transition-all duration-500 md:hover:scale-[1.01] motion-reduce:transition-none
                bg-white/85 border-white/60
                dark:bg-slate-900/90 dark:border-slate-700/50"
              >
                {/* Image Section */}
                <div className="w-full md:w-1/2">
                  <div className="rounded-2xl overflow-hidden shadow-inner aspect-[4/3] border flex items-center justify-center relative transition-colors
                    bg-gradient-to-br from-sky-50 to-white border-gray-100
                    dark:from-slate-800 dark:to-slate-900 dark:border-slate-700"
                  >
                    <span className="font-bold text-center px-4 transition-colors text-gray-400 dark:text-slate-500">
                      [ {p.title} Screenshot ]
                    </span>
                    <div
                      className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl opacity-70 ${
                        index === 0 ? "bg-indigo-100 dark:bg-indigo-900/30" : "bg-sky-100 dark:bg-sky-900/30"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Text Section */}
                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4">
                  <div className="flex flex-col items-start">
                    <span className="text-[#0EA5E9] font-black tracking-widest uppercase text-sm mb-2">
                      {p.role}
                    </span>
                    <h3 className="text-3xl md:text-4xl font-black leading-tight transition-colors
                      text-gray-900 dark:text-white"
                    >
                      {p.title}
                    </h3>
                  </div>

                  <p className="leading-relaxed text-base sm:text-lg min-h-[5rem] transition-colors
                    text-gray-600 dark:text-slate-300"
                  >
                    {p.desc}
                  </p>

                  <ul className="space-y-2 mt-2">
                    {p.outcomes.map((o) => (
                      <li key={o} className="flex gap-3 items-start transition-colors text-gray-700 dark:text-slate-400">
                        <span className="mt-2 w-2 h-2 rounded-full bg-[#0EA5E9] flex-shrink-0"></span>
                        <span className="font-medium text-sm sm:text-base">{o}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2 pt-4">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="px-4 py-1.5 rounded-full text-sm font-bold border transition-colors
                        bg-sky-50 text-[#0EA5E9] border-sky-100
                        dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row flex-wrap gap-3">
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#0EA5E9] text-white font-bold shadow-lg hover:bg-sky-500 transition-all w-full sm:w-auto"
                    >
                      Live <ExternalLink size={18} />
                    </a>
                    <a
                      href={p.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border font-bold transition-all w-full sm:w-auto
                      bg-white border-gray-200 text-gray-800 hover:bg-gray-50
                      dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Code <Github size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="hidden md:block" style={{ height: `${(projects.length - index) * 22}px` }} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;