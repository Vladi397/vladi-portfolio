import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.005 + 0.002,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 163, 184, ${s.alpha * 0.6})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* 404 */}
        <div className="relative mb-8 inline-block">
          <span
            className="text-[160px] sm:text-[220px] font-black leading-none select-none"
            style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #0ea5e9 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 4s linear infinite",
              filter: "drop-shadow(0 0 40px rgba(139,92,246,0.3))",
            }}
          >
            404
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
          Looks like you wandered into the void. This page doesn&apos;t exist&nbsp;—
          but my portfolio does.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 text-slate-300 hover:text-white hover:border-white/30 transition-all font-semibold"
          >
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.03] active:scale-95"
            style={{
              background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)",
            }}
          >
            <Home size={18} />
            Back to Home
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
