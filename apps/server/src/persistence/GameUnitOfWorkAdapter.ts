import {
  createRepositories,
  type EventRecord,
  type WiaiDatabaseClient,
  type WiaiRepositories
} from "@wiai/db";
import type { GameEvent, GameState } from "@wiai/game";

export class GameUnitOfWorkAdapter {
  readonly repositories: WiaiRepositories;
  private roomPersisted = false;
  private sessionPersisted = false;

  constructor(private readonly client: WiaiDatabaseClient) {
    this.repositories = createRepositories(client);
  }

  ensureRoom(input: {
    roomId: string;
    roomCode: string;
    hostPlayerId: string;
    config: unknown;
  }): void {
    if (this.roomPersisted || this.repositories.rooms.find(input.roomId)) {
      this.roomPersisted = true;
      return;
    }

    this.repositories.rooms.create({
      id: input.roomId,
      roomCode: input.roomCode,
      status: "lobby",
      hostPlayerId: input.hostPlayerId,
      config: input.config
    });
    this.roomPersisted = true;
    this.client.persist();
  }

  persistAcceptedEvents(state: GameState, events: GameEvent[]): void {
    if (state.sessionId && !this.sessionPersisted && !this.repositories.sessions.find(state.sessionId)) {
      this.repositories.sessions.create({
        id: state.sessionId,
        roomId: state.roomId,
        status: state.status,
        phase: state.phase,
        roundIndex: state.roundIndex,
        phaseVersion: state.phaseVersion
      });
      this.sessionPersisted = true;
    }

    for (const event of events) {
      this.repositories.events.append(toEventRecord(event));
      if (event.type === "phase.started" || event.type === "game.settled") {
        this.repositories.snapshots.save({
          id: `snapshot_${event.sequence}`,
          sessionId: state.sessionId || event.sessionId,
          roomId: state.roomId,
          phase: state.phase,
          phaseVersion: state.phaseVersion,
          state: snapshotState(state),
          createdAt: event.createdAt
        });
      }
    }

    if (state.sessionId && this.sessionPersisted) {
      this.repositories.sessions.updatePhase({
        id: state.sessionId,
        status: state.status === "ended" ? "ended" : "playing",
        phase: state.phase,
        roundIndex: state.roundIndex,
        phaseVersion: state.phaseVersion
      });

      if (state.result) {
        this.repositories.sessions.settle({
          id: state.sessionId,
          winnerSide: state.result.winnerSide,
          frozenSessionPlayerId: state.result.frozenSessionPlayerId
        });
      }
    }

    this.client.persist();
  }

  close(): void {
    this.client.close();
  }
}

function toEventRecord(event: GameEvent): EventRecord {
  const record: EventRecord = {
    id: event.id,
    sequence: event.sequence,
    sessionId: event.sessionId,
    roomId: event.roomId,
    type: event.type,
    payload: event.payload,
    createdAt: event.createdAt
  };

  if (event.actorSessionPlayerId !== undefined) {
    record.actorSessionPlayerId = event.actorSessionPlayerId;
  }
  if (event.roundIndex !== undefined) {
    record.roundIndex = event.roundIndex;
  }
  if (event.phase !== undefined) {
    record.phase = event.phase;
  }

  return record;
}

function snapshotState(state: GameState) {
  return {
    roomId: state.roomId,
    roomCode: state.roomCode,
    status: state.status,
    phase: state.phase,
    phaseVersion: state.phaseVersion,
    roundIndex: state.roundIndex,
    phaseEndsAt: state.phaseEndsAt,
    lobbyPlayers: state.lobbyPlayers,
    sessionPlayers: state.sessionPlayers,
    answers: state.answers,
    messages: state.messages,
    ballots: state.ballots,
    result: state.result
  };
}
