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

  // Equalise the sticky cards to the tallest one so the scroll-stack sits flush:
  // if a taller card is behind a shorter one, its bottom peeks out as a "gap".
  const [cardMinH, setCardMinH] = useState(0);
  useEffect(() => {
    if (isMobile) return; // stack-equalising only applies to the desktop sticky layout
    const measure = () => {
      let max = 0;
      cardRefs.current.forEach((el) => {
        if (!el) return;
        const prev = el.style.minHeight;
        el.style.minHeight = "0px"; // read each card's natural height
        if (el.offsetHeight > max) max = el.offsetHeight;
        el.style.minHeight = prev;
      });
      setCardMinH(max);
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
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
      title: "DevMatch",
      role: "Full-Stack • Mobile • AI",
      desc:
        "A full-stack, AI-powered job assistant for developers. An Expo React Native app backed by a Node and Express API finds jobs, scores your resume against each listing with ATS analysis, and helps you apply with tailored cover letters.",
      img: devMatchHome,
      // Portrait phone shots — show the branded top of the dashboard on the cover.
      customImgClass: "object-top",
      gallery: [devMatchHome, devMatchJobs, devMatchApply, devMatchResume, devMatchLogin],
      galleryAspect: "1048 / 2046", // portrait phone screenshots
      // DevMatch brand palette — cyan "DEV" + pink "MATCH" on deep navy.
      theme: { accent: "#00D4FF", accent2: "#FF2D8A", deep: "#0D0F1E" },
      // Renders the breathing "match score" bars on the expanded detail view.
      motif: "match",
      story: [
        {
          kicker: "The idea",
          title: "One place to run the whole job hunt",
          body: "Job hunting as a developer is scattered across a dozen tabs: finding roles, tailoring a resume for each one, writing cover letters, then tracking who you applied to. DevMatch pulls all of that into a single app that actually understands your resume.",
        },
        {
          kicker: "The match",
          title: "Every job gets a match score",
          body: "Listings are ranked with a calculated match percentage based on how your skills and resume line up with each role, so you spend your time on the jobs you are actually a fit for instead of scrolling endlessly.",
        },
        {
          kicker: "The ATS boost",
          title: "Beat the resume robots",
          body: "Upload a PDF resume and the AI scores it against a specific job description the way an applicant tracking system would, then rewrites it to lift the match: a clear before and after jump, like 78 percent to 85 percent.",
        },
        {
          kicker: "The letters",
          title: "Cover letters in your voice",
          body: "For any role, DevMatch auto-generates a tailored motivation letter you can set to a tone that fits: casual, professional, confident or creative, so applying is one tap instead of a blank page.",
        },
        {
          kicker: "The build",
          title: "Full-stack, end to end",
          body: "I built both sides: an Expo React Native app for Android, iOS and web, and a Node and Express backend with Prisma and PostgreSQL, secured with JWT auth. A dashboard ties it together with a saved to applied to interview funnel and recent activity.",
        },
      ],
      facts: [
        "Full-stack and cross-platform: one Expo React Native codebase runs on Android, iOS and the web, talking to a Node and Express API with Prisma over PostgreSQL.",
        "Every listing shows a calculated match percentage, so the feed surfaces the roles that fit your resume first.",
        "The ATS boost scores your resume against a real job description and shows a measurable before and after lift, not just vague advice.",
        "Motivation letters are generated per job in four selectable tones (casual, professional, confident, creative).",
        "A saved, applied, interview and rejected funnel plus a recent-activity feed keep the whole application pipeline in one dashboard.",
      ],
      outcomes: [
        "Built a cross-platform Expo React Native app plus a typed Node, Express, Prisma and PostgreSQL backend",
        "Designed an AI ATS flow that scores and rewrites resumes against a job description",
        "Shipped JWT auth, job matching, resume upload and application tracking end to end",
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
      // OurGrid brand palette — used to theme the expanded detail view.
      // grid-green primary, reward-amber accent, deep plum ink.
      theme: { accent: "#01AC51", accent2: "#F4B14A", deep: "#4F2E39" },
      // Renders the flowing "electric current" side waves on this card only.
      motif: "grid",
      // A narrative walkthrough shown as a chapter timeline in the expanded view.
      story: [
        {
          kicker: "The problem",
          title: "Local grids are hitting their limit",
          body: "Heat pumps, EVs and solar panels are spreading far faster than the grid can be upgraded. When a whole neighbourhood draws power at the same peak hours, local transformers overload, raising the risk of outages, pushing up bills, and blocking new homes and EV chargers. Physically reinforcing the grid can take 3 to 5 years.",
        },
        {
          kicker: "The idea",
          title: "Keep the grid in balance, together",
          body: "Instead of waiting years for hardware, OurGrid eases the peaks through the community. If neighbours shift a little flexible energy use away from the busiest hours, the same transformers can carry far more, with no digging required.",
        },
        {
          kicker: "For residents",
          title: "Saving energy becomes a game",
          body: "The app links to your smart meter (P1 dongle), EV charger, battery and heat pump. It shows live power use and warns you when your area nears a peak. During a 'congestion challenge' it suggests simple actions, like delaying the EV charge or the laundry, and each one earns points and trophies for the energy you shift.",
        },
        {
          kicker: "For cities",
          title: "A privacy-safe view of the whole neighbourhood",
          body: "Officials and grid managers get an aggregated dashboard: congestion hotspots on a live map, neighbourhood load curves, participation rates and total energy shifted. Everything is measured at transformer level, so no single household is ever exposed, with exportable GDPR-compliant reports.",
        },
        {
          kicker: "My role",
          title: "Turning dense grid data into a calm interface",
          body: "Built with OpenRemote in the Netherlands, I designed the split-view UI for residents and municipalities, validated the UX with real users, and translated technical IoT and grid-congestion data into clean, accessible React components.",
        },
      ],
      facts: [
        "The whole product splits into two experiences from a single landing screen: a gamified resident app and a municipal dashboard, so each audience only sees what's relevant to them.",
        "'Congestion challenges' turn demand-response into a game: stay under a live target during peak hours and collect points and trophies for the energy you move off-peak.",
        "Every dashboard metric is aggregated at the transformer / neighbourhood level, so congestion maps and load curves reveal grid stress without ever exposing a single household (GDPR by design).",
        "It runs alongside existing grid infrastructure (residents just connect a P1 dongle, EV charger, battery or heat pump), and the app never controls devices automatically; it only guides.",
      ],
      outcomes: [t('projects.ourgrid.outcome1'), t('projects.ourgrid.outcome2'), t('projects.ourgrid.outcome3')],
      tags: ["React", "Tailwind", "User Testing", "Figma"],
      liveUrl: "https://ourgrid.vercel.app/",
      repoUrl: "https://github.com/Marto8090/OurGrid_Website",
    },
    {
      // Visiobal — an accessible audio ball for visually impaired people.
      title: "Visiobal",
      role: "Embedded + App",
      desc:
        "An interactive audio ball that lets visually impaired people find, connect to and play with it through sound. A 3D-printed sphere houses an ESP32 that synthesises music on-device and pairs with a companion app over Bluetooth LE: scan to connect, set the volume, and switch between tracks.",
      img: visiobalAppImg,
      customImgClass: "object-top",
      gallery: [visiobalAppImg, visiobalHardwareImg],
      // Visiobal app palette — violet primary, pink accent, deep navy ink.
      theme: { accent: "#A855F7", accent2: "#F472B6", deep: "#080F1E" },
      // Renders the expanding "sonar" pulse rings (echoes the app's radar scan).
      motif: "sonar",
      story: [
        {
          kicker: "The client",
          title: "Built for Visio",
          body: "Visio is an organisation that supports blind and visually impaired children. They wanted something these kids could simply play with, a toy that doesn't depend on sight. That brief became the VisioBall.",
        },
        {
          kicker: "The problem",
          title: "How do you play with a ball you can't see?",
          body: "A ball is no fun to a blind child if they can't tell where it is. The VisioBall answers back with sound and light, so it can be located, reached for and interacted with, turning a plain sphere into inclusive play.",
        },
        {
          kicker: "The ball",
          title: "A 3D-printed sphere with a brain",
          body: "Inside a custom 3D-printed shell sits an ESP32 that synthesises its music live on-device (Mozzi + I2S), driving a speaker, an LED behaviour and sleep/wake power handling, all run from an onboard battery, with a volume dial on the outside.",
        },
        {
          kicker: "The app",
          title: "Find it, connect, and play",
          body: "The companion app (Expo + React Native) scans over Bluetooth LE with an animated radar, connects to the ball, then hands over control: a 3D model you can spin, a music player with volume and frequency, and simple commands like on/off, blink rate and sleep/wake. It ships in five languages with light and dark themes.",
        },
        {
          kicker: "My role",
          title: "Making play accessible",
          body: "Across embedded and app: the ESP32 firmware that gives the ball its voice, and the React Native app that finds and controls it over Bluetooth. The whole point is inclusion, so a blind child can locate the ball by ear and just play.",
        },
      ],
      facts: [
        "Runs on an ESP32 (PlatformIO + Arduino) and synthesises its music live on-device with the Mozzi audio library: triangle and square oscillators, ADSR envelopes and smoothing, played out over I2S.",
        "Ships with several built-in tracks: a bright C-major tune, a funky E-minor groove (with a cheeky blue note) and a slow G-major-pentatonic 'Zen' arc, all switchable from the app.",
        "Pairs with the companion app over Bluetooth LE: 'Scan for Ball' to connect, a live volume slider and play / skip controls, with sleep-wake power handling on the ball itself.",
        "Built for inclusive play; the whole point is that visually impaired users can locate and interact with the ball by sound.",
        "Custom 3D-printed enclosure packs the speaker, battery pack and a volume potentiometer around the ESP32 board.",
      ],
      outcomes: [
        "Real-time on-device audio synthesis on an ESP32 (Mozzi + I2S)",
        "BLE companion app: scan-to-connect, volume and track controls",
        "Accessible-by-design play for visually impaired users",
      ],
      tags: ["ESP32", "C++", "Bluetooth LE", "Mozzi Audio", "Accessibility"],
      liveUrl: "#",
      repoUrl: "https://github.com/Marto8090/visiobal",
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
    <section id="projects" className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto relative scroll-mt-24 md:scroll-mt-32">
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
                  style={{ minHeight: !isMobile && cardMinH ? `${cardMinH}px` : undefined }}
                  className="relative rounded-[32px] p-7 sm:p-10 md:p-14 overflow-hidden cursor-pointer transition-colors duration-300
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
