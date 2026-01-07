import React, { useEffect, useRef } from "react";

const Starfield = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let stars = [];

    // SETTINGS
    const numStars = 200;
    const speed = 2;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStars = () => {
      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * canvas.width, // Depth
          o: Math.random(), // Opacity
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Check if we are in Dark Mode or Light Mode
      const isDark = document.documentElement.classList.contains("dark");
      
      // Set Color: White for Dark Mode, Slate-800 for Light Mode
      const starColor = isDark ? "255, 255, 255" : "30, 41, 59"; 

      stars.forEach((star) => {
        star.z -= speed;

        if (star.z <= 0) {
          star.z = canvas.width;
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
        }

        const k = 128.0 / star.z;
        const px = (star.x - cx) * k + cx;
        const py = (star.y - cy) * k + cy;

        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          const size = (1 - star.z / canvas.width) * 3;
          const opacity = (1 - star.z / canvas.width);

          ctx.fillStyle = `rgba(${starColor}, ${opacity})`;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    resize();
    createStars();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      // Removed 'opacity-0' logic. Now it's always visible (opacity-100).
      className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-700 opacity-50 dark:opacity-100" 
    />
  );
};

export default Starfield;