import React, { useState, useEffect, useMemo } from "react";
import { Menu, X, Sun, Moon, Globe, ChevronRight, Zap } from "lucide-react"; 
import { scrollToId } from "../../utils/scrollHelpers";
import PrimaryButton from "../ui/PrimaryButton";
import { useTranslation } from 'react-i18next';

const Navbar = ({ activeId, theme, toggleTheme }) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'nl', label: 'Nederlands', short: 'NL' },
    { code: 'bg', label: 'Български', short: 'BG' }
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangMenuOpen(false);
  };

  const links = useMemo(
    () => [
      { label: t('nav.about'), id: "about" },
      { label: t('nav.skills'), id: "skills" },
      { label: t('nav.projects'), id: "projects" },
      { label: t('nav.certificates'), id: "certificates" },
      { label: t('nav.journey'), id: "journey" },
    ],
    [t]
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // While the mobile menu is open: lock scroll and let Escape close it. The
  // previous overflow is restored rather than forced to "unset".
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleNav = (id) => {
    setOpen(false);
    scrollToId(id);
  };

  const ThemeToggle = ({ className = "" }) => (
    <button
      onClick={(e) => toggleTheme(e)}
      className={`p-2 rounded-full transition-all duration-300 ${className}
        hover:bg-gray-100 text-gray-600
        dark:hover:bg-white/10 dark:text-slate-300
        active:scale-95 transform
      `}
    >
      <div className="transition-transform duration-500 rotate-0 dark:rotate-[360deg]">
        {theme === "dark" ? <Sun size={20} className="text-amber-300" /> : <Moon size={20} className="text-sky-400" />}
      </div>
    </button>
  );

  const LangSwitcher = ({ className = "" }) => (
    <div className={`relative ${className} z-50`}>
      <button
        onClick={() => setLangMenuOpen(!langMenuOpen)}
        className={`group relative flex items-center gap-2 p-1 pl-3 pr-1 rounded-full border transition-all duration-500
          ${langMenuOpen 
            ? "bg-sky-50 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.5)] dark:bg-[#0B1120] dark:border-sky-500 dark:shadow-[0_0_25px_rgba(14,165,233,0.6)]" 
            : "bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-white/5"
          }
        `}
      >
        <span className={`text-xs font-black tracking-widest transition-colors duration-300
          ${langMenuOpen ? "text-sky-600 dark:text-sky-400" : "text-gray-600 dark:text-slate-400"}
        `}>
          {currentLang.short}
        </span>
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-700 ease-in-out
            ${langMenuOpen 
              ? "border-sky-500 rotate-[180deg] scale-100 opacity-100" 
              : "border-gray-300 dark:border-slate-600 rotate-0 scale-75 opacity-50 group-hover:border-sky-400 group-hover:opacity-100"
            }
          `} />
          <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500
            ${langMenuOpen 
              ? "bg-sky-500 shadow-lg shadow-sky-500/50 scale-100" 
              : "bg-gray-200 dark:bg-slate-700 scale-90 group-hover:bg-sky-100 dark:group-hover:bg-sky-900"
            }
          `}>
             <Globe size={14} className={`transition-colors duration-300 ${langMenuOpen ? "text-white animate-spin-slow" : "text-gray-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-300"}`} />
          </div>
        </div>
      </button>

      {langMenuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setLangMenuOpen(false)} />
      )}

      <div 
        className={`absolute top-full right-0 mt-4 w-60 p-2 rounded-2xl z-20 border backdrop-blur-2xl origin-top-right overflow-hidden
          transition-all duration-500 cubic-bezier(0.2, 0.8, 0.2, 1)
          ${langMenuOpen 
            ? "opacity-100 scale-100 translate-y-0 rotate-0" 
            : "opacity-0 scale-90 -translate-y-8 rotate-3 pointer-events-none"
          }
          bg-white/80 border-white/60 shadow-2xl
          dark:bg-[#0B1120]/90 dark:border-sky-500/30 dark:shadow-[0_0_50px_-10px_rgba(14,165,233,0.25)]
        `}
      >
        {/* Sweeps only while the menu is actually open, so nothing animates
            behind an invisible panel. */}
        <div
          className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-50 pointer-events-none z-0 ${
            langMenuOpen ? "animate-scan" : ""
          }`}
        />
        <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.5),transparent)] dark:bg-grid-slate-700/30 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.2),transparent)] pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col gap-2 p-1">
          {languages.map((lang, idx) => {
            const isActive = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                style={{ transitionDelay: langMenuOpen ? `${idx * 75}ms` : '0ms' }}
                className={`group relative flex items-center justify-between w-full px-4 py-3 rounded-xl overflow-hidden transition-all duration-500
                  ${langMenuOpen ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"}
                  ${isActive 
                    ? "bg-sky-50/80 border border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/30" 
                    : "hover:bg-gray-50/80 border border-transparent dark:hover:bg-white/5"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] transition-all duration-300
                    ${isActive 
                      ? "bg-sky-500 scale-125 shadow-sky-500" 
                      : "bg-gray-300 dark:bg-slate-600 group-hover:bg-sky-400"
                    }
                  `} />
                  <span className={`text-sm font-bold tracking-wide transition-colors
                    ${isActive ? "text-sky-700 dark:text-sky-300" : "text-gray-600 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white"}
                  `}>
                    {lang.label}
                  </span>
                </div>
                <ChevronRight 
                  size={16} 
                  className={`transition-all duration-300 
                    ${isActive ? "text-sky-500 opacity-100 translate-x-0" : "text-gray-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}
                  `} 
                />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-sky-400/10 pointer-events-none" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <nav
        className={`fixed w-full z-50 top-0 left-0 transition-all duration-300 border-b
          ${scrolled 
            ? "bg-white/85 dark:bg-[#050505]/85 backdrop-blur-md border-gray-200/50 dark:border-slate-800/50 py-3 md:py-4" 
            : "bg-transparent border-transparent py-4 md:py-6"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <button
            onClick={() => scrollToId("home")}
            className="text-xl sm:text-2xl font-black tracking-tight theme-color-transition transition-colors
              text-gray-900 dark:text-slate-50 relative z-50"
          >
            Vladi Georgiev
          </button>

          {/* DESKTOP */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {links.map((l) => {
              const isActive = activeId === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => handleNav(l.id)}
                  // --- FIX APPLIED HERE ---
                  // 1. Used 'group' relative to the button
                  // 2. Applied hover effect to span instead of button to keep button stable
                  // 3. Added invisible padding to keep cursor active area large
                  className={`group relative text-xs lg:text-sm font-semibold tracking-widest uppercase theme-color-transition transition-colors duration-200
                    ${isActive
                      ? "text-sky-600 dark:text-sky-400"
                      : "text-gray-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400"
                    }
                  `}
                >
                  <span className="block transform transition-transform duration-200 group-hover:-translate-y-0.5">
                    {l.label}
                  </span>
                  {/* Invisible 'hitbox' to prevent cursor flickering */}
                  <span className="absolute inset-0 -bottom-2" />
                </button>
              );
            })}
            
            <div className="flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-slate-800">
               <ThemeToggle />
               <LangSwitcher />
            </div>

            <PrimaryButton onClick={() => handleNav("contact")} className="px-6 py-2 text-sm">
              {t('nav.contact')}
            </PrimaryButton>
          </div>

          {/* MOBILE TOGGLES */}
          <div className="flex items-center gap-3 md:hidden relative z-50">
            <LangSwitcher />
            <ThemeToggle />
            <button
              onClick={() => setOpen((s) => !s)}
              className="p-2 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {open ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div 
        className={`fixed inset-0 z-40 md:hidden bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl transition-all duration-300 ease-in-out
          ${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}
        `}
      >
        <div className="flex flex-col h-full justify-center items-center gap-8 p-6">
          {links.map((l, idx) => {
             const isActive = activeId === l.id;
             return (
              <button
                key={l.id}
                onClick={() => handleNav(l.id)}
                style={{ transitionDelay: `${idx * 50}ms` }}
                className={`text-3xl font-black tracking-tight uppercase transition-all duration-500 transform
                  ${open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
                  ${isActive ? "text-[#0EA5E9]" : "text-gray-900 dark:text-white"}
                `}
              >
                {l.label}
              </button>
            );
          })}
          
          <div className={`pt-8 transition-all duration-700 delay-300 transform ${open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
             <PrimaryButton onClick={() => handleNav("contact")} className="w-64 justify-center py-4 text-lg">
               {t('nav.contact')}
             </PrimaryButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;