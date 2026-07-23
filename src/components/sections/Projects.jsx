import React, { useState, useEffect, useRef } from "react";
import { Maximize2 } from "lucide-react";
import SectionTitle from "../ui/SectionTitle";
import ProjectExpand from "../ui/ProjectExpand";
import ProjectCardInner from "../ui/ProjectCardInner";
import { useTranslation } from 'react-i18next';

import ourGridImg     from "../../assets/OurGrid.png";
import fitFusionImg   from "../../assets/FirFusion.png";
import spaceInvasionImg from "../../assets/spaceinvasion.png";
import brewBuddyImg   from "../../assets/brewbuddy.png";
// Visiobal — replace these two placeholder files with your real images (keep the names)
import visiobalAppImg      from "../../assets/visiobal-app.png";
import visiobalHardwareImg from "../../assets/visiobal-hardware.jpg";
// DevMatch — real app screenshots.
import devMatchHome   from "../../assets/devmatch-home.jpg";
import devMatchJobs   from "../../assets/devmatch-jobs.jpg";
import devMatchApply  from "../../assets/devmatch-apply.jpg";
import devMatchResume from "../../assets/devmatch-resume.jpg";
import devMatchLogin  from "../../assets/devmatch-login.jpg";

const Projects = () => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Short viewports (landscape phones, tiny windows) also get the simple
    // stacked layout — sticky cards taller than the viewport pin with their
    // bottom half permanently cut off.
    const checkMobile = () =>
      setIsMobile(window.innerWidth < 768 || window.innerHeight < 520);
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

  // Equalise the sticky cards to the tallest one so the scroll-stack sits flush:
  // if a taller card is behind a shorter one, its bottom peeks out as a "gap".
  // A ResizeObserver keeps the measurement honest whenever card content changes
  // size — language switch, late-loading fonts, anything — not just on mount.
  const [cardMinH, setCardMinH] = useState(0);
  useEffect(() => {
    if (isMobile) return; // stack-equalising only applies to the desktop sticky layout
    let raf = 0;
    const measure = () => {
      let max = 0;
      cardRefs.current.forEach((el) => {
        if (!el) return;
        const prev = el.style.minHeight;
        el.style.minHeight = "0px"; // read each card's natural height
        if (el.offsetHeight > max) max = el.offsetHeight;
        el.style.minHeight = prev;
      });
      setCardMinH(max); // same value bails out — no loop with the observer
    };
    const schedule = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          measure();
        });
      }
    };
    const ro = new ResizeObserver(schedule);
    cardRefs.current.forEach((el) => el && ro.observe(el));
    schedule();
    window.addEventListener("resize", schedule);
    document.fonts?.ready?.then?.(schedule);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isMobile]);

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
      // DevMatch — a full-stack, AI-powered job assistant for developers.
      title: t('projects.devmatch.title'),
      role: t('projects.devmatch.role'),
      desc: t('projects.devmatch.desc'),
      img: devMatchHome,
      // Portrait phone shots — show the branded top of the dashboard on the cover.
      customImgClass: "object-top",
      gallery: [devMatchHome, devMatchJobs, devMatchApply, devMatchResume, devMatchLogin],
      galleryAspect: "1048 / 2046", // portrait phone screenshots
      galleryLayout: "fan", // spread the shots like a hand of cards
      // DevMatch brand palette — cyan "DEV" + pink "MATCH" on deep navy.
      theme: { accent: "#00D4FF", accent2: "#FF2D8A", deep: "#0D0F1E" },
      // Renders the breathing "match score" bars on the expanded detail view.
      motif: "match",
      story: [1, 2, 3, 4, 5].map((n) => ({
        kicker: t(`projects.devmatch.story${n}_kicker`),
        title: t(`projects.devmatch.story${n}_title`),
        body: t(`projects.devmatch.story${n}_body`),
      })),
      facts: [1, 2, 3, 4, 5].map((n) => t(`projects.devmatch.fact${n}`)),
      outcomes: [
        t('projects.devmatch.outcome1'),
        t('projects.devmatch.outcome2'),
        t('projects.devmatch.outcome3'),
      ],
      tags: ["React Native", "Expo", "Node.js", "PostgreSQL", "AI / ATS"],
      liveUrl: "#",
      repoUrl: "https://github.com/Vladi397/devmatch",
    },
    {
      title: t('projects.ourgrid.title'),
      desc: t('projects.ourgrid.desc'),
      role: t('projects.ourgrid.role'),
      img: ourGridImg,
      gallery: [ourGridImg], // TODO: add more OurGrid screenshots here
      galleryLayout: "lightning", // struck by lightning on scroll, then scorched (fits the grid theme)
      // OurGrid brand palette — used to theme the expanded detail view.
      // grid-green primary, reward-amber accent, deep plum ink.
      theme: { accent: "#01AC51", accent2: "#F4B14A", deep: "#4F2E39" },
      // Renders the flowing "electric current" side waves on this card only.
      motif: "grid",
      // A narrative walkthrough shown as a chapter timeline in the expanded view.
      story: [1, 2, 3, 4, 5].map((n) => ({
        kicker: t(`projects.ourgrid.story${n}_kicker`),
        title: t(`projects.ourgrid.story${n}_title`),
        body: t(`projects.ourgrid.story${n}_body`),
      })),
      facts: [1, 2, 3, 4].map((n) => t(`projects.ourgrid.fact${n}`)),
      outcomes: [t('projects.ourgrid.outcome1'), t('projects.ourgrid.outcome2'), t('projects.ourgrid.outcome3')],
      tags: ["React", "Tailwind", "User Testing", "Figma"],
      liveUrl: "https://ourgrid.vercel.app/",
      repoUrl: "https://github.com/Marto8090/OurGrid_Website",
    },
    {
      // Visiobal — an accessible audio ball for visually impaired people.
      title: t('projects.visiobal.title'),
      role: t('projects.visiobal.role'),
      desc: t('projects.visiobal.desc'),
      img: visiobalAppImg,
      customImgClass: "object-top",
      gallery: [visiobalAppImg, visiobalHardwareImg],
      galleryLayout: "model3d", // rotating 3D recreation of the printed ball (switch to "bounce" for the ball-drop animation)

      // Visiobal app palette — violet primary, pink accent, deep navy ink.
      theme: { accent: "#A855F7", accent2: "#F472B6", deep: "#080F1E" },
      // Renders the expanding "sonar" pulse rings (echoes the app's radar scan).
      motif: "sonar",
      story: [1, 2, 3, 4, 5].map((n) => ({
        kicker: t(`projects.visiobal.story${n}_kicker`),
        title: t(`projects.visiobal.story${n}_title`),
        body: t(`projects.visiobal.story${n}_body`),
      })),
      facts: [1, 2, 3, 4, 5].map((n) => t(`projects.visiobal.fact${n}`)),
      outcomes: [
        t('projects.visiobal.outcome1'),
        t('projects.visiobal.outcome2'),
        t('projects.visiobal.outcome3'),
      ],
      tags: ["ESP32", "C++", "Bluetooth LE", "Mozzi Audio", "Accessibility"],
      liveUrl: "#",
      repoUrl: "https://github.com/Marto8090/visiobal",
    },
    {
      hidden: true, // temporarily hidden — remove this line to show again
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
      hidden: true, // temporarily hidden — remove this line to show again
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
      hidden: true, // temporarily hidden — remove this line to show again
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
  ].filter((p) => !p.hidden);

  return (
    <section
      id="projects"
      className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto relative scroll-mt-24 md:scroll-mt-32"
      // Desktop only: pull the next section up into the last card's trailing
      // 40vh so the empty gap after the scroll-stack shrinks, without touching
      // the card margins (which the stack depends on). By the time the next
      // section rises into that region the last card has scrolled off the top.
      style={{ marginBottom: isMobile ? undefined : "-30vh" }}
    >
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
                // 40vh below each card is the scroll distance for the next card
                // to slide up and lock over it (the last card's tail is what
                // keeps the second-to-last pinned long enough to be covered, so
                // it must stay 40vh too — shrinking it breaks the stack). The
                // trailing gap before the next section is closed by pulling that
                // section up instead (negative margin on the section below).
                marginBottom: isMobile
                  ? (index < projects.length - 1 ? "4rem" : "2rem")
                  : "40vh",
              }}
            >
              <div
                className="relative group"
                // Hide the real card (glow included) for the whole time its
                // detail overlay is open/animating, so the flip looks like THIS
                // card lifting off — not a duplicate spawning on top of it.
                // visibility:hidden keeps the layout box, so ProjectExpand can
                // still measure it for the flip origin. Reappears in the same
                // commit the overlay unmounts (activeIndex → null), so the
                // hand-off is seamless.
                style={{ visibility: activeIndex === index ? "hidden" : undefined }}
              >
                {/* Outer glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-[40px] blur-xl opacity-20 dark:opacity-30 group-hover:opacity-50 dark:group-hover:opacity-60 transition-all duration-700 pointer-events-none" />

                <div
                  ref={(el) => (cardRefs.current[index] = el)}
                  onClick={() => openProject(index)}
                  onKeyDown={(e) => onCardKeyDown(e, index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${p.title} — ${t('projects.open_details', 'open details')}`}
                  style={{ minHeight: !isMobile && cardMinH ? `${cardMinH}px` : undefined }}
                  className="relative rounded-[32px] p-6 sm:p-8 md:p-10 overflow-hidden cursor-pointer transition-colors duration-300
                  md:flex md:flex-col md:justify-center
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
