import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createWiaiDatabaseClient } from "./client";
import { createRepositories, type WiaiDatabaseClient } from "./repositories";

let tempDir = "";
let client: WiaiDatabaseClient;

beforeEach(async () => {
  tempDir = mkdtempSync(join(tmpdir(), "wiai-db-"));
  client = await createWiaiDatabaseClient({
    filename: join(tempDir, "wiai.sqlite")
  });
});

afterEach(() => {
  client.close();
  rmSync(tempDir, { recursive: true, force: true });
});

describe("WiAI repositories", () => {
  it("creates a room, session, event, snapshot, and final session result", () => {
    const repositories = createRepositories(client);

    repositories.rooms.create({
      id: "room_1",
      roomCode: "ABC123",
      status: "lobby",
      hostPlayerId: "lp_host",
      config: { minPlayers: 3 }
    });
    repositories.sessions.create({
      id: "session_1",
      roomId: "room_1",
      status: "playing",
      phase: "answer_prep",
      roundIndex: 0,
      phaseVersion: 1
    });
    repositories.events.append({
      id: "event_1",
      sequence: 1,
      sessionId: "session_1",
      roomId: "room_1",
      type: "game.started",
      roundIndex: 0,
      phase: "answer_prep",
      payload: { ok: true },
      createdAt: "2026-05-11T00:00:00.000Z"
    });
    repositories.snapshots.save({
      id: "snapshot_1",
      sessionId: "session_1",
      roomId: "room_1",
      phase: "answer_prep",
      phaseVersion: 1,
      state: { phase: "answer_prep" },
      createdAt: "2026-05-11T00:00:01.000Z"
    });
    repositories.sessions.settle({
      id: "session_1",
      winnerSide: "citizen",
      frozenSessionPlayerId: "sp_ai"
    });

    expect(repositories.rooms.findByCode("ABC123")).toMatchObject({
      id: "room_1",
      roomCode: "ABC123"
    });
    expect(repositories.events.listBySession("session_1")).toHaveLength(1);
    expect(repositories.snapshots.latestForSession("session_1")).toMatchObject({
      phase: "answer_prep",
      phaseVersion: 1
    });
    expect(repositories.sessions.find("session_1")).toMatchObject({
      status: "ended",
      winnerSide: "citizen",
      frozenSessionPlayerId: "sp_ai"
    });

    client.persist();
    expect(repositories.sessions.find("session_1")?.winnerSide).toBe("citizen");
  });
});
