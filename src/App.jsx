import React, { useRef, useState, useEffect } from 'react';
import { 
  ExternalLink, 
  Copy, 
  Menu, 
  X, 
  Rocket, 
  CheckCircle,
  Code2,      
  Database,   
  Layout,     
  Terminal,
  ChevronDown 
} from 'lucide-react';

// --- IMAGES ---
import Vladi1 from './assets/Vladi1.png'; // Hero Image
import Vladi2 from './assets/Vladi2.jpg'; // About Me Image

// --- Helper Components ---

// 1. TiltedCard Component (Smaller Blue Spotlight)
const TiltedCard = ({ children }) => {
  const ref = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 }); 
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!ref.current) return;

    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const centerX = width / 2;
    const centerY = height / 2;
    const rotateX = ((y - centerY) / centerY) * -10; 
    const rotateY = ((x - centerX) / centerX) * 10;

    const xPct = (x / width) * 100;
    const yPct = (y / height) * 100;

    setRotate({ x: rotateX, y: rotateY });
    setGlarePos({ x: xPct, y: yPct });
    setOpacity(1); 
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setOpacity(0); 
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.02, 1.02, 1.02)`,
        transition: "transform 0.1s ease-out",
      }}
      className="relative h-full transition-all duration-200 ease-out group"
    >
      {/* Dynamic Glare Effect */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none z-10 rounded-2xl overflow-hidden"
        style={{
          opacity: opacity,
          transition: 'opacity 0.3s ease',
          background: `radial-gradient(
            300px circle at ${glarePos.x}% ${glarePos.y}%, 
            rgba(14, 165, 233, 0.3), 
            transparent 100%
          )`
        }}
      />
      
      {children}
    </div>
  );
};

// 2. Section Title
const SectionTitle = ({ title, num }) => (
  <div className="flex items-baseline gap-4 mb-16">
    <h2 className="text-5xl md:text-6xl font-black text-gray-900 uppercase tracking-tight">{title}</h2>
    <span className="text-2xl text-gray-500 font-normal">({num})</span>
  </div>
);

// 3. Primary Button
const PrimaryButton = ({ children, className = "" }) => (
  <button className={`bg-[#0EA5E9] text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-sky-500 hover:-translate-y-1 transition-all duration-300 ${className}`}>
    {children}
  </button>
);

// --- Sections ---

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const links = ["ABOUT", "SKILLS", "PROJECTS", "CERTIFICATES", "JOURNEY", "CONTACT"];

  return (
    <nav className="fixed w-full z-50 top-0 left-0 bg-white/80 backdrop-blur-md py-6 transition-all border-b border-gray-100/50">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Vladi Georgiev
        </h1>
        
        <div className="hidden md:flex gap-8 lg:gap-12">
          {links.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-xs lg:text-sm font-semibold text-gray-600 hover:text-[#0EA5E9] tracking-widest uppercase transition-colors">
              {link}
            </a>
          ))}
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-4 shadow-xl">
           {links.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setIsOpen(false)} className="text-lg font-bold text-gray-800">
              {link}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

