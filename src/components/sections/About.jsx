import React from "react";
import { ArrowUpRight } from "lucide-react";
import Reveal from "../ui/Reveal";
import SectionTitle from "../ui/SectionTitle";
import SecondaryButton from "../ui/SecondaryButton";
import Vladi2 from "../../assets/Vladi2.jpg";

const About = () => (
  <section id="about" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-24 md:scroll-mt-32">
    <SectionTitle title="About Me" num="01" kicker="Who I am" />

    <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">
      <div className="flex-1 space-y-6 text-base sm:text-lg leading-relaxed transition-colors 
        text-gray-600 dark:text-slate-400">
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
            {[
              "React + Tailwind",
              "UI/UX in Figma",
              "C# Basics"
            ].map((skill) => (
              <span key={skill} className="px-4 py-2 rounded-full font-semibold text-sm border transition-colors
                bg-sky-50 text-sky-700 border-sky-100
                dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800"
              >
                {skill}
              </span>
            ))}
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
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full blur-2xl -z-10 transition-colors
            bg-sky-100 dark:bg-sky-800/40"></div>
        </Reveal>
      </div>
    </div>
  </section>
);

export default About;