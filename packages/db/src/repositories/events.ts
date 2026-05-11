import { execute, queryAll, type WiaiDatabaseClient } from "../client";

export type EventRecord = {
  id: string;
  sequence: number;
  sessionId: string;
  roomId: string;
  type: string;
  actorSessionPlayerId?: string;
  roundIndex?: number;
  phase?: string;
  payload: unknown;
  createdAt: string;
};

export class EventsRepository {
  constructor(private readonly client: WiaiDatabaseClient) {}

  append(input: EventRecord): void {
    execute(
      this.client.db,
      `INSERT INTO game_events
       (id, session_id, room_id, sequence, type, actor_session_player_id, round_index, phase, payload_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.id,
        input.sessionId,
        input.roomId,
        input.sequence,
        input.type,
        input.actorSessionPlayerId ?? null,
        input.roundIndex ?? null,
        input.phase ?? null,
        JSON.stringify(input.payload),
        input.createdAt
      ]
    );
  }

  listBySession(sessionId: string): EventRecord[] {
    return queryAll(
      this.client.db,
      "SELECT * FROM game_events WHERE session_id = ? ORDER BY sequence ASC",
      [sessionId],
      mapEvent
    );
  }
}

function mapEvent(row: Record<string, unknown>): EventRecord {
  const record: EventRecord = {
    id: String(row.id),
    sequence: Number(row.sequence),
    sessionId: String(row.session_id),
    roomId: String(row.room_id),
    type: String(row.type),
    payload: JSON.parse(String(row.payload_json)),
    createdAt: String(row.created_at)
  };

  if (row.actor_session_player_id !== null && row.actor_session_player_id !== undefined) {
    record.actorSessionPlayerId = String(row.actor_session_player_id);
  }
  if (row.round_index !== null && row.round_index !== undefined) {
    record.roundIndex = Number(row.round_index);
  }
  if (row.phase !== null && row.phase !== undefined) {
    record.phase = String(row.phase);
  }

  return record;
}
