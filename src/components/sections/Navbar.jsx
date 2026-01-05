import React, { useState, useEffect, useMemo } from "react";
import { Menu, X, Sun, Moon } from "lucide-react"; // Imported Sun & Moon
import { scrollToId } from "../../utils/scrollHelpers";
import PrimaryButton from "../ui/PrimaryButton";

const Navbar = ({ activeId, theme, toggleTheme }) => { // Accepted new props
  const [open, setOpen] = useState(false);

  const links = useMemo(
    () => [
      { label: "ABOUT", id: "about" },
      { label: "SKILLS", id: "skills" },
      { label: "PROJECTS", id: "projects" },
      { label: "CERTIFICATES", id: "certificates" },
      { label: "JOURNEY", id: "journey" },
      { label: "CONTACT", id: "contact" },
    ],
    []
  );

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleNav = (id) => {
    setOpen(false);
    scrollToId(id);
  };

  // Inside Navbar.jsx
  const ThemeToggle = ({ className }) => (
    <button
      // We pass the event (e) so the circle starts exactly where you clicked!
      onClick={(e) => toggleTheme(e)} 
      className={`p-2 rounded-full transition-all duration-300 ${className}
        hover:bg-gray-100 text-gray-600
        dark:hover:bg-slate-800 dark:text-slate-300
        active:scale-90 hover:rotate-12 transform
      `}
      aria-label="Toggle Dark Mode"
    >
      {/* Added a subtle spin/scale animation to the ICON itself */}
      <div className="transition-transform duration-500 rotate-0 dark:rotate-[360deg]">
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </div>
    </button>
  );

  return (
    <nav className="fixed w-full z-50 top-0 left-0 transition-colors duration-300
      bg-white/70 border-gray-100/60
      dark:bg-slate-900/80 dark:border-slate-800/60
      backdrop-blur-md border-b"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-5 flex justify-between items-center">
        
        {/* LOGO */}
        <button
          onClick={() => scrollToId("home")}
          className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight transition-colors
            text-gray-900 dark:text-slate-50"
        >
          Vladi Georgiev
        </button>

        {/* --- DESKTOP MENU --- */}
        <div className="hidden md:flex items-center gap-6 lg:gap-10">
          {links.map((l) => {
            const isActive = activeId === l.id;
            return (
              <button
                key={l.id}
                onClick={() => handleNav(l.id)}
                className={[
                  "text-xs lg:text-sm font-semibold tracking-widest uppercase transition-colors",
                  isActive 
                    ? "text-sky-600 dark:text-sky-400" 
                    : "text-gray-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400",
                ].join(" ")}
              >
                {l.label}
              </button>
            );
          })}

          {/* Theme Toggle (Desktop) */}
          <ThemeToggle />

          <PrimaryButton onClick={() => handleNav("contact")} className="px-6 py-2 text-sm">
            Let’s talk
          </PrimaryButton>
        </div>

        {/* --- MOBILE HEADER CONTROLS --- */}
        <div className="flex items-center gap-4 md:hidden">
          {/* Theme Toggle (Mobile - Visible in header) */}
          <ThemeToggle />

          <button 
            onClick={() => setOpen((s) => !s)} 
            aria-label="Open menu"
            className="text-gray-900 dark:text-white"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU DRAWER --- */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 overflow-y-auto transition-colors duration-300
          bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-10">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">Menu</div>
              <button 
                onClick={() => setOpen(false)} 
                aria-label="Close menu"
                className="text-gray-900 dark:text-white"
              >
                <X />
              </button>
            </div>

            <div className="mt-10 flex flex-col gap-6">
              {links.map((l) => {
                const isActive = activeId === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => handleNav(l.id)}
                    className={[
                      "text-2xl font-black tracking-tight text-left transition-colors",
                      isActive 
                        ? "text-sky-600 dark:text-sky-400" 
                        : "text-gray-900 dark:text-slate-200",
                    ].join(" ")}
                  >
                    {l.label}
                  </button>
                );
              })}

              <div className="pt-6">
                <PrimaryButton onClick={() => handleNav("contact")} className="w-full justify-center">
                  Contact me
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;