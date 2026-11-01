import React from "react";
import { useInViewOnce } from "./utils";

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

/*
  Section heading.

  No rule under it. The gradient bar belongs to the project title alone now
  (see BleedHeading, used from ProjectExpand): a page carrying four or five
  subheads was repeating the same device the whole way down, which left the
  title with nothing to mark it out as the top of the page.
*/
export function SectionHead({ children, id }) {
  return (
    <h3
      id={id}
      className="mb-6 sm:mb-8 text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white"
    >
      {children}
    </h3>
  );
}
