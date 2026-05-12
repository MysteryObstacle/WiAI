import type { LobbyPlayer, SessionPlayer } from "./types";

export interface RoleAssignmentStrategy {
  assign(lobbyPlayers: LobbyPlayer[]): SessionPlayer[];
}

export type SheltererPicker = (humanCount: number) => number;

export class RandomRoleAssignmentStrategy implements RoleAssignmentStrategy {
  constructor(private readonly pickSheltererIndex: SheltererPicker = pickRandomIndex) {}

  assign(lobbyPlayers: LobbyPlayer[]): SessionPlayer[] {
    const onlineHumans = lobbyPlayers.filter((player) => player.status === "online");
    const sheltererIndex = normalizeIndex(
      this.pickSheltererIndex(onlineHumans.length),
      onlineHumans.length
    );

    const humans: SessionPlayer[] = onlineHumans.map((player, index) => ({
      id: `sp_${player.id}`,
      lobbyPlayerId: player.id,
      gameNumber: index + 1,
      displayName: player.nickname,
      playerType: "human",
      role: index === sheltererIndex ? "shelterer" : "citizen",
      controlMode: isManagedDebugLobbyPlayerId(player.id) ? "managed" : "player",
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

export function isManagedDebugLobbyPlayerId(lobbyPlayerId: string): boolean {
  return /^lp_debug_\d+$/.test(lobbyPlayerId);
}

export function assignRoles(lobbyPlayers: LobbyPlayer[]): SessionPlayer[] {
  return new RandomRoleAssignmentStrategy().assign(lobbyPlayers);
}

function pickRandomIndex(humanCount: number): number {
  return humanCount > 0 ? Math.floor(Math.random() * humanCount) : 0;
}

function normalizeIndex(index: number, length: number): number {
  if (length < 1) {
    return -1;
  }

  return Math.max(0, Math.min(length - 1, index));
}
