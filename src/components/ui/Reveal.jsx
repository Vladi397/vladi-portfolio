import React, { useEffect, useRef, useState } from "react";

const Reveal = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShow(true);
            io.unobserve(e.target); // one-shot reveal — stop tracking after it fires
          }
        });
      },
      { threshold: 0.15 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Once the slide-up has finished, drop the transform entirely. A lingering
  // transform (even translate(0,0)) turns this element into a backdrop-filter
  // root, which silently kills the frosted-glass blur of any .glass descendant.
  useEffect(() => {
    if (!show) return;
    const id = setTimeout(() => setSettled(true), 700 + delay + 80);
    return () => clearTimeout(id);
  }, [show, delay]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={[
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        show ? "opacity-100" : "opacity-0 translate-y-6",
        settled ? "transform-none" : show ? "translate-y-0" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
};

export default Reveal;
