"use client";

import gsap from "gsap";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createIntelPanels, type IntelPanel } from "./lobbyIntel";

interface LobbyIntelOverlayProps {
  isActive?: boolean;
}

function createRuntimeSeed(): number {
  return Math.floor(Math.random() * 1_000_000_000);
}

const FADE_IN_SEC = 0.65;
const FADE_OUT_SEC = 0.75;

function createRuntimePanels(): IntelPanel[] {
  return createIntelPanels({
    seed: createRuntimeSeed(),
    count: 3 + Math.floor(Math.random() * 2)
  });
}

export function LobbyIntelOverlay({ isActive = true }: LobbyIntelOverlayProps = {}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cycleTimerRef = useRef<number | null>(null);
  const isActiveRef = useRef(isActive);
  const runCycleRef = useRef<(() => void) | null>(null);
  isActiveRef.current = isActive;
  const [panels, setPanels] = useState<IntelPanel[]>([]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setPanels(createIntelPanels({ seed: 20260511, count: 2 }));
      window.requestAnimationFrame(() => {
        gsap.set(root.querySelectorAll("[data-intel-panel]"), { autoAlpha: 0.28 });
      });
      return;
    }

    let isDisposed = false;

    const clearCycleTimer = () => {
      if (cycleTimerRef.current !== null) {
        window.clearTimeout(cycleTimerRef.current);
        cycleTimerRef.current = null;
      }
    };

    const runCycle = () => {
      if (isDisposed || !isActiveRef.current) return;

      const nextPanels = createRuntimePanels();
      setPanels(nextPanels);

      window.requestAnimationFrame(() => {
        if (isDisposed || !rootRef.current) return;

        const panelElements = Array.from(rootRef.current.querySelectorAll("[data-intel-panel]"));
        const fadeMs = (FADE_IN_SEC + FADE_OUT_SEC) * 1000;
        const totalMs = Math.max(
          ...nextPanels.map((panel) => panel.delayMs + panel.visibleMs + fadeMs),
          3200
        );
        gsap.killTweensOf(panelElements);

        panelElements.forEach((element, index) => {
          const panel = nextPanels[index];
          if (!panel) return;

          gsap
            .timeline({ delay: panel.delayMs / 1000 })
            .fromTo(
              element,
              { autoAlpha: 0, y: 6, scale: 0.985 },
              {
                autoAlpha: 0.78,
                y: 0,
                scale: 1,
                duration: FADE_IN_SEC,
                ease: "power2.out"
              }
            )
            .to(element, { autoAlpha: 0.78, duration: panel.visibleMs / 1000, ease: "none" })
            .to(element, {
              autoAlpha: 0,
              y: -3,
              duration: FADE_OUT_SEC,
              ease: "power2.in"
            });
        });

        cycleTimerRef.current = window.setTimeout(() => {
          cycleTimerRef.current = window.setTimeout(runCycle, 900 + Math.random() * 1100);
        }, totalMs + 400);
      });
    };

    const ctx = gsap.context(() => {
      runCycleRef.current = runCycle;
      runCycle();
    }, root);

    return () => {
      isDisposed = true;
      clearCycleTimer();
      runCycleRef.current = null;
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (!isActive) {
      if (cycleTimerRef.current !== null) {
        window.clearTimeout(cycleTimerRef.current);
        cycleTimerRef.current = null;
      }
      const panelElements = root.querySelectorAll("[data-intel-panel]");
      gsap.killTweensOf(panelElements);
      gsap.to(panelElements, { autoAlpha: 0, duration: 0.3, ease: "power2.in" });
      return;
    }

    if (runCycleRef.current && cycleTimerRef.current === null) {
      runCycleRef.current();
    }
  }, [isActive]);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      {panels.map((panel) => (
        <div
          key={panel.id}
          data-intel-panel
          className="absolute border border-emerald-100/20 bg-black/25 p-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-emerald-50/70 opacity-0 shadow-[0_0_22px_rgba(52,211,153,0.1)] backdrop-blur-[1px]"
          style={{
            left: `${panel.leftPct}%`,
            top: `${panel.topPct}%`,
            width: panel.width,
            minHeight: panel.height
          }}
        >
          <div className="mb-1 flex items-center justify-between gap-2 text-emerald-100">
            <span>{panel.label}</span>
            <span>{panel.value}</span>
          </div>
          <div className="text-emerald-100/55">{panel.detail}</div>
        </div>
      ))}
    </div>
  );
}
