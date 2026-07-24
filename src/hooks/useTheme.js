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

      // The starfield canvas is what makes this expensive: the browser has to
      // rasterise it into both view-transition snapshots while it keeps
      // drawing. Parking it for the switch took the blocking frame from a
      // ~340ms median to ~0ms, which matters because anything over the 320ms
      // duration swallows the wipe entirely. Same events ProjectExpand uses.
      window.dispatchEvent(new Event("universe:pause"));
      const resumeUniverse = () => {
        // Don't un-pause if a full-screen overlay is the reason it's parked.
        if (!document.querySelector('[role="dialog"]')) {
          window.dispatchEvent(new Event("universe:resume"));
        }
      };

      const DURATION = 320;
      const EASING = "linear";

      // Fallback if browser doesn't support View Transitions
      if (!document.startViewTransition) {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        applyTheme(next);

        setTimeout(() => {
          delete root.dataset.themeSwitching;
          resumeUniverse();
        }, DURATION + 50);

        return;
      }

      // Where the circular reveal starts. Prefer the pointer, but fall back to
      // the toggle itself rather than the middle of the screen: a keyboard
      // activation reports clientX/clientY of 0, and a synthetic call has no
      // coordinates at all, so the wipe used to start from the wrong place.
      // currentTarget is read synchronously here, before any await.
      const rect = e?.currentTarget?.getBoundingClientRect?.();
      const hasPointer =
        typeof e?.clientX === "number" &&
        typeof e?.clientY === "number" &&
        (e.clientX !== 0 || e.clientY !== 0);

      const x = hasPointer
        ? e.clientX
        : rect
          ? rect.left + rect.width / 2
          : window.innerWidth / 2;
      const y = hasPointer
        ? e.clientY
        : rect
          ? rect.top + rect.height / 2
          : window.innerHeight / 2;

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const nextTheme = theme === "light" ? "dark" : "light";

      // Dispatching the pause above is not enough on its own: React has to
      // actually apply frameloop="never" to the canvas before the browser
      // rasterises its snapshots, and that cannot happen in this same task.
      // Yield two frames first. The coordinates above are already captured, so
      // nothing here depends on the event any more, and ~32ms is imperceptible
      // against the 320ms wipe.
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );

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

      // Restart the background a beat later. Spinning the scene back up costs
      // a frame or two of its own, and at DURATION + 50 that landed right on
      // the tail of the wipe; pushing it out keeps the animation clean.
      setTimeout(resumeUniverse, DURATION + 260);
    },
    [theme]
  );

  return { theme, toggleTheme };
}
