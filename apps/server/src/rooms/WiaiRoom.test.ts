import { describe, expect, it } from "vitest";
import { createWiaiDatabaseClient } from "@wiai/db";
import { RoomApplicationService } from "../application/RoomApplicationService";
import { AgentOrchestrator } from "../application/AgentOrchestrator";
import { ManagedPlayerOrchestrator } from "../application/ManagedPlayerOrchestrator";

describe("RoomApplicationService", () => {
  it("joins players, starts the game, routes mock Agent suggestions, and persists events", async () => {
    const db = await createWiaiDatabaseClient();
    const service = new RoomApplicationService({
      roomId: "room_1",
      roomCode: "ABC123",
      db
    });

    service.joinLobby({ lobbyPlayerId: "lp_host", nickname: "Host", isHost: true });
    service.joinLobby({ lobbyPlayerId: "lp_ada", nickname: "Ada", isHost: false });
    service.joinLobby({ lobbyPlayerId: "lp_grace", nickname: "Grace", isHost: false });
    service.execute({ type: "ready", actorLobbyPlayerId: "lp_ada", isReady: true });
    service.execute({ type: "ready", actorLobbyPlayerId: "lp_grace", isReady: true });

    const start = service.execute({ type: "start_game", actorLobbyPlayerId: "lp_host" });
    expect(start.ok).toBe(true);
    expect(service.state.phase).toBe("answer_prep");

    const orchestrator = new AgentOrchestrator(service);
    const agentAnswer = await orchestrator.runOnce();
    expect(agentAnswer.ok).toBe(true);
    expect(service.state.answers.some((answer) => answer.sessionPlayerId === "sp_ai")).toBe(true);

    for (const player of service.state.sessionPlayers.filter(
      (candidate) => candidate.playerType === "human"
    )) {
      service.execute({
        type: "submit_answer",
        actorSessionPlayerId: player.id,
        content: `Answer from ${player.displayName}`
      });
    }

    expect(service.state.phase).toBe("answer_reveal");
    service.handlePhaseTimeout(service.state.phaseVersion);
    expect(service.state.phase).toBe("discussion");

    const agentChat = await orchestrator.runOnce();
    expect(agentChat.ok).toBe(true);
    expect(service.state.messages).toHaveLength(1);

    service.handlePhaseTimeout(service.state.phaseVersion);
    expect(service.state.phase).toBe("voting");

    const agentVote = await orchestrator.runOnce();
    expect(agentVote.ok).toBe(true);
    expect(service.state.ballots.some((ballot) => ballot.actorSessionPlayerId === "sp_ai")).toBe(
      true
    );

    expect(service.events.listBySession("session_room_1").length).toBeGreaterThan(0);
    db.close();
  });

  it("routes managed human players through answers, chat, and ballots", async () => {
    const db = await createWiaiDatabaseClient();
    const service = new RoomApplicationService({
      roomId: "room_managed",
      roomCode: "DBG123",
      db
    });

    service.joinLobby({ lobbyPlayerId: "lp_host", nickname: "Host", isHost: true });
    expect(
      service.execute({
        type: "add_debug_players",
        actorLobbyPlayerId: "lp_host",
        count: 2
      }).ok
    ).toBe(true);
    expect(service.execute({ type: "start_game", actorLobbyPlayerId: "lp_host" }).ok).toBe(true);

    const orchestrator = new ManagedPlayerOrchestrator(service, {
      shouldSendDiscussionMessage: () => true,
      chooseVoteTarget: (_player, candidates) => candidates[0]!
    });

    const answerResult = orchestrator.runOnce();
    expect(answerResult.ok).toBe(true);
    expect(
      service.state.answers.filter((answer) => answer.sessionPlayerId.startsWith("sp_lp_debug_"))
    ).toHaveLength(2);

    for (const player of service.state.sessionPlayers.filter(
      (candidate) => candidate.controlMode === "player"
    )) {
      service.execute({
        type: "submit_answer",
        actorSessionPlayerId: player.id,
        content: `Answer from ${player.displayName}`
      });
    }
    const agent = new AgentOrchestrator(service);
    await agent.runOnce();
    expect(service.state.phase).toBe("answer_reveal");

    service.handlePhaseTimeout(service.state.phaseVersion);
    expect(service.state.phase).toBe("discussion");
    const chatResult = orchestrator.runOnce();
    expect(chatResult.ok).toBe(true);
    expect(
      service.state.messages.filter((message) => message.sessionPlayerId.startsWith("sp_lp_debug_"))
    ).toHaveLength(2);

    service.handlePhaseTimeout(service.state.phaseVersion);
    expect(service.state.phase).toBe("voting");
    const ballotResult = orchestrator.runOnce();
    expect(ballotResult.ok).toBe(true);
    expect(
      service.state.ballots.filter((ballot) => ballot.actorSessionPlayerId.startsWith("sp_lp_debug_"))
    ).toHaveLength(2);

    db.close();
  });
});
