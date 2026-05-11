# React Colyseus Rewrite P0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new TypeScript-first `Who is AI` P0 where one local command runs a playable React + Colyseus multiplayer game with one mock AI and SQLite persistence.

**Architecture:** Colyseus owns live multiplayer room runtime, `apps/server` owns application orchestration, `packages/game` owns pure domain rules through command handlers and phase policies, `packages/kernel` owns shared value primitives, Drizzle owns persistence through Unit of Work, and React renders live room state. Agent integration is provider-based and never mutates room state directly.

**Tech Stack:** React, Next.js App Router, shadcn/ui, Tailwind CSS, GSAP, Node.js, TypeScript, Colyseus, Zod, Drizzle, SQLite, Vitest, Playwright.

---

## Task 1: Scaffold Monorepo

**Files:**

- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `apps/web/package.json`
- Create: `apps/server/package.json`
- Create: `packages/kernel/package.json`
- Create: `packages/schema/package.json`
- Create: `packages/game/package.json`
- Create: `packages/db/package.json`
- Create: `packages/agent/package.json`
- Create: `packages/content/package.json`

- [ ] Create npm workspaces for `apps/*` and `packages/*`.
- [ ] Add root scripts:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev -w apps/server\" \"npm run dev -w apps/web\"",
    "test": "npm run test -ws --if-present",
    "test:architecture": "npm run test:architecture -ws --if-present",
    "typecheck": "npm run typecheck -ws --if-present",
    "lint": "npm run lint -ws --if-present",
    "build": "npm run build -ws --if-present"
  }
}
```

- [ ] Add shared TypeScript config with strict mode enabled.
- [ ] Verify `npm install` completes.
- [ ] Verify `npm run typecheck` runs even before feature code exists.

Expected result:

```text
npm install
npm run typecheck
```

Both commands finish without external services.

## Task 2: Define Shared Kernel And Protocol Schemas

**Files:**

- Create: `packages/kernel/src/ids.ts`
- Create: `packages/kernel/src/result.ts`
- Create: `packages/kernel/src/enums.ts`
- Create: `packages/kernel/src/index.ts`
- Create: `packages/schema/src/enums.ts`
- Create: `packages/schema/src/commands.ts`
- Create: `packages/schema/src/agent.ts`
- Create: `packages/schema/src/errors.ts`
- Create: `packages/schema/src/index.ts`
- Test: `packages/kernel/src/result.test.ts`
- Test: `packages/schema/src/commands.test.ts`
- Test: `packages/schema/src/agent.test.ts`

- [ ] Define branded ids and value primitives in `packages/kernel`.
- [ ] Define `GamePhase`, `BallotType`, `PlayerRole`, `PlayerType`, `ControlMode`, `WinnerSide` value lists in `packages/kernel`.
- [ ] Define Zod schemas for browser commands: `ready`, `start_game`, `submit_answer`, `cancel_submit_answer`, `send_chat`, `submit_ballot`.
- [ ] Map parsed DTOs to domain command intent objects.
- [ ] Define Zod schemas for Agent visible context and action suggestion.
- [ ] Define stable error code enum.
- [ ] Test that invalid empty content fails.
- [ ] Test that invalid ballot type fails.
- [ ] Test that unknown suggestion type fails.

Expected result:

```text
npm run test -w packages/schema
npm run test -w packages/kernel
```

Validation tests pass.

## Task 3: Implement Pure Game Rules

**Files:**

- Create: `packages/game/src/types.ts`
- Create: `packages/game/src/state.ts`
- Create: `packages/game/src/roleAssignment.ts`
- Create: `packages/game/src/commands/CommandBus.ts`
- Create: `packages/game/src/commands/handlers.ts`
- Create: `packages/game/src/policies/phasePolicies.ts`
- Create: `packages/game/src/policies/settlementPolicy.ts`
- Create: `packages/game/src/policies/visibilityPolicy.ts`
- Create: `packages/game/src/selectors.ts`
- Create: `packages/game/src/index.ts`
- Test: `packages/game/src/policies/phasePolicies.test.ts`
- Test: `packages/game/src/commands/handlers.test.ts`

- [ ] Model plain domain state without Colyseus classes.
- [ ] Implement role assignment: one AI, one shelterer, remaining humans citizen.
- [ ] Implement `startGame` command handler.
- [ ] Implement command handlers for `submitAnswer`, `cancelSubmitAnswer`, `sendChat`, `submitBallot`.
- [ ] Implement phase transitions:

```text
answer_prep -> answer_reveal -> discussion -> voting -> next round or settlement
```

- [ ] Implement early advance after all active answers.
- [ ] Implement early advance after all active ballots.
- [ ] Implement settlement vote resolution and tie break.
- [ ] Test every invalid command listed in `03-domain-protocol.md`.
- [ ] Test full three-round happy path.

Expected result:

```text
npm run test -w packages/game
```

Pure rule tests pass without Colyseus or database.

## Task 4: Add Drizzle Persistence

**Files:**

- Create: `packages/db/src/schema.ts`
- Create: `packages/db/src/client.ts`
- Create: `packages/db/src/repositories/rooms.ts`
- Create: `packages/db/src/repositories/sessions.ts`
- Create: `packages/db/src/repositories/events.ts`
- Create: `packages/db/src/repositories/snapshots.ts`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/drizzle.config.ts`
- Test: `packages/db/src/repositories.test.ts`

