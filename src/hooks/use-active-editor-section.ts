"use client";

import { useEffect, useState } from "react";

type UseActiveEditorSectionOptions = {
  sectionIds: string[];
  /** Intersection ratio to consider a section active */
  threshold?: number;
};

export const useActiveEditorSection = ({ sectionIds, threshold = 0.35 }: UseActiveEditorSectionOptions) => {
  const [activeSectionId, setActiveSectionId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const elements = sectionIds
      .map((id) => document.getElementById(`edit-${id}`))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id.replace(/^edit-/, "");
          ratios.set(id, entry.intersectionRatio);
        }

        let bestId = sectionIds[0] ?? "";
        let bestRatio = 0;

        for (const id of sectionIds) {
          const ratio = ratios.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }

        if (bestRatio >= threshold) {
          setActiveSectionId(bestId);
        }
      },
      {
        threshold: [0, 0.15, 0.35, 0.5, 0.75, 1],
        rootMargin: "-80px 0px -40% 0px",
      },
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [sectionIds, threshold]);

  return activeSectionId;
};
