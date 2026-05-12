import { describe, expect, it } from "vitest";
import {
  createRandomGlyphBursts,
  createTitleGlyphs,
  displaceGlyphPoint
} from "./glyphMatrix";

describe("glyph matrix helpers", () => {
  it("creates title glyphs for Who is AI?", () => {
    const glyphs = createTitleGlyphs({
      text: "Who is AI?",
      cellSize: 8,
      originX: 100,
      originY: 50
    });

    expect(glyphs.length).toBeGreaterThan(120);
    expect(glyphs.some((glyph) => glyph.layer === "title")).toBe(true);
    expect(glyphs.every((glyph) => glyph.baseX >= 100)).toBe(true);
  });

  it("keeps upper and lower case title glyph shapes distinct", () => {
    const upper = createTitleGlyphs({
      text: "I",
      cellSize: 8,
      originX: 0,
      originY: 0
    });
    const lower = createTitleGlyphs({
      text: "i",
      cellSize: 8,
      originX: 0,
      originY: 0
    });

    expect(upper).not.toEqual(lower);
    expect(upper.length).toBeGreaterThan(lower.length);
  });

  it("creates deterministic random glyph bursts", () => {
    const first = createRandomGlyphBursts({
      count: 5,
      seed: 42,
      width: 1000,
      height: 520,
      cellSize: 8
    });
    const second = createRandomGlyphBursts({
      count: 5,
      seed: 42,
      width: 1000,
      height: 520,
      cellSize: 8
    });

    expect(second).toEqual(first);
    expect(first.length).toBeGreaterThan(20);
    expect(first.every((glyph) => glyph.layer === "burst")).toBe(true);
  });

  it("pushes glyphs away from the pointer inside the radius", () => {
    const result = displaceGlyphPoint(
      { baseX: 100, baseY: 100, x: 100, y: 100, char: "W", brightness: 1, layer: "title" },
      { x: 90, y: 100, radius: 40, strength: 20 }
    );

    expect(result.x).toBeGreaterThan(100);
    expect(result.y).toBe(100);
  });
});
