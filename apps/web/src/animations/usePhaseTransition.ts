"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function usePhaseTransition(phaseVersion: number) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = ref.current;
    if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        target,
        { y: 8, autoAlpha: 0.94 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.24,
          ease: "power2.out",
          overwrite: "auto",
          clearProps: "transform,opacity,visibility"
        }
      );
    }, target);

    return () => context.revert();
  }, [phaseVersion]);

  return ref;
}
