# Module Boundaries

## `apps/web`

Owns:

- Next.js route structure.
- shadcn/ui composition.
- Colyseus browser client.
- UI state and forms.
- GSAP presentation animation.

Must not own:

- Phase advancement.
- Vote resolution.
- Role assignment.
- Hidden-role decisions.

## `apps/server`

Owns:

- Colyseus server boot.
- `WiaiRoom`.
- Colyseus Schema classes.
- Room clock timers.
- Message handler wiring.
- Persistence orchestration.
- Mock Agent scheduling.
- Application services that compose command dispatch, repositories, visibility, and Agent providers.
- Colyseus-to-domain and domain-to-Colyseus mappers.

Must not own:

- Large rule if/else blocks inside message handlers.
- UI-specific logic.
- Game phase rules.
- Settlement decisions.
- Hidden-information visibility decisions.

## `packages/kernel`

Owns:

- Branded id/value types.
- Stable enum value lists.
- `Result` and domain error primitives.
- Shared clock and id-generator interfaces when needed.

Must not own:

- Game rules.
- Zod schemas.
- Persistence records.
- UI helpers.

Allowed dependencies:

- TypeScript only.

## `packages/game`

Owns:

- `GameSession` aggregate and plain game state types.
- Command intents and command handlers.
- Phase policies.
- Settlement policy.
- Role assignment strategy.
- Visibility policy.
- Action guards/specifications.
- Domain events.
- Selectors.
- Rule tests.

Allowed dependencies:

- TypeScript.
- `packages/kernel`.

Disallowed dependencies:

- React.
- Colyseus.
- Drizzle.
- Zod.
- `packages/schema`.
- `packages/db`.
- `packages/agent`.
- Node HTTP.
- Browser APIs.

## `packages/schema`

Owns external protocol validation:

- Browser command schemas.
- Agent context schemas.
- Agent suggestion schemas.
- Error code definitions.
- DTO-to-command-intent mappers.

Does not own:

- Colyseus Schema classes.
- Drizzle table definitions.
- Game rule decisions.
- Domain mutation.

Allowed dependencies:

- `packages/kernel`.

## `packages/db`

Owns:

- Drizzle schema.
- Migrations.
- Database client factory.
- Repositories.
- Unit of Work.
- Event store adapter.

Repository inputs and outputs must be plain objects.

Allowed dependencies:

- `packages/kernel`.

Disallowed dependencies:

- `packages/schema`.
- Colyseus Schema classes.
- Game rule services.

## `packages/agent`

Owns:

- Mock Agent behavior.
- `AgentProvider` strategy interface.
- Provider implementations, such as local mock and future HTTP provider.
- External Agent protocol helpers for P1.

Agent modules must not:

- Mutate Colyseus state.
- Import `packages/game`.
- Receive full game state.
- Execute suggestions.

The server application layer builds visible context and routes accepted suggestions through the same command path used by humans.
