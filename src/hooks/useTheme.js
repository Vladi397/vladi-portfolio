import { useState, useEffect } from "react";
import { flushSync } from "react-dom"; // Needed to force React to update DOM immediately

export default function useTheme() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove old, add new
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = async (e) => {
    // 1. Check if browser supports View Transitions. If not, just toggle.
    if (!document.startViewTransition) {
      setTheme((prev) => (prev === "light" ? "dark" : "light"));
      return;
    }

    // 2. Capture the click position (or center of screen if no event)
    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;

    // 3. Calculate distance to the furthest corner
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // 4. Start the transition
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
      });
    });

    // 5. Animate the circle clip path
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return { theme, toggleTheme };
}