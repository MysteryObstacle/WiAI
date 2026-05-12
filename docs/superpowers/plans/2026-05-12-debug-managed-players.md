# Debug Managed Players Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add host-controlled debug human players that can auto-answer, optionally chat, and vote so one browser tab can drive a complete local WiAI game.

**Architecture:** Add a typed `add_debug_players` command through the schema and game command bus. Synthetic lobby players use `lp_debug_*` IDs, become `playerType: "human"` plus `controlMode: "managed"` at session start, and are driven by a server-side `ManagedPlayerOrchestrator` that submits normal domain commands. The lobby exposes a development-only host button that fills to the minimum player count.

**Tech Stack:** TypeScript, Zod, Vitest, Colyseus, Next.js App Router, next-intl, Playwright.

---

## File Structure

- Modify `packages/schema/src/commands.ts`: add the browser command schema and intent mapping for `add_debug_players`.
- Modify `packages/schema/src/errors.ts`: add domain error codes used by the new command.
- Modify `packages/schema/src/commands.test.ts`: prove schema parsing and actor mapping.
- Modify `packages/game/src/types.ts`: add `AddDebugPlayersIntent` and new error codes.
- Modify `packages/game/src/state.ts`: keep lobby helpers as-is; use `addLobbyPlayer` for synthetic players.
- Modify `packages/game/src/commands/handlers.ts`: execute host-validated debug player creation.
- Modify `packages/game/src/commands/handlers.test.ts`: cover host, non-host, max player, and start-game behavior.
- Modify `packages/game/src/roleAssignment.ts`: mark `lp_debug_*` lobby players as managed human session players and choose the shelterer from humans only.
- Create `packages/game/src/roleAssignment.test.ts`: cover managed control mode and role limits.
- Create `apps/server/src/application/ManagedPlayerOrchestrator.ts`: drive managed humans through existing domain commands.
- Modify `apps/server/src/rooms/WiaiRoom.ts`: instantiate and schedule the managed orchestrator next to the Agent orchestrator.
- Modify `apps/server/src/rooms/WiaiRoom.test.ts`: cover one real host plus debug players completing managed actions.
- Modify `apps/web/src/game-client/roomCommands.ts`: add `sendAddDebugPlayers`.
- Create `apps/web/src/game-client/roomCommands.test.ts`: verify the client sends the new command payload.
- Modify `apps/web/src/components/lobby/LobbyRoom.tsx`: render the development-only host debug button.
- Modify `apps/web/src/messages/en-US.json` and `apps/web/src/messages/zh-CN.json`: add button label and disabled copy under `lobby.debug`.
- Modify `apps/web/src/messages/messages.test.ts`: assert the new locale keys exist in both locales.
- Modify `tests/e2e/full-game.spec.ts`: replace the three-browser path with a one-browser debug-player path.

---

### Task 1: Add The Wire Command Schema

**Files:**
- Modify: `packages/schema/src/commands.ts`
- Modify: `packages/schema/src/errors.ts`
- Test: `packages/schema/src/commands.test.ts`

- [ ] **Step 1: Write the failing schema tests**

Add these cases to `packages/schema/src/commands.test.ts`:

```ts
it("parses add_debug_players with a positive count", () => {
  const parsed = browserCommandSchema.parse({
    type: "add_debug_players",
    payload: { count: 2 },
    requestId: "req_debug"
  });

  expect(parsed).toEqual({
    type: "add_debug_players",
    payload: { count: 2 },
    requestId: "req_debug"
  });
});

it("rejects add_debug_players without a positive count", () => {
  const parsed = browserCommandSchema.safeParse({
    type: "add_debug_players",
    payload: { count: 0 }
  });

  expect(parsed.success).toBe(false);
});

it("maps add_debug_players to a host lobby actor intent", () => {
  const parsed = browserCommandSchema.parse({
    type: "add_debug_players",
    payload: { count: 2 },
    requestId: "req_debug"
  });

  expect(
    mapBrowserCommandToIntent(parsed, {
      actorLobbyPlayerId: "lp_host"
    })
  ).toEqual({
    type: "add_debug_players",
    actorLobbyPlayerId: "lp_host",
    requestId: "req_debug",
    count: 2
  });
});
```

- [ ] **Step 2: Run the schema tests and verify they fail**

Run: `npm run test -w @wiai/schema -- src/commands.test.ts`

