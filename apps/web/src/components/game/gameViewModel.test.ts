import { describe, expect, it } from "vitest";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import {
  getDefaultFocusedPlayerId,
  getPlayerPublicStatus,
  getPublicPlayerName,
  getSubmittedAnswerCount,
  getVotesAgainst,
  sortedPlayers,
  splitPlayerColumns
} from "./gameViewModel";

function player(overrides: Partial<SessionPlayerSnapshot>): SessionPlayerSnapshot {
  return {
    id: overrides.id ?? "p1",
    lobbyPlayerId: overrides.lobbyPlayerId ?? "l1",
    gameNumber: overrides.gameNumber ?? 1,
    displayName: overrides.displayName ?? "Ada",
    playerType: overrides.playerType ?? "human",
    role: overrides.role ?? "",
    controlMode: overrides.controlMode ?? "human",
    isActive: overrides.isActive ?? true
  };
}

function snapshot(overrides: Partial<WiaiSnapshot>): WiaiSnapshot {
  const players =
    overrides.sessionPlayers ??
    [
      player({ id: "p1", gameNumber: 1, displayName: "Ada" }),
      player({ id: "p2", gameNumber: 2, displayName: "Debug 1" }),
      player({ id: "p3", gameNumber: 3, displayName: "Debug 2" }),
      player({ id: "p4", gameNumber: 4, displayName: "Agent" })
    ];

  return {
    roomId: "room-1",
    roomCode: "ABCD",
    status: "playing",
    phase: "answer_prep",
    phaseVersion: 1,
    roundIndex: 0,
    phaseEndsAt: Date.now() + 60_000,
    lobbyPlayers: [],
    sessionPlayers: players,
    answers: [],
    messages: [],
    ballots: [],
    questions: [{ roundIndex: 0, kind: "memory", prompt: "Name a human detail." }],
    result: { winnerSide: "", frozenSessionPlayerId: "" },
    ...overrides
  };
}

describe("gameViewModel", () => {
  it("sorts players by public game number", () => {
    const players = [
      player({ id: "p3", gameNumber: 3 }),
      player({ id: "p1", gameNumber: 1 }),
      player({ id: "p2", gameNumber: 2 })
    ];

    expect(sortedPlayers(players).map((item) => item.gameNumber)).toEqual([1, 2, 3]);
  });

  it("splits six to eight players into balanced side columns", () => {
    const players = Array.from({ length: 7 }, (_, index) =>
      player({ id: `p${index + 1}`, gameNumber: index + 1 })
    );

    const columns = splitPlayerColumns(players);

    expect(columns.left.map((item) => item.gameNumber)).toEqual([1, 2, 3, 4]);
    expect(columns.right.map((item) => item.gameNumber)).toEqual([5, 6, 7]);
  });

  it("counts submitted answers for the active round", () => {
    const state = snapshot({
      roundIndex: 1,
      answers: [
        { id: "a1", roundIndex: 1, sessionPlayerId: "p1", content: "A", submittedAt: "" },
        { id: "a2", roundIndex: 0, sessionPlayerId: "p2", content: "Old", submittedAt: "" }
      ]
    });

    expect(getSubmittedAnswerCount(state)).toBe(1);
  });

  it("derives public status without exposing hidden identity", () => {
    const state = snapshot({
      phase: "answer_prep",
      answers: [{ id: "a1", roundIndex: 0, sessionPlayerId: "p2", content: "A", submittedAt: "" }]
    });

    expect(getPlayerPublicStatus(state, state.sessionPlayers[0]!, state.sessionPlayers[0])).toBe("current");
    expect(getPlayerPublicStatus(state, state.sessionPlayers[1]!, state.sessionPlayers[0])).toBe("submitted");
    expect(getPlayerPublicStatus(state, state.sessionPlayers[2]!, state.sessionPlayers[0])).toBe("waiting");
  });

  it("counts non-abstain votes against a target in the active round", () => {
    const state = snapshot({
      phase: "voting",
      ballots: [
        {
          id: "b1",
          roundIndex: 0,
          actorSessionPlayerId: "p1",
          ballotType: "suspicion",
          targetSessionPlayerId: "p4",
          abstain: false
        },
        {
          id: "b2",
          roundIndex: 0,
          actorSessionPlayerId: "p2",
          ballotType: "suspicion",
          targetSessionPlayerId: "p4",
          abstain: false
        },
        {
          id: "b3",
          roundIndex: 0,
          actorSessionPlayerId: "p3",
          ballotType: "suspicion",
          targetSessionPlayerId: "",
          abstain: true
        }
      ]
    });

    expect(getVotesAgainst(state, "p4")).toBe(2);
  });

  it("uses the current player as the initial focus when available", () => {
    const state = snapshot({});

    expect(getDefaultFocusedPlayerId(state, state.sessionPlayers[1])).toBe("p2");
    expect(getDefaultFocusedPlayerId(state, undefined)).toBe("p1");
  });

  it("masks debug AI labels without depending on hidden identity", () => {
    expect(getPublicPlayerName(player({ displayName: "Mock AI", gameNumber: 4 }), "Player 4")).toBe(
      "Player 4"
    );
    expect(getPublicPlayerName(player({ displayName: "Ada", playerType: "ai" }), "Player 1")).toBe(
      "Ada"
    );
  });
});
