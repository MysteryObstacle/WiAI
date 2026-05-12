import { describe, expect, it } from "vitest";
import zhCN from "./zh-CN.json";
import enUS from "./en-US.json";

type Messages = Record<string, unknown>;
type PromoMessage = Record<string, unknown>;

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value as Messages).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key)
  );
}

function messageShapes(messages: PromoMessage[]): string[][] {
  return messages.map((message) => Object.keys(message).sort());
}

function expectSpeakerAndBody(messages: PromoMessage[]) {
  for (const message of messages) {
    expect(message.who).toEqual(expect.any(String));
    expect(message.body).toEqual(expect.any(String));
  }
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
        "lobby.debug.addPlayers",
        "lobby.debug.addPlayersDisabled",
        "winnerSide.citizen",
        "winnerSide.shelterer",
        "winnerSide.ai",
        "winnerSide.undecided"
      ])
    );
  });

  it("ships the cinematic promo homepage copy in both locales", () => {
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
      "lobby.promo.howItPlays.decisiveRound.eyebrow",
      "lobby.promo.howItPlays.decisiveRound.question",
      "lobby.promo.howItPlays.decisiveRound.vote.label",
      "lobby.promo.howItPlays.decisiveRound.vote.result",
      "lobby.promo.howItPlays.decisiveRound.vote.note",
      "lobby.promo.closer.tagline",
      "lobby.promo.closer.subline",
      "lobby.promo.closer.cta",
      "lobby.promo.signature.channel",
      "lobby.promo.signature.status",
      "lobby.promo.signature.line",
      "lobby.promo.signature.attribution",
      "lobby.promo.assets.verificationGrid",
      "lobby.promo.assets.memoryAnswerSheet",
      "lobby.promo.assets.voteFreezeSheet",
      "lobby.promo.assets.archiveResidue"
    ];

    expect(zhKeys).toEqual(expect.arrayContaining(expectedLeafKeys));
    expect(enKeys).toEqual(expect.arrayContaining(expectedLeafKeys));
  });

  it("ships array-shaped cinematic promo copy with matching lengths", () => {
    const zhAnswers = zhCN.lobby.promo.howItPlays.decisiveRound.answers as PromoMessage[];
    const enAnswers = enUS.lobby.promo.howItPlays.decisiveRound.answers as PromoMessage[];
    const zhDiscussion = zhCN.lobby.promo.howItPlays.decisiveRound.discussion as PromoMessage[];
    const enDiscussion = enUS.lobby.promo.howItPlays.decisiveRound.discussion as PromoMessage[];

    expect(zhCN.lobby.promo.prologue.lines).toHaveLength(5);
    expect(enUS.lobby.promo.prologue.lines).toHaveLength(5);
    expect(zhCN.lobby.promo.signature.systemLines).toHaveLength(2);
    expect(enUS.lobby.promo.signature.systemLines).toHaveLength(2);
    expect(zhAnswers).toHaveLength(4);
    expect(enAnswers).toHaveLength(4);
    expect(zhDiscussion).toHaveLength(4);
    expect(enDiscussion).toHaveLength(4);

    expect(messageShapes(zhAnswers)).toEqual(messageShapes(enAnswers));
    expect(messageShapes(zhDiscussion)).toEqual(messageShapes(enDiscussion));

    expectSpeakerAndBody([...zhAnswers, ...enAnswers]);
    expect(zhAnswers.some((answer) => answer.isMe === true)).toBe(true);
    expect(enAnswers.some((answer) => answer.isMe === true)).toBe(true);
    expect(zhAnswers.some((answer) => answer.suspect === true)).toBe(true);
    expect(enAnswers.some((answer) => answer.suspect === true)).toBe(true);

    expectSpeakerAndBody([...zhDiscussion, ...enDiscussion]);
    expect(zhDiscussion.some((message) => message.roleHint === "accuser")).toBe(true);
    expect(enDiscussion.some((message) => message.roleHint === "accuser")).toBe(true);
    expect(zhDiscussion.some((message) => message.roleHint === "shelterer")).toBe(true);
    expect(enDiscussion.some((message) => message.roleHint === "shelterer")).toBe(true);
    expect(zhDiscussion.some((message) => message.isMe === true)).toBe(true);
    expect(enDiscussion.some((message) => message.isMe === true)).toBe(true);
    expect(zhDiscussion.some((message) => message.suspect === true)).toBe(true);
    expect(enDiscussion.some((message) => message.suspect === true)).toBe(true);
  });

  it("locks brand-fixed promo strings and removes visible round labels", () => {
    expect(zhCN.lobby.promo.signature.line).toBe("I'm everywhere.");
    expect(enUS.lobby.promo.signature.line).toBe("I'm everywhere.");
    expect(zhCN.lobby.promo.signature.channel).toBe("channel #hvs-7421");
    expect(enUS.lobby.promo.signature.channel).toBe("channel #hvs-7421");
    expect(zhCN.lobby.promo.hero.scrollHint).toBe("HVS-7421 · scroll");
    expect(enUS.lobby.promo.hero.scrollHint).toBe("HVS-7421 · scroll");
    expect(JSON.stringify(zhCN.lobby.promo.howItPlays)).not.toMatch(/\bR[1-3]\b/);
    expect(JSON.stringify(enUS.lobby.promo.howItPlays)).not.toMatch(/\bR[1-3]\b/);
  });

  it("uses the approved cinematic CTA question", () => {
    expect(zhCN.lobby.promo.closer.tagline).toBe(
      "当一个存在无法被看见，只有被相信——谁才是人类？"
    );
    expect(enUS.lobby.promo.closer.tagline).toBe(
      "When a being cannot be seen, only believed — who gets to be human?"
    );
  });
});
