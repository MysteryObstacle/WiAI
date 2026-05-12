import { describe, expect, it } from "vitest";
import { promoAssets, promoContent } from "./promoContent";

describe("promoContent", () => {
  it("declares exactly three constraint columns", () => {
    expect(promoContent.session.constraints).toHaveLength(3);
    expect(promoContent.session.constraints.map((c) => c.key)).toEqual([
      "noSearch",
      "noProof",
      "noExternal"
    ]);
  });

  it("declares three roles with unique accents and a cumulative count of 6", () => {
    expect(promoContent.roles).toHaveLength(3);
    const accents = new Set(promoContent.roles.map((r) => r.accent));
    expect(accents.size).toBe(3);
    expect([...accents].sort()).toEqual(["ai", "citizen", "shelter"]);
    const totalCount = promoContent.roles.reduce((sum, role) => sum + role.headcount, 0);
    expect(totalCount).toBe(6);
  });

  it("models one decisive final round instead of visible R labels", () => {
    expect(promoContent.howItPlays.certificationRoundCount).toBe(3);
    expect(promoContent.howItPlays.visibleRoundLabels).toHaveLength(0);
    expect(JSON.stringify(promoContent.howItPlays)).not.toMatch(/\bR[1-3]\b/);
    expect(promoContent.howItPlays.decisiveRound.answerCount).toBe(4);
    expect(promoContent.howItPlays.decisiveRound.discussionCount).toBe(4);
    expect(promoContent.howItPlays.decisiveRound.hasSheltererMisdirection).toBe(true);
  });

  it("declares four generated promo assets", () => {
    expect(promoAssets).toEqual([
      {
        key: "verificationGrid",
        src: "/promo/verification-grid.png",
        altKey: "verificationGrid"
      },
      {
        key: "memoryAnswerSheet",
        src: "/promo/memory-answer-sheet.png",
        altKey: "memoryAnswerSheet"
      },
      {
        key: "voteFreezeSheet",
        src: "/promo/vote-freeze-sheet.png",
        altKey: "voteFreezeSheet"
      },
      {
        key: "archiveResidue",
        src: "/promo/archive-residue.png",
        altKey: "archiveResidue"
      }
    ]);
  });
});
