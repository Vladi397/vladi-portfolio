import React, { useMemo, useState, useEffect, useDeferredValue, Suspense, lazy } from "react";
import { ArrowUpRight } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import useActiveSection from "./hooks/useActiveSection";
import useTheme from "./hooks/useTheme";
import { scrollToId } from "./utils/scrollHelpers";

import LoadingScreen from "./components/ui/LoadingScreen";
import GlareHover from "./components/ui/GlareHover";
import CustomCursor from "./components/ui/CustomCursor";

import MouseSpotlight from "./components/ui/MouseSpotlight";
import StaticBackdrop from "./components/ui/StaticBackdrop";

// If the 3D background throws anywhere (WebGL init, driver quirks), swap in the
// static backdrop instead of white-screening the whole site.
class BackgroundBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    // Decorative layer only — nothing to report, the fallback covers it.
  }
  render() {
    return this.state.failed ? <StaticBackdrop /> : this.props.children;
  }
}

// Code-split: the 3D background pulls in the entire three.js stack, and the 404
// page is only ever shown on a non-"/" route. Both load on demand so they stay
// out of the initial bundle. Behaviour is unchanged — the background is a fixed,
// decorative canvas behind a solid dark bg layer + the loading screen, and the
// 404 renders identically once its chunk arrives.
const UniverseBackground = lazy(() => import("./components/ui/UniverseBackground"));
const NotFound = lazy(() => import("./pages/NotFound"));

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

  // The starfield is by far the most expensive thing that reads the theme, and
  // the toggle flushes synchronously inside a view transition. Deferring only
  // the background keeps that blocking frame cheap, so the wipe animation is
  // not swallowed by a long task; the scene recolours a moment later.
  const backgroundTheme = useDeferredValue(theme);

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
    <BrowserRouter>
      <CustomCursor />
      <Suspense fallback={null}>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<>
      <Analytics />

      {!isLoaded && <LoadingScreen onComplete={() => setIsLoaded(true)} />}

      <div
        className={`min-h-screen font-sans theme-color-transition transition-colors duration-300
        selection:bg-[#0EA5E9] selection:text-white
        text-gray-900 dark:text-slate-100
        opacity-100`} 
      >
        <div className="fixed inset-0 -z-50 bg-slate-50 dark:bg-[#050505] transition-colors duration-300" />
        <MouseSpotlight />
        <BackgroundBoundary>
          <Suspense fallback={null}>
            <UniverseBackground theme={backgroundTheme} />
          </Suspense>
        </BackgroundBoundary>
        
        {isLoaded && (
          <Navbar activeId={activeId} theme={theme} toggleTheme={toggleTheme} />
        )}

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

        {isLoaded && showTop && (
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
    </>} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}