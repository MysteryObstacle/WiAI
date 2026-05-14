"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useRevealTimeline(phaseVersion: number) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = ref.current;
    if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const targets = Array.from(target.children);
    if (targets.length === 0) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        targets,
        { y: 10, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.24,
          stagger: 0.06,
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
