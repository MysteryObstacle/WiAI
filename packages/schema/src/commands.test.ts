import { describe, expect, it } from "vitest";
import {
  browserCommandSchema,
  mapBrowserCommandToIntent,
  submitAnswerCommandSchema,
  submitBallotCommandSchema
} from "./commands";

describe("browser command schemas", () => {
  it("rejects empty answer content", () => {
    const parsed = submitAnswerCommandSchema.safeParse({
      type: "submit_answer",
      payload: { content: "   " }
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects an invalid ballot type", () => {
    const parsed = submitBallotCommandSchema.safeParse({
      type: "submit_ballot",
      payload: { ballotType: "final", targetGameNumber: 2, abstain: false }
    });

    expect(parsed.success).toBe(false);
  });

  it("maps a parsed command to an actor-resolved domain intent", () => {
    const parsed = browserCommandSchema.parse({
      type: "send_chat",
      payload: { content: "Player 2 sounds too generic." },
      requestId: "req_1"
    });

    expect(
      mapBrowserCommandToIntent(parsed, {
        actorSessionPlayerId: "sp_1"
      })
    ).toEqual({
      type: "send_chat",
      actorSessionPlayerId: "sp_1",
      requestId: "req_1",
      content: "Player 2 sounds too generic."
    });
  });

  it("parses add_debug_players with a positive count", () => {
    const parsed = browserCommandSchema.parse({
      type: "add_debug_players",
      payload: { count: 2 },
      requestId: "req_debug"
    });

    expect(parsed).toEqual({
      type: "add_debug_players",
      payload: { count: 2 },
      requestId: "req_debug"
    });
  });

  it("rejects add_debug_players without a positive count", () => {
    const parsed = browserCommandSchema.safeParse({
      type: "add_debug_players",
      payload: { count: 0 }
    });

    expect(parsed.success).toBe(false);
  });

  it("maps add_debug_players to a host lobby actor intent", () => {
    const parsed = browserCommandSchema.parse({
      type: "add_debug_players",
      payload: { count: 2 },
      requestId: "req_debug"
    });

    expect(
      mapBrowserCommandToIntent(parsed, {
        actorLobbyPlayerId: "lp_host"
      })
    ).toEqual({
      type: "add_debug_players",
      actorLobbyPlayerId: "lp_host",
      requestId: "req_debug",
      count: 2
    });
  });
});
