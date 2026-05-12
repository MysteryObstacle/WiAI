export interface IntelPanel {
  id: string;
  layer: "intel";
  label: string;
  value: string;
  detail: string;
  leftPct: number;
  topPct: number;
  width: number;
  height: number;
  visibleMs: number;
  delayMs: number;
}

interface CreateIntelPanelsOptions {
  seed: number;
  count: number;
}

const INTEL_LABELS = [
  "ANSWER HASH",
  "VOTE TRACE",
  "SUSPECT MAP",
  "ROUND LOCKED",
  "ROLE: UNKNOWN",
  "DISCUSSION NOISE",
  "CONFIDENCE",
  "ALIBI DELTA"
] as const;

const INTEL_DETAILS = [
  "signal accepted",
  "identity unresolved",
  "vote entropy rising",
  "answer vector drift",
  "human pattern mismatch",
  "reasoning trace split",
  "lobby packet armed",
  "suspect cluster hot"
] as const;

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function randomHex(random: () => number): string {
  return `0x${Math.floor(random() * 0xfffff).toString(16).padStart(5, "0").toUpperCase()}`;
}

function panelPosition(random: () => number): { leftPct: number; topPct: number } {
  const zones = [
    { left: [8, 28], top: [16, 32] },
    { left: [72, 90], top: [16, 32] },
    { left: [8, 28], top: [64, 80] },
    { left: [72, 90], top: [64, 80] }
  ] as const;
  const zone = zones[Math.floor(random() * zones.length)] ?? zones[0];

  return {
    leftPct: Math.round(zone.left[0] + random() * (zone.left[1] - zone.left[0])),
    topPct: Math.round(zone.top[0] + random() * (zone.top[1] - zone.top[0]))
  };
}

export function createIntelPanels(options: CreateIntelPanelsOptions): IntelPanel[] {
  const random = seededRandom(options.seed);

  return Array.from({ length: options.count }, (_, index) => {
    const label = INTEL_LABELS[Math.floor(random() * INTEL_LABELS.length)] ?? INTEL_LABELS[0];
    const detail = INTEL_DETAILS[Math.floor(random() * INTEL_DETAILS.length)] ?? INTEL_DETAILS[0];
    const position = panelPosition(random);

    return {
      id: `${options.seed}-${index}-${label}`,
      layer: "intel",
      label,
      value: label.includes("CONFIDENCE") ? `${Math.round(35 + random() * 62)}%` : randomHex(random),
      detail,
      leftPct: position.leftPct,
      topPct: position.topPct,
      width: Math.round(132 + random() * 92),
      height: Math.round(54 + random() * 46),
      visibleMs: Math.round(4200 + random() * 3800),
      delayMs: Math.round(random() * 1200)
    };
  });
}
