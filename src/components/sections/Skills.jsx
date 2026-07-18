import React from "react";
import { Layout, Database, Code2 } from "lucide-react";
import Reveal from "../ui/Reveal";
import SectionTitle from "../ui/SectionTitle";
import TiltedCard from "../ui/TiltedCard";
import { useTranslation } from 'react-i18next';

const Skills = () => {
  const { t } = useTranslation();

  const skillCategories = [
    {
      title: t('skills.cat_frontend'), // Translated
      icon: <Layout className="w-7 h-7 text-[#0EA5E9]" />,
      skills: ["React", "JavaScript (ES6+)", "Tailwind CSS", "HTML5 & CSS3", "Bootstrap", "Blazor"],
    },
    {
      title: t('skills.cat_backend'), // Translated
      icon: <Database className="w-7 h-7 text-[#0EA5E9]" />,
      skills: ["C#", "Razor Pages", "Python", "REST APIs", "SQL Basics"],
    },
    {
      title: t('skills.cat_tools'), // Translated
      icon: <Code2 className="w-7 h-7 text-[#0EA5E9]" />,
      skills: ["Git & GitHub", "Figma (UI/UX)", "VS Code", t('skills.responsive'), "Agile"], // Translated 'Responsive Design'
    },
  ];

  return (
    <section id="skills" className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-24 md:scroll-mt-32">
      <SectionTitle title={t('skills.title')} num="02" kicker={t('skills.kicker')} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {skillCategories.map((cat, idx) => (
          <Reveal key={idx} delay={idx * 80}>
            <div className="relative group h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-[22px] blur opacity-25 dark:opacity-40 transition duration-1000 group-hover:opacity-60"></div>
              
              <TiltedCard className="h-full relative">
                <div className="h-full p-6 sm:p-8 rounded-[22px] transition-colors duration-300
                  bg-white dark:bg-slate-800/90 border border-transparent dark:border-slate-700/50"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors
                    bg-sky-50 dark:bg-slate-700"
                  >
                    {cat.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-6 transition-colors
                    text-gray-900 dark:text-white"
                  >
                    {cat.title}
                  </h3>
                  <ul className="space-y-3">
                    {cat.skills.map((skill) => (
                      <li key={skill} className="flex items-center gap-3 font-semibold transition-colors
                        text-gray-600 dark:text-slate-300"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#0EA5E9]"></span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </TiltedCard>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Skills;