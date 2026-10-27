import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Maximize2 } from "lucide-react";
import SectionTitle from "../ui/SectionTitle";
import ProjectCardInner from "../ui/ProjectCardInner";
import useScrollSpotlight from "../../hooks/useScrollSpotlight";
import { useTranslation } from 'react-i18next';

import ourGridImg     from "../../assets/OurGrid.webp";
// OurGrid case-study shots. Fourteen frames in two sizes is twenty-eight
// imports to keep in step by hand, so they are resolved by filename instead:
// adding a frame means dropping in the pair and naming it in OURGRID_SHOTS.
const OG_FILES = import.meta.glob("../../assets/ourgrid-*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});
const ogAsset = (name, small) => OG_FILES[`../../assets/ourgrid-${name}${small ? "-sm" : ""}.webp`];
import fitFusionImg   from "../../assets/FirFusion.webp";
import spaceInvasionImg from "../../assets/spaceinvasion.webp";
import brewBuddyImg   from "../../assets/brewbuddy.webp";
// Visiobal — replace these two placeholder files with your real images (keep the names)
import visiobalAppImg      from "../../assets/visiobal-app.webp";
import visiobalHardwareImg from "../../assets/visiobal-hardware.webp";
// DevMatch — real app screenshots.
import devMatchHome   from "../../assets/devmatch-home.webp";
import devMatchJobs   from "../../assets/devmatch-jobs.webp";
import devMatchApply  from "../../assets/devmatch-apply.webp";
import devMatchResume from "../../assets/devmatch-resume.webp";
import devMatchLogin  from "../../assets/devmatch-login.webp";

/*
  The expanded detail view pulls in three.js (the Visiobal 3D ball) and every
  gallery and motif, so it is code-split out of the initial bundle. It is
  fetched as soon as the browser is idle and again on hover/focus of a card, so
  by the time anyone clicks, the chunk is there and the flip starts instantly.
*/
/*
  OurGrid case-study shots, in the order the argument is made. The captions
  live in i18n (projects.ourgrid.shots) and are zipped onto these at render.

  The resident and municipality landing pages used to be two separate frames.
  They are the same photograph and the same layout with one line of copy
  changed — which is exactly the point being made, and exactly why they read
  as the same picture twice in a carousel. They are now one labelled frame
  (ourgrid-split) where the two headlines sit above each other and the
  difference is the only thing left to look at.

  The home page is in here twice on purpose. The first pass only ever took its
  hero, which left out the two blocks that do the actual persuading: the ask
  itself, next to the phone it happens on, and the download block that closes
  it. A landing page represented only by its headline is not a landing page.

  Each name resolves to a 1400px frame and a 700px one. A phone draws these at
  193px: at full size the fourteen of them decode to 65MB of bitmap for 3MB of
  visible pixels, which is memory a weak phone has no business spending on
  decoration. The small set costs 16MB instead, and the desktop set stays as
  it was, where the centre frame really is 640 CSS px on a 2x screen.
*/
const OURGRID_SHOTS = [
  "front-door", "split", "home-shift", "home-download", "loadcurve",
  "peakhours", "before-after", "energy", "hotspots", "explainer",
  "problem", "solution", "howitworks", "app-screens",
];

const loadProjectExpand = () => import("../ui/ProjectExpand");
const ProjectExpand = lazy(loadProjectExpand);

/*
  ProjectCard
  -----------
  One card in the list. It is its own component so each card can own a
  scroll-spotlight observer — on a phone nothing hovers, so the glow, the cover
  drift and the tap pill all come on while the card sits in the middle of the
  screen, and fade as it scrolls away. On a mouse this is inert and the hover
  styles do their usual job.
*/
function ProjectCard({
  project,
  isFlipped,
  urlLabel,
  t,
  canHover,
  cardRef,
  minHeight,
  hidden,
  onOpen,
  onKeyDown,
  onLinkClick,
}) {
  const { ref: spotRef, active, touch } = useScrollSpotlight({ band: 0.3 });

  return (
    <div
      ref={spotRef}
      className="relative group"
      // Hide the real card (glow included) for the whole time its
      // detail overlay is open/animating, so the flip looks like THIS
      // card lifting off — not a duplicate spawning on top of it.
      // visibility:hidden keeps the layout box, so ProjectExpand can
      // still measure it for the flip origin. Reappears in the same
      // commit the overlay unmounts (activeIndex → null), so the
      // hand-off is seamless.
      style={{ visibility: hidden ? "hidden" : undefined }}
    >
      {/* Outer glow */}
      <div
        className={`absolute -inset-1 bg-gradient-to-r from-brand-500 to-brand2-600 rounded-[40px] blur-xl transition-all duration-700 pointer-events-none ${
          active
            ? "opacity-50 dark:opacity-60"
            : "opacity-20 dark:opacity-30 group-hover:opacity-50 dark:group-hover:opacity-60"
        }`}
      />

      <div
        ref={cardRef}
        onClick={onOpen}
        onKeyDown={onKeyDown}
        onPointerEnter={loadProjectExpand}
        onFocus={loadProjectExpand}
        role="button"
        tabIndex={0}
        aria-label={`${project.title} — ${t('projects.open_details', 'open details')}`}
        style={{ minHeight: minHeight || undefined }}
        className="relative rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 md:p-10 overflow-hidden cursor-pointer transition-colors duration-300
        md:flex md:flex-col md:justify-center
        bg-white shadow-xl border border-lagoon-100
        dark:bg-[#0B1120] dark:shadow-none dark:border-sky-900/40
        focus:outline-none focus-visible:ring-2 focus-visible:ring-lagoon-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0B1120]"
      >
        {/* Expand affordance. On a mouse it is a quiet hint that fades in on
            hover. On touch it is the only cue there is anything behind the
            card, so it is a filled accent pill that reads as a button. */}
        <span
          className={`absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-20 inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold pointer-events-none transition-all duration-300 ${
            canHover
              ? "bg-white/80 text-stone-600 border border-stone-200 backdrop-blur-sm dark:bg-white/5 dark:text-slate-300 dark:border-white/10 opacity-100 md:opacity-0 md:group-hover:opacity-100"
              : `bg-accent text-white border border-transparent shadow-lg shadow-accent/30 ${active ? "opacity-100 scale-105" : "opacity-90"}`
          }`}
        >
          <Maximize2 size={12} className={canHover ? "text-accent sm:hidden" : "sm:hidden"} />
          <Maximize2 size={14} className={canHover ? "text-accent hidden sm:block" : "hidden sm:block"} />
          {canHover
            ? t("projects.expand_hint", "Click to expand")
            : t("projects.expand_hint_touch", "Tap to explore")}
        </span>

        <ProjectCardInner
          project={project}
          isFlipped={isFlipped}
          urlLabel={urlLabel}
          t={t}
          interactive
          onLinkClick={onLinkClick}
          drift={touch}
          live={active}
        />
      </div>
    </div>
  );
}

const Projects = () => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  // Touch screens cannot hover, so the card hint names the tap instead.
  const [canHover] = useState(
    () => typeof window === "undefined" || !window.matchMedia || window.matchMedia("(any-hover: hover)").matches
  );

  useEffect(() => {
    const idle = window.requestIdleCallback || ((fn) => window.setTimeout(fn, 1200));
    const cancel = window.cancelIdleCallback || window.clearTimeout;
    const handle = idle(() => loadProjectExpand());
    return () => cancel(handle);
  }, []);

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
      // Engineer's-notebook content (log, figure, snags, build sheet) from i18n.
      notes: t("projects.devmatch.notes", { returnObjects: true }),
      figure: "jobtrace",
      outcomes: [
        t('projects.devmatch.outcome1'),
        t('projects.devmatch.outcome2'),
        t('projects.devmatch.outcome3'),
      ],
      tags: ["Expo 54", "Express 5", "Prisma + PostgreSQL", "Gemini 2.5 Flash-Lite", "Adzuna + Remotive"],
      liveUrl: "#",
      repoUrl: "https://github.com/Vladi397/devmatch",
    },
    {
      title: t('projects.ourgrid.title'),
      desc: t('projects.ourgrid.desc'),
      role: t('projects.ourgrid.role'),
      img: ourGridImg,
      // The client is part of the credential on commissioned work, so the
      // detail view links out to them.
      clientName: "OpenRemote",
      clientUrl: "https://openremote.io/",
      galleryLayout: "rail", // captioned sideways gallery — see CaseGallery
      gallery: [ourGridImg], // cover fallback if the rail is ever switched off
      /*
        The walk-through. Each shot is one step of the argument, so the order
        matters: the split, then each side of it, then the resident's evidence,
        then the municipality's, then the explainer the whole thing rests on.
        Captions live in i18n so they translate with the rest of the site.
      */
      // Translations load over HTTP, so t() can hand back the raw key before
      // they arrive or if a locale is missing this block. Zip defensively:
      // the pictures still tell the story with the captions a beat behind.
      shots: (() => {
        const captions = t("projects.ourgrid.shots", { returnObjects: true });
        return OURGRID_SHOTS.map((name, i) => ({
          src: ogAsset(name),
          srcSmall: ogAsset(name, true),
          caption: Array.isArray(captions) && captions[i] ? captions[i].caption : "",
        }));
      })(),
      caseStudy: t("projects.ourgrid.case", { returnObjects: true }),
      // OurGrid brand palette — used to theme the expanded detail view.
      // grid-green primary, reward-amber accent, deep plum ink.
      theme: { accent: "#01AC51", accent2: "#F4B14A", deep: "#4F2E39" },
      // Renders the flowing "electric current" side waves on this card only.
      motif: "grid",
      notes: t("projects.ourgrid.notes", { returnObjects: true }),
      figure: "peakshift",
      outcomes: [t('projects.ourgrid.outcome1'), t('projects.ourgrid.outcome2'), t('projects.ourgrid.outcome3')],
      tags: ["React + Vite", "Leaflet", "Recharts", "Figma", "User testing"],
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
      notes: t("projects.visiobal.notes", { returnObjects: true }),
      figure: "signalchain",
      outcomes: [
        t('projects.visiobal.outcome1'),
        t('projects.visiobal.outcome2'),
        t('projects.visiobal.outcome3'),
      ],
      tags: ["Expo + BLE", "three.js", "ESP32", "Mozzi synth", "FreeRTOS"],
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
              <ProjectCard
                project={p}
                isFlipped={isFlipped}
                urlLabel={urlLabel}
                t={t}
                canHover={canHover}
                cardRef={(el) => (cardRefs.current[index] = el)}
                minHeight={!isMobile && cardMinH ? `${cardMinH}px` : undefined}
                hidden={activeIndex === index}
                onOpen={() => openProject(index)}
                onKeyDown={(e) => onCardKeyDown(e, index)}
                onLinkClick={handleLinkClick}
              />
            </div>
          );
        })}
      </div>

      {activeIndex !== null && (
        <Suspense fallback={null}>
          <ProjectExpand
            project={projects[activeIndex]}
            cardEl={activeCard}
            isFlipped={activeIndex % 2 === 1}
            onClose={closeProject}
          />
        </Suspense>
      )}
    </section>
  );
};

export default Projects;