Expected: FAIL with a Zod discriminated union error or TypeScript compile failure because `add_debug_players` is not part of `browserCommandSchema`.

- [ ] **Step 3: Add the command schema and intent mapping**

In `packages/schema/src/commands.ts`, add this schema after `startGameCommandSchema`:

```ts
export const addDebugPlayersCommandSchema = z.object({
  type: z.literal("add_debug_players"),
  payload: z.object({
    count: z.number().int().positive()
  }),
  requestId: z.string().trim().min(1).optional()
});
```

Include it in `browserCommandSchema`:

```ts
export const browserCommandSchema = z.discriminatedUnion("type", [
  readyCommandSchema,
  startGameCommandSchema,
  addDebugPlayersCommandSchema,
  submitAnswerCommandSchema,
  cancelSubmitAnswerCommandSchema,
  sendChatCommandSchema,
  submitBallotCommandSchema,
  requestStateCommandSchema
]);
```

Add this union member to `CommandIntent`:

```ts
  | {
      type: "add_debug_players";
      actorLobbyPlayerId: string;
      requestId?: string;
      count: number;
    }
```

Add this switch branch in `mapBrowserCommandToIntent` immediately after `start_game`:

```ts
    case "add_debug_players":
      return withOptionalRequestId({
        type: "add_debug_players",
        actorLobbyPlayerId: requireLobbyActor(actor),
        count: command.payload.count
      }, requestId);
```

In `packages/schema/src/errors.ts`, add these strings to `errorCodes` after `"players_not_ready"`:

```ts
  "room_full",
  "invalid_debug_player_count",
```

- [ ] **Step 4: Run the schema tests and verify they pass**

Run: `npm run test -w @wiai/schema -- src/commands.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/schema/src/commands.ts packages/schema/src/errors.ts packages/schema/src/commands.test.ts
git commit -m "feat(schema): add debug player command"
```

---

### Task 2: Add The Domain Command For Debug Lobby Players

**Files:**
- Modify: `packages/game/src/types.ts`
- Modify: `packages/game/src/commands/handlers.ts`
- Modify: `packages/game/src/commands/handlers.test.ts`

- [ ] **Step 1: Write failing command bus tests**

Add these tests to `packages/game/src/commands/handlers.test.ts`:

```ts
it("lets the host add ready debug players in the lobby", () => {
  const state = createInitialGameState({
    roomId: "room_1",
    roomCode: "ABC123",
    config: {
      minPlayers: 3,
      maxPlayers: 6,
      phaseDurationsMs: {
        answer_prep: 30_000,
        answer_reveal: 3_000,
        discussion: 30_000,
        voting: 30_000,
        settlement: 0
      }
    }
  });
  const bus = new CommandBus();
  addLobbyPlayer(state, { id: "lp_host", nickname: "Host", isHost: true });

  const result = bus.execute(state, {
    type: "add_debug_players",
    actorLobbyPlayerId: "lp_host",
    count: 2
  });

  expect(result.ok).toBe(true);
  expect(state.lobbyPlayers.map((player) => player.id)).toEqual([
    "lp_host",
    "lp_debug_1",
    "lp_debug_2"
  ]);
  expect(state.lobbyPlayers.slice(1)).toEqual([
    expect.objectContaining({
      nickname: "Debug 1",
      isHost: false,
      isReady: true,
      status: "online"
    }),
    expect.objectContaining({
      nickname: "Debug 2",
      isHost: false,
      isReady: true,
      status: "online"
    })
  ]);
});

it("rejects debug player creation from non-hosts and full rooms", () => {
  const state = createLobby();
  const bus = new CommandBus();

  expect(
    bus.execute(state, {
      type: "add_debug_players",
      actorLobbyPlayerId: "lp_ada",
      count: 1
    })
  ).toMatchObject({ ok: false, error: { code: "not_host" } });

  expect(
    bus.execute(state, {
      type: "add_debug_players",
      actorLobbyPlayerId: "lp_host",
      count: 4
    })
  ).toMatchObject({ ok: false, error: { code: "room_full" } });
});
```

- [ ] **Step 2: Run the game command tests and verify they fail**

Run: `npm run test -w @wiai/game -- src/commands/handlers.test.ts`

Expected: FAIL because `add_debug_players` is not a `DomainCommand`.

- [ ] **Step 3: Add the domain command type and error codes**

