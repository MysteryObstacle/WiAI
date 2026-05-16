"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useVoteGraphMotion(versionKey: string) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = ref.current;
    if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const context = gsap.context(() => {
      const edges = target.querySelectorAll(".vote-graph-edge");

      edges.forEach((edge) => {
        const line = edge as SVGLineElement;
        const length = Math.hypot(
          Number(line.getAttribute("x2")) - Number(line.getAttribute("x1")),
          Number(line.getAttribute("y2")) - Number(line.getAttribute("y1"))
        );

        gsap.fromTo(
          line,
          { autoAlpha: 0, strokeDasharray: length, strokeDashoffset: length },
          {
            autoAlpha: 1,
            strokeDashoffset: 0,
            duration: 0.24,
            ease: "power1.out",
            overwrite: "auto",
            clearProps: "opacity,visibility,strokeDasharray,strokeDashoffset"
          }
        );
      });
    }, target);

    return () => context.revert();
  }, [versionKey]);

  return ref;
}
