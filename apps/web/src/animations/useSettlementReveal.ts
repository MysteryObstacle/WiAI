"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useSettlementReveal(phaseVersion: number) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.fromTo(
      ref.current.querySelectorAll(".settlement-hero, .role-card, .vote-row"),
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.32, stagger: 0.06, ease: "power2.out" }
    );
  }, [phaseVersion]);

  return ref;
}