In `packages/game/src/types.ts`, add these error codes to `GameErrorCode` after `"players_not_ready"`:

```ts
  | "room_full"
  | "invalid_debug_player_count"
```

Add this intent type after `StartGameIntent`:

```ts
export type AddDebugPlayersIntent = {
  type: "add_debug_players";
  actorLobbyPlayerId: string;
  requestId?: string;
  count: number;
};
```

Include it in `DomainCommand`:

```ts
export type DomainCommand =
  | ReadyIntent
  | StartGameIntent
  | AddDebugPlayersIntent
  | SubmitAnswerIntent
  | CancelSubmitAnswerIntent
  | SendChatIntent
  | SubmitBallotIntent;
```

- [ ] **Step 4: Implement debug lobby player creation**

In `packages/game/src/commands/handlers.ts`, add `AddDebugPlayersIntent` to the type import list:

```ts
  AddDebugPlayersIntent,
```

Add `addLobbyPlayer` to the import from `../state`:

```ts
  addLobbyPlayer,
```

Add this switch branch after `start_game`:

```ts
    case "add_debug_players":
      return handleAddDebugPlayers(state, command);
```

Add this handler after `handleStartGame`:

```ts
function handleAddDebugPlayers(
  state: GameState,
  command: AddDebugPlayersIntent
): CommandResult {
  const host = getHostLobbyPlayer(state);
  if (!host || host.id !== command.actorLobbyPlayerId) {
    return err("not_host", "Only the host can add debug players");
  }
  if (state.status !== "lobby") {
    return err("room_not_lobby", "Debug players can only be added in lobby");
  }
  if (command.count < 1) {
    return err("invalid_debug_player_count", "Debug player count must be positive");
  }

  const onlinePlayers = getOnlineLobbyPlayers(state);
  if (onlinePlayers.length + command.count > state.config.maxPlayers) {
    return err("room_full", "Debug players would exceed room maximum");
  }

  const existingDebugCount = state.lobbyPlayers.filter((player) =>
    player.id.startsWith("lp_debug_")
  ).length;

  for (let offset = 1; offset <= command.count; offset += 1) {
    const debugNumber = existingDebugCount + offset;
    addLobbyPlayer(state, {
      id: `lp_debug_${debugNumber}`,
      nickname: `Debug ${debugNumber}`,
      isHost: false,
      isReady: true,
      status: "online"
    });
  }

  return ok([]);
}
```

- [ ] **Step 5: Run the game command tests and verify they pass**

Run: `npm run test -w @wiai/game -- src/commands/handlers.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/game/src/types.ts packages/game/src/commands/handlers.ts packages/game/src/commands/handlers.test.ts
git commit -m "feat(game): add debug lobby players"
```

---

### Task 3: Assign Managed Human Session Players

**Files:**
- Modify: `packages/game/src/roleAssignment.ts`
- Create: `packages/game/src/roleAssignment.test.ts`
- Modify: `packages/game/src/commands/handlers.test.ts`

- [ ] **Step 1: Write failing role assignment tests**

Create `packages/game/src/roleAssignment.test.ts`:

```ts
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
```

Add this test to `packages/game/src/commands/handlers.test.ts` so start-game behavior also covers debug-filled rooms:

```ts
it("starts a session with debug players as managed humans", () => {
  const state = createInitialGameState({
    roomId: "room_1",
    roomCode: "ABC123",
    config: {
      minPlayers: 3,
      maxPlayers: 6,
      phaseDurationsMs: {
        answer_prep: 30_000,
        answer_reveal: 3_000,
        discussion: 30_000,
        voting: 30_000,
        settlement: 0
      }
    }
  });
  const bus = new CommandBus();
  addLobbyPlayer(state, { id: "lp_host", nickname: "Host", isHost: true });
  const addDebug = bus.execute(state, {
    type: "add_debug_players",
    actorLobbyPlayerId: "lp_host",
    count: 2
  });
  expect(addDebug.ok).toBe(true);

  const start = bus.execute(state, {
    type: "start_game",
    actorLobbyPlayerId: "lp_host"
  });

  expect(start.ok).toBe(true);
  expect(state.sessionPlayers.filter((player) => player.controlMode === "managed")).toHaveLength(2);
  expect(
    state.sessionPlayers
      .filter((player) => player.controlMode === "managed")
      .every((player) => player.playerType === "human" && player.role !== "ai")
  ).toBe(true);
});
```

