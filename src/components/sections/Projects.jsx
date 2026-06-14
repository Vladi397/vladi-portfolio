import React, { useState, useEffect, useRef } from "react";
import { Maximize2 } from "lucide-react";
import SectionTitle from "../ui/SectionTitle";
import ProjectExpand from "../ui/ProjectExpand";
import ProjectCardInner from "../ui/ProjectCardInner";
import { useTranslation } from 'react-i18next';

import ourGridImg     from "../../assets/OurGrid.png";
import marioPizzaImg  from "../../assets/MarioPizza.png";
import fitFusionImg   from "../../assets/FirFusion.png";
import spaceInvasionImg from "../../assets/spaceinvasion.png";
import brewBuddyImg   from "../../assets/brewbuddy.png";

const Projects = () => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLinkClick = (e, url) => {
    e.stopPropagation(); // don't let the link open the expanded card view
    if (url === "#" || !url) {
      e.preventDefault();
      alert(t('projects.link_unavailable') || "Sorry, this link is not working right now.");
    }
  };

  // ── Click-to-expand state ──
  const cardRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeCard, setActiveCard] = useState(null); // the live card DOM node

  const openProject = (index) => {
    const el = cardRefs.current[index];
    if (!el) return;
    setActiveCard(el); // ProjectExpand measures this node for the FLIP origin
    setActiveIndex(index);
  };

  const closeProject = () => {
    const idx = activeIndex;
    setActiveIndex(null);
    setActiveCard(null);
    requestAnimationFrame(() => cardRefs.current[idx]?.focus()); // restore focus
  };

  const onCardKeyDown = (e, index) => {
    // Only the card itself responds — ignore Enter/Space bubbling up from inner links.
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      openProject(index);
    }
  };

  /*
    Each project's expanded detail view reads two extra fields:
      • gallery — array of imported images shown in the detail photo gallery.
                  Import more screenshots at the top of this file and add them
                  here. Falls back to [img] when left as just the cover shot.
      • facts   — array of short "interesting fact" strings. Any string starting
                  with "TODO" renders as a dashed placeholder so it's obvious
                  what still needs real content. (Swap to t('...') keys later if
                  you want them translated like the rest of the copy.)
  */
  const projects = [
    {
      title: t('projects.ourgrid.title'),
      desc: t('projects.ourgrid.desc'),
      role: t('projects.ourgrid.role'),
      img: ourGridImg,
      gallery: [ourGridImg], // TODO: add more OurGrid screenshots here
      facts: [
        "TODO: add an interesting fact about OurGrid (e.g. a result from user testing)",
        "TODO: add a second fact (e.g. tech decision or accessibility win)",
        "TODO: add a third fact (e.g. something you'd do differently)",
      ],
      outcomes: [t('projects.ourgrid.outcome1'), t('projects.ourgrid.outcome2'), t('projects.ourgrid.outcome3')],
      tags: ["React", "Tailwind", "User Testing", "Figma"],
      liveUrl: "https://ourgrid.vercel.app/",
      repoUrl: "https://github.com/Marto8090/OurGrid_Website",
    },
    {
      title: t('projects.mario.title'),
      desc: t('projects.mario.desc'),
      role: t('projects.mario.role'),
      img: marioPizzaImg,
      customImgClass: "object-[center_35%] scale-110",
      gallery: [marioPizzaImg], // TODO: add more Mario Pizza screenshots here
      facts: [
        "TODO: add an interesting fact about Mario Pizza",
        "TODO: add a second interesting fact",
        "TODO: add a third interesting fact",
      ],
      outcomes: [t('projects.mario.outcome1'), t('projects.mario.outcome2'), t('projects.mario.outcome3')],
      tags: ["Figma", "Python Flask", "JavaScript", "HTML/CSS"],
      liveUrl: "#",
      repoUrl: "https://git.fhict.nl/I549833/fakeittillyoumakeit",
    },
    {
      title: t('projects.fitfusion.title'),
      desc: t('projects.fitfusion.desc'),
      role: t('projects.fitfusion.role'),
      img: fitFusionImg,
      gallery: [fitFusionImg], // TODO: add more FitFusion screenshots here
      facts: [
        "TODO: add an interesting fact about FitFusion",
        "TODO: add a second interesting fact (e.g. team-lead learning)",
        "TODO: add a third interesting fact",
      ],
      outcomes: [t('projects.fitfusion.outcome1'), t('projects.fitfusion.outcome2'), t('projects.fitfusion.outcome3')],
      tags: ["Team Lead", "C# Razor Pages", "Figma", "Unity"],
      liveUrl: "#",
      repoUrl: "https://git.fhict.nl/I546016/the-merge-conflicts",
    },
    {
      title: t('projects.brewbuddy.title'),
      desc: t('projects.brewbuddy.desc'),
      role: t('projects.brewbuddy.role'),
      img: brewBuddyImg,
      gallery: [brewBuddyImg], // TODO: add more BrewBuddy screenshots here
      facts: [
        "TODO: add an interesting fact about BrewBuddy",
        "TODO: add a second interesting fact (e.g. API/SQL detail)",
        "TODO: add a third interesting fact",
      ],
      outcomes: [t('projects.brewbuddy.outcome1'), t('projects.brewbuddy.outcome2'), t('projects.brewbuddy.outcome3')],
      tags: ["React", "C# .NET", "Swagger UI", "SQL"],
      liveUrl: "#",
      repoUrl: "https://git.fhict.nl/I547861/brewbuddy",
    },
    {
      title: t('projects.space.title'),
      desc: t('projects.space.desc'),
      role: t('projects.space.role'),
      img: spaceInvasionImg,
      gallery: [spaceInvasionImg], // TODO: add more Space Invasion screenshots here
      facts: [
        "TODO: add an interesting fact about Space Invasion",
        "TODO: add a second interesting fact (e.g. a Canvas/game-dev detail)",
        "TODO: add a third interesting fact",
      ],
      outcomes: [t('projects.space.outcome1'), t('projects.space.outcome2'), t('projects.space.outcome3')],
      tags: ["Game Dev", "JavaScript", "Canvas API", "HTML5"],
      liveUrl: "#",
      repoUrl: "#",
    },
  ];

  return (
    <section id="projects" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto relative scroll-mt-24 md:scroll-mt-32">
      <SectionTitle title={t('projects.title')} num="03" kicker={t('projects.kicker')} />

      <div className="flex flex-col">
        {projects.map((p, index) => {
          const isFlipped  = index % 2 === 1;
          const urlLabel   = p.liveUrl !== "#"
            ? p.liveUrl.replace("https://", "").replace(/\/$/, "")
            : "localhost:3000";

          return (
            <div
              key={index}
              className={isMobile ? "relative mb-12" : "sticky top-28 md:top-32"}
              style={{
                zIndex: (index + 1) * 10,
                marginBottom: isMobile
                  ? (index < projects.length - 1 ? "4rem" : "2rem")
                  : "40vh",
              }}
            >
              <div className="relative group">
                {/* Outer glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-[40px] blur-xl opacity-20 dark:opacity-30 group-hover:opacity-50 dark:group-hover:opacity-60 transition-all duration-700 pointer-events-none" />

                <div
                  ref={(el) => (cardRefs.current[index] = el)}
                  onClick={() => openProject(index)}
                  onKeyDown={(e) => onCardKeyDown(e, index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${p.title} — ${t('projects.open_details', 'open details')}`}
                  className="relative rounded-[32px] p-7 sm:p-10 md:p-14 overflow-hidden cursor-pointer transition-colors duration-300
                  bg-white shadow-xl border border-sky-100
                  dark:bg-[#0B1120] dark:shadow-none dark:border-sky-900/40
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0B1120]"
                >
                  {/* Expand affordance (always visible on touch, on hover for pointer) */}
                  <span className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold pointer-events-none transition-opacity duration-300
                    bg-white/80 text-gray-600 border border-gray-200 backdrop-blur-sm
                    dark:bg-white/5 dark:text-slate-300 dark:border-white/10
                    opacity-100 md:opacity-0 md:group-hover:opacity-100">
                    <Maximize2 size={14} className="text-[#0EA5E9]" />
                    {t('projects.expand_hint', 'Click to expand')}
                  </span>

                  <ProjectCardInner
                    project={p}
                    isFlipped={isFlipped}
                    urlLabel={urlLabel}
                    t={t}
                    interactive
                    onLinkClick={handleLinkClick}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeIndex !== null && (
        <ProjectExpand
          project={projects[activeIndex]}
          cardEl={activeCard}
          isFlipped={activeIndex % 2 === 1}
          onClose={closeProject}
        />
      )}
    </section>
  );
};

export default Projects;
