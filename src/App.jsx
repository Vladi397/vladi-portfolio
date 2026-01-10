import React, { useMemo, useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

import useActiveSection from "./hooks/useActiveSection";
import useTheme from "./hooks/useTheme";
import { scrollToId } from "./utils/scrollHelpers";

import LoadingScreen from "./components/ui/LoadingScreen";
import GlareHover from "./components/ui/GlareHover";

import UniverseBackground from "./components/ui/UniverseBackground";
import MouseSpotlight from "./components/ui/MouseSpotlight";

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

      {/* CHANGED: duration-700 -> duration-300 for snappy feel */}
      <div
        className={`min-h-screen font-sans theme-color-transition transition-colors duration-300
        selection:bg-[#0EA5E9] selection:text-white
        text-gray-900 dark:text-slate-100
        ${isLoaded ? "opacity-100" : "opacity-0"}`}
      >
        {/* --- LAYER 1: BASE COLOR --- */}
        <div className="fixed inset-0 -z-50 bg-slate-50 dark:bg-[#050505] transition-colors duration-300" />

        {/* --- LAYER 2: MOUSE SPOTLIGHT --- */}
        <MouseSpotlight />

        {/* --- LAYER 3: 3D UNIVERSE --- */}
        <UniverseBackground theme={theme} />

        {/* --- LAYER 4: CONTENT --- */}
        <Navbar activeId={activeId} theme={theme} toggleTheme={toggleTheme} />

        <main className="relative z-10">
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Certificates />
          <Journey />
          <Contact />
        </main>

        <footer className="text-center py-12 text-sm font-semibold theme-color-transition transition-colors duration-500 text-gray-400 dark:text-slate-600 relative z-10">
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