- [ ] **Step 2: Run role assignment tests and verify they fail**

Run: `npm run test -w @wiai/game -- src/roleAssignment.test.ts src/commands/handlers.test.ts`

Expected: FAIL because `RandomRoleAssignmentStrategy` and `isManagedDebugLobbyPlayerId` do not exist, and debug players currently become `controlMode: "player"`.

- [ ] **Step 3: Replace role assignment with managed-aware random shelterer selection**

Replace `packages/game/src/roleAssignment.ts` with:

```ts
import type { LobbyPlayer, SessionPlayer } from "./types";

export interface RoleAssignmentStrategy {
  assign(lobbyPlayers: LobbyPlayer[]): SessionPlayer[];
}

export type SheltererPicker = (humanCount: number) => number;

export class RandomRoleAssignmentStrategy implements RoleAssignmentStrategy {
  constructor(private readonly pickSheltererIndex: SheltererPicker = pickRandomIndex) {}

  assign(lobbyPlayers: LobbyPlayer[]): SessionPlayer[] {
    const onlineHumans = lobbyPlayers.filter((player) => player.status === "online");
    const sheltererIndex = normalizeIndex(this.pickSheltererIndex(onlineHumans.length), onlineHumans.length);

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
```

- [ ] **Step 4: Run role assignment and command tests**

Run: `npm run test -w @wiai/game -- src/roleAssignment.test.ts src/commands/handlers.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/game/src/roleAssignment.ts packages/game/src/roleAssignment.test.ts packages/game/src/commands/handlers.test.ts
git commit -m "feat(game): assign debug players as managed humans"
```

---

### Task 4: Add Managed Player Orchestration

**Files:**
- Create: `apps/server/src/application/ManagedPlayerOrchestrator.ts`
- Modify: `apps/server/src/rooms/WiaiRoom.test.ts`

- [ ] **Step 1: Write failing orchestrator tests**

Add this import to `apps/server/src/rooms/WiaiRoom.test.ts`:

```ts
import { ManagedPlayerOrchestrator } from "../application/ManagedPlayerOrchestrator";
```

Add this test:

```ts
it("routes managed human players through answers, chat, and ballots", async () => {
  const db = await createWiaiDatabaseClient();
  const service = new RoomApplicationService({
    roomId: "room_managed",
    roomCode: "DBG123",
    db
  });

  service.joinLobby({ lobbyPlayerId: "lp_host", nickname: "Host", isHost: true });
  expect(
    service.execute({
      type: "add_debug_players",
      actorLobbyPlayerId: "lp_host",
      count: 2
    }).ok
  ).toBe(true);
  expect(service.execute({ type: "start_game", actorLobbyPlayerId: "lp_host" }).ok).toBe(true);

  const orchestrator = new ManagedPlayerOrchestrator(service, {
    shouldSendDiscussionMessage: () => true,
    chooseVoteTarget: (_player, candidates) => candidates[0]!
  });

  const answerResult = orchestrator.runOnce();
  expect(answerResult.ok).toBe(true);
  expect(service.state.answers.filter((answer) => answer.sessionPlayerId.startsWith("sp_lp_debug_"))).toHaveLength(2);

  for (const player of service.state.sessionPlayers.filter((candidate) => candidate.controlMode === "player")) {
    service.execute({
      type: "submit_answer",
      actorSessionPlayerId: player.id,
      content: `Answer from ${player.displayName}`
    });
  }
  const agent = new AgentOrchestrator(service);
  await agent.runOnce();
  expect(service.state.phase).toBe("answer_reveal");

  service.handlePhaseTimeout(service.state.phaseVersion);
  expect(service.state.phase).toBe("discussion");
  const chatResult = orchestrator.runOnce();
  expect(chatResult.ok).toBe(true);
  expect(service.state.messages.filter((message) => message.sessionPlayerId.startsWith("sp_lp_debug_"))).toHaveLength(2);

  service.handlePhaseTimeout(service.state.phaseVersion);
  expect(service.state.phase).toBe("voting");
  const ballotResult = orchestrator.runOnce();
  expect(ballotResult.ok).toBe(true);
  expect(service.state.ballots.filter((ballot) => ballot.actorSessionPlayerId.startsWith("sp_lp_debug_"))).toHaveLength(2);

  db.close();
});
```

- [ ] **Step 2: Run server tests and verify they fail**

