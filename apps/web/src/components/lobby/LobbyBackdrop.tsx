"use client";

import gsap from "gsap";
import { useEffect, useLayoutEffect, useRef } from "react";
import {
  createTitleGlyphs,
  displaceGlyphPoint,
  type GlyphPoint
} from "./glyphMatrix";

interface LobbyBackdropProps {
  isActive?: boolean;
}

const MATRIX_CHARS = ["W", "h", "o", "i", "s", "A", "I", "?", "0", "1", "/", ":", ".", "*", "+", "-"];
const TITLE_TEXT = "Who is AI?";

interface RenderState {
  intro: number;
  flicker: number;
  pointerStrength: number;
}

interface PointerState {
  x: number;
  y: number;
  active: boolean;
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function matrixChar(index: number, tick = 0): string {
  return MATRIX_CHARS[(index + tick) % MATRIX_CHARS.length] ?? ".";
}

function boundsFor(glyphs: GlyphPoint[]) {
  return glyphs.reduce(
    (bounds, glyph) => ({
      minX: Math.min(bounds.minX, glyph.baseX),
      minY: Math.min(bounds.minY, glyph.baseY),
      maxX: Math.max(bounds.maxX, glyph.baseX),
      maxY: Math.max(bounds.maxY, glyph.baseY)
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );
}

function translateGlyphs(glyphs: GlyphPoint[], dx: number, dy: number): GlyphPoint[] {
  return glyphs.map((glyph) => ({
    ...glyph,
    baseX: glyph.baseX + dx,
    baseY: glyph.baseY + dy,
    x: glyph.x + dx,
    y: glyph.y + dy
  }));
}

function createAmbientGlyphs(width: number, height: number, cellSize: number): GlyphPoint[] {
  const random = seededRandom(Math.round(width * 17 + height * 31));
  const glyphs: GlyphPoint[] = [];
  let sequence = 0;

  for (let y = cellSize / 2; y < height; y += cellSize) {
    for (let x = cellSize / 2; x < width; x += cellSize) {
      glyphs.push({
        baseX: x,
        baseY: y,
        x,
        y,
        char: matrixChar(sequence++),
        brightness: 0.12 + random() * 0.22,
        layer: "ambient"
      });
    }
  }

  return glyphs;
}

function createTitleLayout(width: number, height: number, cellSize: number) {
  const rawGlyphs = createTitleGlyphs({
    text: TITLE_TEXT,
    cellSize,
    originX: 0,
    originY: 0
  });
  const bounds = boundsFor(rawGlyphs);
  const titleWidth = bounds.maxX - bounds.minX;
  const titleHeight = bounds.maxY - bounds.minY;
  const dx = width / 2 - titleWidth / 2 - bounds.minX;
  const dy = height * 0.44 - titleHeight / 2 - bounds.minY;
  const glyphs = translateGlyphs(rawGlyphs, dx, dy);

  return {
    glyphs,
    bounds: boundsFor(glyphs)
  };
}

export function LobbyBackdrop({ isActive = true }: LobbyBackdropProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runnerRef = useRef<{
    rafId: number;
    running: boolean;
    draw: ((time: number) => void) | null;
  }>({ rafId: 0, running: false, draw: null });
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state: RenderState = {
      intro: reduceMotion ? 1 : 0,
      flicker: reduceMotion ? 0.12 : 0.32,
      pointerStrength: 0
    };
    const pointer: PointerState = { x: 0, y: 0, active: false };
    let ambientGlyphs: GlyphPoint[] = [];
    let titleGlyphs: GlyphPoint[] = [];
    let titleBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    let width = 0;
    let height = 0;
    let startedAt = performance.now();

    const rebuildGlyphs = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const titleCellSize = Math.max(7, Math.min(13, width / 118));
      const ambientCellSize = Math.max(7, Math.min(11, width / 150));
      const titleLayout = createTitleLayout(width, height, titleCellSize);
      titleGlyphs = titleLayout.glyphs;
      titleBounds = titleLayout.bounds;
      ambientGlyphs = createAmbientGlyphs(width, height, ambientCellSize);
    };

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        state.intro = 1;
        return;
      }

      gsap.to(state, { intro: 1, duration: 1.4, ease: "power2.out" });
      gsap.to(state, {
        flicker: 0.88,
        duration: 0.68,
        repeat: -1,
        yoyo: true,
        ease: "rough({ template: none.out, strength: 1.4, points: 12, taper: none, randomize: true, clamp: true })"
      });
    }, canvas);

    const drawGlyph = (
      glyph: GlyphPoint,
      index: number,
      time: number,
      options: { alpha: number; lightness: number; size: number }
    ) => {
      const flicker = reduceMotion ? 0 : Math.sin(time * (0.008 + index * 0.00009) + index) * state.flicker;
      const swapTick = Math.floor(time / (reduceMotion ? 9000 : 95));
      const alpha = Math.max(0, Math.min(1, options.alpha * (glyph.brightness + flicker * 0.16) * state.intro));
      if (alpha <= 0.01) return;

      context.fillStyle = `oklch(${options.lightness}% 0.01 250 / ${alpha})`;
      context.font = `700 ${options.size}px "Geist Mono", "Geist Mono Fallback", ui-monospace, monospace`;
      context.fillText(matrixChar(index, swapTick), glyph.x, glyph.y);
    };

    const draw = (time: number) => {
      if (!isActiveRef.current) {
        runnerRef.current.running = false;
        return;
      }
      const elapsed = time - startedAt;
      context.clearRect(0, 0, width, height);
      context.fillStyle = "oklch(8% 0.01 250)";
      context.fillRect(0, 0, width, height);

      context.save();
      context.textAlign = "center";
      context.textBaseline = "middle";

      ambientGlyphs.forEach((glyph) => {
        const cell = Math.max(2.2, Math.min(4, width / 330));
        context.fillStyle = `oklch(42% 0.005 250 / ${0.2 + glyph.brightness * 0.2})`;
        context.fillRect(glyph.baseX - cell / 2, glyph.baseY - cell / 2, cell, cell);
      });

      titleGlyphs.forEach((glyph, index) => {
        let target = { ...glyph, x: glyph.baseX, y: glyph.baseY };
        if (!reduceMotion && state.pointerStrength > 0.01 && pointer.active) {
          target = displaceGlyphPoint(glyph, {
            x: pointer.x,
            y: pointer.y,
            radius: Math.max(110, width * 0.11),
            strength: state.pointerStrength
          });
        }

        glyph.x += (target.x - glyph.x) * 0.18;
        glyph.y += (target.y - glyph.y) * 0.18;
        drawGlyph(glyph, index + 6000, elapsed, { alpha: 1.35, lightness: 98, size: 13 });
      });

      context.restore();
      runnerRef.current.rafId = window.requestAnimationFrame(draw);
    };
    runnerRef.current.draw = draw;

    const isInsideTitleHotspot = (x: number, y: number) =>
      x >= titleBounds.minX - 80 &&
      x <= titleBounds.maxX + 80 &&
      y >= titleBounds.minY - 80 &&
      y <= titleBounds.maxY + 80;

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = isInsideTitleHotspot(pointer.x, pointer.y);

      if (reduceMotion) return;
      gsap.to(state, {
        pointerStrength: pointer.active ? 52 : 0,
        duration: pointer.active ? 0.28 : 0.85,
        ease: "power3.out"
      });
    };

    const clearPointer = () => {
      pointer.active = false;
      gsap.to(state, { pointerStrength: 0, duration: 0.85, ease: "power3.out" });
    };

    rebuildGlyphs();
    startedAt = performance.now();
    if (isActiveRef.current) {
      runnerRef.current.running = true;
      runnerRef.current.rafId = window.requestAnimationFrame(draw);
    }
    window.addEventListener("resize", rebuildGlyphs);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", clearPointer);
    window.addEventListener("blur", clearPointer);

    return () => {
      window.cancelAnimationFrame(runnerRef.current.rafId);
      runnerRef.current.running = false;
      runnerRef.current.draw = null;
      window.removeEventListener("resize", rebuildGlyphs);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", clearPointer);
      window.removeEventListener("blur", clearPointer);
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    const runner = runnerRef.current;
    if (isActive) {
      if (!runner.running && runner.draw) {
        runner.running = true;
        runner.rafId = window.requestAnimationFrame(runner.draw);
      }
    } else if (runner.running) {
      window.cancelAnimationFrame(runner.rafId);
      runner.running = false;
    }
  }, [isActive]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-background" aria-hidden>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
