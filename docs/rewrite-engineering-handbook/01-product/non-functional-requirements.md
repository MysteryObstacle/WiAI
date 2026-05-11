# Non-Functional Requirements

## Local Development

- Fresh checkout can run with Node.js and npm.
- No Redis in P0.
- No PostgreSQL in P0 local loop.
- No Python or Django process.
- SQLite file path is controlled by `WIAI_DATABASE_URL`.

## Reliability

- Phase timeouts must be idempotent through `phaseVersion`.
- Duplicate commands must be rejected.
- Reconnect must not create duplicate lobby players.
- Room disposal must clear timers.

## Security

- Reconnect tokens must be non-sequential.
- Client cannot choose hidden role.
- Client cannot submit command for another player.
- Agent cannot mutate room state directly.
- Agent cannot write database directly.

## Performance

- Live Colyseus state stores current game data, not unlimited history.
- Full event history lives in database.
- Chat rendering should handle at least 200 messages without layout collapse.
- GSAP timelines must be killed on component unmount.

## Accessibility

- Keyboard users can create, join, answer, chat, vote.
- Countdown is text-visible.
- Buttons have disabled states and labels.
- Color is not the only indicator for readiness or winner.

## Portability

- Drizzle schema must avoid SQLite-only assumptions where reasonable.
- Repository tests must be runnable against PostgreSQL before production.
- Deployment must keep Colyseus as a long-running service.

