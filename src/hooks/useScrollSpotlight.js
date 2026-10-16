import { useEffect, useRef, useState } from "react";
import { hasHover } from "./usePointerKind";

/*
  useScrollSpotlight
  ------------------
  The touch stand-in for :hover. On a phone the cursor is the scroll position,
  so instead of lighting a card up when a pointer lands on it, we light it up
  while it sits in a band across the middle of the screen — the card you are
  looking at is the card that tilts, glows and drifts, and it settles back down
  as you scroll past.

  Returns { ref, active }:
    • attach `ref` to the element,
    • `active` is true while it crosses the band — and *always false* on pointer
      devices, which keep their hover behaviour untouched.

  Deliberately cheap, because this runs on the weakest phones: one
  IntersectionObserver per element, no scroll listener, nothing per frame. The
  observer isn't even created on a hover device.

  Options:
    band – how much of the viewport counts as "the middle", as a fraction
           trimmed off each end. 0.3 → the middle 40% of the screen.
    once – latch on the first crossing and stop observing (for one-shot
           flourishes like a glare sweep that shouldn't re-fire on every pass).
*/

export default function useScrollSpotlight({ band = 0.3, once = false } = {}) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const [touch] = useState(() => !hasHover());

  useEffect(() => {
    if (!touch) return undefined;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          if (once) io.disconnect();
        } else if (!once) {
          setActive(false);
        }
      },
      // Negative top/bottom margins shrink the root to the middle band.
      { rootMargin: `-${Math.round(band * 100)}% 0px` }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [band, once, touch]);

  return { ref, active, touch };
}
