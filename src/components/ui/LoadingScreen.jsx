import React, { useState, useEffect } from "react";

const LoadingScreen = ({ onComplete }) => {
  const [text, setText] = useState("");
  const fullText = "Hello Vladi..."; // You can change this text
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setText((prev) => prev + fullText[index]);
        setIndex((prev) => prev + 1);
      }, 100); // Typing speed
      return () => clearTimeout(timeout);
    } else {
      // Once typing is done, wait a bit and then finish
      const timeout = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [index, fullText, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-center">
      {/* Blinking Cursor Text */}
      <div className="text-4xl md:text-6xl font-bold font-mono">
        {text}
        <span className="animate-pulse">_</span>
      </div>

      {/* Loading Bar */}
      <div className="w-[200px] h-[2px] bg-gray-800 rounded mt-4 overflow-hidden relative">
        <div className="absolute top-0 left-0 h-full bg-[#0EA5E9] animate-progress"></div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2.5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;