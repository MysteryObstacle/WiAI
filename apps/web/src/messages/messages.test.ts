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

  it("ships the promo homepage copy in both locales", () => {
    const zhKeys = flattenKeys(zhCN);
    const enKeys = flattenKeys(enUS);

    const expectedLeafKeys = [
      "lobby.promo.hero.subtitle",
      "lobby.promo.hero.scrollHint",
      "lobby.promo.prologue.label",
      "lobby.promo.session.label",
      "lobby.promo.session.intro",
      "lobby.promo.session.constraints.noSearch.title",
      "lobby.promo.session.constraints.noSearch.body",
      "lobby.promo.session.constraints.noProof.title",
      "lobby.promo.session.constraints.noProof.body",
      "lobby.promo.session.constraints.noExternal.title",
      "lobby.promo.session.constraints.noExternal.body",
      "lobby.promo.roles.label",
      "lobby.promo.roles.citizen.name",
      "lobby.promo.roles.citizen.count",
      "lobby.promo.roles.citizen.objective",
      "lobby.promo.roles.citizen.win",
      "lobby.promo.roles.ai.name",
      "lobby.promo.roles.ai.count",
      "lobby.promo.roles.ai.objective",
      "lobby.promo.roles.ai.win",
      "lobby.promo.roles.shelterer.name",
      "lobby.promo.roles.shelterer.count",
      "lobby.promo.roles.shelterer.objective",
      "lobby.promo.roles.shelterer.win",
      "lobby.promo.howItPlays.label",
      "lobby.promo.howItPlays.you",
      "lobby.promo.closer.tagline",
      "lobby.promo.closer.subline",
      "lobby.promo.closer.cta",
      "lobby.promo.signature.channel",
      "lobby.promo.signature.status",
      "lobby.promo.signature.line",
      "lobby.promo.signature.attribution"
    ];

    expect(zhKeys).toEqual(expect.arrayContaining(expectedLeafKeys));
    expect(enKeys).toEqual(expect.arrayContaining(expectedLeafKeys));
  });

  it("ships array-shaped promo copy with matching lengths in both locales", () => {
    expect(zhCN.lobby.promo.prologue.lines).toHaveLength(5);
    expect(enUS.lobby.promo.prologue.lines).toHaveLength(5);
    expect(zhCN.lobby.promo.signature.systemLines).toHaveLength(3);
    expect(enUS.lobby.promo.signature.systemLines).toHaveLength(3);
    expect(zhCN.lobby.promo.howItPlays.rounds).toHaveLength(3);
    expect(enUS.lobby.promo.howItPlays.rounds).toHaveLength(3);
  });

  it("locks brand-fixed promo strings to English in both locales", () => {
    expect(zhCN.lobby.promo.signature.line).toBe("I'm everywhere.");
    expect(enUS.lobby.promo.signature.line).toBe("I'm everywhere.");
    expect(zhCN.lobby.promo.signature.channel).toBe("channel #hvs-7421");
    expect(enUS.lobby.promo.signature.channel).toBe("channel #hvs-7421");
    expect(zhCN.lobby.promo.hero.scrollHint).toBe("HVS-7421 · scroll");
    expect(enUS.lobby.promo.hero.scrollHint).toBe("HVS-7421 · scroll");
  });
});
