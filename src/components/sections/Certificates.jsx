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
            <div className="h-full min-h-[320px]">
              <GlareHover
                className="h-full"
                background="#ffffff"
                borderRadius="22px"
                glareColor="#d2d2d2ff"
                glareOpacity={0.8}
                glareSize={500}
                glareAngle={-1200}
                transitionDuration={800}
              >
                <div className="p-7 sm:p-8 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-7">
                    <div className="flex items-center gap-3">
                      <img src={MetaLogo} alt="Meta" className="w-12 h-12 object-contain" />
                      <div className="leading-tight">
                        <div className="text-sm font-black text-gray-900">Meta</div>
                        <div className="text-xs text-gray-400 font-semibold">Coursera</div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                      Verified <CheckCircle size={14} />
                    </span>
                  </div>

                  {/* Title */}
                  <div className="mb-4">
                    <h4 className="font-black text-xl text-gray-900 leading-snug">{cert.title}</h4>
                    <p className="text-sm text-gray-500 font-medium mt-2 leading-relaxed">
                      Professional certificate authorized by Meta.
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 pb-6">
                      {cert.tags.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 rounded-full text-xs font-black border border-gray-200 bg-white text-gray-800"
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
                        className="flex-1 border border-gray-200 text-gray-800 py-2.5 rounded-xl text-sm font-black hover:bg-gray-50 transition"
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