import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  X,
  Copy,
  Check,
  Rocket,
  ExternalLink,
  Github,
  MapPin,
  CheckCircle,
  Layout,
  Database,
  Code2,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";

// --- IMAGES ---
// Ensure these paths match your actual folder structure
import Vladi1 from "./assets/Vladi1.png";
import Vladi2 from "./assets/Vladi2.jpg";
import MetaLogo from "./assets/meta.png";

// ---------- Helpers ----------

const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
};

// --- COMPONENT 1: TILTED CARD (For Skills) ---
// Based on React Bits "Tilted Card" logic but adapted for your content
const TiltedCard = ({ children, className = "" }) => {
  const ref = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate rotation based on cursor position relative to center
    // Divisor controls sensitivity (higher = less sensitive)
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setScale(1.05);
  };

  const handleMouseLeave = () => {
    setScale(1);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-200 ease-out preserve-3d group ${className}`}
      style={{
        perspective: "1000px",
      }}
    >
      <div
        className="w-full h-full bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm transition-all duration-200 ease-out group-hover:shadow-2xl group-hover:shadow-sky-200/50"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(${scale})`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Inner Content with depth */}
        <div style={{ transform: "translateZ(30px)" }}>{children}</div>
      </div>
    </div>
  );
};

// --- COMPONENT 2: GLARE HOVER (React Bits style) ---
// Crisp glare, no blur, driven by CSS variables (no React re-render spam)
const GlareHover = ({
  children,
  className = "",
  background = "#fff",
  borderRadius = "22px",
  borderColor = "rgba(226,232,240,1)", // slate-200
  glareOpacity = 0.35,
  glareAngle = -45,
  glareSize = 240, // px
}) => {
  const ref = useRef(null);
  const raf = useRef(null);
  const isFinePointer = useRef(true);

  useEffect(() => {
    const mq = window.matchMedia?.("(pointer: fine)");
    const update = () => (isFinePointer.current = !!mq?.matches);
    update();
    mq?.addEventListener?.("change", update);
    return () => mq?.removeEventListener?.("change", update);
  }, []);

  const setVars = (xPct, yPct, hovering) => {
    const el = ref.current;
    if (!el) return;

    el.style.setProperty("--gh-x", `${xPct}%`);
    el.style.setProperty("--gh-y", `${yPct}%`);
    el.style.setProperty("--gh-o", hovering ? String(glareOpacity) : "0");
    el.style.setProperty("--gh-angle", `${glareAngle}deg`);
    el.style.setProperty("--gh-size", `${glareSize}px`);
  };

  const onMove = (e) => {
    if (!isFinePointer.current) return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => setVars(x, y, true));
  };

  const onEnter = (e) => {
    if (!isFinePointer.current) return;
    onMove(e);
  };

  const onLeave = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--gh-o", "0");
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={[
        "relative overflow-hidden border shadow-sm transition-shadow duration-300",
        "hover:shadow-lg",
        className,
      ].join(" ")}
      style={{
        background,
        borderRadius,
        borderColor,
        borderStyle: "solid",
        borderWidth: 1,

        // defaults
        ["--gh-x"]: "50%",
        ["--gh-y"]: "50%",
        ["--gh-o"]: "0",
        ["--gh-angle"]: `${glareAngle}deg`,
        ["--gh-size"]: `${glareSize}px`,
      }}
    >
      {/* Glare layer: NO blur, NO glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: "var(--gh-o)",
          transition: "opacity 220ms ease",
          mixBlendMode: "soft-light",
          backgroundImage: `
            radial-gradient(
              circle at var(--gh-x) var(--gh-y),
              rgba(255,255,255,0.55),
              rgba(255,255,255,0) var(--gh-size)
            ),
            linear-gradient(
              var(--gh-angle),
              rgba(255,255,255,0) 0%,
              rgba(255,255,255,0.55) 45%,
              rgba(255,255,255,0) 100%
            )
          `,
          backgroundSize: "100% 100%, 200% 200%",
          backgroundPosition: "0 0, var(--gh-x) var(--gh-y)",
        }}
      />

      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

// 2) Reveal-on-scroll
const Reveal = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setShow(true);
        });
      },
      { threshold: 0.15 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={[
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
};

// 3) Section Title
const SectionTitle = ({ title, num, kicker }) => (
  <div className="flex items-baseline gap-4 mb-10 md:mb-16">
    <div className="flex-1">
      {kicker && (
        <p className="text-xs tracking-[0.25em] uppercase font-bold text-sky-600 mb-3">
          {kicker}
        </p>
      )}
      <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 uppercase tracking-tight">
        {title}
      </h2>
    </div>
    <span className="text-lg sm:text-xl md:text-2xl text-gray-500 font-medium">
      ({num})
    </span>
  </div>
);

// 4) Buttons
const PrimaryButton = ({ children, onClick, className = "", type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    className={[
      "bg-[#0EA5E9] text-white px-7 sm:px-8 py-3 rounded-full font-bold text-base md:text-lg",
      "shadow-lg hover:bg-sky-500 hover:-translate-y-1 active:translate-y-0",
      "transition-all duration-300 motion-reduce:transition-none",
      "focus:outline-none focus:ring-2 focus:ring-sky-300",
      className,
    ].join(" ")}
  >
    {children}
  </button>
);

const SecondaryButton = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={[
      "px-7 sm:px-8 py-3 rounded-full font-bold text-base md:text-lg",
      "border border-gray-200 bg-white/70 backdrop-blur",
      "text-gray-800 hover:bg-white hover:-translate-y-1 active:translate-y-0",
      "transition-all duration-300 motion-reduce:transition-none",
      "focus:outline-none focus:ring-2 focus:ring-sky-200",
      className,
    ].join(" ")}
  >
    {children}
  </button>
);

// Scrollspy
const useActiveSection = (sectionIds) => {
  const [active, setActive] = useState(sectionIds[0] ?? "home");

  useEffect(() => {
    const els = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));

        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { threshold: [0.2, 0.35, 0.5, 0.65] }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sectionIds]);

  return active;
};

// ---------- Sections ----------

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

const Hero = () => (
  <section
    id="home"
    className={[
      "pt-28 sm:pt-32 md:pt-40 pb-14 sm:pb-16 md:pb-24",
      "px-4 sm:px-6 max-w-7xl mx-auto",
      "min-h-[92svh] flex flex-col md:flex-row items-center gap-10 md:gap-12",
    ].join(" ")}
  >
    <div className="flex-1 z-10 text-center md:text-left">
      <Reveal>
        <h3 className="text-[#0EA5E9] font-bold tracking-[0.25em] text-[11px] sm:text-xs uppercase mb-4">
          Front-End Developer • UI/UX
        </h3>
      </Reveal>

      <Reveal delay={80}>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.08]">
          Building Digital{" "}
          <span className="relative inline-block">
            Experiences
            <span className="absolute bottom-1.5 md:bottom-2 left-0 w-full h-2.5 md:h-3 bg-sky-200/60 -z-10 rounded-full"></span>
          </span>
          .
        </h1>
      </Reveal>

      <Reveal delay={140}>
        <p className="text-gray-500 text-base sm:text-lg max-w-xl leading-relaxed pt-5 mx-auto md:mx-0">
          I build clean, responsive React interfaces with strong UX and a performance-first mindset.
        </p>
      </Reveal>

      <Reveal delay={200}>
        <div className="pt-7 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
          <PrimaryButton onClick={() => scrollToId("projects")}>
            See My Work <ArrowUpRight className="inline-block ml-2" size={18} />
          </PrimaryButton>
          <SecondaryButton onClick={() => scrollToId("contact")}>Get in touch</SecondaryButton>
        </div>
      </Reveal>

      <Reveal delay={260}>
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm justify-center md:justify-start">
          <span className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-white/80 border border-gray-100 shadow-sm">
            <CheckCircle className="text-sky-600" size={16} />
            7 Meta Certificates
          </span>
          <span className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-white/80 border border-gray-100 shadow-sm">
            <MapPin className="text-sky-600" size={16} />
            Eindhoven
          </span>
          <span className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-white/80 border border-gray-100 shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse motion-reduce:animate-none"></span>
            Available
          </span>
        </div>
      </Reveal>

      <Reveal delay={320}>
        <div className="mt-8 sm:mt-10 border-l-4 border-[#0EA5E9] pl-4 sm:pl-5 py-2 text-left max-w-xl mx-auto md:mx-0">
          <p className="text-sm sm:text-base md:text-lg text-gray-800 font-semibold leading-relaxed">
            “Modern solutions built with technical precision and clean design.”
          </p>
        </div>
      </Reveal>
    </div>

    <div className="flex-1 relative flex justify-center w-full">
      <Reveal delay={120} className="w-full max-w-sm sm:max-w-md">
        <div className="relative">
          <div
            className="relative z-10"
            style={{
              maskImage: "linear-gradient(to bottom, black 72%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 72%, transparent 100%)",
            }}
          >
            <img src={Vladi1} alt="Vladi Georgiev" className="w-full h-auto object-cover select-none" />
          </div>

          <div className="absolute top-16 left-10 w-[78%] h-[78%] bg-sky-200 rounded-full blur-[70px] -z-10 opacity-55"></div>
          <div className="absolute -top-6 -right-4 w-24 h-24 bg-sky-100 rounded-full blur-2xl -z-10"></div>
        </div>
      </Reveal>
    </div>
  </section>
);

const About = () => (
  <section id="about" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-24 md:scroll-mt-32">
    <SectionTitle title="About Me" num="01" kicker="Who I am" />

    <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">
      <div className="flex-1 space-y-6 text-gray-600 text-base sm:text-lg leading-relaxed">
        <Reveal>
          <p>
            I’m Vladi Georgiev from Bulgaria. After studying electronic trades in high school, I earned seven
            professional certificates in front-end development from Meta.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <p>
            I build websites with HTML, CSS, JavaScript, React, and UI/UX design. I’ve also worked on C# projects
            using Razor and Blazor.
          </p>
        </Reveal>

        <Reveal delay={140}>
          <div className="pt-3 flex flex-wrap gap-2 sm:gap-3">
            <span className="px-4 py-2 rounded-full bg-sky-50 text-sky-700 border border-sky-100 font-semibold text-sm">
              React + Tailwind
            </span>
            <span className="px-4 py-2 rounded-full bg-sky-50 text-sky-700 border border-sky-100 font-semibold text-sm">
              UI/UX in Figma
            </span>
            <span className="px-4 py-2 rounded-full bg-sky-50 text-sky-700 border border-sky-100 font-semibold text-sm">
              C# Basics
            </span>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <SecondaryButton
            onClick={() => alert("Hook this to your resume PDF link.")}
            className="mt-4 inline-flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
          >
            Download Full Resume <ArrowUpRight size={18} />
          </SecondaryButton>
        </Reveal>
      </div>

      <div className="flex-1 relative w-full">
        <Reveal className="w-full max-w-sm sm:max-w-md md:max-w-sm ml-auto relative">
          <img
            src={Vladi2}
            alt="About Vladi"
            className="rounded-[28px] sm:rounded-[32px] shadow-2xl w-full object-cover bg-gray-100 select-none"
          />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-sky-100 rounded-full blur-2xl -z-10"></div>
        </Reveal>
      </div>
    </div>
  </section>
);

const Skills = () => {
  const skillCategories = [
    {
      title: "Frontend",
      icon: <Layout className="w-7 h-7 text-[#0EA5E9]" />,
      skills: ["React", "JavaScript (ES6+)", "Tailwind CSS", "HTML5 & CSS3", "Bootstrap", "Blazor"],
    },
    {
      title: "Backend & Logic",
      icon: <Database className="w-7 h-7 text-[#0EA5E9]" />,
      skills: ["C#", "Razor Pages", "Python", "REST APIs", "SQL Basics"],
    },
    {
      title: "Tools & Design",
      icon: <Code2 className="w-7 h-7 text-[#0EA5E9]" />,
      skills: ["Git & GitHub", "Figma (UI/UX)", "VS Code", "Responsive Design", "Agile"],
    },
  ];

  return (
    <section id="skills" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-24 md:scroll-mt-32">
      <SectionTitle title="Skills" num="02" kicker="What I use" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {skillCategories.map((cat, idx) => (
          <Reveal key={idx} delay={idx * 80}>
            <TiltedCard className="h-full">
              <div className="bg-sky-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                {cat.icon}
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-6">{cat.title}</h3>
              <ul className="space-y-3">
                {cat.skills.map((skill) => (
                  <li key={skill} className="flex items-center gap-3 text-gray-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#0EA5E9]"></span>
                    {skill}
                  </li>
                ))}
              </ul>
            </TiltedCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

const Projects = () => {
  const projects = [
    {
      title: "OurGrid (OpenRemote)",
      desc: "A platform demystifying 'grid congestion' for OpenRemote. I designed the UI and validated the UX with real users (students & coaches) to translate complex data into a clean React interface.",
      role: "Frontend Lead • UI/UX Designer • Research",
      outcomes: [
        "Validated UX via testing with real users",
        "Architected a split-view UI for Residents vs. Municipalities",
        "Translated technical IoT data into accessible web components",
      ],
      tags: ["React", "Tailwind", "User Testing", "Figma"],
      liveUrl: "#",
      repoUrl: "#",
    },
    {
      title: "Mario & Luigi's Pizza",
      desc: "A full-stack Italian restaurant app with auth and a shopping cart. I designed the authentic visual identity in Figma and built the responsive frontend connected to a Python Flask backend.",
      role: "UI Designer & Frontend Lead",
      outcomes: [
        "Designed the UI/UX & assets in Figma",
        "Developed the product card grid & cart logic",
        "Integrated Python Flask for routing & auth",
      ],
      tags: ["Figma", "Python Flask", "JavaScript", "HTML/CSS"],
      liveUrl: "#",
      repoUrl: "#",
    },
    {
      title: "Fit Fusion",
      desc: "A gamified health ecosystem where physical steps nurture a virtual pet. I led a 6-person agile team and handled the technical integration between the Unity game and the Web platform.",
      role: "Team Lead • Full Stack Web",
      outcomes: [
        "Led the agile team & coordinated integration",
        "Developed the Web Frontend & C# Razor Pages",
        "Designed game characters (Tamagotchis) & UI",
      ],
      tags: ["Team Lead", "C# Razor Pages", "Figma", "Unity"],
      liveUrl: "#",
      repoUrl: "#",
    },
  ];

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto relative scroll-mt-24 md:scroll-mt-32">
      <SectionTitle title="Projects" num="03" kicker="Selected work" />

      <div className="flex flex-col gap-10 pb-10 md:pb-20">
        {projects.map((p, index) => (
          <div key={p.title} className="md:sticky md:top-28">
            <Reveal delay={index * 90}>
              <div className="bg-white/85 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 sm:p-7 md:p-10 flex flex-col md:flex-row gap-8 md:gap-10 transition-transform duration-500 md:hover:scale-[1.01] motion-reduce:transition-none">
                {/* Image Section */}
                <div className="w-full md:w-1/2">
                  <div className="rounded-2xl overflow-hidden shadow-inner aspect-[4/3] bg-gradient-to-br from-sky-50 to-white border border-gray-100 flex items-center justify-center relative">
                    <span className="text-gray-400 font-bold text-center px-4">[ {p.title} Screenshot ]</span>
                    <div
                      className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl opacity-70 ${
                        index === 0 ? "bg-indigo-100" : "bg-sky-100"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Text Section */}
                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4">
                  <div className="flex flex-col items-start">
                    <span className="text-[#0EA5E9] font-black tracking-widest uppercase text-sm mb-2">
                      {p.role}
                    </span>
                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">{p.title}</h3>
                  </div>

                  <p className="text-gray-600 leading-relaxed text-base sm:text-lg min-h-[5rem]">{p.desc}</p>

                  <ul className="space-y-2 text-gray-700 mt-2">
                    {p.outcomes.map((o) => (
                      <li key={o} className="flex gap-3 items-start">
                        <span className="mt-2 w-2 h-2 rounded-full bg-[#0EA5E9] flex-shrink-0"></span>
                        <span className="font-medium text-sm sm:text-base">{o}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2 pt-4">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="px-4 py-1.5 bg-sky-50 text-[#0EA5E9] rounded-full text-sm font-bold border border-sky-100"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row flex-wrap gap-3">
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#0EA5E9] text-white font-bold shadow-lg hover:bg-sky-50 transition-all w-full sm:w-auto"
                    >
                      Live <ExternalLink size={18} />
                    </a>
                    <a
                      href={p.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white border border-gray-200 text-gray-800 font-bold hover:bg-gray-50 transition-all w-full sm:w-auto"
                    >
                      Code <Github size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="hidden md:block" style={{ height: `${(projects.length - index) * 22}px` }} />
          </div>
        ))}
      </div>
    </section>
  );
};

