import { describe, expect, it } from "vitest";
import { createIntelPanels } from "./lobbyIntel";

describe("createIntelPanels", () => {
  it("creates deterministic panels from a seed", () => {
    const first = createIntelPanels({ seed: 42, count: 4 });
    const second = createIntelPanels({ seed: 42, count: 4 });

    expect(second).toEqual(first);
    expect(first).toHaveLength(4);
  });

  it("places panels in peripheral lanes away from the hero controls", () => {
    const panels = createIntelPanels({ seed: 7, count: 8 });

    expect(
      panels.every((panel) => (panel.leftPct <= 34 || panel.leftPct >= 66) && (panel.topPct <= 34 || panel.topPct >= 62))
    ).toBe(true);
  });

  it("randomizes labels, values, and dimensions while keeping readable durations", () => {
    const panels = createIntelPanels({ seed: 99, count: 8 });
    const labels = new Set(panels.map((panel) => panel.label));
    const widths = new Set(panels.map((panel) => panel.width));

    expect(labels.size).toBeGreaterThan(1);
    expect(widths.size).toBeGreaterThan(1);
    expect(panels.every((panel) => panel.visibleMs >= 4200)).toBe(true);
    expect(panels.every((panel) => panel.layer === "intel")).toBe(true);
  });
});
