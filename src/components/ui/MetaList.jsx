import React from "react";

/*
  MetaList
  --------
  Short metadata that reads as a list — a role, a stack, a place, a marker.
  These parts used to be strung together with "•" or "·". Dots between words
  are the house style of every generated portfolio on the internet, and this
  site separates things with rules everywhere else, so these do too: a thin
  upright hairline between the parts, in the text's own colour.

  Takes either an array of parts or a string, in which case the dot is still
  the delimiter in the translations — never rendered, so the copy keeps
  reading naturally in a JSON file and translators have nothing new to learn.
  A string with no delimiter is passed straight through untouched.

  A screen reader gets a comma between the parts, because neighbouring flex
  items would otherwise be announced as one run-on word.
*/

const DELIMITER = /\s*[•·]\s*/;

export default function MetaList({ as = "p", children, className = "", ...rest }) {
  const Tag = as;
  const parts = Array.isArray(children)
    ? children.filter(Boolean)
    : typeof children === "string"
      ? children.split(DELIMITER).filter(Boolean)
      : [];

  if (parts.length < 2) {
    return (
      <Tag className={className} {...rest}>
        {parts.length === 1 ? parts[0] : children}
      </Tag>
    );
  }

  return (
    <Tag className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 ${className}`} {...rest}>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <>
              <span className="sr-only">, </span>
              <span aria-hidden="true" className="h-[0.85em] w-px bg-current opacity-30" />
            </>
          )}
          <span>{part}</span>
        </React.Fragment>
      ))}
    </Tag>
  );
}
