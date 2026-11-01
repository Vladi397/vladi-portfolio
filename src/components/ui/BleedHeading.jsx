import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/*
  BleedHeading
  ------------
  A heading with a rule that comes in from the left edge of the screen and
  stops where the heading's text stops, so the line arrives at the title
  instead of trailing off after it. It keeps the weight and the brand gradient
  of the short tab it replaced — the same bar, run the full width of the page.

  Two measurements are needed, and both are taken from the heading's own line
  boxes rather than its box, because a heading that fits on one line is as
  wide as its text while one that wraps grows to the full column:

    inset — how far the rule's right end sits from the wrapper's right edge,
            which is what pins it to the end of the text.
    len   — how long the visible part of the rule is, i.e. the distance from
            the screen's left edge to that same point. The bar itself is
            100vw, so most of it hangs off-screen; the gradient has to be
            placed to complete exactly where the visible part ends, or the
            whole sweep would happen out of sight.

  The bar is 100vw because that reaches the screen edge from anywhere at any
  viewport without the heading knowing the page's gutters or max width, and
  overflow past the left of the origin cannot produce a horizontal scrollbar
  the way overflow to the right would.

  Client rects are in painted coordinates, so an ancestor mid-transform
  reports everything scaled — and the detail view opens with exactly such an
  animation, which no ResizeObserver reports because the layout box never
  changes. So the measurement keeps repeating while a transform is in play,
  with a frame budget so a permanently scaled ancestor cannot spin forever.
*/

const SETTLE_FRAMES = 90; // ~1.5s, comfortably longer than the open animation

export default function BleedHeading({
  as = "h3",
  id,
  children,
  from,
  to,
  thickness = 1,
  className = "",
  wrapperClassName = "",
}) {
  const Tag = as;
  const wrapRef = useRef(null);
  const textRef = useRef(null);
  const rafRef = useRef(0);
  const triesRef = useRef(0);
  const [rule, setRule] = useState({ inset: 0, len: 0 });

  // A named function expression, so the retry can schedule itself without the
  // callback referring to the const it is still being assigned to.
  const measure = useCallback(function step() {
    const wrap = wrapRef.current;
    const el = textRef.current;
    if (!wrap || !el || typeof document === "undefined") return;

    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = [...range.getClientRects()];
    if (!rects.length) return;

    const widest = Math.max(...rects.map((r) => r.right));
    const box = wrap.getBoundingClientRect();
    const scale = wrap.offsetWidth > 0 ? box.width / wrap.offsetWidth : 1;
    if (!scale) return;

    setRule({
      inset: Math.max(0, Math.round((box.right - widest) / scale)),
      len: Math.max(0, Math.round(widest / scale)),
    });

    // Still being animated: the numbers above are only true at rest.
    if (Math.abs(scale - 1) > 0.01 && triesRef.current < SETTLE_FRAMES) {
      triesRef.current += 1;
      rafRef.current = requestAnimationFrame(step);
    }
  }, []);

  useLayoutEffect(() => {
    triesRef.current = 0;
    measure();
    const el = textRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    // Covers a resize, a language switch and webfonts landing late.
    const ro = new ResizeObserver(() => {
      triesRef.current = 0;
      measure();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, children]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const tail = to || from;
  return (
    <div ref={wrapRef} className={`relative ${wrapperClassName}`}>
      <Tag id={id} ref={textRef} className={`inline-block max-w-full ${className}`}>
        {children}
      </Tag>
      <span
        aria-hidden="true"
        className="bleed-rule pointer-events-none absolute bottom-0 w-screen rounded-full"
        style={{
          right: rule.inset,
          height: thickness,
          // The sweep is placed to finish at the end of the visible stretch,
          // so it reads the same as the short tab did, just longer.
          background: `linear-gradient(to right, ${from} calc(100% - ${rule.len}px), ${tail} 100%)`,
        }}
      />
    </div>
  );
}
