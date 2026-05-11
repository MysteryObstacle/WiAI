import type { LobbyPlayer, SessionPlayer } from "./types";

export interface RoleAssignmentStrategy {
  assign(lobbyPlayers: LobbyPlayer[]): SessionPlayer[];
}

export class DeterministicRoleAssignmentStrategy implements RoleAssignmentStrategy {
  assign(lobbyPlayers: LobbyPlayer[]): SessionPlayer[] {
    const onlineHumans = lobbyPlayers.filter((player) => player.status === "online");
    const sheltererLobbyId = onlineHumans.find((player) => !player.isHost)?.id ?? onlineHumans[0]?.id;

    const humans: SessionPlayer[] = onlineHumans.map((player, index) => ({
      id: `sp_${player.id}`,
      lobbyPlayerId: player.id,
      gameNumber: index + 1,
      displayName: player.nickname,
      playerType: "human",
      role: player.id === sheltererLobbyId ? "shelterer" : "citizen",
      controlMode: "player",
      isActive: true
    }));

    return [
      ...humans,
      {
        id: "sp_ai",
        gameNumber: humans.length + 1,
        displayName: "Mock AI",
        playerType: "ai",
        role: "ai",
        controlMode: "agent",
        isActive: true
      }
    ];
  }
}

export function assignRoles(lobbyPlayers: LobbyPlayer[]): SessionPlayer[] {
  return new DeterministicRoleAssignmentStrategy().assign(lobbyPlayers);
}
