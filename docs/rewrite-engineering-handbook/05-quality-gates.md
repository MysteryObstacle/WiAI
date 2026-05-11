# Quality Gates

## 1. Definition Of Done For P0

P0 is complete only when:

- `npm install` works from a clean checkout.
- `npm run dev` starts web and server.
- No Redis, PostgreSQL, Docker, Python, or Django process is required.
- A browser user can create a room.
- At least two more browser contexts can join.
- Host can start the game.
- One mock AI joins as a hidden real session player.
- The game completes three rounds.
- The server advances phases by room clock and early completion.
- Settlement displays winner, frozen player, all roles, and final votes.
- SQLite contains durable records for the completed session.
- Vitest and Playwright checks pass.

## 2. Required Commands

Run before handoff:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

If a command is not available yet, the implementing Codex session must either add it or explicitly document why that phase has not reached the gate.

## 3. Rule Tests

`packages/game` must test:

- start game creates correct round and phase.
- role assignment creates one AI and one shelterer.
- submit answer succeeds in `answer_prep`.
- submit answer fails outside `answer_prep`.
- duplicate answer fails.
- cancel answer succeeds before phase transition.
- chat succeeds in `discussion`.
- chat fails outside `discussion`.
- suspicion vote allows abstain.
- decision vote rejects abstain.
- self vote is rejected.
- duplicate ballot is rejected.
- all answers cause early advance.
- all ballots cause early advance.
- round 2 decision vote enters settlement.
- freezing AI gives citizen win.
- freezing citizen gives AI win.
- freezing shelterer gives shelterer win.
- tie break uses lowest game number.

## 4. Server Tests

`apps/server` must test:

- room can be created.
- room code is unique enough for local use.
- join creates lobby player.
- reconnect restores player identity.
- start game requires host.
- start game requires ready players.
- message payloads are Zod parsed.
- invalid message returns stable error.
- phase timeout advances once.
- stale timeout cannot double-advance phase.
- successful command persists event.
- phase transition persists snapshot.
- mock Agent suggestion uses the same command path as humans.

## 5. Frontend Tests

`apps/web` should cover:

- create room form validation.
- join room form validation.
- lobby ready button state.
- start button disabled when not host or not ready.
- phase header countdown rendering.
- answer form visibility by phase.
- discussion input visibility by phase.
- vote options exclude self.
- settlement renders all roles after game end.

## 6. End-To-End Smoke Test

The core E2E test must:

1. Open host page.
2. Create room.
3. Open two additional browser contexts.
4. Join by room code.
5. Ready non-host players.
6. Start game.
7. Submit human answers each round.
8. Send at least one discussion message.
9. Submit votes each round.
10. Wait for mock AI to act.
11. Reach settlement.
12. Assert winner is displayed.

## 7. Security And Safety Gates

Agent:

- Agent visible context does not reveal other hidden roles before settlement.
- Agent suggestion cannot call arbitrary server functions.
- Agent suggestion cannot mutate DB directly.
- Agent suggestion cannot mutate Colyseus state directly.
- Rejected suggestion is auditable.

Room identity:

- `playerToken` or reconnect token must not be a raw sequential database id.
- Host checks use server state.
- Client cannot claim another `sessionPlayerId`.

Protocol:

- All browser commands pass through Zod.
- All Agent suggestions pass through Zod.
- Error responses use stable error codes.

## 8. Performance Gates

P0 does not need large-scale optimization, but must satisfy:

- Live state remains small.
- Long history is not stored in Colyseus state.
- Chat/event history is persisted in database and selectively rendered.
- Timers are cleared when room is disposed.
- GSAP timelines are killed on component unmount.

## 9. Design Gates

The first implemented UI must be the usable game experience, not a marketing landing page.

Required screens:

- create/join room
- lobby
- game session
- settlement

Visual direction:

- shadcn/ui style, restrained and readable.
- DOM UI for text-heavy gameplay.
- No canvas-only UI.
- No decorative complexity that hides game information.
- GSAP motion used for clarity and ceremony, not state logic.

## 10. Deployment Gates

Before production:

- PostgreSQL repository tests pass.
- Database migrations are repeatable.
- Colyseus server deployment target supports long-lived WebSockets.
- Vercel deployment, if used, hosts only web/static/frontend surfaces.
- Environment variables are documented.
- Logs include room id, session id, phase, and event id for debugging.

