"use client";

import { useEffect, type ReactNode } from "react";

/** Prevent the iframe document from scrolling — only the in-app preview pane scrolls. */
export const BrandPreviewBodyLock = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.classList.add("h-full", "overflow-hidden");
    body.classList.add("h-full", "overflow-hidden");

    return () => {
      html.classList.remove("h-full", "overflow-hidden");
      body.classList.remove("h-full", "overflow-hidden");
    };
  }, []);

  return <div className="h-full overflow-hidden bg-(--gym-bg)">{children}</div>;
};
