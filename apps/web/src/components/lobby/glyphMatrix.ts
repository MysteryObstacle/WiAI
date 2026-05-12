export type GlyphLayer = "ambient" | "title" | "burst";

export interface GlyphPoint {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  char: string;
  brightness: number;
  layer: GlyphLayer;
}

interface CreateTitleGlyphsOptions {
  text: string;
  cellSize: number;
  originX: number;
  originY: number;
}

interface CreateRandomGlyphBurstsOptions {
  count: number;
  seed: number;
  width: number;
  height: number;
  cellSize: number;
}

interface PointerRepulsion {
  x: number;
  y: number;
  radius: number;
  strength: number;
}

const TITLE_CHARS = ["W", "h", "o", "i", "s", "A", "I", "?", "0", "1", "/", ":", ".", "*", "+", "-"];

const GLYPH_FONT: Record<string, string[]> = {
  W: [
    "##.....##.....##",
    "##.....##.....##",
    "##.....##.....##",
    "##.....##.....##",
    "##.....##.....##",
    "##..##.##..##.##",
    "##..##.##..##.##",
    ".####...#######.",
    ".####...#######.",
    ".###.....#####..",
    ".##.......###..."
  ],
  h: [
    "##.......",
    "##.......",
    "##.......",
    "##.####..",
    "#######..",
    "###..###.",
    "##....##.",
    "##....##.",
    "##....##.",
    "##....##.",
    "##....##."
  ],
  o: [
    ".........",
    ".........",
    "..#####..",
    ".#######.",
    "###...###",
    "##.....##",
    "##.....##",
    "###...###",
    ".#######.",
    "..#####..",
    "........."
  ],
  i: [
    ".....",
    ".##..",
    ".##..",
    ".....",
    "####.",
    ".##..",
    ".##..",
    ".##..",
    ".##..",
    ".##..",
    "#####"
  ],
  s: [
    "........",
    "........",
    ".######.",
    "########",
    "##......",
    ".#####..",
    "..######",
    "......##",
    "########",
    ".######.",
    "........"
  ],
  A: [
    "....##....",
    "...####...",
    "...####...",
    "..##..##..",
    "..##..##..",
    ".########.",
    ".########.",
    "##......##",
    "##......##",
    "##......##",
    "##......##"
  ],
  I: [
    "#######",
    "#######",
    "..###..",
    "..###..",
    "..###..",
    "..###..",
    "..###..",
    "..###..",
    "..###..",
    "#######",
    "#######"
  ],
  "?": [
    ".######.",
    "########",
    "##....##",
    ".....###",
    "....###.",
    "...###..",
    "..###...",
    "..##....",
    "........",
    "..###...",
    "..###..."
  ]
};

function glyphChar(index: number): string {
  return TITLE_CHARS[index % TITLE_CHARS.length] ?? ".";
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function createTitleGlyphs(options: CreateTitleGlyphsOptions): GlyphPoint[] {
  const { text, cellSize, originX, originY } = options;
  const glyphs: GlyphPoint[] = [];
  let cursorX = originX;
  let sequence = 0;

  for (const rawChar of text) {
    if (rawChar === " ") {
      cursorX += cellSize * 4;
      continue;
    }

    const bitmap = GLYPH_FONT[rawChar];
    if (!bitmap) {
      cursorX += cellSize * 4;
      continue;
    }

    bitmap.forEach((row, rowIndex) => {
      [...row].forEach((pixel, columnIndex) => {
        if (pixel !== "#") return;

        const baseX = cursorX + columnIndex * cellSize;
        const baseY = originY + rowIndex * cellSize;
        glyphs.push({
          baseX,
          baseY,
          x: baseX,
          y: baseY,
          char: glyphChar(sequence++),
          brightness: 1,
          layer: "title"
        });
      });
    });

    const width = Math.max(...bitmap.map((row) => row.length));
    cursorX += (width + 2) * cellSize;
  }

  return glyphs;
}

export function createRandomGlyphBursts(options: CreateRandomGlyphBurstsOptions): GlyphPoint[] {
  const { count, seed, width, height, cellSize } = options;
  const random = createSeededRandom(seed);
  const glyphs: GlyphPoint[] = [];
  let sequence = seed;

  for (let index = 0; index < count; index += 1) {
    const originX = cellSize * 3 + random() * Math.max(cellSize, width - cellSize * 6);
    const originY = cellSize * 3 + random() * Math.max(cellSize, height - cellSize * 6);
    const columns = 2 + Math.floor(random() * 7);
    const rows = 2 + Math.floor(random() * 5);
    const density = 0.35 + random() * 0.45;

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        if (random() > density) continue;
        const baseX = Math.round(originX + column * cellSize);
        const baseY = Math.round(originY + row * cellSize);
        glyphs.push({
          baseX,
          baseY,
          x: baseX,
          y: baseY,
          char: glyphChar(sequence++),
          brightness: 0.55 + random() * 0.45,
          layer: "burst"
        });
      }
    }
  }

  return glyphs;
}

export function displaceGlyphPoint(glyph: GlyphPoint, pointer: PointerRepulsion): GlyphPoint {
  const dx = glyph.baseX - pointer.x;
  const dy = glyph.baseY - pointer.y;
  const distance = Math.hypot(dx, dy);

  if (distance === 0 || distance >= pointer.radius || pointer.strength <= 0) {
    return { ...glyph, x: glyph.baseX, y: glyph.baseY };
  }

  const falloff = 1 - distance / pointer.radius;
  const push = falloff * pointer.strength;
  const unitX = dx / distance;
  const unitY = dy / distance;

  return {
    ...glyph,
    x: glyph.baseX + unitX * push,
    y: glyph.baseY + unitY * push
  };
}