Run: `npm run test -w apps-server -- src/rooms/WiaiRoom.test.ts`

Expected: FAIL because `ManagedPlayerOrchestrator` does not exist.

- [ ] **Step 3: Implement the managed orchestrator**

Create `apps/server/src/application/ManagedPlayerOrchestrator.ts`:

```ts
import { err, ok, type Result } from "@wiai/kernel";
import {
  expectedBallotType,
  getActiveSessionPlayers,
  getCurrentQuestion,
  type DomainCommand,
  type GameErrorCode,
  type GameEvent,
  type GameState,
  type SessionPlayer
} from "@wiai/game";
import type { RoomApplicationService } from "./RoomApplicationService";

type ManagedPlayerOptions = {
  shouldSendDiscussionMessage?: (player: SessionPlayer, state: GameState) => boolean;
  chooseVoteTarget?: (player: SessionPlayer, candidates: SessionPlayer[], state: GameState) => SessionPlayer;
};

export class ManagedPlayerOrchestrator {
  private readonly shouldSendDiscussionMessage: NonNullable<ManagedPlayerOptions["shouldSendDiscussionMessage"]>;
  private readonly chooseVoteTarget: NonNullable<ManagedPlayerOptions["chooseVoteTarget"]>;

  constructor(
    private readonly service: RoomApplicationService,
    options: ManagedPlayerOptions = {}
  ) {
    this.shouldSendDiscussionMessage =
      options.shouldSendDiscussionMessage ?? (() => Math.random() >= 0.35);
    this.chooseVoteTarget =
      options.chooseVoteTarget ??
      ((_player, candidates) => candidates[Math.floor(Math.random() * candidates.length)]!);
  }

  runOnce(): Result<GameEvent[], GameErrorCode> {
    const state = this.service.state;
    if (state.status !== "playing") {
      return ok([]);
    }

    const commands = this.buildCommands(state);
    const events: GameEvent[] = [];
    for (const command of commands) {
      const result = this.service.execute(command);
      if (!result.ok) {
        return err(result.error.code, result.error.message, result.error);
      }
      events.push(...result.value);
    }

    return ok(events);
  }

  private buildCommands(state: GameState): DomainCommand[] {
    const players = getActiveSessionPlayers(state).filter(
      (player) => player.playerType === "human" && player.controlMode === "managed"
    );
    return players.flatMap((player) => {
      const command = this.buildCommandForPlayer(state, player);
      return command ? [command] : [];
    });
  }

  private buildCommandForPlayer(
    state: GameState,
    player: SessionPlayer
  ): DomainCommand | undefined {
    if (state.phase === "answer_prep") {
      return this.buildAnswerCommand(state, player);
    }
    if (state.phase === "discussion") {
      return this.buildChatCommand(state, player);
    }
    if (state.phase === "voting") {
      return this.buildBallotCommand(state, player);
    }
    return undefined;
  }

  private buildAnswerCommand(state: GameState, player: SessionPlayer): DomainCommand | undefined {
    const alreadyAnswered = state.answers.some(
      (answer) => answer.roundIndex === state.roundIndex && answer.sessionPlayerId === player.id
    );
    if (alreadyAnswered) {
      return undefined;
    }

    return {
      type: "submit_answer",
      actorSessionPlayerId: player.id,
      requestId: `managed_answer_${state.roundIndex}_${player.id}`,
      content: `Player ${player.gameNumber} debug answer: ${getCurrentQuestion(state).prompt}`
    };
  }

  private buildChatCommand(state: GameState, player: SessionPlayer): DomainCommand | undefined {
    const alreadySpoke = state.messages.some(
      (message) => message.roundIndex === state.roundIndex && message.sessionPlayerId === player.id
    );
    if (alreadySpoke || !this.shouldSendDiscussionMessage(player, state)) {
      return undefined;
    }

    return {
      type: "send_chat",
      actorSessionPlayerId: player.id,
      requestId: `managed_chat_${state.roundIndex}_${player.id}`,
      content: `Player ${player.gameNumber}: I am comparing concrete details before voting.`
    };
  }

  private buildBallotCommand(state: GameState, player: SessionPlayer): DomainCommand | undefined {
    const ballotType = expectedBallotType(state.roundIndex);
    const alreadyVoted = state.ballots.some(
      (ballot) =>
        ballot.roundIndex === state.roundIndex &&
        ballot.actorSessionPlayerId === player.id &&
        ballot.ballotType === ballotType
    );
    if (alreadyVoted) {
      return undefined;
    }

    const candidates = getActiveSessionPlayers(state).filter((candidate) => candidate.id !== player.id);
    if (candidates.length < 1) {
      if (ballotType === "decision") {
        return undefined;
      }
      return {
        type: "submit_ballot",
        actorSessionPlayerId: player.id,
        requestId: `managed_ballot_${state.roundIndex}_${player.id}`,
        ballotType,
        abstain: true
      };
    }

    const target = this.chooseVoteTarget(player, candidates, state);
    return {
      type: "submit_ballot",
      actorSessionPlayerId: player.id,
      requestId: `managed_ballot_${state.roundIndex}_${player.id}`,
      ballotType,
      targetGameNumber: target.gameNumber,
      abstain: false
    };
  }
}
```

