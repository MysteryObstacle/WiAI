"use client";

import { useEffect, useState, type RefObject } from "react";

export function useHeroVisibility(ref: RefObject<HTMLElement | null>): boolean {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsVisible(entry.intersectionRatio > 0.05);
        }
      },
      { threshold: [0, 0.05, 0.5] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return isVisible;
}
