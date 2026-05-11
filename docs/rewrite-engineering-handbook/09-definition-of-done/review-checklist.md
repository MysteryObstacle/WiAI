# Review Checklist

## Architecture

- Rules are not embedded in React components.
- Rules are not scattered through Colyseus message handlers.
- `packages/game` remains independent.
- Repositories receive plain objects.

## Protocol

- New commands have Zod schemas.
- Errors use stable codes.
- Agent visible context is reviewed for hidden data leakage.

## Frontend

- Live room connection is in a client component.
- Server Components do not use browser APIs.
- UI disables forbidden actions.
- Mobile layout remains usable.

## Persistence

- Events are append-only.
- Phase transitions save snapshots.
- Settlement updates session result.

## Naming

- Uses WiAI/wiai/Wiai naming.
- Does not introduce forbidden old identifiers.

