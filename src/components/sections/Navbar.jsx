import React, { useState, useEffect, useMemo } from "react";
import { Menu, X } from "lucide-react";
import { scrollToId } from "../../utils/scrollHelpers";
import PrimaryButton from "../ui/PrimaryButton";

const Navbar = ({ activeId }) => {
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

  return (
    <nav className="fixed w-full z-50 top-0 left-0 bg-white/70 backdrop-blur-md border-b border-gray-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-5 flex justify-between items-center">
        <button
          onClick={() => scrollToId("home")}
          className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight"
        >
          Vladi Georgiev
        </button>

        <div className="hidden md:flex items-center gap-6 lg:gap-10">
          {links.map((l) => {
            const isActive = activeId === l.id;
            return (
              <button
                key={l.id}
                onClick={() => handleNav(l.id)}
                className={[
                  "text-xs lg:text-sm font-semibold tracking-widest uppercase transition-colors",
                  isActive ? "text-sky-600" : "text-gray-600 hover:text-sky-600",
                ].join(" ")}
              >
                {l.label}
              </button>
            );
          })}

          <PrimaryButton onClick={() => handleNav("contact")} className="px-6 py-2 text-sm">
            Let’s talk
          </PrimaryButton>
        </div>

        <button className="md:hidden" onClick={() => setOpen((s) => !s)} aria-label="Open menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 bg-white/95 backdrop-blur-xl z-50 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-10">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-gray-900">Menu</div>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
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
                      "text-2xl font-black tracking-tight text-left",
                      isActive ? "text-sky-600" : "text-gray-900",
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