import { useState } from "react";

/*
  usePointerKind
  --------------
  One place to answer "can this visitor hover?". The site leans on hover for a
  lot of its character (tilt, glare, spotlights, the x-ray lens), and a phone
  gets none of it, so several components need to branch on this and they should
  all branch the same way.

  `(any-hover: hover)` rather than `(pointer: coarse)`: a 2-in-1 laptop has a
  touchscreen but still has a mouse, and it should keep the hover versions.

  Read once on mount, like the rest of the codebase does — a visitor plugging a
  mouse in mid-scroll is not worth a live listener on every card.
*/

const HOVER_QUERY = "(any-hover: hover)";

export function hasHover() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  return window.matchMedia(HOVER_QUERY).matches;
}

export function prefersReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function usePointerKind() {
  const [kind] = useState(() => {
    const hover = hasHover();
    return { hover, touch: !hover };
  });
  return kind;
}
