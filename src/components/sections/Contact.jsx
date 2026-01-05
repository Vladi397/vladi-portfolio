import React, { useState } from "react";
import { Check, Copy, ExternalLink, Github, Rocket } from "lucide-react";
import Reveal from "../ui/Reveal";

const Contact = () => {
  const email = "vladi.georgiev.14@gmail.com";
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Copy failed. Please copy manually.");
    }
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-24 md:scroll-mt-32">
      <Reveal>
        <div className="rounded-3xl p-6 sm:p-8 md:p-16 flex flex-col md:flex-row gap-10 md:gap-12 items-center shadow-lg border transition-colors
          bg-[#E0F2FE] border-sky-100
          dark:bg-slate-800/80 dark:border-slate-700"
        >
          <div className="flex-1 space-y-6 w-full">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold transition-colors
              text-gray-900 dark:text-white"
            >
              Let’s start a <br className="hidden sm:block" /> conversation
            </h2>

            <div className="flex items-center gap-2 font-black transition-colors
              text-green-700 dark:text-green-400"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse motion-reduce:animate-none"></span>
              Available for new projects
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2 w-full">
              <button
                onClick={onCopy}
                className="inline-flex items-center justify-between gap-2 px-5 py-3 rounded-full font-semibold shadow-sm transition-colors w-full sm:w-auto
                  bg-white/70 border border-white/60 text-gray-700 hover:bg-white
                  dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <span className="truncate max-w-[240px] sm:max-w-none">{email}</span>
                {copied ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} className="hover:text-[#0EA5E9]" />
                )}
              </button>

              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold shadow-sm transition-colors w-full sm:w-auto
                  bg-white/70 border border-white/60 text-gray-700 hover:bg-white
                  dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                LinkedIn <ExternalLink size={16} />
              </a>

              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold shadow-sm transition-colors w-full sm:w-auto
                  bg-white/70 border border-white/60 text-gray-700 hover:bg-white
                  dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                GitHub <Github size={16} />
              </a>
            </div>
          </div>

          <form
            className="flex-1 w-full space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Hook this form to EmailJS / Formspree / your backend.");
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-black transition-colors text-gray-700 dark:text-slate-300">
                Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full p-4 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] outline-none transition-colors
                  bg-[#F0F9FF] border border-sky-100 placeholder:text-gray-400
                  dark:bg-slate-950 dark:border-slate-800 dark:placeholder:text-slate-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black transition-colors text-gray-700 dark:text-slate-300">
                Email
              </label>
              <input
                type="email"
                placeholder="you@email.com"
                className="w-full p-4 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] outline-none transition-colors
                  bg-[#F0F9FF] border border-sky-100 placeholder:text-gray-400
                  dark:bg-slate-950 dark:border-slate-800 dark:placeholder:text-slate-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black transition-colors text-gray-700 dark:text-slate-300">
                Message
              </label>
              <textarea
                placeholder="What are you building?"
                rows="4"
                className="w-full p-4 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] outline-none resize-none transition-colors
                  bg-[#F0F9FF] border border-sky-100 placeholder:text-gray-400
                  dark:bg-slate-950 dark:border-slate-800 dark:placeholder:text-slate-600 dark:text-white"
              ></textarea>
            </div>

            <button
              className="w-full bg-[#0EA5E9] text-white font-black py-4 px-8 rounded-full shadow-lg hover:bg-sky-500 transition-all duration-300 motion-reduce:transition-none inline-flex items-center justify-center gap-2"
              type="submit"
            >
              Send Message <Rocket size={20} />
            </button>
          </form>
        </div>
      </Reveal>
    </section>
  );
};

export default Contact;