- [ ] **Step 4: Run server tests and verify they pass**

Run: `npm run test -w apps-server -- src/rooms/WiaiRoom.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/application/ManagedPlayerOrchestrator.ts apps/server/src/rooms/WiaiRoom.test.ts
git commit -m "feat(server): add managed player orchestrator"
```

---

### Task 5: Schedule Managed Players In The Colyseus Room

**Files:**
- Modify: `apps/server/src/rooms/WiaiRoom.ts`
- Modify: `apps/server/src/rooms/WiaiRoom.test.ts`

- [ ] **Step 1: Add a scheduling assertion to the integration test**

In `apps/server/src/rooms/WiaiRoom.test.ts`, extend the existing first test after `const orchestrator = new AgentOrchestrator(service);` with a managed orchestrator:

```ts
    const managed = new ManagedPlayerOrchestrator(service, {
      shouldSendDiscussionMessage: () => true,
      chooseVoteTarget: (_player, candidates) => candidates[0]!
    });
```

Then, before each human manual loop in that test, run managed players:

```ts
    const managedAnswer = managed.runOnce();
    expect(managedAnswer.ok).toBe(true);
```

In discussion and voting sections, add:

```ts
    const managedChat = managed.runOnce();
    expect(managedChat.ok).toBe(true);
```

```ts
    const managedVote = managed.runOnce();
    expect(managedVote.ok).toBe(true);
```

This keeps the service-level behavior covered while `WiaiRoom.ts` wires the same orchestrator into room timers.

- [ ] **Step 2: Modify WiaiRoom scheduling**

In `apps/server/src/rooms/WiaiRoom.ts`, import the orchestrator:

```ts
import { ManagedPlayerOrchestrator } from "../application/ManagedPlayerOrchestrator";
```

Add fields:

```ts
  private managedOrchestrator!: ManagedPlayerOrchestrator;
  private managedTimer?: { clear: () => void };
```

Instantiate it in `onCreate` after the Agent orchestrator:

```ts
    this.orchestrator = new AgentOrchestrator(this.service);
    this.managedOrchestrator = new ManagedPlayerOrchestrator(this.service);
```

Clear it in `onDispose`:

```ts
    this.managedTimer?.clear();
```

Clear it at the top of `schedulePhaseWork`:

```ts
    this.managedTimer?.clear();
```

Inside the existing `if (phase === "answer_prep" || phase === "discussion" || phase === "voting")` block, schedule managed players before the Agent timer:

```ts
      this.managedTimer = this.clock.setTimeout(() => {
        const previousPhaseVersion = this.service.state.phaseVersion;
        this.managedOrchestrator.runOnce();
        this.syncState();
        if (this.service.state.phaseVersion !== previousPhaseVersion) {
          this.schedulePhaseWork();
        }
      }, 125);
```

Keep the existing Agent timer at 250 ms so the real AI still runs through its separate path.

- [ ] **Step 3: Run server tests and typecheck**

Run: `npm run test -w apps-server -- src/rooms/WiaiRoom.test.ts`

Expected: PASS.

