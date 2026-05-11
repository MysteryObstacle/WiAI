import { describe, expect, it } from "vitest";
import { CommandBus } from "./CommandBus";
import {
  addLobbyPlayer,
  createInitialGameState,
  findSessionPlayerByLobbyId,
  readyLobbyPlayer
} from "../state";

function createLobby() {
  const state = createInitialGameState({
    roomId: "room_1",
    roomCode: "ABC123",
    config: {
      minPlayers: 3,
      maxPlayers: 6,
      phaseDurationsMs: {
        answer_prep: 30_000,
        answer_reveal: 3_000,
        discussion: 30_000,
        voting: 30_000,
        settlement: 0
      }
    }
  });

  addLobbyPlayer(state, { id: "lp_host", nickname: "Host", isHost: true });
  addLobbyPlayer(state, { id: "lp_ada", nickname: "Ada", isHost: false });
  addLobbyPlayer(state, { id: "lp_grace", nickname: "Grace", isHost: false });
  readyLobbyPlayer(state, "lp_ada", true);
  readyLobbyPlayer(state, "lp_grace", true);

  return state;
}

describe("CommandBus handlers", () => {
  it("starts a session with one AI, one shelterer, and remaining citizens", () => {
    const state = createLobby();
    const result = new CommandBus().execute(state, {
      type: "start_game",
      actorLobbyPlayerId: "lp_host"
    });

    expect(result.ok).toBe(true);
    expect(state.status).toBe("playing");
    expect(state.phase).toBe("answer_prep");
    expect(state.sessionPlayers).toHaveLength(4);
    expect(state.sessionPlayers.filter((player) => player.role === "ai")).toHaveLength(1);
    expect(state.sessionPlayers.filter((player) => player.role === "shelterer")).toHaveLength(1);
    expect(state.events.map((event) => event.type)).toContain("game.started");
  });

  it("rejects invalid phase, duplicate answer, invalid ballot, self vote, and duplicate ballot", () => {
    const state = createLobby();
    const bus = new CommandBus();
    bus.execute(state, { type: "start_game", actorLobbyPlayerId: "lp_host" });
    const ada = findSessionPlayerByLobbyId(state, "lp_ada");
    expect(ada).toBeDefined();

    const chatTooEarly = bus.execute(state, {
      type: "send_chat",
      actorSessionPlayerId: ada!.id,
      content: "Too soon"
    });
    expect(chatTooEarly).toMatchObject({ ok: false, error: { code: "invalid_phase" } });

    const firstAnswer = bus.execute(state, {
      type: "submit_answer",
      actorSessionPlayerId: ada!.id,
      content: "I would remove short video apps."
    });
    expect(firstAnswer.ok).toBe(true);

    const duplicateAnswer = bus.execute(state, {
      type: "submit_answer",
      actorSessionPlayerId: ada!.id,
      content: "Another answer"
    });
    expect(duplicateAnswer).toMatchObject({
      ok: false,
      error: { code: "duplicate_answer" }
    });

    state.phase = "voting";
    state.roundIndex = 0;
    const invalidBallotType = bus.execute(state, {
      type: "submit_ballot",
      actorSessionPlayerId: ada!.id,
      ballotType: "decision",
      targetGameNumber: 1,
      abstain: false
    });
    expect(invalidBallotType).toMatchObject({
      ok: false,
      error: { code: "invalid_ballot_type" }
    });

    const selfVote = bus.execute(state, {
      type: "submit_ballot",
      actorSessionPlayerId: ada!.id,
      ballotType: "suspicion",
      targetGameNumber: ada!.gameNumber,
      abstain: false
    });
    expect(selfVote).toMatchObject({ ok: false, error: { code: "forbidden_self_vote" } });

    const target = state.sessionPlayers.find((player) => player.id !== ada!.id && player.isActive)!;
    expect(
      bus.execute(state, {
        type: "submit_ballot",
        actorSessionPlayerId: ada!.id,
        ballotType: "suspicion",
        targetGameNumber: target.gameNumber,
        abstain: false
      }).ok
    ).toBe(true);

    expect(
      bus.execute(state, {
        type: "submit_ballot",
        actorSessionPlayerId: ada!.id,
        ballotType: "suspicion",
        targetGameNumber: target.gameNumber,
        abstain: false
      })
    ).toMatchObject({ ok: false, error: { code: "duplicate_ballot" } });
  });
});
