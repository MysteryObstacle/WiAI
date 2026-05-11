# Repository And Unit Of Work Contracts

Repositories hide Drizzle details from application services. `WiaiRoom` should not call repositories directly except through a server application service.

## Unit Of Work

Accepted command persistence must be atomic.

```ts
interface GameUnitOfWork {
  run<T>(operation: (repos: GameRepositories) => Promise<T>): Promise<T>;
}
```

`GameRepositories` includes room, player, session, event, snapshot, and Agent audit repositories bound to the same transaction.

## Room Repository

```ts
createRoom(input: CreateRoomRecord): Promise<RoomRecord>
getRoomByCode(roomCode: RoomCode): Promise<RoomRecord | null>
updateRoomStatus(roomId: RoomId, status: RoomStatus): Promise<void>
```

## Player Repository

```ts
createLobbyPlayer(input: CreateLobbyPlayerRecord): Promise<LobbyPlayerRecord>
setReady(playerId: LobbyPlayerId, isReady: boolean): Promise<void>
setConnectionStatus(playerId: LobbyPlayerId, status: ConnectionStatus): Promise<void>
```

## Session Repository

```ts
createSession(input: CreateSessionRecord): Promise<GameSessionRecord>
createSessionPlayers(input: CreateSessionPlayerRecord[]): Promise<SessionPlayerRecord[]>
updatePhase(input: UpdatePhaseRecord): Promise<void>
settleSession(input: SettleSessionRecord): Promise<void>
```

## Event Repository

```ts
appendEvent(event: AppendGameEventRecord): Promise<GameEventRecord>
appendEvents(events: AppendGameEventRecord[]): Promise<GameEventRecord[]>
getEventsAfter(sessionId: SessionId, sequence: number): Promise<GameEventRecord[]>
```

## Snapshot Repository

```ts
saveSnapshot(snapshot: SaveSnapshotRecord): Promise<void>
getLatestSnapshot(sessionId: SessionId): Promise<GameSnapshotRecord | null>
```

## Agent Audit Repository

```ts
appendAgentAudit(audit: AppendAgentAuditRecord): Promise<AgentActionAuditRecord>
markAgentAuditResult(input: MarkAgentAuditResultRecord): Promise<void>
```

## Contract Rules

- Inputs are plain objects.
- Outputs are plain objects.
- Repositories do not accept Colyseus Schema instances.
- Repositories do not accept Zod DTOs.
- Repositories do not contain game rule decisions.
- Repositories do not call Agent providers.
- Repository methods should be idempotent where `requestId` or event id is supplied.

## Mapping Rule

Application services map between:

```text
Domain events and aggregate snapshots
  <-> persistence records
```

This mapping must not live in `packages/game`.
