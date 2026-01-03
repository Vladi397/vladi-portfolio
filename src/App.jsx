import React, { useMemo, useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

// Helpers
import useActiveSection from "./hooks/useActiveSection";
import { scrollToId } from "./utils/scrollHelpers";

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
  const sectionIds = useMemo(
    () => ["about", "skills", "projects", "certificates", "journey", "contact"],
    []
  );
  const activeId = useActiveSection(sectionIds);

  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans selection:bg-[#0EA5E9] selection:text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-50 bg-gradient-to-b from-gray-50 via-gray-50 to-sky-100"></div>
      <div className="fixed -z-40 inset-0 pointer-events-none opacity-[0.55]">
        <div className="absolute -top-24 -left-24 w-[520px] h-[520px] bg-sky-200 rounded-full blur-[120px]"></div>
        <div className="absolute top-48 -right-24 w-[520px] h-[520px] bg-sky-100 rounded-full blur-[120px]"></div>
      </div>

      <Navbar activeId={activeId} />

      <Hero />
      <About />
      <Skills />
      <Projects />
      <Certificates />
      <Journey />
      <Contact />

      <footer className="text-center py-12 text-gray-400 text-sm font-semibold">
        © 2025 Vladi Georgiev.
      </footer>

      {showTop && (
        <button
          onClick={() => scrollToId("home")}
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 bg-white/80 backdrop-blur border border-gray-100 shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Back to top"
        >
          <ArrowUpRight className="rotate-[-45deg]" size={18} />
        </button>
      )}
    </div>
  );
}