import React, { useState, useEffect, useMemo } from "react";
import { Menu, X, Sun, Moon, Globe } from "lucide-react"; // Added Globe icon
import { scrollToId } from "../../utils/scrollHelpers";
import PrimaryButton from "../ui/PrimaryButton";
import { useTranslation } from 'react-i18next'; // <--- Import hook

const Navbar = ({ activeId, theme, toggleTheme }) => {
  const { t, i18n } = useTranslation(); // <--- Init hook
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Define languages
  const languages = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'nl', label: 'NL', name: 'Nederlands' },
    { code: 'bg', label: 'BG', name: 'Български' }
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangMenuOpen(false);
  };

  const links = useMemo(
    () => [
      { label: t('nav.about'), id: "about" }, // <--- USE t() HERE
      { label: t('nav.skills'), id: "skills" },
      { label: t('nav.projects'), id: "projects" },
      { label: t('nav.certificates'), id: "certificates" },
      { label: t('nav.journey'), id: "journey" },
    ],
    [t] // Depend on t so it updates when language changes
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ... (Keep your useEffect for overflow hidden)

  const handleNav = (id) => {
    setOpen(false);
    scrollToId(id);
  };

  const ThemeToggle = ({ className = "" }) => (
    <button
      onClick={(e) => toggleTheme(e)}
      className={`p-2 rounded-full transition-all duration-300 ${className}
        hover:bg-gray-100 text-gray-600
        dark:hover:bg-slate-800 dark:text-slate-300
        active:scale-95 transform
      `}
    >
      <div className="transition-transform duration-500 rotate-0 dark:rotate-[360deg]">
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </div>
    </button>
  );

  // New Language Switcher Component
  const LangSwitcher = ({ className = "" }) => (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setLangMenuOpen(!langMenuOpen)}
        className="flex items-center gap-1 p-2 rounded-full font-bold text-xs hover:bg-gray-100 text-gray-600 dark:hover:bg-slate-800 dark:text-slate-300 transition-all"
      >
        <Globe size={18} />
        <span>{currentLang.label}</span>
      </button>

      {langMenuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setLangMenuOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-32 py-2 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-slate-700 z-20 flex flex-col">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`px-4 py-2 text-left text-sm font-medium hover:bg-sky-50 dark:hover:bg-slate-700/50 transition-colors
                  ${i18n.language === lang.code ? 'text-sky-600 dark:text-sky-400' : 'text-gray-600 dark:text-slate-300'}
                `}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <nav
        className={`fixed w-full z-50 top-0 left-0 transition-all duration-300 border-b
          ${scrolled 
            ? "bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-gray-200/50 dark:border-slate-700/50 py-3 md:py-4" 
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
                  className={[
                    "text-xs lg:text-sm font-semibold tracking-widest uppercase theme-color-transition transition-colors hover:-translate-y-0.5 duration-200",
                    isActive
                      ? "text-sky-600 dark:text-sky-400"
                      : "text-gray-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400",
                  ].join(" ")}
                >
                  {l.label}
                </button>
              );
            })}
            
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-slate-700">
               <ThemeToggle />
               <LangSwitcher />
            </div>

            <PrimaryButton onClick={() => handleNav("contact")} className="px-6 py-2 text-sm">
              {t('nav.contact')}
            </PrimaryButton>
          </div>

          {/* MOBILE TOGGLES */}
          <div className="flex items-center gap-2 md:hidden relative z-50">
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