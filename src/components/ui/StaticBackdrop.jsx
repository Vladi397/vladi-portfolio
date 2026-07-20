import React from "react";

/*
  StaticBackdrop
  --------------
  Graceful stand-in for the WebGL universe: a couple of soft CSS glows echoing
  the nebula's palette. Rendered when WebGL is unavailable (blocked, ancient
  GPU, remote desktop), when the GPU context is lost, or when the 3D background
  crashes — so the site always has a calm backdrop instead of a blank page.
  Deliberately dependency-free (no three.js import).
*/

const StaticBackdrop = () => (
  <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
    <div
      className="absolute -top-40 -left-40 w-[60vw] h-[60vw] rounded-full blur-3xl opacity-25 dark:opacity-20"
      style={{ background: "radial-gradient(closest-side, rgba(14,165,233,0.5), transparent 70%)" }}
    />
    <div
      className="absolute top-1/4 -right-40 w-[50vw] h-[50vw] rounded-full blur-3xl opacity-20 dark:opacity-15"
      style={{ background: "radial-gradient(closest-side, rgba(99,102,241,0.5), transparent 70%)" }}
    />
  </div>
);

export default StaticBackdrop;
