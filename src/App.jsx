import React, { useMemo, useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

// Helpers
import useActiveSection from "./hooks/useActiveSection";
import useTheme from "./hooks/useTheme"; // <--- 1. Import the hook
import { scrollToId } from "./utils/scrollHelpers";

// UI
import LoadingScreen from "./components/ui/LoadingScreen";
import GlareHover from "./components/ui/GlareHover"; 

// Sections
import Navbar from "./components/sections/Navbar";
import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Skills from "./components/sections/Skills";
import Projects from "./components/sections/Projects";
import Certificates from "./components/sections/Certificates";
import Journey from "./components/sections/Journey";
import Contact from "./components/sections/Contact";

export default function App() {
  // --- Theme State ---
  const { theme, toggleTheme } = useTheme(); // <--- 2. Use the hook

  const sectionIds = useMemo(
    () => ["about", "skills", "projects", "certificates", "journey", "contact"],
    []
  );
  const activeId = useActiveSection(sectionIds);

  // --- Loading & Scroll State ---
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* 1. Loading Screen */}
      {!isLoaded && <LoadingScreen onComplete={() => setIsLoaded(true)} />}

      {/* 2. Main Website */}
      <div
        className={`min-h-screen font-sans transition-colors duration-700
        selection:bg-[#0EA5E9] selection:text-white
        /* LIGHT MODE TEXT */ text-gray-900 
        /* DARK MODE TEXT */  dark:text-slate-100
        ${isLoaded ? "opacity-100" : "opacity-0"}`}
      >
        {/* --- DYNAMIC BACKGROUND --- */}
        <div className="fixed inset-0 -z-50 transition-colors duration-700
          /* LIGHT BG */ bg-gradient-to-b from-gray-50 via-gray-50 to-sky-100
          /* DARK BG */  dark:from-slate-950 dark:via-slate-950 dark:to-slate-900"
        ></div>

        {/* --- BACKGROUND BLOBS --- */}
        <div className="fixed -z-40 inset-0 pointer-events-none opacity-[0.55] transition-opacity duration-700">
          <div className="absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full blur-[120px] transition-colors duration-700
            /* LIGHT BLOB */ bg-sky-200 
            /* DARK BLOB */  dark:bg-sky-900/40"
          ></div>
          <div className="absolute top-48 -right-24 w-[520px] h-[520px] rounded-full blur-[120px] transition-colors duration-700
            /* LIGHT BLOB */ bg-sky-100
            /* DARK BLOB */  dark:bg-indigo-900/40"
          ></div>
        </div>

        {/* Pass theme props to Navbar so we can put the button there */}
        <Navbar activeId={activeId} theme={theme} toggleTheme={toggleTheme} />

        <Hero />
        <About />
        <Skills />
        <Projects />
        <Certificates />
        <Journey />
        <Contact />

        <footer className="text-center py-12 text-sm font-semibold transition-colors duration-500
          text-gray-400 dark:text-slate-600">
          © 2025 Vladi Georgiev.
        </footer>

        {/* Back to Top Button */}
        {showTop && (
          <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50">
            <GlareHover
              borderRadius="50%"
              className="cursor-pointer"
              // Dynamic background for the button itself
              background={theme === 'dark' ? "rgba(30, 41, 59, 0.9)" : "rgba(245, 245, 245, 0.9)"}
              glareOpacity={0.4}
            >
              <button
                onClick={() => scrollToId("home")}
                className="w-12 h-12 flex items-center justify-center transition-colors duration-300
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