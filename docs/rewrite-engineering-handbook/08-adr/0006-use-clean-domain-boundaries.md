# ADR 0006: Use Clean Domain Boundaries

## Context

The rewrite needs to be easier to extend than the current mixed frontend/backend/referee/Agent system. The early handbook already separated React, Colyseus, game rules, schema, Agent, and DB packages, but some dependency directions were too loose.

The risky areas were:

- Domain rules could depend on Zod protocol schemas.
- Agent code could import game logic.
- Persistence could couple to wire DTOs.
- The referee could become one large procedural class.

## Decision

Use a lightweight Clean Architecture / Hexagonal structure:

```text
adapters -> application services -> domain core -> shared kernel
```

Add `packages/kernel` for stable primitives and value objects. Keep `packages/game` pure and dependent only on `packages/kernel`.

Use explicit patterns:

- Command Pattern for browser and Agent actions.
- State Pattern through phase policies.
- Strategy Pattern for role assignment, settlement, and Agent providers.
- Adapter Pattern for Colyseus, Drizzle, Zod, and Agent integrations.
- Unit of Work for accepted command persistence.

## Consequences

- The package graph is slightly larger, but dependencies become easier to reason about.
- `apps/server` becomes the composition root for runtime orchestration.
- `packages/game` can be tested without Colyseus, Zod, Drizzle, React, or Agent code.
- Third-party Agent support becomes safer because Agent providers never receive full game state.
- Future game modes can swap policies instead of rewriting the room runtime.

## Alternatives Considered

- Keep `packages/schema` as a dependency of `packages/game`: simpler package count, but protocol concerns leak into the domain core.
- Keep one `GameReferee` class: easier to start, but likely to become a god object as phases and game modes grow.
- Put orchestration inside `WiaiRoom`: convenient for P0, but couples Colyseus lifecycle to business workflow and persistence.
