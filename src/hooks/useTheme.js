// src/hooks/useTheme.js
import { useState, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";

function getInitialTheme() {
  // 1. Check if the user has a saved preference from a previous visit
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
  }

  // 2. If no saved preference, DEFAULT TO DARK
  return "dark";
}

function applyTheme(nextTheme) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  // This toggles the 'dark' class: adds it if nextTheme is 'dark', removes if 'light'
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

      // Fallback if browser doesn't support View Transitions
      if (!document.startViewTransition) {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        applyTheme(next);

        setTimeout(() => {
          delete root.dataset.themeSwitching;
        }, DURATION + 50);

        return;
      }

      // Get click coordinates for the circle animation
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
        // Apply immediately so the view transition snapshots match perfectly
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

      // Cleanup the switching flag
      setTimeout(() => {
        delete root.dataset.themeSwitching;
      }, DURATION + 50);
    },
    [theme]
  );

  return { theme, toggleTheme };
}