- [ ] Define tables from `03-domain-protocol.md`.
- [ ] Use SQLite for local `WIAI_DATABASE_URL=file:./.data/wiai.sqlite`.
- [ ] Keep column types portable for PostgreSQL.
- [ ] Implement append-only event repository.
- [ ] Implement snapshot repository.
- [ ] Implement session result update.
- [ ] Test create room, create session, append event, save snapshot, settle session.

Expected result:

```text
npm run test -w packages/db
```

Repository tests pass against local SQLite.

## Task 5: Implement Colyseus Server

**Files:**

- Create: `apps/server/src/index.ts`
- Create: `apps/server/src/rooms/WiaiRoom.ts`
- Create: `apps/server/src/application/RoomApplicationService.ts`
- Create: `apps/server/src/application/CommandDtoAdapter.ts`
- Create: `apps/server/src/state/WiaiState.ts`
- Create: `apps/server/src/state/mappers.ts`
- Create: `apps/server/src/config.ts`
- Create: `apps/server/src/persistence/GameUnitOfWorkAdapter.ts`
- Test: `apps/server/src/rooms/WiaiRoom.test.ts`

- [ ] Start Colyseus server on `PORT=2567` by default.
- [ ] Register room name `wiai`.
- [ ] Implement `onCreate` with room config and short code.
- [ ] Implement `onJoin` with nickname and optional reconnect token.
- [ ] Implement `onLeave` and reconnection window.
- [ ] Implement message handlers for all browser commands.
- [ ] Each handler parses Zod payload before calling `RoomApplicationService`.
- [ ] Room clock schedules phase timeout.
- [ ] Timeout calls `RoomApplicationService.handlePhaseTimeout`.
- [ ] State mutations are mirrored into Colyseus Schema.
- [ ] Successful commands persist events and phase snapshots through Unit of Work.

Expected result:

```text
npm run dev -w apps/server
```

Server starts with no Redis and no PostgreSQL.

## Task 6: Implement Mock Agent

**Files:**

- Create: `packages/agent/src/mockAgent.ts`
- Create: `packages/agent/src/AgentProvider.ts`
- Create: `packages/agent/src/index.ts`
- Test: `packages/agent/src/mockAgent.test.ts`
- Modify: `apps/server/src/rooms/WiaiRoom.ts`
- Create: `apps/server/src/application/AgentOrchestrator.ts`

- [ ] Build visible context in server application layer through domain `VisibilityPolicy`.
- [ ] Mock Agent returns `submit_answer` during `answer_prep`.
- [ ] Mock Agent can return `send_chat` during `discussion`.
- [ ] Mock Agent returns `submit_ballot` during `voting`.
- [ ] Mock Agent returns `noop` during `answer_reveal` and `settlement`.
- [ ] Server schedules mock Agent action after phase start.
- [ ] Suggestion mapping uses the same command path as human actions.
- [ ] Rejected suggestions are persisted as audit events.

Expected result:

```text
npm run test -w packages/agent
npm run test -w apps/server
```

Mock AI can complete a full game without a separate worker.

## Task 7: Build Next.js Client

**Files:**

- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/room/[roomCode]/page.tsx`
- Create: `apps/web/src/app/game/[roomId]/page.tsx`
- Create: `apps/web/src/components/lobby/LobbyClient.tsx`
- Create: `apps/web/src/components/game/GameClient.tsx`
- Create: `apps/web/src/game-client/colyseusClient.ts`
- Create: `apps/web/src/game-client/useRoomConnection.ts`
- Create: `apps/web/src/game-client/roomCommands.ts`
- Create: `apps/web/src/components/lobby/CreateRoomPanel.tsx`
- Create: `apps/web/src/components/lobby/JoinRoomPanel.tsx`
- Create: `apps/web/src/components/lobby/LobbyRoom.tsx`
- Create: `apps/web/src/components/game/GameLayout.tsx`
- Create: `apps/web/src/components/game/PhaseHeader.tsx`
- Create: `apps/web/src/components/game/AnswerPanel.tsx`
- Create: `apps/web/src/components/game/RevealPanel.tsx`
- Create: `apps/web/src/components/game/DiscussionPanel.tsx`
- Create: `apps/web/src/components/game/VotePanel.tsx`
- Create: `apps/web/src/components/game/SettlementPanel.tsx`

- [ ] Initialize Next.js App Router app with TypeScript, Tailwind, ESLint, `src/`, npm, and import alias `@/*`.
- [ ] Use a non-interactive scaffold command when creating the app:

```bash
npx create-next-app@latest apps/web --yes --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-npm
```

- [ ] If scaffolding inside a non-empty target directory, add `--force`.
- [ ] Initialize shadcn/ui with Tailwind.
- [ ] Apply the Next.js + shadcn font fix if Tailwind v4 writes circular Geist font variables: keep Geist font variables on `<html>` and use literal font names in `globals.css`.
- [ ] Keep route `page.tsx` files as Server Components unless they need browser APIs.
- [ ] Put Colyseus client, `localStorage`, countdown UI effects, and GSAP code inside `'use client'` components such as `LobbyClient` and `GameClient`.
- [ ] Connect Colyseus client.
- [ ] Implement create room.
- [ ] Implement join room by code.
- [ ] Persist reconnect token in localStorage.
- [ ] Render lobby roster and ready state.
- [ ] Render phase header and countdown.
- [ ] Render answer form only when allowed.
- [ ] Render revealed answers.
- [ ] Render discussion messages and input only when allowed.
- [ ] Render voting UI only when allowed.
- [ ] Render settlement result and all roles.

Expected result:

```text
npm run dev -w apps/web
```

Browser can connect to local server.

## Task 8: Add GSAP Game Ceremony

**Files:**

- Create: `apps/web/src/animations/usePhaseTransition.ts`
- Create: `apps/web/src/animations/useRevealTimeline.ts`
- Create: `apps/web/src/animations/useSettlementReveal.ts`
- Modify: game display components from Task 7

- [ ] Add `@gsap/react`.
- [ ] Animate phase transition without changing game state.
- [ ] Animate answer reveal sequence.
- [ ] Animate vote tally or selection confirmation.
- [ ] Animate settlement identity reveal.
- [ ] Respect `prefers-reduced-motion`.

Expected result:

Animations run only after server state changes.

## Task 9: End-To-End Verification

**Files:**

- Create: `tests/e2e/full-game.spec.ts`
- Create: `playwright.config.ts`

- [ ] Start server and web dev servers for Playwright.
- [ ] Test host creates room.
- [ ] Test two additional browser contexts join.
- [ ] Test ready and start.
- [ ] Test answer, discussion, voting across three rounds.
- [ ] Let mock AI act automatically.
- [ ] Assert settlement appears.
- [ ] Assert SQLite has final session result.

Expected result:

```text
npm run test:e2e
```

Full P0 loop passes.

## Task 10: Production Readiness Pass

**Files:**

- Modify: `README.md`
- Modify: `.env.example`
- Create: `docs/engineering/local-development.md`
- Create: `docs/engineering/deployment.md`

- [ ] Document local commands.
- [ ] Document env vars.
- [ ] Document SQLite local path.
- [ ] Document PostgreSQL migration expectations.
- [ ] Document why Colyseus server is not deployed as Vercel Functions.
- [ ] Document Agent safety boundary.
- [ ] Run final verification:

```text
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

Expected result:

New project is ready for iterative feature work.
