# Sprint 01: Rules And Persistence Foundation

## Goal

Implement pure game rules, shared schemas, and SQLite persistence foundation.

## Committed Items

- B-005 define Zod command schemas.
- B-006 implement pure game state.
- B-007 implement referee phase machine.
- B-012 implement Drizzle SQLite schema.

## Acceptance

- `packages/game` full happy path test passes.
- Invalid command tests pass.
- SQLite repository tests pass.
- No Colyseus dependency exists in `packages/game`.

## Demo

Run tests showing a three-round game resolves in pure TypeScript.

