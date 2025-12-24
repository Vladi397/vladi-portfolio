import React, { useState } from 'react';
import { Rocket, ExternalLink, Copy, CheckCircle, Menu, X } from 'lucide-react';
import Vladi1 from './assets/Vladi1.png';

// --- UI Components ---

// 1. NEW: Glow Component for the hero background effects
const GlowOrb = ({ className = "" }) => (
  <div className={`absolute rounded-full blur-[100px] -z-10 ${className}`}></div>
);

// 2. OLD: Your original GlassCard (kept strictly as requested)
const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/30 backdrop-blur-md border border-white/50 shadow-glass rounded-3xl ${className}`}>
    {children}
  </div>
);

// 3. OLD: Your original SectionHeading (kept strictly as requested)
const SectionHeading = ({ title, num }) => (
  <div className="flex items-baseline gap-2 mb-12">
    <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight uppercase">{title}</h2>
    <span className="text-xl md:text-2xl font-light text-gray-500">({num})</span>
  </div>
);

// --- Sections ---

// UPDATED: High Fidelity Navbar (Cleaner look)
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const links = ["About", "Projects", "Certificates", "Contact"];

  return (
    <nav className="fixed w-full z-50 top-0 left-0 bg-white/70 backdrop-blur-lg border-b border-white/40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tighter">
          Vladi <span className="text-brand-accent">Georgiev</span>
        </h1>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-10">
          {links.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-sm font-bold text-gray-500 hover:text-brand-accent tracking-widest uppercase transition-colors">
              {link}
            </a>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 text-gray-700" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl p-6 flex flex-col gap-6 shadow-2xl border-t border-gray-100 animate-fade-in-down">
          {links.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setIsOpen(false)} className="text-2xl font-bold text-gray-800">
              {link}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

// UPDATED: High Fidelity Hero (Glows, Fading Image, Better Typography)
const Hero = () => (
  <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 min-h-screen relative overflow-visible">
    
    {/* NEW: Background Glows */}
    <GlowOrb className="w-[500px] h-[500px] bg-sky-200/40 -top-20 -left-20" />
    <GlowOrb className="w-[400px] h-[400px] bg-blue-200/30 bottom-0 right-0" />

    <div className="flex-1 space-y-8 animate-fade-in-up z-10">
      <div className="inline-block px-4 py-2 bg-sky-50 rounded-full border border-sky-100">
        <h3 className="text-brand-accent font-bold tracking-widest text-xs uppercase">Front-End Developer & UI/UX Designer</h3>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1]">
        Building Digital <br />
        <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700">
          Experiences.
          {/* Decorative Underline */}
          <span className="absolute bottom-3 left-0 w-full h-4 bg-brand-accent/20 -z-10 -rotate-1"></span>
        </span>
      </h1>
      
      <p className="text-gray-500 text-lg md:text-xl max-w-lg leading-relaxed">
        Design driven by logic. Code inspired by art. Creating seamless web solutions.
      </p>
      
      <div className="flex flex-wrap gap-4">
        <button className="bg-brand-accent text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-sky-300/50 hover:bg-sky-400 hover:shadow-sky-400/50 hover:-translate-y-1 transition-all duration-300">
          See My Work
        </button>
      </div>

      <div className="mt-12 border-l-4 border-brand-accent pl-6 py-1">
        <p className="text-xl md:text-2xl text-gray-800 font-medium leading-relaxed italic">
          "Developing modern solutions in <span className="text-brand-accent font-bold not-italic">Eindhoven</span> with a foundation in technical precision."
        </p>
      </div>
    </div>

    <div className="flex-1 relative flex justify-center z-10">
      {/* Intense Glow behind image */}
      <div className="absolute w-[120%] h-[120%] bg-gradient-to-tr from-sky-200/50 to-white/0 rounded-full blur-3xl -z-10 top-10"></div>
      
      {/* NEW: Image with Bottom Fade Mask */}
      <div className="relative w-full max-w-md">
        <div className="relative rounded-3xl overflow-hidden" style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}>
            <img src={Vladi1} alt="Vladi Georgiev" className="w-full h-auto object-cover transform hover:scale-105 transition-duration-700" />
        </div>
      </div>
    </div>
  </section>
);

const About = () => (
  <section id="about" className="py-20 px-6 max-w-7xl mx-auto">
    <SectionHeading title="About Me" num="01" />
    
    <div className="flex flex-col-reverse md:flex-row items-center gap-12">
      <div className="flex-1 space-y-6 text-lg text-gray-600 leading-relaxed">
        <p>
          I'm Vladi Georgiev from Bulgaria. After studying electronic trades in high school, I earned seven professional certificates in front-end development from Meta.
        </p>
        <p>
          I've built websites with HTML, CSS, Bootstrap, JavaScript, React, and UI/UX design, and worked on several C# projects using Razor and Blazor.
        </p>
        <button className="mt-6 flex items-center gap-2 text-brand-accent font-bold hover:underline">
          Download Full Resume <ExternalLink size={18} />
        </button>
      </div>
      
      <div className="flex-1 flex justify-center">
         <div className="w-80 h-80 bg-gray-200 rounded-3xl shadow-lg flex items-center justify-center text-gray-400 rotate-3 transition-transform hover:rotate-0">
             [About Image]
         </div>
      </div>
    </div>
  </section>
);

const Journey = () => {
  const timeline = [
    { year: "2019", title: "Specialty: Electronic Trade", desc: "Started a multidisciplinary high school program combining Economy, Business, and Web Development." },
    { year: "2023", title: "International Exhibition & Fundamentals", desc: "Participated in TF-FEST. Earned foundational certificates in Version Control and Front-End." },
    { year: "2024", title: "Graduation & Meta Certifications", desc: "Solidified front-end expertise by mastering HTML, CSS, JS. Earned specialized Meta certificates in React." },
    { year: "2025", title: "Fontys University (ICT)", desc: "Expanding into full-stack development with C#, Razor, and Blazor. Focusing on UI/UX design." },
  ];

  return (
    <section id="journey" className="py-20 px-6 max-w-7xl mx-auto">
       <div className="flex items-baseline gap-2 mb-12 text-brand-accent">
          <h2 className="text-4xl font-black uppercase tracking-tight">Journey</h2>
       </div>

       <div className="border-l-2 border-gray-200 ml-4 md:ml-12 space-y-12">
         {timeline.map((item, index) => (
           <div key={index} className="relative pl-8 md:pl-12 group">
             {/* Dot */}
             <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gray-300 group-hover:bg-brand-accent ring-4 ring-white transition-colors duration-300"></div>
             
             <div className="flex flex-col md:flex-row gap-2 md:gap-12">
               <span className="text-3xl font-bold text-brand-accent min-w-[100px]">{item.year}</span>
               <div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                 <p className="text-gray-600 max-w-2xl">{item.desc}</p>
               </div>
             </div>
           </div>
         ))}
       </div>
    </section>
  );
};

const Projects = () => (
  <section id="projects" className="py-20 px-6 max-w-7xl mx-auto">
    <SectionHeading title="Projects" num="02" />

    {/* Project Card */}
    <GlassCard className="p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center hover:shadow-2xl transition-shadow duration-300">
      <div className="w-full md:w-1/2">
        <div className="bg-gray-100 rounded-xl overflow-hidden shadow-inner aspect-video flex items-center justify-center text-gray-400 group">
           <span className="group-hover:scale-105 transition-transform">[Project Screenshot]</span>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 space-y-6">
        <h3 className="text-3xl font-bold text-gray-900">Mario's Pizza</h3>
        <p className="text-gray-600 leading-relaxed">
          A fully responsive e-commerce platform for a pizza restaurant. Features include menu browsing, cart management, and a seamless checkout process designed with a mobile-first approach.
        </p>
        
        <div className="flex flex-wrap gap-3">
          {['Python', 'React', 'Tailwind'].map(tag => (
            <span key={tag} className="px-4 py-1 bg-sky-50 text-brand-accent border border-sky-100 rounded-full text-sm font-medium">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-gray-400 text-sm font-medium pt-2">Front-End Developer & UX/UI</p>
      </div>
    </GlassCard>
  </section>
);

const Certificates = () => {
  const certs = [
    { title: "Introduction to Front-End", tags: ["HTML", "CSS"] },
    { title: "HTML and CSS in depth", tags: ["HTML", "CSS"] },
    { title: "Programming with JavaScript", tags: ["JavaScript"] },
    { title: "React Basics", tags: ["JavaScript", "React"] },
    { title: "Version Control", tags: ["GIT"] },
    { title: "Advanced React", tags: ["React"] },
  ];

  return (
    <section id="certificates" className="py-20 px-6 max-w-7xl mx-auto">
      <SectionHeading title="Certificates" num="03" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certs.map((cert, idx) => (
          <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 flex flex-col justify-between h-full group">
            <div>
              <div className="flex items-center gap-2 mb-4">
                 {/* Fake Meta Logo */}
                 <div className="font-bold text-blue-600 text-xl tracking-tight flex items-center gap-1">
                    <span className="text-2xl">∞</span> Meta
                 </div>
              </div>
              <h4 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-brand-accent transition-colors">{cert.title}</h4>
              <p className="text-xs text-gray-400 mb-4">authorized by Meta and offered through Coursera</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {cert.tags.map(t => (
                  <span key={t} className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">{t}</span>
                ))}
                <span className="ml-auto flex items-center text-green-500 text-xs font-bold gap-1">
                  Verified <CheckCircle size={12} />
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-auto">
              <button className="flex-1 bg-brand-accent text-white py-2 rounded-lg text-sm font-bold hover:bg-sky-500 transition-colors">VIEW</button>
              <button className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">PDF</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Contact = () => (
  <section id="contact" className="py-20 px-6 max-w-7xl mx-auto">
    
    <GlassCard className="max-w-4xl mx-auto p-8 md:p-16 flex flex-col md:flex-row gap-12">
      
      <div className="flex-1 space-y-6">
        <h2 className="text-4xl font-extrabold text-gray-900">Let's start a <br /> conversation</h2>
        <div className="flex items-center gap-2 text-gray-500 font-medium">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Available for new projects
        </div>

        <div className="inline-flex items-center gap-2 bg-sky-100/50 px-4 py-2 rounded-lg text-brand-accent text-sm font-medium hover:bg-sky-100 transition-colors">
          vladi.georgiev.14@gmail.com
          <Copy size={16} className="cursor-pointer hover:text-blue-600" />
        </div>
      </div>

      <form className="flex-1 space-y-4" onSubmit={(e) => e.preventDefault()}>
        <input type="text" placeholder="Name" className="w-full bg-white/50 border border-gray-200 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all" />
        <input type="email" placeholder="Email" className="w-full bg-white/50 border border-gray-200 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all" />
        <textarea placeholder="Message" rows="4" className="w-full bg-white/50 border border-gray-200 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white resize-none transition-all"></textarea>
        
        <button className="w-full bg-brand-accent text-white font-bold py-4 rounded-xl shadow-lg hover:bg-sky-500 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
          Send Message <Rocket size={20} />
        </button>
      </form>

    </GlassCard>
  </section>
);

// --- Main App ---

export default function App() {
  return (
    // Main Background Gradient
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-sky-100 overflow-x-hidden font-sans selection:bg-brand-accent selection:text-white">
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Journey />
      <Certificates />
      <Contact />
      
      <footer className="text-center py-8 text-gray-400 text-sm">
        © 2025 Vladi Georgiev. All rights reseerved.
      </footer>
    </div>
  );
}