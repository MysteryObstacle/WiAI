"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useRevealTimeline(phaseVersion: number) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.fromTo(
      Array.from(ref.current.children),
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.28, stagger: 0.08, ease: "power2.out" }
    );
  }, [phaseVersion]);

  return ref;
}
