import React from "react";
import { Layout, Database, Code2 } from "lucide-react";
import Reveal from "../ui/Reveal";
import SectionTitle from "../ui/SectionTitle";
import TiltedCard from "../ui/TiltedCard";

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

export default Skills;