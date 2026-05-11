"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function usePhaseTransition(phaseVersion: number) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.fromTo(
      ref.current,
      { y: 10, opacity: 0.92 },
      { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }
    );
  }, [phaseVersion]);

  return ref;
}
