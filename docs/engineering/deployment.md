# Deployment Notes

## Runtime Shape

P0 runs as two processes:

- `apps/web`: Next.js App Router web client.
- `apps/server`: long-lived Colyseus Node.js server.

Colyseus rooms need persistent WebSocket process state and timers, so the room server is not a Vercel Function. Deploy it as a long-running Node service. The Next.js app can be deployed to Vercel and pointed at the server through `NEXT_PUBLIC_WIAI_SERVER_URL`.

## Persistence

Local development uses SQL.js-backed SQLite at `WIAI_DATABASE_URL=file:./.data/wiai.sqlite`.

Future PostgreSQL support should keep the same repository contracts:

- append accepted command events;
- save snapshots on phase transitions and settlement;
- update the session result atomically with settlement;
- keep Colyseus Schema instances out of persistence.

## Agent Boundary

The Agent provider returns only `action_suggestion`. The server validates the suggestion, maps it to the same command path used by humans, and persists accepted or rejected suggestions as audit events. Agent code must not mutate room state or receive hidden human roles before settlement.
