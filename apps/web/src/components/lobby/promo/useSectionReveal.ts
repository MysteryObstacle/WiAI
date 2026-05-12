"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

interface UseSectionRevealOptions {
  selector?: string;
  staggerSec?: number;
  threshold?: number;
}

export function useSectionReveal<T extends HTMLElement>(
  options: UseSectionRevealOptions = {}
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    const selector = options.selector ?? "[data-reveal]";
    const staggerSec = options.staggerSec ?? 0.06;
    const threshold = options.threshold ?? 0.25;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = Array.from(host.querySelectorAll<HTMLElement>(selector));

    if (targets.length === 0) return;

    if (reduceMotion) {
      gsap.set(targets, { autoAlpha: 1, y: 0 });
      return;
    }

    gsap.set(targets, { autoAlpha: 0, y: 16 });

    let played = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !played) {
            played = true;
            gsap.to(targets, {
              autoAlpha: 1,
              y: 0,
              duration: 0.55,
              stagger: staggerSec,
              ease: "power2.out"
            });
            observer.disconnect();
            break;
          }
        }
      },
      { threshold }
    );

    observer.observe(host);
    return () => observer.disconnect();
  }, [options.selector, options.staggerSec, options.threshold]);

  return ref;
}
