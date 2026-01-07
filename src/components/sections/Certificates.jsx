import React, { useState, useEffect } from "react";
import { CheckCircle, X, ExternalLink, FileText } from "lucide-react";
import Reveal from "../ui/Reveal";
import SectionTitle from "../ui/SectionTitle";
import GlareHover from "../ui/GlareHover";
import MetaLogo from "../../assets/meta.png";

// --- IMPORTS ---
import FrontEndPdf from "../../assets/frontend.pdf";
import JSPdf from "../../assets/javascript.pdf";
import VersionControlPdf from "../../assets/version-control.pdf";
import HtmlCssDepthPdf from "../../assets/html-css.pdf";
import ReactBasicsPdf from "../../assets/react-basics.pdf";
import AdvReactPdf from "../../assets/advanced-react.pdf";

const Certificates = () => {
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    if (selectedCert) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedCert]);

  const certs = [
    {
      title: "Introduction to Front-End Development",
      tags: ["HTML", "CSS"],
      date: "Sep 2, 2023",
      verifyLink: "https://coursera.org/verify/8ETUQ9L3GS9E",
      pdf: FrontEndPdf,
    },
    {
      title: "Programming with JavaScript",
      tags: ["JavaScript"],
      date: "Sep 25, 2023",
      verifyLink: "https://coursera.org/verify/83A5ALGPJF42",
      pdf: JSPdf,
    },
    {
      title: "Version Control",
      tags: ["Git", "GitHub"],
      date: "Oct 2, 2023",
      verifyLink: "https://coursera.org/verify/HYWBPSY7JGGZ",
      pdf: VersionControlPdf,
    },
    {
      title: "HTML and CSS in depth",
      tags: ["HTML", "CSS"],
      date: "Jan 17, 2024",
      verifyLink: "https://coursera.org/verify/8RF7U25HVNQ2",
      pdf: HtmlCssDepthPdf,
    },
    {
      title: "React Basics",
      tags: ["JavaScript", "React"],
      date: "Feb 24, 2024",
      verifyLink: "https://coursera.org/verify/AAS45JF4NDVZ",
      pdf: ReactBasicsPdf,
    },
    {
      title: "Advanced React",
      tags: ["React", "Hooks"],
      date: "Aug 1, 2024",
      verifyLink: "https://coursera.org/verify/QD8K2V7ADKY9",
      pdf: AdvReactPdf,
    },
  ];

  return (
    <>
      <section id="certificates" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-24 md:scroll-mt-32">
        <SectionTitle title="Certificates" num="04" kicker="Verified Skills" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {certs.map((cert, idx) => (
            <Reveal key={idx} delay={idx * 90}>
              <div className="relative group h-full min-h-[320px]">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-[22px] blur opacity-25 dark:opacity-40 transition duration-1000 group-hover:opacity-60"></div>

                <GlareHover
                  className="h-full relative"
                  background="transparent"
                  borderRadius="22px"
                  glareColor="#ffffff"
                  glareOpacity={0.3}
                  glareSize={500}
                  glareAngle={-1200}
                  transitionDuration={800}
                >
                  <div className="p-7 sm:p-8 flex flex-col h-full rounded-[22px] transition-colors duration-300 bg-white dark:bg-slate-800/60 dark:border dark:border-slate-700">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-7">
                      <div className="flex items-center gap-3">
                        <img src={MetaLogo} alt="Meta" className="w-12 h-12 object-contain" />
                        <div className="leading-tight">
                          <div className="text-sm font-black text-gray-900 dark:text-white">Meta</div>
                          <div className="text-xs text-gray-400 font-semibold">Coursera</div>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full border transition-colors bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                        Verified <CheckCircle size={14} />
                      </span>
                    </div>

                    {/* Title */}
                    <div className="mb-4">
                      <h4 className="font-black text-xl leading-snug transition-colors text-gray-900 dark:text-slate-100">
                        {cert.title}
                      </h4>
                      <p className="text-sm font-medium mt-2 leading-relaxed transition-colors text-gray-500 dark:text-slate-400">
                        Completed on {cert.date}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 pb-6">
                        {cert.tags.map((t) => (
                          <span key={t} className="px-3 py-1 rounded-full text-xs font-black border transition-colors bg-white text-gray-800 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="flex-1 bg-[#0EA5E9] text-white py-2.5 rounded-xl text-sm font-black shadow-sm hover:brightness-95 transition"
                        >
                          VIEW
                        </button>
                        <a
                          href={cert.verifyLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 border py-2.5 rounded-xl text-sm font-black transition-colors bg-transparent border-gray-200 text-gray-800 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
                        >
                          Verify <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                </GlareHover>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --- CERTIFICATE MODAL --- */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedCert(null)}
          ></div>

          <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-100 dark:border-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate pr-4">
                {selectedCert.title}
              </h3>

              <div className="flex items-center gap-3">
                <a
                  href={selectedCert.verifyLink}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ExternalLink size={16} /> Verify
                </a>
                
                <button
                  onClick={() => setSelectedCert(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="w-full h-[50vh] sm:h-[75vh] bg-gray-50 dark:bg-slate-950 relative overflow-hidden flex flex-col justify-center">
              
              {/* DESKTOP: Iframe */}
              <iframe
                src={`${selectedCert.pdf}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                title="Certificate PDF"
                className="hidden sm:block w-full h-full border-0"
              />
              
              {/* MOBILE: Fallback */}
              <div className="sm:hidden flex flex-col items-center text-center p-6 gap-4">
                 <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center text-sky-600 dark:text-sky-400">
                   <FileText size={32} />
                 </div>
                 <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">View Certificate PDF</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-[220px] mx-auto">
                      Tap below to open the official PDF in your browser.
                    </p>
                 </div>
                 <div className="flex flex-col gap-3 w-full max-w-[250px]">
                   <a
                    href={selectedCert.pdf}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-full shadow-lg"
                  >
                    Open PDF
                  </a>
                  <a
                    href={selectedCert.verifyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold border border-gray-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300"
                  >
                     External Verify <ExternalLink size={14} />
                  </a>
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Certificates;