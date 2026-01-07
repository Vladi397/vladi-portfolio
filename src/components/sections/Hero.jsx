import React from "react";
import { ArrowUpRight, CheckCircle, MapPin } from "lucide-react";
import Reveal from "../ui/Reveal";
import PrimaryButton from "../ui/PrimaryButton";
import SecondaryButton from "../ui/SecondaryButton";
import { scrollToId } from "../../utils/scrollHelpers";
import Vladi1 from "../../assets/Vladi1.png";

const Hero = () => (
  <section
    id="home"
    className={[
      "pt-24 sm:pt-32 md:pt-40 pb-12 sm:pb-16 md:pb-24",
      "px-4 sm:px-6 max-w-7xl mx-auto",
      "min-h-[92svh] flex flex-col md:flex-row items-center gap-8 md:gap-12",
    ].join(" ")}
  >
    {/* Text Section */}
    <div className="flex-1 z-10 text-center md:text-left order-2 md:order-1">
      <Reveal>
        <h3
          className="font-bold tracking-[0.25em] text-[11px] sm:text-xs uppercase mb-4 transition-colors
          text-[#0EA5E9] dark:text-sky-400"
        >
          Front-End Developer • UI/UX
        </h3>
      </Reveal>

      <Reveal delay={80}>
        <h1
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.08] transition-colors
          text-gray-900 dark:text-white"
        >
          Building Digital Experiences.
        </h1>
      </Reveal>

      <Reveal delay={140}>
        <p
          className="text-base sm:text-lg max-w-xl leading-relaxed pt-5 mx-auto md:mx-0 transition-colors
          text-gray-500 dark:text-slate-400"
        >
          I build clean, responsive React interfaces with strong UX and a performance-first mindset.
        </p>
      </Reveal>

      <Reveal delay={200}>
        <div className="pt-7 flex flex-col sm:flex-row gap-3 justify-center md:justify-start w-full sm:w-auto">
          <PrimaryButton onClick={() => scrollToId("projects")} className="justify-center w-full sm:w-auto">
            See My Work <ArrowUpRight className="inline-block ml-2" size={18} />
          </PrimaryButton>

          {/* Boost contrast + “clickability” in LIGHT mode */}
          <SecondaryButton
            onClick={() => scrollToId("contact")}
            className={[
              "justify-center w-full sm:w-auto",
              "bg-white/90 border border-gray-200 text-gray-900 shadow-sm",
              "hover:bg-white hover:border-gray-300 hover:shadow-md",
              "dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-200",
              "dark:hover:bg-slate-800/55 dark:hover:border-slate-600",
            ].join(" ")}
          >
            Get in touch
          </SecondaryButton>
        </div>
      </Reveal>

      <Reveal delay={260}>
        {/* Pills: stronger border/contrast in LIGHT mode */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm justify-center md:justify-start">
          <span
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full transition-colors border
            bg-white/85 border-gray-200 text-gray-900 shadow-sm
            hover:bg-white hover:border-gray-300
            dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-300"
          >
            <CheckCircle className="text-sky-600 dark:text-sky-400" size={16} />
            7 Meta Certificates
          </span>

          <span
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full transition-colors border
            bg-white/85 border-gray-200 text-gray-900 shadow-sm
            hover:bg-white hover:border-gray-300
            dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-300"
          >
            <MapPin className="text-sky-600 dark:text-sky-400" size={16} />
            Eindhoven
          </span>

          <span
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full transition-colors border
            bg-white/85 border-gray-200 text-gray-900 shadow-sm
            hover:bg-white hover:border-gray-300
            dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-300"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse motion-reduce:animate-none"></span>
            Available
          </span>
        </div>
      </Reveal>

      <Reveal delay={320}>
        <div className="mt-8 sm:mt-10 border-l-4 border-[#0EA5E9] pl-4 sm:pl-5 py-2 text-left max-w-xl mx-auto md:mx-0">
          <p
            className="text-sm sm:text-base md:text-lg font-semibold leading-relaxed transition-colors
            text-gray-800 dark:text-slate-200"
          >
            “Modern solutions built with technical precision and clean design.”
          </p>
        </div>
      </Reveal>
    </div>

    {/* Image Section */}
    <div className="flex-1 relative flex justify-center w-full order-1 md:order-2">
      <Reveal delay={120} className="w-full max-w-[280px] sm:max-w-md">
        <div className="relative isolate">
          {/* Subtle “stage” behind the person so light mode doesn’t feel flat */}
          <div
            className={[
              "absolute inset-0 -z-20 rounded-[32px]",
              "bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.14),transparent_60%)]",
              "dark:bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.18),transparent_55%)]",
            ].join(" ")}
          />

          {/* Grounding shadow so the cutout doesn’t float like a sticker */}
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[72%] h-8 -z-10 rounded-full blur-2xl
            bg-slate-900/15 dark:bg-black/45"
          />

          <div
            className="relative z-10"
            style={{
              maskImage: "linear-gradient(to bottom, black 72%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 72%, transparent 100%)",
            }}
          >
            <img
              src={Vladi1}
              alt="Vladi Georgiev"
              className={[
                "w-full h-auto object-cover select-none",
                // Better integration: soft drop shadow (light) + stronger (dark)
                "drop-shadow-[0_28px_55px_rgba(2,6,23,0.18)]",
                "dark:drop-shadow-[0_28px_55px_rgba(0,0,0,0.50)]",
              ].join(" ")}
            />
          </div>

          {/* Glow blobs: toned down in LIGHT mode to avoid halo/sticker look */}
          <div
            className="absolute top-16 left-10 w-[78%] h-[78%] rounded-full blur-[80px] -z-10 transition-colors
            opacity-35 bg-sky-100
            dark:opacity-30 dark:bg-sky-600/70"
          />
          <div
            className="absolute -top-6 -right-4 w-24 h-24 rounded-full blur-2xl -z-10 transition-colors
            opacity-30 bg-sky-100
            dark:opacity-25 dark:bg-sky-800/40"
          />
        </div>
      </Reveal>
    </div>
  </section>
);

export default Hero;
