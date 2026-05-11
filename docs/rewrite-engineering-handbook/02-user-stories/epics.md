# Epics

## E1: Local Zero-Dependency Game Loop

Deliver a full local game loop with one command, SQLite, Colyseus, Next.js, and mock AI.

Success:

- Three browser contexts can complete a game.
- No Redis, Django, Python worker, Docker, or PostgreSQL is required.

## E2: Server-Authoritative Multiplayer Runtime

Use Colyseus for room lifecycle, connection, reconnection, state sync, and room clock while keeping rules in pure game modules.

Success:

- Browser sends commands only.
- Referee owns phase and outcome.
- Game rules test without Colyseus.

## E3: Agent As Controlled Player

Represent AI as a real session player controlled through validated suggestions.

Success:

- Agent cannot bypass command validation.
- Visible context does not leak hidden roles.
- Action audit records Agent behavior.

## E4: Durable Audit And Replay Foundation

Persist game events and snapshots to support debugging, future replay, and Agent evaluation.

Success:

- Events are append-only.
- Snapshots are saved on phase transitions.
- Final result is queryable.

## E5: Playable Next.js Game UI

Build the primary game surface with shadcn/ui, responsive layouts, and GSAP ceremony.

Success:

- Create/join/lobby/game/settlement screens are usable.
- UI follows allowed actions.
- Motion is presentation-only.

