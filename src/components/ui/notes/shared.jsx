import React from "react";
import { useInViewOnce, hexA } from "./utils";
import BleedHeading from "../BleedHeading";

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
  Section heading: the title, with a brand-gradient rule running in from the
  left edge of the screen and stopping where the title stops. See BleedHeading.

  Half the weight of the one under a project title, which is 6px: a subhead
  rule as heavy as the title's would compete with it on a page that carries
  four or five of them.
*/
export function SectionHead({ children, accent, accent2, id }) {
  return (
    <BleedHeading
      id={id}
      from={hexA(accent, 0.55)}
      to={accent2 || accent}
      thickness={3}
      wrapperClassName="mb-6 sm:mb-8"
      className="pb-3 text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white"
    >
      {children}
    </BleedHeading>
  );
}
