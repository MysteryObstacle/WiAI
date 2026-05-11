# Testing Strategy

## Unit Tests

Use Vitest for:

- kernel value objects and Result helpers
- schemas
- command handlers
- phase policy transitions
- role assignment
- vote resolution
- visibility policy
- Agent suggestion validation

## Integration Tests

Use Vitest for:

- repositories against SQLite
- Unit of Work transaction behavior
- WiaiRoom message handling through RoomApplicationService
- mock AgentProvider suggestion flow
- persistence after command execution
- dependency boundary tests for forbidden package imports

## E2E Tests

Use Playwright for:

- multi-context room join
- ready/start
- full three-round game
- settlement display

## Test Priority

1. `packages/kernel`
2. `packages/game`
3. `packages/schema`
4. `packages/db`
5. `packages/agent`
6. `apps/server`
7. `apps/web`
8. `tests/e2e`

Rules first, UI later.

## Architecture Tests

Add lightweight import-boundary checks before P0 completion:

- `packages/game` must not import schema, db, agent, Colyseus, Drizzle, React, or browser APIs.
- `packages/agent` must not import game or db.
- `packages/db` must not import schema or game rule services.
- `apps/web` must not import game domain modules.
