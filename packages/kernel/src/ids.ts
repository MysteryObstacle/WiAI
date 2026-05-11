export type Brand<T, Name extends string> = T & { readonly __brand: Name };

export type RoomId = Brand<string, "RoomId">;
export type LobbyPlayerId = Brand<string, "LobbyPlayerId">;
export type GameSessionId = Brand<string, "GameSessionId">;
export type SessionPlayerId = Brand<string, "SessionPlayerId">;
export type RoundId = Brand<string, "RoundId">;
export type GameEventId = Brand<string, "GameEventId">;
export type AgentAssignmentId = Brand<string, "AgentAssignmentId">;
export type RequestId = Brand<string, "RequestId">;

export function asId<T extends string>(value: string): Brand<string, T> {
  if (!value.trim()) {
    throw new Error("id_empty");
  }

  return value as Brand<string, T>;
}
