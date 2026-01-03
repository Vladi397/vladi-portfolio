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

export default Hero;