const Hero = () => (
  <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex flex-col md:flex-row items-center gap-12">
    <div className="flex-1 space-y-6 z-10">
      <h3 className="text-[#0EA5E9] font-bold tracking-widest text-xs uppercase mb-2">Front-End Developer & UI/UX Designer</h3>
      
      <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1]">
        Building Digital <br />
        <span className="relative inline-block">
          Experiences.
          <span className="absolute bottom-2 left-0 w-full h-3 bg-sky-200/50 -z-10"></span>
        </span>
      </h1>
      
      <p className="text-gray-500 text-lg max-w-lg leading-relaxed pt-4">
        Design driven by logic. Code inspired by art.
      </p>
      
      <div className="pt-6">
        <PrimaryButton>See My Work</PrimaryButton>
      </div>

      <div className="mt-16 border-l-4 border-[#0EA5E9] pl-6 py-2">
        <p className="text-xl text-gray-800 font-medium leading-relaxed">
          "Developing modern solutions in <span className="text-[#0EA5E9]">Eindhoven</span> with a foundation in technical precision."
        </p>
      </div>
    </div>

    <div className="flex-1 relative flex justify-center">
      <div className="relative w-full max-w-md">
        <div className="relative z-10" style={{ maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}>
            <img src={Vladi1} alt="Vladi Georgiev" className="w-full h-auto object-cover" />
        </div>
        <div className="absolute top-20 left-10 w-[80%] h-[80%] bg-sky-200 rounded-full blur-[80px] -z-10 opacity-60"></div>
      </div>
    </div>
  </section>
);

const About = () => (
  <section id="about" className="py-20 px-6 max-w-7xl mx-auto">
    <SectionTitle title="About Me" num="01" />
    
    <div className="flex flex-col-reverse md:flex-row items-center gap-16">
      <div className="flex-1 space-y-6 text-gray-600 text-lg leading-relaxed">
        <p>
          I'm Vladi Georgiev from Bulgaria. After studying electronic trades in high school, I earned seven professional certificates in front-end development from Meta.
        </p>
        <p>
          I've built websites with HTML, CSS, Bootstrap, JavaScript, React, and UI/UX design, and worked on several C# projects using Razor and Blazor.
        </p>
        
        <button className="mt-8 px-8 py-3 border-2 border-sky-100 text-[#0EA5E9] font-bold rounded-full hover:bg-sky-50 transition-colors flex items-center gap-2">
          Download Full Resume <span className="text-xl">→</span>
        </button>
      </div>
      
      <div className="flex-1 relative">
         <div className="w-full max-w-sm ml-auto relative">
             <img src={Vladi2} alt="About Vladi" className="rounded-[40px] shadow-2xl w-full object-cover bg-gray-100" />
         </div>
      </div>
    </div>
  </section>
);

const Skills = () => {
  const skillCategories = [
    {
      title: "Frontend",
      icon: <Layout className="w-8 h-8 text-[#0EA5E9]" />,
      skills: ["React", "JavaScript (ES6+)", "Tailwind CSS", "HTML5 & CSS3", "Bootstrap", "Blazor"]
    },
    {
      title: "Backend & Logic",
      icon: <Database className="w-8 h-8 text-[#0EA5E9]" />,
      skills: ["C#", "Razor Pages", "Python", "RESTful APIs", "SQL Basics"]
    },
    {
      title: "Tools & Design",
      icon: <Code2 className="w-8 h-8 text-[#0EA5E9]" />,
      skills: ["Git & GitHub", "Figma (UI/UX)", "VS Code", "Responsive Design", "Agile"]
    }
  ];

  return (
    <section id="skills" className="py-20 px-6 max-w-7xl mx-auto">
      <SectionTitle title="Tech Stack" num="02" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {skillCategories.map((cat, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 hover:shadow-xl hover:border-sky-100 transition-all duration-300 group">
            <div className="bg-sky-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {cat.icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{cat.title}</h3>
            <ul className="space-y-3">
              {cat.skills.map((skill) => (
                <li key={skill} className="flex items-center gap-3 text-gray-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#0EA5E9]"></span>
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

const Projects = () => {
  const projects = [
    {
      title: "Mario's Pizza",
      desc: "A fully responsive e-commerce platform for a pizza restaurant. Features include menu browsing, cart management, and a seamless checkout process.",
      tags: ["Python", "React", "Tailwind"],
      bg: "bg-[#1f2937]", 
      text: "white"
    },
    {
      title: "Finance Tracker",
      desc: "Comprehensive dashboard for tracking personal expenses with chart visualizations and export capabilities.",
      tags: ["Next.js", "TypeScript", "ChartJS"],
      bg: "bg-white",
      text: "gray-900"
    },
    {
      title: "Portfolio v1",
      desc: "The first iteration of my personal portfolio showcasing my early work in HTML and CSS.",
      tags: ["HTML", "CSS", "JS"],
      bg: "bg-white",
      text: "gray-900"
    }
  ];

  return (
    <section id="projects" className="py-20 px-6 max-w-7xl mx-auto relative">
      <SectionTitle title="Projects" num="03" />

      <div className="flex flex-col gap-8 pb-20">
        {projects.map((project, index) => (
          <div 
            key={index} 
            className="sticky top-32" 
            style={{ marginTop: index === 0 ? 0 : '0px', marginBottom: `${(projects.length - index) * 20}px` }}
          >
            <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-12 transition-transform hover:scale-[1.02] duration-500">
              
              <div className="w-full md:w-1/2">
                <div className={`${project.bg} rounded-2xl overflow-hidden shadow-inner aspect-[4/3] flex items-center justify-center relative group`}>
                   <span className="text-gray-400 font-bold">[ Project Screenshot ]</span>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
                <h3 className="text-4xl font-black text-gray-900">{project.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {project.desc}
                </p>
                
                <div className="flex flex-wrap gap-3">
                  {project.tags.map(tag => (
                    <span key={tag} className="px-4 py-1.5 bg-sky-50 text-[#0EA5E9] rounded-full text-sm font-bold border border-sky-100">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-gray-400 text-sm font-medium pt-4">Front-End Developer & UX/UI</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

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
      <SectionTitle title="Certificates" num="04" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {certs.map((cert, idx) => (
          <TiltedCard key={idx}>
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 flex flex-col h-full relative z-0">
                <div className="flex items-center gap-2 mb-6">
                    <div className="font-bold text-[#0EA5E9] text-xl flex items-center gap-1">
                      <span className="text-2xl">∞</span> Meta
                    </div>
                </div>
                
                <h4 className="font-bold text-xl text-gray-900 mb-2">{cert.title}</h4>
                <p className="text-xs text-gray-400 mb-6">authorized by Meta and offered through Coursera</p>
                
                <div className="mt-auto space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {cert.tags.map(t => (
                      <span key={t} className="px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-md">{t}</span>
                    ))}
                    <span className="ml-auto text-green-500 flex items-center gap-1 text-xs font-bold">Verified <CheckCircle size={14}/></span>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-[#0EA5E9] text-white py-2 rounded-lg text-sm font-bold hover:bg-sky-500 transition-colors">VIEW</button>
                    <button className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">Download PDF</button>
                  </div>
                </div>
            </div>
          </TiltedCard>
        ))}
      </div>
    </section>
  );
};

// --- ANIMATED JOURNEY SECTION ---
// --- NEW HELPER: Handles the "Appear/Disappear" logic based on line height ---
const TimelineItem = ({ item, index, parentLineHeight, parentRef }) => {
  const itemRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [offsetTop, setOffsetTop] = useState(0);

  // 1. Calculate exactly where this item sits on the page
  React.useLayoutEffect(() => {
    if (itemRef.current && parentRef.current) {
      // Get the distance from the top of the Journey section to this specific item
      const itemTop = itemRef.current.offsetTop;
      // Trigger visibility when the line is 50px past the start of the item
      setOffsetTop(itemTop + 50); 
    }
  }, [parentRef]);

  // 2. Check every time the Blue Line grows or shrinks
  useEffect(() => {
    // If Blue Line is taller than this item -> SHOW
    // If Blue Line shrinks (scroll up) and becomes shorter -> HIDE
    if (parentLineHeight > offsetTop) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [parentLineHeight, offsetTop]);

  return (
    <div ref={itemRef} className="flex group relative z-10 mb-24">
      
      {/* Year Column (Left) - Slides in/out */}
      <div 
        className={`w-24 md:w-32 flex-shrink-0 text-right pr-8 pt-2 transition-all duration-500 ease-out 
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
      >
        <span className="text-3xl font-bold text-[#0EA5E9]">{item.year}</span>
      </div>
      
      {/* Dot Column (Center) */}
      <div className="relative flex flex-col items-center w-0 md:w-auto">
         {/* The Blue Dot 
             - z-20: Puts it ON TOP of the line
             - border-white: Creates the gap effect
             - scale-0/100: Pops in and out
         */}
         <div 
            className={`hidden md:flex absolute top-3 -left-[9px] w-5 h-5 rounded-full border-4 border-white bg-[#0EA5E9] shadow-md z-20 transition-transform duration-300 ease-back-out 
            ${isVisible ? 'scale-100' : 'scale-0'}`}
         ></div>
      </div>
      
      {/* Text Column (Right) - Slides in/out */}
      <div 
        className={`pl-8 md:pl-12 pt-1 border-l-2 border-gray-100 md:border-none transition-all duration-500 ease-out delay-75
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      > 
        <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
        <p className="text-gray-600 leading-relaxed">{item.desc}</p>
      </div>

    </div>
  );
};

// --- UPDATED JOURNEY SECTION ---
const Journey = () => {
  const sectionRef = useRef(null);
  const [lineHeight, setLineHeight] = useState(0);

  const timeline = [
    { year: "2019", title: "Specialty: Electronic Trade", desc: "Started a multidisciplinary high school program combining Economy, Business, and Web Development. Graduated with a diploma as an Organizer of Internet Applications." },
    { year: "2023", title: "International Exhibition & Fundamentals", desc: "Participated in the TF-FEST International Exhibition. Earned foundational professional certificates in Version Control and Introduction to Front-End." },
    { year: "2024", title: "Graduation & Meta Certifications", desc: "Solidified front-end expertise by mastering HTML, CSS, and JavaScript. Earned specialized Meta certificates in React Basics and Advanced React." },
    { year: "2025", title: "Fontys University (ICT)", desc: "Expanding into full-stack development with C#, Razor, and Blazor. Focusing on UI/UX design, Wireframing, and collaborative open learning in agile teams." },
  ];

  // Logic: Calculate Blue Line Height based on Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Start drawing line when the section is in the middle of the screen
        const startOffset = windowHeight / 2; 
        const relativeY = windowHeight - rect.top - startOffset;
        
        // Clamp: Ensure height is never negative
        const newHeight = Math.max(0, relativeY);
        
        setLineHeight(newHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="journey" className="py-20 px-6 max-w-7xl mx-auto" ref={sectionRef}>
       <div className="flex items-baseline gap-2 mb-20 text-[#0EA5E9]">
          <h2 className="text-4xl font-black uppercase tracking-tight">JOURNEY</h2>
       </div>

       <div className="max-w-4xl relative">
         
         {/* --- THE SCROLLING LINE TRACK --- */}
         <div className="absolute left-[96px] md:left-[128px] top-2 bottom-0 w-[2px] h-full z-0 hidden md:block">
            {/* 1. Gray Background Line (The Track) */}
            <div className="absolute top-0 left-0 w-full h-full bg-gray-200"></div>
            
            {/* 2. Blue Animated Line */}
            <div 
              className="absolute top-0 left-0 w-full bg-[#0EA5E9] transition-all duration-75 ease-linear shadow-[0_0_10px_#0EA5E9]"
              style={{ height: `${lineHeight}px`, maxHeight: '100%' }} 
            >
                {/* 3. THE ARROW HEAD (Sticks to the bottom of the blue line) */}
                <div className={`absolute -bottom-4 -left-[9px] text-[#0EA5E9] transition-opacity duration-300 ${lineHeight > 10 ? 'opacity-100' : 'opacity-0'}`}>
                   <ChevronDown size={20} strokeWidth={3} />
                </div>
            </div>
         </div>

         {/* --- TIMELINE ITEMS --- */}
         {/* We pass the 'lineHeight' to every item so it knows when to appear/disappear */}
         <div className="relative pb-24">
            {timeline.map((item, index) => (
              <TimelineItem 
                key={index} 
                item={item} 
                index={index} 
                parentLineHeight={lineHeight} 
                parentRef={sectionRef} 
              />
            ))}
         </div>
         
         {/* Static End Dot */}
         <div className="flex opacity-20">
            <div className="w-24 md:w-32 flex-shrink-0 pr-8"></div>
            <div className="relative flex flex-col items-center pl-3">
               <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
         </div>
       </div>
    </section>
  );
};

const Contact = () => (
  <section id="contact" className="py-20 px-6 max-w-7xl mx-auto">
    <div className="bg-[#E0F2FE] rounded-3xl p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center shadow-lg">
      
      <div className="flex-1 space-y-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Let's start a <br /> conversation</h2>
        <div className="flex items-center gap-2 text-green-600 font-bold">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Available for new projects
        </div>

        <div className="inline-flex items-center gap-2 bg-white/50 px-6 py-3 rounded-full text-gray-600 text-sm font-medium mt-4">
          vladi.georgiev.14@gmail.com
          <Copy size={16} className="cursor-pointer hover:text-[#0EA5E9]" />
        </div>
      </div>

      <form className="flex-1 w-full space-y-4">
        <input type="text" placeholder="Name" className="w-full bg-[#F0F9FF] border-none p-4 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] outline-none placeholder:text-gray-400" />
        <input type="email" placeholder="Email" className="w-full bg-[#F0F9FF] border-none p-4 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] outline-none placeholder:text-gray-400" />
        <textarea placeholder="Message" rows="4" className="w-full bg-[#F0F9FF] border-none p-4 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] outline-none resize-none placeholder:text-gray-400"></textarea>
        
        <button className="bg-[#0EA5E9] text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-sky-50 transition-all flex items-center gap-2">
          Send Message <Rocket size={20} />
        </button>
      </form>
    </div>
  </section>
);

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-sky-100 font-sans selection:bg-[#0EA5E9] selection:text-white">
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Journey />
      <Certificates />
      <Contact />
      
      <footer className="text-center py-12 text-gray-400 text-sm">
        © 2025 Vladi Georgiev.
      </footer>
    </div>
  );
}