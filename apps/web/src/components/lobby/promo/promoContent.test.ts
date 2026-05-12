import { describe, expect, it } from "vitest";
import { promoContent } from "./promoContent";

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
    const totalCount =
      promoContent.roles.find((r) => r.key === "citizen")!.headcount +
      promoContent.roles.find((r) => r.key === "ai")!.headcount +
      promoContent.roles.find((r) => r.key === "shelterer")!.headcount;
    expect(totalCount).toBe(6);
  });

  it("declares three rounds with at least two messages each", () => {
    expect(promoContent.howItPlays.roundCount).toBe(3);
    expect(promoContent.howItPlays.minMessagesPerRound).toBe(2);
  });

  it("declares three system lines in the signature section", () => {
    expect(promoContent.signature.systemLineCount).toBe(3);
  });
});
