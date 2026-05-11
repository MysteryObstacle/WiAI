import { err, ok, type Result } from "@wiai/kernel";
import {
  addLobbyPlayer,
  appendEvent,
  CommandBus,
  createInitialGameState,
  findSessionPlayerByLobbyId,
  type DomainCommand,
  type GameErrorCode,
  type GameEvent,
  type GameState
} from "@wiai/game";
import type { WiaiDatabaseClient } from "@wiai/db";
import { DEFAULT_ROOM_CONFIG } from "../config";
import { GameUnitOfWorkAdapter } from "../persistence/GameUnitOfWorkAdapter";

export type RoomApplicationServiceInput = {
  roomId: string;
  roomCode: string;
  db: WiaiDatabaseClient;
};

export type AgentCommandResult = Result<GameEvent[], GameErrorCode | "agent_suggestion_rejected">;

export class RoomApplicationService {
  readonly state: GameState;
  private readonly commandBus = new CommandBus();
  private readonly unitOfWork: GameUnitOfWorkAdapter;
  private persistedEventCount = 0;

  constructor(input: RoomApplicationServiceInput) {
    this.state = createInitialGameState({
      roomId: input.roomId,
      roomCode: input.roomCode,
      config: DEFAULT_ROOM_CONFIG
    });
    this.unitOfWork = new GameUnitOfWorkAdapter(input.db);
  }

  get events() {
    return this.unitOfWork.repositories.events;
  }

  joinLobby(input: { lobbyPlayerId: string; nickname: string; isHost: boolean }): void {
    addLobbyPlayer(this.state, {
      id: input.lobbyPlayerId,
      nickname: input.nickname,
      isHost: input.isHost
    });

    if (input.isHost) {
      this.unitOfWork.ensureRoom({
        roomId: this.state.roomId,
        roomCode: this.state.roomCode,
        hostPlayerId: input.lobbyPlayerId,
        config: this.state.config
      });
    }

    this.persistNewEventsSince(this.persistedEventCount);
  }

  execute(command: DomainCommand): Result<GameEvent[], GameErrorCode> {
    const beforeEventCount = this.state.events.length;
    const result = this.commandBus.execute(this.state, command);
    if (!result.ok) {
      return result;
    }

    const events = this.state.events.slice(beforeEventCount);
    this.unitOfWork.persistAcceptedEvents(this.state, events);
    this.persistedEventCount = this.state.events.length;
    return ok(events);
  }

  handlePhaseTimeout(expectedPhaseVersion: number): Result<GameEvent[], GameErrorCode> {
    const beforeEventCount = this.state.events.length;
    const result = this.commandBus.handlePhaseTimeout(this.state, expectedPhaseVersion);
    if (!result.ok) {
      return result;
    }

    const events = this.state.events.slice(beforeEventCount);
    this.unitOfWork.persistAcceptedEvents(this.state, events);
    this.persistedEventCount = this.state.events.length;
    return ok(events);
  }

  getSessionPlayerIdForLobby(lobbyPlayerId: string): string | undefined {
    return findSessionPlayerByLobbyId(this.state, lobbyPlayerId)?.id;
  }

  recordAgentEvent(
    type: "agent.suggestion_received" | "agent.suggestion_executed" | "agent.suggestion_rejected",
    input: {
      actorSessionPlayerId: string;
      payload: unknown;
    }
  ): Result<GameEvent[], never> {
    const beforeEventCount = this.state.events.length;
    appendEvent(this.state, type, {
      actorSessionPlayerId: input.actorSessionPlayerId,
      roundIndex: this.state.roundIndex,
      phase: this.state.phase,
      payload: input.payload
    });
    const events = this.state.events.slice(beforeEventCount);
    this.unitOfWork.persistAcceptedEvents(this.state, events);
    this.persistedEventCount = this.state.events.length;
    return ok(events);
  }

  rejectAgentSuggestion(
    actorSessionPlayerId: string,
    payload: unknown
  ): AgentCommandResult {
    this.recordAgentEvent("agent.suggestion_rejected", {
      actorSessionPlayerId,
      payload
    });
    return err("agent_suggestion_rejected", "Agent suggestion was rejected");
  }

  close(): void {
    this.unitOfWork.close();
  }

  private persistNewEventsSince(index: number): void {
    this.unitOfWork.persistAcceptedEvents(this.state, this.state.events.slice(index));
    this.persistedEventCount = this.state.events.length;
  }
}
