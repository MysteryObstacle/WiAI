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
        { autoAlpha: 0.96 },
        {
          autoAlpha: 1,
          duration: 0.18,
          ease: "power1.out",
          overwrite: "auto",
          clearProps: "opacity,visibility"
        }
      );
    }, target);

    return () => context.revert();
  }, [phaseVersion]);

  return ref;
}