// ✅ UPDATED CERTIFICATES: GlareHover + no dot grid background, no glow mess
const Certificates = () => {
  const certs = [
    { title: "Introduction to Front-End", tags: ["HTML", "CSS"] },
    { title: "HTML and CSS in depth", tags: ["HTML", "CSS"] },
    { title: "Programming with JavaScript", tags: ["JavaScript"] },
    { title: "React Basics", tags: ["JavaScript", "React"] },
    { title: "Version Control", tags: ["Git", "GitHub"] },
    { title: "Advanced React", tags: ["React", "Hooks"] },
  ];

  return (
    <section id="certificates" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-24 md:scroll-mt-32">
      <SectionTitle title="Certificates" num="04" kicker="Verified Skills" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {certs.map((cert, idx) => (
          <Reveal key={idx} delay={idx * 90}>
            <div className="h-full min-h-[320px]">
              <GlareHover className="h-full" borderRadius="22px" glareOpacity={0.35} glareAngle={-45} glareSize={240}>
                <div className="p-7 sm:p-8 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-7">
                    <div className="flex items-center gap-3">
                      <img src={MetaLogo} alt="Meta" className="w-12 h-12 object-contain" />
                      <div className="leading-tight">
                        <div className="text-sm font-black text-gray-900">Meta</div>
                        <div className="text-xs text-gray-400 font-semibold">Coursera</div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                      Verified <CheckCircle size={14} />
                    </span>
                  </div>

                  {/* Title */}
                  <div className="mb-4">
                    <h4 className="font-black text-xl text-gray-900 leading-snug">{cert.title}</h4>
                    <p className="text-sm text-gray-500 font-medium mt-2 leading-relaxed">
                      Professional certificate authorized by Meta.
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 pb-6">
                      {cert.tags.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 rounded-full text-xs font-black border border-gray-200 bg-white text-gray-800"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => alert("Hook VIEW to credential link")}
                        className="flex-1 bg-[#0EA5E9] text-white py-2.5 rounded-xl text-sm font-black shadow-sm hover:brightness-95 transition"
                      >
                        VIEW
                      </button>
                      <button
                        onClick={() => alert("Hook PDF to download")}
                        className="flex-1 border border-gray-200 text-gray-800 py-2.5 rounded-xl text-sm font-black hover:bg-gray-50 transition"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              </GlareHover>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

const TimelineItem = ({ item, parentLineHeight, isDesktop }) => {
  const itemRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [trigger, setTrigger] = useState(0);

  useLayoutEffect(() => {
    if (!itemRef.current) return;
    setTrigger(itemRef.current.offsetTop + 60);
  }, []);

  useEffect(() => {
    if (parentLineHeight > trigger) {
      setIsVisible(true);
      return;
    }
    if (isDesktop) setIsVisible(false);
  }, [parentLineHeight, trigger, isDesktop]);

  return (
    <div ref={itemRef} className="flex group relative z-10 mb-16 sm:mb-20 md:mb-24">
      <div
        className={[
          "w-20 sm:w-24 md:w-32 flex-shrink-0 text-right pr-6 sm:pr-8 pt-2 transition-all duration-500 ease-out",
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10",
        ].join(" ")}
      >
        <span className="text-2xl sm:text-3xl font-black text-[#0EA5E9]">{item.year}</span>
      </div>

      <div className="relative flex flex-col items-center w-0 md:w-auto">
        <div
          className={[
            "hidden md:flex absolute top-3 -left-[9px] w-5 h-5 rounded-full border-4 border-white bg-[#0EA5E9] shadow-md z-20 transition-transform duration-300",
            isVisible ? "scale-100" : "scale-0",
          ].join(" ")}
        ></div>
      </div>

      <div
        className={[
          "pl-6 sm:pl-8 md:pl-12 pt-1 border-l-2 border-gray-100 md:border-none transition-all duration-500 ease-out delay-75",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
        ].join(" ")}
      >
        <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2 sm:mb-3">{item.title}</h3>
        <p className="text-gray-600 leading-relaxed font-medium text-sm sm:text-base">{item.desc}</p>
      </div>
    </div>
  );
};

const Journey = () => {
  const sectionRef = useRef(null);
  const rafRef = useRef(null);
  const [lineHeight, setLineHeight] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  const timeline = [
    {
      year: "2019",
      title: "Specialty: Electronic Trade",
      desc:
        "Started a multidisciplinary high school program combining Economy, Business, and Web Development. Graduated with a diploma as an Organizer of Internet Applications.",
    },
    {
      year: "2023",
      title: "International Exhibition & Fundamentals",
      desc:
        "Participated in the TF-FEST International Exhibition. Earned foundational certificates in Version Control and Introduction to Front-End.",
    },
    {
      year: "2024",
      title: "Graduation & Meta Certifications",
      desc:
        "Solidified front-end expertise by mastering HTML, CSS, and JavaScript. Earned Meta certificates in React Basics and Advanced React.",
    },
    {
      year: "2025",
      title: "Fontys University (ICT)",
      desc:
        "Expanding into full-stack development with C#, Razor, and Blazor. Focusing on UI/UX design and collaboration in agile teams.",
    },
  ];

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const calc = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const startOffset = windowHeight / 2;
      const relativeY = windowHeight - rect.top - startOffset;
      setLineHeight(Math.max(0, relativeY));
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        calc();
        rafRef.current = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", calc);
    calc();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", calc);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      id="journey"
      className="py-20 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-24 md:scroll-mt-32"
      ref={sectionRef}
    >
      <SectionTitle title="Journey" num="05" kicker="Timeline" />

      <div className="max-w-4xl relative">
        <div className="absolute left-[80px] sm:left-[96px] md:left-[128px] top-2 bottom-0 w-[2px] h-full z-0 hidden md:block">
          <div className="absolute top-0 left-0 w-full h-full bg-gray-200"></div>

          <div
            className="absolute top-0 left-0 w-full bg-[#0EA5E9] transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(14,165,233,0.55)]"
            style={{ height: `${lineHeight}px`, maxHeight: "100%" }}
          >
            <div
              className={[
                "absolute -bottom-4 -left-[9px] text-[#0EA5E9] transition-opacity duration-300",
                lineHeight > 10 ? "opacity-100" : "opacity-0",
              ].join(" ")}
            >
              <ChevronDown size={20} strokeWidth={3} />
            </div>
          </div>
        </div>

        <div className="relative pb-10 md:pb-16">
          {timeline.map((item, index) => (
            <TimelineItem key={index} item={item} parentLineHeight={lineHeight} isDesktop={isDesktop} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const email = "vladi.georgiev.14@gmail.com";
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Copy failed. Please copy manually.");
    }
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-24 md:scroll-mt-32">
      <Reveal>
        <div className="bg-[#E0F2FE] rounded-3xl p-6 sm:p-8 md:p-16 flex flex-col md:flex-row gap-10 md:gap-12 items-center shadow-lg border border-sky-100">
          <div className="flex-1 space-y-6 w-full">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
              Let’s start a <br className="hidden sm:block" /> conversation
            </h2>

            <div className="flex items-center gap-2 text-green-700 font-black">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse motion-reduce:animate-none"></span>
              Available for new projects
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2 w-full">
              <button
                onClick={onCopy}
                className="inline-flex items-center justify-between gap-2 bg-white/70 border border-white/60 px-5 py-3 rounded-full text-gray-700 font-semibold shadow-sm hover:bg-white transition-colors w-full sm:w-auto"
              >
                <span className="truncate max-w-[240px] sm:max-w-none">{email}</span>
                {copied ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} className="hover:text-[#0EA5E9]" />
                )}
              </button>

              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/70 border border-white/60 text-gray-700 font-semibold shadow-sm hover:bg-white transition-colors w-full sm:w-auto"
              >
                LinkedIn <ExternalLink size={16} />
              </a>

              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/70 border border-white/60 text-gray-700 font-semibold shadow-sm hover:bg-white transition-colors w-full sm:w-auto"
              >
                GitHub <Github size={16} />
              </a>
            </div>
          </div>

          <form
            className="flex-1 w-full space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Hook this form to EmailJS / Formspree / your backend.");
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700">Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full bg-[#F0F9FF] border border-sky-100 p-4 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700">Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                className="w-full bg-[#F0F9FF] border border-sky-100 p-4 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700">Message</label>
              <textarea
                placeholder="What are you building?"
                rows="4"
                className="w-full bg-[#F0F9FF] border border-sky-100 p-4 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] outline-none resize-none placeholder:text-gray-400"
              ></textarea>
            </div>

            <button
              className="w-full bg-[#0EA5E9] text-white font-black py-4 px-8 rounded-full shadow-lg hover:bg-sky-500 transition-all duration-300 motion-reduce:transition-none inline-flex items-center justify-center gap-2"
              type="submit"
            >
              Send Message <Rocket size={20} />
            </button>
          </form>
        </div>
      </Reveal>
    </section>
  );
};

export default function App() {
  const sectionIds = useMemo(() => ["about", "skills", "projects", "certificates", "journey", "contact"], []);
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

      <footer className="text-center py-12 text-gray-400 text-sm font-semibold">© 2025 Vladi Georgiev.</footer>

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
