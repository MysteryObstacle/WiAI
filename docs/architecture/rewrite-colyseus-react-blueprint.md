# Who is AI React + Colyseus Rewrite Blueprint

Date: 2026-05-11

Status: accepted direction for the next rewrite, not an in-place migration plan.

## 0. Naming

Product-facing name stays `Who is AI`.

Engineering shorthand is:

```text
Display abbreviation: WiAI
Machine slug: wiai
Package scope: @wiai/*
Environment prefix: WIAI_
Database file: wiai.sqlite
Service names: wiai-web, wiai-server
TypeScript PascalCase prefix: Wiai
```

Do not use `WhoisAI`, `WhoIsAi`, `whoisai`, or `who_is_ai` for new project code identifiers. Use names like `WiaiRoom`, `WiaiState`, `WIAI_DATABASE_URL`, and `@wiai/game`.

## 1. Decision

The rewrite should use one TypeScript-centered stack:

```text
React + Next.js App Router + shadcn/ui + Tailwind + GSAP
Node.js + TypeScript + Colyseus
Drizzle ORM + SQLite locally + PostgreSQL for production
Zod contracts for browser, server, and Agent protocol
```

Colyseus is accepted as the multiplayer runtime even though it introduces framework coupling, because the project benefits more from reducing custom multiplayer infrastructure than from keeping the transport layer fully generic.

## 2. Goals

- Run the whole local game with one command and no external services.
- Remove Django, Redis, separate referee process, separate agent worker process, and duplicated object models from the core path.
- Keep the game server authoritative.
- Make multiplayer rooms, reconnection, phase timing, state sync, and later scaling easier to manage.
- Keep Agent integration independent from direct database or room-state mutation.
- Use SQLite as the local training field and PostgreSQL as the production field.
- Rebuild UI rather than migrate the current Vue UI.

## 3. Non-Goals

- Preserve existing Vue components.
- Keep Django REST Framework or Django Channels.
- Keep Redis in the P0 local development loop.
- Let third-party Agents write database records directly.
- Let browser clients advance phase or decide game outcomes.
- Build miniprogram support in the first rewrite pass.

## 4. Product Requirements To Preserve

### Lobby

- Create room and generate a short room code.
- Join room by code.
- Optional room password.
- Configurable min and max player count.
- Player ready and cancel-ready.
- Host can start game when online player count and ready rules pass.
- Host can kick players before game start.
- Player can leave room before game start.
- Reconnect should restore the same player identity.

### Game Session

- Each game creates human session players from lobby players.
- Each game creates one hidden AI session player for P0.
- Game has exactly three rounds in P0.
- Each round follows:

```text
answer_prep -> answer_reveal -> discussion -> voting
```

- After round 3 voting, the game enters:

```text
settlement
```

- Phase advancement is server-side only.
- `answer_prep` advances when all active players submit answers or the timer expires.
- `voting` advances when all active players vote or the timer expires.
- `answer_reveal` and `discussion` advance on timer.

### Actions

- `submit_answer` only during `answer_prep`.
- `cancel_submit_answer` only during `answer_prep` after the viewer has submitted.
- `send_chat` only during `discussion`.
- `submit_ballot` only during `voting`.
- Round 1 and round 2 use `suspicion` ballots.
- Round 3 uses `decision` ballots.
- `decision` ballot cannot abstain.
- A player cannot vote for self.
- Duplicate answer or ballot is rejected.
- All actions from human players, AI Agents, and managed fallback go through the same command validation path.

### Roles And Outcome

- P0 roles are `citizen`, `shelterer`, and `ai`.
- P0 default setup: one AI, one shelterer, remaining humans are citizens.
- Round 3 decision vote freezes the highest-voted active player.
- Tie break remains deterministic by lowest game number unless product rules change later.
- If frozen player is `ai`, citizens win.
- If frozen player is `citizen`, AI wins.
- If frozen player is `shelterer`, shelterer wins.

### Agent

- AI is a real session player, not a UI bot.
- AI has game number, role, answers, messages, votes, and settlement participation.
- Platform builds an Agent visible context.
- Agent returns an action suggestion.
- Platform validates and executes the suggestion through the normal game command path.
- Agent never directly changes room state, database rows, phase, or outcome.
- P0 includes an in-process mock Agent so local play does not need another service.
- External third-party Agent gateway is exposed as a separate protocol surface.

## 5. Runtime Model

P0 uses Colyseus as the live authoritative runtime:

```text
Browser clients -> Colyseus Room -> command validation -> room state mutation -> state sync
                                      |
                                      v
                                  database persistence
```

The live game truth while a room is active is the Colyseus room state. The durable truth is the database event log plus saved snapshots. On recovery, the server restores room state from durable records.

This is a deliberate change from the current Django design where SQLite is the only active truth source. It removes the need for a separate referee worker and reduces SQLite write contention during live play.

## 6. Colyseus Boundary

Colyseus owns:

- Room lifecycle.
- Client join, leave, reconnect, and session binding.
- Matchmaking by room code.
- Authoritative live state.
- State synchronization.
- Room clock and phase timers.
- Per-client visible state where needed.

Application code owns:

