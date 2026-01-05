import React from "react";
import { CheckCircle } from "lucide-react";
import Reveal from "../ui/Reveal";
import SectionTitle from "../ui/SectionTitle";
import GlareHover from "../ui/GlareHover";
import MetaLogo from "../../assets/meta.png";

const Certificates = () => {
  const certs = [
    { title: "Introduction to Front-End", tags: ["HTML", "CSS"] },
    { title: "HTML and CSS in depth", tags: ["HTML", "CSS"] },
    { title: "Programming with JavaScript", tags: ["JavaScript"] },
    { title: "React Basics", tags: ["JavaScript", "React"] },
    { title: "Version Control", tags: ["Git", "GitHub"] },
    { title: "Advanced React", tags: ["React", "Hooks"] },
  ];

  return (
    <section id="certificates" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-24 md:scroll-mt-32">
      <SectionTitle title="Certificates" num="04" kicker="Verified Skills" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {certs.map((cert, idx) => (
          <Reveal key={idx} delay={idx * 90}>
             {/* Wrapper for the Glow Effect */}
            <div className="relative group h-full min-h-[320px]">
               {/* THE GLOW - Positioned behind the card */}
               <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-[22px] blur opacity-25 dark:opacity-40 transition duration-1000 group-hover:opacity-60"></div>

              <GlareHover
                className="h-full relative" // Keep relative so it sits on top of the glow div
                background="transparent"
                borderRadius="22px"
                glareColor="#ffffff"
                glareOpacity={0.3}
                glareSize={500}
                glareAngle={-1200}
                transitionDuration={800}
              >
                {/* INNER CARD */}
                {/* REVERTED dark:bg-slate-800/90 BACK TO your original dark:bg-slate-800/60 below */}
                <div className="p-7 sm:p-8 flex flex-col h-full rounded-[22px] transition-colors duration-300
                  bg-white dark:bg-slate-800/60 dark:border dark:border-slate-700"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-7">
                    <div className="flex items-center gap-3">
                      <img src={MetaLogo} alt="Meta" className="w-12 h-12 object-contain" />
                      <div className="leading-tight">
                        <div className="text-sm font-black text-gray-900 dark:text-white">Meta</div>
                        <div className="text-xs text-gray-400 font-semibold">Coursera</div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full border transition-colors
                      bg-emerald-50 text-emerald-700 border-emerald-200
                      dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                    >
                      Verified <CheckCircle size={14} />
                    </span>
                  </div>

                  {/* Title */}
                  <div className="mb-4">
                    <h4 className="font-black text-xl leading-snug transition-colors
                      text-gray-900 dark:text-slate-100"
                    >
                      {cert.title}
                    </h4>
                    <p className="text-sm font-medium mt-2 leading-relaxed transition-colors
                      text-gray-500 dark:text-slate-400"
                    >
                      Professional certificate authorized by Meta.
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 pb-6">
                      {cert.tags.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 rounded-full text-xs font-black border transition-colors
                          bg-white text-gray-800 border-gray-200
                          dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => alert("Hook VIEW to credential link")}
                        className="flex-1 bg-[#0EA5E9] text-white py-2.5 rounded-xl text-sm font-black shadow-sm hover:brightness-95 transition"
                      >
                        VIEW
                      </button>
                      <button
                        onClick={() => alert("Hook PDF to download")}
                        className="flex-1 border py-2.5 rounded-xl text-sm font-black transition-colors
                        bg-transparent border-gray-200 text-gray-800 hover:bg-gray-50
                        dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              </GlareHover>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Certificates;