Run: `npm run typecheck -w apps-server`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/server/src/rooms/WiaiRoom.ts apps/server/src/rooms/WiaiRoom.test.ts
git commit -m "feat(server): schedule managed debug players"
```

---

### Task 6: Add Frontend Command And Host Debug Button

**Files:**
- Modify: `apps/web/src/game-client/roomCommands.ts`
- Create: `apps/web/src/game-client/roomCommands.test.ts`
- Modify: `apps/web/src/components/lobby/LobbyRoom.tsx`
- Modify: `apps/web/src/messages/en-US.json`
- Modify: `apps/web/src/messages/zh-CN.json`
- Modify: `apps/web/src/messages/messages.test.ts`

- [ ] **Step 1: Write failing frontend command test**

Create `apps/web/src/game-client/roomCommands.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { sendAddDebugPlayers } from "./roomCommands";

describe("room commands", () => {
  it("sends add_debug_players with the requested count", () => {
    const room = {
      send: vi.fn()
    };

    sendAddDebugPlayers(room as unknown as Parameters<typeof sendAddDebugPlayers>[0], 2);

    expect(room.send).toHaveBeenCalledWith("add_debug_players", { count: 2 });
  });
});
```

- [ ] **Step 2: Run the frontend command test and verify it fails**

Run: `npm run test -w apps-web -- src/game-client/roomCommands.test.ts`

Expected: FAIL because `sendAddDebugPlayers` is not exported.

- [ ] **Step 3: Add the command sender**

In `apps/web/src/game-client/roomCommands.ts`, add:

```ts
export function sendAddDebugPlayers(room: Room, count: number) {
  room.send("add_debug_players", { count });
}
```

- [ ] **Step 4: Add locale keys and locale test assertions**

In `apps/web/src/messages/en-US.json`, add `debug` under `lobby` after `start`:

```json
    "debug": {
      "addPlayers": "Add debug players",
      "addPlayersDisabled": "Debug players are not needed"
    },
```

In `apps/web/src/messages/zh-CN.json`, add matching keys under `lobby` after `start`:

```json
    "debug": {
      "addPlayers": "添加调试玩家",
      "addPlayersDisabled": "暂不需要调试玩家"
    },
```

In `apps/web/src/messages/messages.test.ts`, add these keys to the `expectedLeafKeys` array in the locale sync test or add a focused assertion in `"provides translated labels for game display enums and player references"`:

```ts
        "lobby.debug.addPlayers",
        "lobby.debug.addPlayersDisabled",
```

- [ ] **Step 5: Render the development-only host button**

In `apps/web/src/components/lobby/LobbyRoom.tsx`, update imports:

```ts
import { Check, Clipboard, Play, ShieldAlert, UserPlus } from "lucide-react";
import { sendAddDebugPlayers, sendReady, sendStartGame } from "@/game-client/roomCommands";
```

Add these constants after `canStart`:

```ts
  const minPlayers = 3;
  const maxPlayers = 6;
  const onlinePlayerCount = snapshot.lobbyPlayers.filter((player) => player.status === "online").length;
  const debugPlayersToAdd = Math.max(0, minPlayers - onlinePlayerCount);
  const canAddDebugPlayers = isHost && debugPlayersToAdd > 0 && onlinePlayerCount < maxPlayers;
  const showDebugControls = process.env.NODE_ENV === "development" && isHost && snapshot.phase === "lobby";
```

Replace the existing `enoughPlayers` line with:

```ts
  const enoughPlayers = onlinePlayerCount >= minPlayers;
```

Render this button before the start-game button:

```tsx
          {showDebugControls && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-testid="add-debug-players"
                  variant="secondary"
                  disabled={!canAddDebugPlayers}
                  onClick={() => sendAddDebugPlayers(room, debugPlayersToAdd)}
                >
                  <UserPlus aria-hidden className="h-4 w-4" />
                  {tLobby("debug.addPlayers")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {canAddDebugPlayers ? tLobby("debug.addPlayers") : tLobby("debug.addPlayersDisabled")}
              </TooltipContent>
            </Tooltip>
          )}
```

- [ ] **Step 6: Run frontend tests**

Run: `npm run test -w apps-web -- src/game-client/roomCommands.test.ts src/messages/messages.test.ts`

Expected: PASS.

Run: `npm run typecheck -w apps-web`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/game-client/roomCommands.ts apps/web/src/game-client/roomCommands.test.ts apps/web/src/components/lobby/LobbyRoom.tsx apps/web/src/messages/en-US.json apps/web/src/messages/zh-CN.json apps/web/src/messages/messages.test.ts
git commit -m "feat(web): add debug player lobby control"
```

---

### Task 7: Update The Full Game E2E To Use Debug Players

**Files:**
- Modify: `tests/e2e/full-game.spec.ts`

