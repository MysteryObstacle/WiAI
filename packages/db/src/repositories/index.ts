import type { WiaiDatabaseClient } from "../client";
import { EventsRepository } from "./events";
import { RoomsRepository } from "./rooms";
import { SessionsRepository } from "./sessions";
import { SnapshotsRepository } from "./snapshots";

export type { WiaiDatabaseClient } from "../client";
export type { EventRecord } from "./events";
export type { RoomRecord } from "./rooms";
export type { SessionRecord } from "./sessions";
export type { SnapshotRecord } from "./snapshots";

export type WiaiRepositories = ReturnType<typeof createRepositories>;

export function createRepositories(client: WiaiDatabaseClient) {
  return {
    rooms: new RoomsRepository(client),
    sessions: new SessionsRepository(client),
    events: new EventsRepository(client),
    snapshots: new SnapshotsRepository(client)
  };
}
