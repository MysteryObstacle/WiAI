import { describe, expect, it } from "vitest";
import { RandomRoleAssignmentStrategy, isManagedDebugLobbyPlayerId } from "./roleAssignment";
import type { LobbyPlayer } from "./types";

const lobbyPlayers: LobbyPlayer[] = [
  {
    id: "lp_host",
    nickname: "Host",
    isHost: true,
    isReady: false,
    status: "online"
  },
  {
    id: "lp_debug_1",
    nickname: "Debug 1",
    isHost: false,
    isReady: true,
    status: "online"
  },
  {
    id: "lp_debug_2",
    nickname: "Debug 2",
    isHost: false,
    isReady: true,
    status: "online"
  }
];

describe("role assignment", () => {
  it("recognizes synthetic debug lobby player ids", () => {
    expect(isManagedDebugLobbyPlayerId("lp_debug_1")).toBe(true);
    expect(isManagedDebugLobbyPlayerId("lp_host")).toBe(false);
  });

  it("maps debug lobby players to managed human session players", () => {
    const players = new RandomRoleAssignmentStrategy(() => 1).assign(lobbyPlayers);
    const debugPlayers = players.filter((player) => player.lobbyPlayerId?.startsWith("lp_debug_"));

    expect(debugPlayers).toHaveLength(2);
    expect(debugPlayers).toEqual([
      expect.objectContaining({
        lobbyPlayerId: "lp_debug_1",
        playerType: "human",
        controlMode: "managed"
      }),
      expect.objectContaining({
        lobbyPlayerId: "lp_debug_2",
        playerType: "human",
        controlMode: "managed"
      })
    ]);
    expect(debugPlayers.map((player) => player.role)).toEqual(["shelterer", "citizen"]);
    expect(debugPlayers.every((player) => player.role !== "ai")).toBe(true);
    expect(players.filter((player) => player.playerType === "ai")).toHaveLength(1);
  });
});
