// src/hooks/useTheme.js
import { useState, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";

function getInitialTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;
  return "light";
}

function applyTheme(nextTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", nextTheme === "dark");
  localStorage.setItem("theme", nextTheme);
}

export default function useTheme() {
  const [theme, setTheme] = useState(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(
    async (e) => {
      const root = document.documentElement;

      root.dataset.themeSwitching = "true";

      const DURATION = 320;
      const EASING = "linear";

      // fallback if no view transitions
      if (!document.startViewTransition) {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        applyTheme(next);

        setTimeout(() => {
          delete root.dataset.themeSwitching;
        }, DURATION + 50);

        return;
      }

      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const nextTheme = theme === "light" ? "dark" : "light";

      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setTheme(nextTheme);
        });
        // apply immediately so the view transition snapshots match perfectly
        applyTheme(nextTheme);
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: DURATION,
            easing: EASING,
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });

      // remove switching flag quickly based on duration
      setTimeout(() => {
        delete root.dataset.themeSwitching;
      }, DURATION + 50);
    },
    [theme]
  );

  return { theme, toggleTheme };
}
