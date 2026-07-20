import { useState, useEffect } from "react";

const useActiveSection = (sectionIds) => {
  const [active, setActive] = useState(sectionIds[0] ?? "home");

  useEffect(() => {
    let io = null;
    let rafId = 0;
    let tries = 0;
    const ratios = new Map();

    const attach = () => {
      const els = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

      // The sections mount a tick after this effect (they live inside a
      // Suspense-wrapped route). If they aren't in the DOM yet, retry on the
      // next frame instead of giving up permanently — that "give up on empty"
      // was why the navbar highlight froze on the first section. Capped so the
      // 404 route (no sections) doesn't spin forever.
      if (!els.length) {
        if (tries++ < 180) rafId = requestAnimationFrame(attach);
        return;
      }

      // Track EVERY section's current visibility and pick the global maximum —
      // comparing only the sections in a single observer callback let the
      // highlight stick when scrolling past one. Fine-grained thresholds also
      // matter: the Projects section is several viewports tall, so its ratio
      // caps around 0.14 and would never cross a coarse 0.2 threshold.
      els.forEach((el) => ratios.set(el.id, 0));

      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
          }
          let best = null;
          let bestRatio = 0;
          for (const [id, ratio] of ratios) {
            if (ratio > bestRatio) {
              bestRatio = ratio;
              best = id;
            }
          }
          // Only update when something is on screen; otherwise (very top of the
          // page, or footer below the last section) keep the last active link.
          if (best) setActive(best);
        },
        { threshold: [0, 0.05, 0.1, 0.15, 0.25, 0.4, 0.55, 0.7, 0.85, 1] }
      );

      els.forEach((el) => io.observe(el));
    };

    attach();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (io) io.disconnect();
    };
  }, [sectionIds]);

  return active;
};

export default useActiveSection;
