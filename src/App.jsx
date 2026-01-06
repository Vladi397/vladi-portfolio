// src/App.jsx
import React, { useMemo, useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

import useActiveSection from "./hooks/useActiveSection";
import useTheme from "./hooks/useTheme";
import { scrollToId } from "./utils/scrollHelpers";

import LoadingScreen from "./components/ui/LoadingScreen";
import GlareHover from "./components/ui/GlareHover";

import Navbar from "./components/sections/Navbar";
import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Skills from "./components/sections/Skills";
import Projects from "./components/sections/Projects";
import Certificates from "./components/sections/Certificates";
import Journey from "./components/sections/Journey";
import Contact from "./components/sections/Contact";

export default function App() {
  const { theme, toggleTheme } = useTheme();

  const sectionIds = useMemo(
    () => ["about", "skills", "projects", "certificates", "journey", "contact"],
    []
  );
  const activeId = useActiveSection(sectionIds);

  const [isLoaded, setIsLoaded] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {!isLoaded && <LoadingScreen onComplete={() => setIsLoaded(true)} />}

      <div
        className={`min-h-screen font-sans theme-color-transition transition-colors duration-700
        selection:bg-[#0EA5E9] selection:text-white
        text-gray-900 dark:text-slate-100
        ${isLoaded ? "opacity-100" : "opacity-0"}`}
      >
        {/* --- DYNAMIC BACKGROUND --- */}
        <div
          className="fixed inset-0 -z-50 theme-color-transition transition-colors duration-700
          bg-gradient-to-b from-gray-50 via-gray-50 to-sky-100
          dark:from-slate-950 dark:via-slate-950 dark:to-slate-900"
        />

        {/* --- BACKGROUND BLOBS --- */}
        <div className="fixed -z-40 inset-0 pointer-events-none opacity-[0.55] theme-color-transition transition-opacity duration-700">
          <div
            className="theme-heavy-blob absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full blur-[120px] theme-color-transition transition-colors duration-700
            bg-sky-200 dark:bg-sky-900/40"
          />
          <div
            className="theme-heavy-blob absolute top-48 -right-24 w-[520px] h-[520px] rounded-full blur-[120px] theme-color-transition transition-colors duration-700
            bg-sky-100 dark:bg-indigo-900/40"
          />
        </div>

        <Navbar activeId={activeId} theme={theme} toggleTheme={toggleTheme} />

        <Hero />
        <About />
        <Skills />
        <Projects />
        <Certificates />
        <Journey />
        <Contact />

        <footer className="text-center py-12 text-sm font-semibold theme-color-transition transition-colors duration-500 text-gray-400 dark:text-slate-600">
          © 2025 Vladi Georgiev.
        </footer>

        {showTop && (
          <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50">
            <GlareHover
              borderRadius="50%"
              className="cursor-pointer"
              background={theme === "dark" ? "rgba(30, 41, 59, 0.9)" : "rgba(245, 245, 245, 0.9)"}
              glareOpacity={0.4}
            >
              <button
                onClick={() => scrollToId("home")}
                className="w-12 h-12 flex items-center justify-center theme-color-transition transition-colors duration-300
                  text-gray-700 hover:text-black
                  dark:text-slate-200 dark:hover:text-white"
                aria-label="Back to top"
              >
                <ArrowUpRight className="rotate-[-45deg]" size={18} />
              </button>
            </GlareHover>
          </div>
        )}
      </div>
    </>
  );
}
