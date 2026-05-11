import { execute, queryOne, type WiaiDatabaseClient } from "../client";

export type SessionRecord = {
  id: string;
  roomId: string;
  status: string;
  phase: string;
  roundIndex: number;
  phaseVersion: number;
  winnerSide?: string;
  frozenSessionPlayerId?: string;
};

export type CreateSessionInput = {
  id: string;
  roomId: string;
  status: string;
  phase: string;
  roundIndex: number;
  phaseVersion: number;
};

export type SettleSessionInput = {
  id: string;
  winnerSide: string;
  frozenSessionPlayerId: string;
};

export class SessionsRepository {
  constructor(private readonly client: WiaiDatabaseClient) {}

  create(input: CreateSessionInput): void {
    execute(
      this.client.db,
      `INSERT INTO game_sessions (id, room_id, status, phase, round_index, phase_version)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [input.id, input.roomId, input.status, input.phase, input.roundIndex, input.phaseVersion]
    );
  }

  updatePhase(input: {
    id: string;
    status: string;
    phase: string;
    roundIndex: number;
    phaseVersion: number;
  }): void {
    execute(
      this.client.db,
      `UPDATE game_sessions
       SET status = ?, phase = ?, round_index = ?, phase_version = ?
       WHERE id = ?`,
      [input.status, input.phase, input.roundIndex, input.phaseVersion, input.id]
    );
  }

  settle(input: SettleSessionInput): void {
    execute(
      this.client.db,
      `UPDATE game_sessions
       SET status = 'ended', winner_side = ?, frozen_session_player_id = ?
       WHERE id = ?`,
      [input.winnerSide, input.frozenSessionPlayerId, input.id]
    );
  }

  find(id: string): SessionRecord | undefined {
    return queryOne(this.client.db, "SELECT * FROM game_sessions WHERE id = ?", [id], mapSession);
  }
}

function mapSession(row: Record<string, unknown>): SessionRecord {
  const record: SessionRecord = {
    id: String(row.id),
    roomId: String(row.room_id),
    status: String(row.status),
    phase: String(row.phase),
    roundIndex: Number(row.round_index),
    phaseVersion: Number(row.phase_version)
  };

  if (row.winner_side !== null && row.winner_side !== undefined) {
    record.winnerSide = String(row.winner_side);
  }
  if (row.frozen_session_player_id !== null && row.frozen_session_player_id !== undefined) {
    record.frozenSessionPlayerId = String(row.frozen_session_player_id);
  }

  return record;
}
