import type { Client } from "@colyseus/core";
import { Room } from "@colyseus/core";
import { createWiaiDatabaseClient } from "@wiai/db";
import type { DomainCommand, GameState } from "@wiai/game";
import { getCurrentQuestion } from "@wiai/game";
import { ZodError } from "zod";
import { generateRoomCode, getDatabaseFilename } from "../config";
import { AgentOrchestrator } from "../application/AgentOrchestrator";
import { parseRoomMessage } from "../application/CommandDtoAdapter";
import { RoomApplicationService } from "../application/RoomApplicationService";
import { mapDomainStateToColyseus } from "../state/mappers";
import { WiaiState } from "../state/WiaiState";

type UserData = {
  lobbyPlayerId: string;
};

export class WiaiRoom extends Room<WiaiState> {
  private service!: RoomApplicationService;
  private orchestrator!: AgentOrchestrator;
  private readonly liveState = new WiaiState();
  private phaseTimer?: { clear: () => void };
  private agentTimer?: { clear: () => void };

  async onCreate(options: { roomCode?: string } = {}): Promise<void> {
    const roomCode = options.roomCode ?? generateRoomCode();
    this.roomId = roomCode;
    void this.setMetadata({ roomCode });

    const db = await createWiaiDatabaseClient({
      filename: getDatabaseFilename()
    });
    this.service = new RoomApplicationService({
      roomId: this.roomId,
      roomCode,
      db
    });
    this.orchestrator = new AgentOrchestrator(this.service);
    this.syncState();

    this.onMessage("*", (client, type, payload) => {
      void this.handleClientMessage(client, String(type), payload);
    });
  }

  onJoin(client: Client, options: { nickname?: string } = {}): void {
    const isHost = this.service.state.lobbyPlayers.length === 0;
    const lobbyPlayerId = `lp_${client.sessionId}`;
    (client.userData as UserData) = { lobbyPlayerId };
    this.service.joinLobby({
      lobbyPlayerId,
      nickname: options.nickname?.trim() || `Player ${this.service.state.lobbyPlayers.length + 1}`,
      isHost
    });
    this.syncState();
  }

  onLeave(client: Client): void {
    const userData = client.userData as UserData | undefined;
    const lobbyPlayer = this.service.state.lobbyPlayers.find(
      (player) => player.id === userData?.lobbyPlayerId
    );
    if (lobbyPlayer) {
      lobbyPlayer.status = "disconnected";
      this.syncState();
    }
  }

  onDispose(): void {
    this.phaseTimer?.clear();
    this.agentTimer?.clear();
    this.service.close();
  }

  private async handleClientMessage(
    client: Client,
    type: string,
    payload: unknown
  ): Promise<void> {
    const userData = client.userData as UserData | undefined;
    try {
      const actorLobbyPlayerId = userData?.lobbyPlayerId;
      const actorSessionPlayerId = actorLobbyPlayerId
        ? this.service.getSessionPlayerIdForLobby(actorLobbyPlayerId)
        : undefined;
      const command = parseRoomMessage(type, payload, {
        ...(actorLobbyPlayerId ? { actorLobbyPlayerId } : {}),
        ...(actorSessionPlayerId ? { actorSessionPlayerId } : {})
      });
      if (command.type === "request_state") {
        this.syncState();
        return;
      }
      const previousPhaseVersion = this.service.state.phaseVersion;
      const result = this.service.execute(command as DomainCommand);
      if (!result.ok) {
        client.send("error", result.error);
        return;
      }

      this.syncState();
      if (this.service.state.phaseVersion !== previousPhaseVersion) {
        this.schedulePhaseWork();
      }
    } catch (error) {
      client.send("error", toClientError(error));
    }
  }

  private syncState(): void {
    mapDomainStateToColyseus(this.service.state, this.liveState);
    this.broadcast("state", toClientSnapshot(this.service.state));
  }

  private schedulePhaseWork(): void {
    this.phaseTimer?.clear();
    this.agentTimer?.clear();

    const phase = this.service.state.phase;
    if (phase !== "lobby" && phase !== "settlement") {
      const version = this.service.state.phaseVersion;
      const delay = Math.max(0, this.service.state.phaseEndsAt - Date.now());
      this.phaseTimer = this.clock.setTimeout(() => {
        this.service.handlePhaseTimeout(version);
        this.syncState();
        this.schedulePhaseWork();
      }, delay);
    }

    if (phase === "answer_prep" || phase === "discussion" || phase === "voting") {
      this.agentTimer = this.clock.setTimeout(async () => {
        await this.orchestrator.runOnce();
        this.syncState();
        this.schedulePhaseWork();
      }, 250);
    }
  }
}

function toClientSnapshot(domain: GameState) {
  const canRevealAnswers =
    domain.phase === "answer_reveal" ||
    domain.phase === "discussion" ||
    domain.phase === "voting" ||
    domain.phase === "settlement";

  return {
    roomId: domain.roomId,
    roomCode: domain.roomCode,
    status: domain.status,
    phase: domain.phase,
    phaseVersion: domain.phaseVersion,
    roundIndex: domain.roundIndex,
    phaseEndsAt: domain.phaseEndsAt,
    lobbyPlayers: domain.lobbyPlayers,
    sessionPlayers: domain.sessionPlayers.map((player) => ({
      ...player,
      role: domain.phase === "settlement" ? player.role : ""
    })),
    answers: domain.answers
      .filter((answer) => answer.roundIndex === domain.roundIndex)
      .map((answer) => ({
        ...answer,
        content: canRevealAnswers ? answer.content : ""
      })),
    messages: domain.messages.filter((message) => message.roundIndex === domain.roundIndex),
    ballots: (domain.phase === "settlement"
      ? domain.ballots
      : domain.ballots.filter((ballot) => ballot.roundIndex === domain.roundIndex).map((ballot) => ({
          ...ballot,
          targetSessionPlayerId: ""
        }))),
    questions: domain.roundIndex >= 0 ? [getCurrentQuestion(domain)] : [],
    result: {
      winnerSide: domain.result?.winnerSide ?? "",
      frozenSessionPlayerId: domain.result?.frozenSessionPlayerId ?? ""
    }
  };
}

function toClientError(error: unknown) {
  if (error instanceof ZodError) {
    return {
      code: "invalid_payload",
      message: error.message
    };
  }
  if (error instanceof Error) {
    return {
      code: error.message,
      message: error.message
    };
  }

  return {
    code: "unknown",
    message: "Unknown room error"
  };
}
