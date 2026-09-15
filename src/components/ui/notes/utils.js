import { useEffect, useRef, useState } from "react";

// hex (#rgb or #rrggbb) → rgba() string.
export const hexA = (hex, a) => {
  const n = String(hex).replace("#", "");
  const f = n.length === 3 ? n.split("").map((c) => c + c).join("") : n;
  const r = parseInt(f.slice(0, 2), 16);
  const g = parseInt(f.slice(2, 4), 16);
  const b = parseInt(f.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

// One-shot "has this scrolled into view" flag. The detail panel is a fixed,
// full-viewport scroller, so the default (viewport) root tracks it correctly.
export function useInViewOnce(disabled = false, rootMargin = "0px 0px -12% 0px") {
  const ref = useRef(null);
  const [inView, setInView] = useState(disabled);
  useEffect(() => {
    if (disabled || inView) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [disabled, inView, rootMargin]);
  return [ref, inView];
}
