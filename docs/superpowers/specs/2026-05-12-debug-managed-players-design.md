# Debug Managed Players Design

## Goal

Add host-controlled debug human players so a developer can run a complete WiAI room from one browser tab. These players are not the hidden AI role and do not use the Agent role identity. They exist only as server-managed human participants for local debugging and automated flow testing.

## Context

WiAI currently creates lobby players only from connected Colyseus clients. Starting a game assigns one AI session player (`playerType: "ai"`, `role: "ai"`, `controlMode: "agent"`) and converts online lobby players into human session players. The kernel already defines `controlMode: "managed"`, which is the right boundary for debug players because it separates "human controlled by the server" from both browser-controlled humans and the real AI role.

## Requirements

- A room host can add debug players while the room is still in the lobby.
- Debug players count as online, ready lobby players for start-game validation.
- Debug players become `playerType: "human"` session players with `controlMode: "managed"`.
- Debug players can randomly receive `citizen` or `shelterer`; they must never receive the `ai` role.
- The existing hidden AI remains the only `playerType: "ai"` session player and keeps `controlMode: "agent"`.
- Managed players automatically submit answers, optionally send discussion messages, and submit votes so the game can complete without opening extra browser tabs.
- The feature is development-only in the UI and should not become a normal production gameplay path.

## Non-Goals

- Do not replace the existing Mock Agent or Agent orchestration path.
- Do not create real Colyseus client sessions for debug players.
- Do not make managed players configurable as the actual AI role.
- Do not build a full admin console or multi-room debug dashboard.

## Recommended Approach

Implement server-managed debug humans behind an explicit host action.

The lobby UI will expose a development-only control for hosts, such as "Add debug players" or "Fill with debug players." The control sends a new room command to the Colyseus room. The server validates that the actor is the host, the room is still in lobby, and the requested count fits under `maxPlayers`. The service then appends synthetic lobby players using stable IDs such as `lp_debug_1`, ready status `true`, status `online`, and display names like `Debug 1`.

When the game starts, role assignment treats these lobby players as regular online humans but assigns their resulting session players `controlMode: "managed"` instead of `"player"`. Role assignment should choose the shelterer randomly from human session players only, so debug players may receive `citizen` or `shelterer` but never `ai`. The existing `sp_ai` remains the sole AI role.

After phase transitions, a new managed-player orchestrator runs alongside the existing Agent orchestrator. It issues normal domain commands for each active managed player:

- `answer_prep`: submit a short answer using the current question and the player number.
- `discussion`: randomly either send one short message or skip.
- `voting`: submit the expected ballot type, never target self, and choose an active target from the current table.

Because managed behavior goes through the existing command bus, duplicate prevention, phase checks, settlement, persistence, and client snapshots stay on the same path as real players.

## Alternatives Considered

### Browser Automation Clients

Use Playwright or another script to open several browser clients and join the room normally.

This is behaviorally realistic but still consumes browser resources, creates timing flakiness, and does not solve the daily developer friction of manually driving multiple tabs.

### Reuse Agent Orchestration

Reuse the existing Agent provider to drive debug humans.

This would reduce code initially, but it blurs a critical product boundary: the AI role is a real game identity, while debug humans are only managed test participants. Keeping a separate managed-player orchestrator makes logs, snapshots, and future Agent work easier to reason about.

## Data Model

No new persisted table is required.

Use existing fields:

- `LobbyPlayer.id`: synthetic `lp_debug_*` ID.
- `LobbyPlayer.nickname`: generated debug name.
- `LobbyPlayer.isReady`: `true`.
- `LobbyPlayer.status`: `online`.
- `SessionPlayer.playerType`: `human`.
- `SessionPlayer.controlMode`: `managed`.
- `SessionPlayer.role`: assigned through normal human role assignment, limited to `citizen` or `shelterer`.

Optional event payloads can include `{ managed: true }` for debug player creation, but event type additions should stay minimal unless tests need the distinction.

## Server Commands

Add a browser/room command:

```ts
{
  type: "add_debug_players",
  payload: {
    count: number
  }
}
```

Validation:

- `count` is a positive integer.
- Actor must be the host.
- Room status must be `lobby`.
- Existing online plus added players must not exceed `config.maxPlayers`.

The command should return normal domain errors through the existing Colyseus `"error"` message path. If a new error code is needed, prefer a focused code such as `room_full` or `debug_players_forbidden`.

## Orchestration

Create a server-side `ManagedPlayerOrchestrator` that depends on `RoomApplicationService`.

The orchestrator should:

- Find active session players where `playerType === "human"` and `controlMode === "managed"`.
- Skip players who have already acted in the current phase.
- Submit deterministic-enough content for answers so tests are stable.
- Use random or seeded target selection for votes, while avoiding self-targets.
- Never inspect hidden roles before settlement.

The room should run this orchestrator after phase changes for `answer_prep`, `discussion`, and `voting`, similar to the Agent orchestrator scheduling. It should not run in `lobby`, `answer_reveal`, or `settlement`.

## UI

In the lobby, show the control only when:

- The connected user is host.
- The app is running in development mode.
- The room is in lobby.

The simplest first UI is a compact host-only button near the start-game controls:

- "Add debug players" adds enough debug players to reach `minPlayers`.
- The button is disabled when the room already has enough online players or cannot add more players under `maxPlayers`.
- A later refinement may add a count selector, but the first version should minimize UI surface.

Debug lobby rows can use existing player display UI. If labeling is added, use existing status badges or a small text label based on `controlMode` after the game starts.

## Testing

Unit tests should cover:

- Host can add managed debug lobby players.
- Non-host cannot add debug players.
- Debug players cannot exceed `maxPlayers`.
- Role assignment maps debug lobby players to `playerType: "human"` and `controlMode: "managed"`.
- Debug players can receive `citizen` or `shelterer` but not `ai`.
- Managed orchestrator submits answers and ballots through the existing command bus.

Integration tests should cover:

- One real host plus debug players can start and complete a full game.
- The real AI remains one `playerType: "ai"` player.
- Final settlement works after managed players vote.

Frontend tests should cover:

- Host sees the debug control in development.
- Non-host does not see the debug control.
- Clicking the control sends the new room command.

## Risks

- If debug controls leak into production, players could fill rooms with unmanaged test seats. Gate the UI by development mode and keep server validation explicit.
- If managed players all vote the same deterministic target, settlement outcomes may become repetitive. Use a simple target rotation or randomized choice while keeping tests able to assert completion.
- If managed orchestration runs too often, duplicate command errors can create noisy logs. The orchestrator should check existing answers and ballots before acting.

## Implementation Defaults

- The first UI fills only to `minPlayers`, because that solves the immediate "start a room from one browser" debugging problem without crowding the table.
- Discussion behavior randomly skips some managed players to mimic quieter tables while still allowing phase timers to advance.
- Vote target selection can be random in production-like local runs; tests should either inject deterministic selection or assert only that valid ballots are submitted.
