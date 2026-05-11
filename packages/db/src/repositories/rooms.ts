import { execute, queryOne, type WiaiDatabaseClient } from "../client";

export type RoomRecord = {
  id: string;
  roomCode: string;
  status: string;
  hostPlayerId: string;
  config: unknown;
  createdAt: string;
  updatedAt: string;
};

export type CreateRoomInput = {
  id: string;
  roomCode: string;
  status: string;
  hostPlayerId: string;
  config: unknown;
};

export class RoomsRepository {
  constructor(private readonly client: WiaiDatabaseClient) {}

  create(input: CreateRoomInput): void {
    const now = new Date().toISOString();
    execute(
      this.client.db,
      `INSERT INTO rooms (id, room_code, status, host_player_id, config_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [input.id, input.roomCode, input.status, input.hostPlayerId, JSON.stringify(input.config), now, now]
    );
  }

  findByCode(roomCode: string): RoomRecord | undefined {
    return queryOne(
      this.client.db,
      "SELECT * FROM rooms WHERE room_code = ?",
      [roomCode],
      mapRoom
    );
  }

  find(id: string): RoomRecord | undefined {
    return queryOne(this.client.db, "SELECT * FROM rooms WHERE id = ?", [id], mapRoom);
  }
}

function mapRoom(row: Record<string, unknown>): RoomRecord {
  return {
    id: String(row.id),
    roomCode: String(row.room_code),
    status: String(row.status),
    hostPlayerId: String(row.host_player_id),
    config: JSON.parse(String(row.config_json)),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}
