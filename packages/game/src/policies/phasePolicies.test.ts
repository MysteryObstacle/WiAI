import { describe, expect, it } from "vitest";
import { CommandBus } from "../commands/CommandBus";
import {
  createInitialGameState,
  getActiveSessionPlayers,
  getCurrentQuestion,
  readyLobbyPlayer,
  addLobbyPlayer
} from "../state";

function createStartedState() {
  const state = createInitialGameState({
    roomId: "room_1",
    roomCode: "ABC123",
    config: {
      minPlayers: 3,
      maxPlayers: 6,
      phaseDurationsMs: {
        answer_prep: 30_000,
        answer_reveal: 1,
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
  new CommandBus().execute(state, { type: "start_game", actorLobbyPlayerId: "lp_host" });
  return state;
}

describe("phase policies", () => {
  it("advances early after every active player submits an answer", () => {
    const state = createStartedState();
    const bus = new CommandBus();

    for (const player of getActiveSessionPlayers(state)) {
      bus.execute(state, {
        type: "submit_answer",
        actorSessionPlayerId: player.id,
        content: `Answer from ${player.gameNumber}`
      });
    }

    expect(state.phase).toBe("answer_reveal");
    expect(state.answers).toHaveLength(4);
    expect(state.events.at(-1)).toMatchObject({ type: "phase.started", phase: "answer_reveal" });
  });

  it("completes three rounds and resolves settlement through final decision ballots", () => {
    const state = createStartedState();
    const bus = new CommandBus();

    for (let round = 0; round < 3; round += 1) {
      expect(state.phase).toBe("answer_prep");
      expect(getCurrentQuestion(state).roundIndex).toBe(round);

      for (const player of getActiveSessionPlayers(state)) {
        expect(
          bus.execute(state, {
            type: "submit_answer",
            actorSessionPlayerId: player.id,
            content: `Round ${round} answer from ${player.gameNumber}`
          }).ok
        ).toBe(true);
      }

      expect(state.phase).toBe("answer_reveal");
      bus.handlePhaseTimeout(state, state.phaseVersion);
      expect(state.phase).toBe("discussion");

      const first = getActiveSessionPlayers(state)[0]!;
      bus.execute(state, {
        type: "send_chat",
        actorSessionPlayerId: first.id,
        content: `Round ${round} discussion`
      });

      bus.handlePhaseTimeout(state, state.phaseVersion);
      expect(state.phase).toBe("voting");

      const ai = state.sessionPlayers.find((player) => player.role === "ai")!;
      const ballotType = round === 2 ? "decision" : "suspicion";
      for (const player of getActiveSessionPlayers(state)) {
        const target = player.id === ai.id ? getActiveSessionPlayers(state)[0]! : ai;
        expect(
          bus.execute(state, {
            type: "submit_ballot",
            actorSessionPlayerId: player.id,
            ballotType,
            targetGameNumber: target.gameNumber,
            abstain: false
          }).ok
        ).toBe(true);
      }
    }

    expect(state.phase).toBe("settlement");
    expect(state.status).toBe("ended");
    expect(state.result).toMatchObject({
      winnerSide: "citizen",
      frozenSessionPlayerId: state.sessionPlayers.find((player) => player.role === "ai")!.id
    });
  });
});
