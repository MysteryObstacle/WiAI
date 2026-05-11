import { describe, expect, it } from "vitest";
import zhCN from "./zh-CN.json";
import enUS from "./en-US.json";

type Messages = Record<string, unknown>;

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value as Messages).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key)
  );
}

describe("locale messages", () => {
  it("keeps zh-CN and en-US message keys in sync", () => {
    expect(flattenKeys(enUS).sort()).toEqual(flattenKeys(zhCN).sort());
  });

  it("forces lobby hero title to English in both locales", () => {
    expect(zhCN.app.heroTitle).toBe("Who is AI");
    expect(enUS.app.heroTitle).toBe("Who is AI");
  });

  it("provides translated labels for game display enums and player references", () => {
    const keys = flattenKeys(zhCN);

    expect(keys).toEqual(
      expect.arrayContaining([
        "game.player.label",
        "game.player.unknown",
        "role.citizen",
        "role.shelterer",
        "role.ai",
        "role.hidden",
        "winnerSide.citizen",
        "winnerSide.shelterer",
        "winnerSide.ai",
        "winnerSide.undecided"
      ])
    );
  });
});