- [ ] **Step 1: Replace the multi-browser test with a one-browser debug flow**

Replace `tests/e2e/full-game.spec.ts` with:

```ts
import { expect, test, type Page } from "@playwright/test";

test("one host browser completes a full Who is AI game with debug players", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("create-nickname").fill("Host");
  await page.getByTestId("create-room").click();
  const roomCode = (await page.getByTestId("room-code").innerText()).trim();
  expect(roomCode.length).toBeGreaterThan(0);

  await expect(page.getByTestId("add-debug-players")).toBeEnabled();
  await page.getByTestId("add-debug-players").click();
  await expect(page.getByText("Debug 1")).toBeVisible();
  await expect(page.getByText("Debug 2")).toBeVisible();

  await expect(page.getByTestId("start-game")).toBeEnabled();
  await page.getByTestId("start-game").click();

  for (let round = 0; round < 3; round += 1) {
    await answerRound(page, `Host round ${round}`);

    await expect(page.getByTestId("phase-name")).toHaveText("Discussion", { timeout: 10_000 });
    await expect(page.getByTestId("phase-name")).toHaveText("Voting", { timeout: 10_000 });

    await voteForAi(page);

    if (round < 2) {
      await expect(page.getByTestId("phase-name")).toHaveText("Answer prep", { timeout: 10_000 });
    }
  }

  await expect(page.getByTestId("settlement-winner")).toHaveText(
    /Citizens win|AI wins|Shelterer wins/,
    { timeout: 10_000 }
  );
});

async function answerRound(page: Page, content: string) {
  await expect(page.getByTestId("phase-name")).toHaveText("Answer prep", { timeout: 10_000 });
  await page.getByTestId("answer-input").fill(content);
  await page.getByTestId("submit-answer").click();
}

async function voteForAi(page: Page) {
  await expect(page.getByTestId("phase-name")).toHaveText("Voting", { timeout: 10_000 });
  await page.getByTestId("vote-option-4").click();
  await page.getByTestId("cast-vote").click();
}
```

- [ ] **Step 2: Run the E2E test**

Run: `npm run test:e2e -- tests/e2e/full-game.spec.ts`

Expected: PASS. The test should create one room, add `Debug 1` and `Debug 2`, start the game, and finish settlement.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/full-game.spec.ts
git commit -m "test(e2e): complete game with debug players"
```

---

### Task 8: Final Verification

**Files:**
- No new files.

- [ ] **Step 1: Run focused package tests**

Run:

```bash
npm run test -w @wiai/schema -- src/commands.test.ts
npm run test -w @wiai/game -- src/roleAssignment.test.ts src/commands/handlers.test.ts
npm run test -w apps-server -- src/rooms/WiaiRoom.test.ts
npm run test -w apps-web -- src/game-client/roomCommands.test.ts src/messages/messages.test.ts
```

Expected: all PASS.

- [ ] **Step 2: Run typecheck across workspaces**

Run: `npm run typecheck`

Expected: all workspace typechecks PASS.

- [ ] **Step 3: Run the updated E2E**

Run: `npm run test:e2e -- tests/e2e/full-game.spec.ts`

Expected: PASS.

- [ ] **Step 4: Inspect git status**

Run: `git status --short`

Expected: only intentional files from this feature are modified, and no unrelated user changes are staged.

- [ ] **Step 5: Commit any verification-only fix**

If a verification command exposes a small fix, stage only the files changed for this feature:

```bash
git add packages/schema/src/commands.ts packages/schema/src/errors.ts packages/schema/src/commands.test.ts packages/game/src/types.ts packages/game/src/commands/handlers.ts packages/game/src/commands/handlers.test.ts packages/game/src/roleAssignment.ts packages/game/src/roleAssignment.test.ts apps/server/src/application/ManagedPlayerOrchestrator.ts apps/server/src/rooms/WiaiRoom.ts apps/server/src/rooms/WiaiRoom.test.ts apps/web/src/game-client/roomCommands.ts apps/web/src/game-client/roomCommands.test.ts apps/web/src/components/lobby/LobbyRoom.tsx apps/web/src/messages/en-US.json apps/web/src/messages/zh-CN.json apps/web/src/messages/messages.test.ts tests/e2e/full-game.spec.ts
git commit -m "fix: stabilize debug managed players"
```

Expected: commit succeeds only if verification required a fix.
