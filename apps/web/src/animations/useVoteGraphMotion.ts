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
      const nodes = target.querySelectorAll(".vote-graph-node");
      const edges = target.querySelectorAll(".vote-graph-edge");
      const selected = target.querySelectorAll(".vote-graph-selected");

      gsap.fromTo(
        nodes,
        { autoAlpha: 0, scale: 0.96 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.2,
          stagger: 0.025,
          ease: "power2.out",
          overwrite: "auto",
          clearProps: "opacity,visibility,transform"
        }
      );

      if (edges.length > 0) {
        gsap.fromTo(
          edges,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.18,
            ease: "power1.out",
            overwrite: "auto",
            clearProps: "opacity,visibility"
          }
        );
      }

      if (selected.length > 0) {
        gsap.fromTo(
          selected,
          { scale: 1 },
          {
            scale: 1.06,
            duration: 0.12,
            yoyo: true,
            repeat: 1,
            ease: "power1.out",
            overwrite: "auto",
            clearProps: "transform"
          }
        );
      }
    }, target);

    return () => context.revert();
  }, [versionKey]);

  return ref;
}
