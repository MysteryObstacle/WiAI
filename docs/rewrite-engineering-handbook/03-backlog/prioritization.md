# Backlog Prioritization

## Decision Rule

Prioritize work that proves the playable loop first:

```text
rules -> server runtime -> persistence -> mock Agent -> UI -> E2E
```

Avoid starting advanced UI, external Agent gateway, or production scaling before the rules and server loop are testable.

## P0 Must-Haves

- Monorepo scaffold.
- Shared schemas.
- Pure game rules.
- Colyseus room.
- SQLite persistence.
- Mock Agent.
- Next.js game UI.
- E2E full game test.

## P0 Should-Haves

- Basic reconnect.
- Basic GSAP transitions.
- Snapshot persistence on every phase.
- Human-readable error messages.

## P0 Won't-Haves

- Real authentication.
- External Agent marketplace.
- Admin panel.
- Replay UI.
- Distributed room hosting.

## Prioritization Risks

| Risk | Mitigation |
|---|---|
| UI starts before rules are stable | Require `packages/game` tests before full UI work |
| Colyseus Room becomes too large | Keep commands and referee in `packages/game` |
| Agent gets privileged state | Visible context tests before Agent execution |
| SQLite assumptions block PostgreSQL | Keep Drizzle schema portable and add P1 Postgres tests |

