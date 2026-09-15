// src/hooks/useTheme.js
import { useState, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";

function getInitialTheme() {
  // 1. Check if the user has a saved preference from a previous visit
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
  }

  // 2. First visit (no saved preference): start in light mode
  return "light";
}

// Centre of the theme toggle that was used. Prefers the button that fired the
// event; otherwise the visible toggle on the page (desktop or mobile navbar);
// the pointer and then the window centre are last resorts only.
function getToggleOrigin(e) {
  const centre = (el) => {
    const r = el?.getBoundingClientRect?.();
    return r && r.width > 0 && r.height > 0
      ? { x: r.left + r.width / 2, y: r.top + r.height / 2 }
      : null;
  };

  const fromEvent = centre(e?.currentTarget);
  if (fromEvent) return fromEvent;

  for (const el of document.querySelectorAll("[data-theme-toggle]")) {
    const c = centre(el);
    if (c) return c;
  }

  if (typeof e?.clientX === "number" && (e.clientX !== 0 || e.clientY !== 0)) {
    return { x: e.clientX, y: e.clientY };
  }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
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

      // The circle always grows out of the sun/moon button itself. Pointer
      // coordinates were unreliable: keyboard activation reports 0,0 and a
      // missing value fell back to the middle of the window, which on most
      // screens sits over "Projects" in the nav. currentTarget is only valid
      // synchronously, so the rect is read before anything else happens.
      const origin = getToggleOrigin(e);
      const x = origin.x;
      const y = origin.y;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const endRadius = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y));

      // Express the circle in percentages of the snapshot, not px. With Windows
      // display scaling or browser zoom (e.g. 150%), Chrome can lay out the
      // view-transition snapshot in a different pixel space than the page, so a
      // px centre landed at x/1.5 (over "Projects") instead of on the toggle.
      // Percentages resolve against the snapshot's own box, so they stay put.
      // A circle's % radius is relative to sqrt(w² + h²) / √2.
      const cx = (x / vw) * 100;
      const cy = (y / vh) * 100;
      const endPct = (endRadius / (Math.hypot(vw, vh) / Math.SQRT2)) * 100;

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
              `circle(0% at ${cx}% ${cy}%)`,
              `circle(${endPct}% at ${cx}% ${cy}%)`,
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