- Game command validation.
- Role assignment.
- Phase transition rules.
- Vote resolution.
- Agent visible context.
- Agent suggestion validation.
- Database persistence.
- Audit, replay, and analytics records.

The main rule: Colyseus may host the game state, but Agent protocol and database schema must not become Colyseus-only concepts.

Use Colyseus Schema for synchronized live room state. Use Zod for inbound commands, HTTP payloads, and Agent protocol validation. Do not force one universal schema to serve both Colyseus state sync and external protocol validation.

## 7. Proposed Repository Layout

```text
repo/
  apps/
    web/
      React + Next.js App Router client
      shadcn/ui source components
      Colyseus client connection
      Tailwind/CSS transitions and GSAP animation layer
    server/
      Colyseus server
      HTTP health and admin API
      Agent gateway
      local mock Agent adapter
  packages/
    schema/
      Zod command, event, payload, and Agent protocol schemas
    game/
      rules, phase machine, vote resolution, role assignment
    db/
      Drizzle schema, migrations, repositories
    agent/
      Agent protocol types, mock adapter, validation helpers
    content/
      question bank, rules copy, story copy
```

Use npm workspaces for P0 so the only required local tool is Node.js with npm.

## 8. Frontend Direction

Choose React instead of Vue because the desired UI direction is shadcn/Vercel-style, and the strongest shadcn ecosystem path is React.

Use Next.js App Router for the web app because:

- It is the strongest fit for the Vercel + shadcn/ui ecosystem.
- It keeps future product routes, rules pages, replay pages, Agent debug views, and admin views in one framework.
- Server Components are useful for static/product/admin surfaces, while the live game room can be isolated behind client components.
- It aligns better with Vercel Agent, Vercel preview workflows, and future production deployment.

The live game page must use client components for Colyseus, browser storage, timers, and GSAP. The Colyseus WebSocket server remains a separate long-running Node service rather than a Vercel Function.

Animation policy:

- Tailwind/CSS transitions for simple UI states and ordinary component transitions.
- GSAP with `@gsap/react` for game ceremony: phase transitions, answer reveal, vote tally, identity reveal, and settlement sequence.
- Motion remains an optional later addition only if complex layout choreography becomes repetitive enough to justify a second animation mental model.

Animation consumes room events and state diffs. Animation does not mutate game state.

State management policy:

- Colyseus room state is the live game state source in the browser.
- React local state handles ephemeral UI, form drafts, open panels, and selection.
- Do not mirror the whole game state into Redux, Zustand, or another global store in P0.
- Add TanStack Query later only for non-live HTTP surfaces such as profile, admin, history, and Agent debug lists.

## 9. Database Direction

P0 local:

```text
SQLite file database
```

Production:

```text
PostgreSQL
```

Use Drizzle schema and migrations as the database source of truth. The project should avoid SQLite-specific SQL and should run repository-level tests against PostgreSQL before production launch.

The switch from SQLite to PostgreSQL should not require handwritten gameplay conversion code, but it is not just a config flip unless schemas, migrations, queries, and tests are kept portable from the start.

## 10. Agent Gateway Direction

P0:

- Local in-process mock Agent.
- Agent suggestions are scheduled by room events.
- No separate worker process.

P1:

- External Agent gateway over WebSocket or HTTP streaming.
- Platform sends:

```json
{
  "type": "session_event",
  "payload": {
    "assignmentId": "assignment-id",
    "visibleContext": {}
  }
}
```

- Agent replies:

```json
{
  "type": "action_suggestion",
  "payload": {
    "type": "submit_answer",
    "payload": {
      "content": "answer text"
    },
    "requestId": "request-id"
  }
}
```

Supported P0 suggestions:

- `submit_answer`
- `send_chat`
- `submit_ballot`
- `noop`

The server maps every accepted suggestion into the same command path used by humans.

## 11. Scaling Path

P0:

- Single Node.js process.
- Colyseus rooms in memory.
- SQLite file.
- In-process mock Agent.
- No Redis.

P1:

- PostgreSQL.
- External Agent gateway.
- Saved room snapshots and event logs.
- Admin/debug views.

P2:

- Multiple game server processes.
- Colyseus Redis presence or equivalent shared presence.
- Horizontal room hosting.
- Production observability.
- Rate limits and Agent allowlist management.

## 12. First Rewrite Milestone

The first milestone should prove the full loop, not every product surface:

1. `npm install`
2. `npm run dev`
3. Open web client.
4. Create room.
5. Join with multiple browser tabs.
6. Start game.
7. Human players and one mock AI complete three rounds.
8. Server advances phases without Redis or a separate referee.
9. Final settlement displays all roles and winner.
10. SQLite contains session, players, answers, messages, ballots, events, and result.

## 13. External References

- Colyseus docs: https://docs.colyseus.io/
- Colyseus presence: https://docs.colyseus.io/server/presence/
- Colyseus StateView: https://docs.colyseus.io/state/view/
- shadcn/ui docs: https://ui.shadcn.com/docs
- GSAP React docs: https://gsap.com/resources/React/
- Vercel WebSocket limits: https://vercel.com/docs/limits
