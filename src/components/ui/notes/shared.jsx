import React from "react";
import { useInViewOnce, hexA } from "./utils";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

// Fades a block up once it enters the view. Transform + opacity only.
export function Rise({ as = "div", reduce, delay = 0, className = "", style, children, ...rest }) {
  const Tag = as;
  const [ref, inView] = useInViewOnce(reduce);
  const motion = reduce
    ? undefined
    : {
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(16px)",
        transition: `opacity 600ms ${EASE} ${delay}ms, transform 600ms ${EASE} ${delay}ms`,
      };
  return (
    <Tag ref={ref} className={className} style={{ ...style, ...motion }} {...rest}>
      {children}
    </Tag>
  );
}

// Section heading: the title, then a hairline in the project colour that runs
// to the edge. No icon tile, no numbering.
export function SectionHead({ children, accent, id }) {
  return (
    <div className="mb-6 sm:mb-8 flex items-center gap-4">
      {/* The title may wrap on narrow screens; the rule only needs a little room. */}
      <h3 id={id} className="min-w-0 text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
        {children}
      </h3>
      <span aria-hidden="true" className="h-px min-w-[2.5rem] flex-1" style={{ background: hexA(accent, 0.3) }} />
    </div>
  );
}
