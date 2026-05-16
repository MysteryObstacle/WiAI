"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useSettlementReveal(phaseVersion: number) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = ref.current;
    if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const targets = target.querySelectorAll(".settlement-hero, .role-card, .vote-row");
    if (targets.length === 0) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        targets,
        { y: 14, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.32,
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
