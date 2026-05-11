# Release Plan

## Release P0: Local Playable Loop

Goal:

```text
One command, local browser, complete game, mock AI, SQLite audit.
```

Included:

- Next.js web app.
- Colyseus server.
- Pure game rules.
- Mock Agent.
- SQLite persistence.
- Playwright full loop.

Excluded:

- External Agent gateway.
- PostgreSQL production deployment.
- Replay UI.
- Admin UI.

## Release P1: Developer Preview

Goal:

```text
Make the game useful for Agent developers and early testers.
```

Included:

- External Agent gateway.
- Agent action audit UI.
- Replay viewer.
- PostgreSQL test path.
- Basic deployment docs.

## Release P2: Production Foundation

Goal:

```text
Prepare for public rooms and operational visibility.
```

Included:

- Auth strategy.
- Rate limiting.
- Moderation hooks.
- Multi-process Colyseus presence.
- Observability and dashboards.

