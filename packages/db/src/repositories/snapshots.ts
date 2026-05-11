import { execute, queryOne, type WiaiDatabaseClient } from "../client";

export type SnapshotRecord = {
  id: string;
  sessionId: string;
  roomId: string;
  phase: string;
  phaseVersion: number;
  state: unknown;
  createdAt: string;
};

export class SnapshotsRepository {
  constructor(private readonly client: WiaiDatabaseClient) {}

  save(input: SnapshotRecord): void {
    execute(
      this.client.db,
      `INSERT INTO game_snapshots
       (id, session_id, room_id, phase, phase_version, state_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.id,
        input.sessionId,
        input.roomId,
        input.phase,
        input.phaseVersion,
        JSON.stringify(input.state),
        input.createdAt
      ]
    );
  }

  latestForSession(sessionId: string): SnapshotRecord | undefined {
    return queryOne(
      this.client.db,
      `SELECT * FROM game_snapshots
       WHERE session_id = ?
       ORDER BY phase_version DESC
       LIMIT 1`,
      [sessionId],
      mapSnapshot
    );
  }
}

function mapSnapshot(row: Record<string, unknown>): SnapshotRecord {
  return {
    id: String(row.id),
    sessionId: String(row.session_id),
    roomId: String(row.room_id),
    phase: String(row.phase),
    phaseVersion: Number(row.phase_version),
    state: JSON.parse(String(row.state_json)),
    createdAt: String(row.created_at)
  };
}
