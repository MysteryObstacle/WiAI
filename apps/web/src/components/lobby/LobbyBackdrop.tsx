"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

const SILHOUETTE_LEFT_PCT = [8, 22, 42, 62, 82];

function AbstractSilhouette({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 72"
      aria-hidden
      preserveAspectRatio="xMidYMax meet"
    >
      <circle className="fill-current" cx="24" cy="14" r="9" />
      <path
        className="fill-current"
        d="M8 72 L8 44 Q8 30 24 30 Q40 30 40 44 L40 72 Z"
      />
    </svg>
  );
}

export function LobbyBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const silhouettes = root.querySelectorAll("[data-silhouette]");
      if (reduceMotion) {
        gsap.set(silhouettes, { opacity: 0.35 });
        return;
      }
      silhouettes.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0.12 + i * 0.02 },
          {
            opacity: 0.42 + i * 0.02,
            duration: 2.8 + i * 0.35,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.4
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute inset-0 mix-blend-overlay opacity-[0.07]"
        style={{
          backgroundImage: `repeating-radial-gradient(circle at 17% 19%, var(--foreground) 0, var(--foreground) 0.6px, transparent 0.65px, transparent 2.4px)`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
      <div className="absolute inset-x-0 bottom-0 top-1/2">
        {SILHOUETTE_LEFT_PCT.map((left) => (
          <div
            key={left}
            data-silhouette
            className="absolute bottom-0 h-[min(38vh,14rem)] w-[min(12vw,4.5rem)] -translate-x-1/2 text-muted-foreground/30"
            style={{ left: `${left}%` }}
          >
            <AbstractSilhouette className="h-full w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
