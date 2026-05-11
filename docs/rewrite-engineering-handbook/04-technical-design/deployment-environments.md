# Deployment Environments

## Local P0

```text
apps/web     Next.js dev server
apps/server  Colyseus Node server
database     SQLite file
```

Command:

```bash
npm run dev
```

Environment:

```text
WIAI_DATABASE_URL=file:./.data/wiai.sqlite
WIAI_COLYSEUS_PORT=2567
NEXT_PUBLIC_WIAI_SERVER_URL=ws://localhost:2567
```

## Preview

Recommended:

- Vercel hosts `apps/web`.
- Fly.io, Render, Railway, or VPS hosts `apps/server`.
- SQLite can remain for short-lived demos, but PostgreSQL is preferred for shared preview.

## Production

Recommended:

- Vercel hosts Next.js web app.
- Long-running Node host runs Colyseus.
- PostgreSQL stores durable data.
- Redis presence is added only when multiple Colyseus processes are required.

## Constraint

Vercel Functions must not host the Colyseus WebSocket server because the game server requires long-lived WebSocket connections.

