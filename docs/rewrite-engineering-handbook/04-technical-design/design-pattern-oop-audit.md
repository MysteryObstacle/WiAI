# Design Pattern And OOP Audit

Date: 2026-05-11

## Verdict

The handbook was directionally correct, but several design boundaries were too loose for an extensible multiplayer game. This audit tightens the target architecture around Clean Architecture, Hexagonal ports/adapters, DDD-style aggregates, and a small set of explicit design patterns.

The rewrite should not copy the old implementation shape. The new code should optimize for a stable domain core, replaceable adapters, and testable policies.

## Findings And Corrections

| Severity | Finding | Risk | Correction |
|---|---|---|---|
| P1 | `packages/game` was allowed to depend on `packages/schema` | Protocol and Zod concerns would leak into the domain core | Domain now depends only on `packages/kernel`; schema is an adapter outside the domain |
| P1 | `GameCommands` and `GameReferee` were described as large services | High risk of god classes and phase-specific if/else sprawl | Use Command Pattern plus phase policies and domain services |
| P1 | Agent package could depend on game and had `executeSuggestion` wording | Agent integration could bypass the same command path as humans | Agent is now an `AgentProvider` strategy that only returns suggestions from visible context |
| P1 | Persistence orchestration lacked a transaction boundary | Events, snapshots, and result rows could diverge after partial failure | Add Unit of Work around accepted command persistence |
| P2 | Domain model used many primitive strings/numbers | Invalid ids, empty text, wrong round numbers, and mixed identifiers become easy | Add value objects/branded types under `packages/kernel` |
| P2 | Frontend state diagram implied components mutate server state | UI code could accidentally become a second rule engine | Components only send command DTOs and render server patches |
| P2 | DB and Agent packages could depend on protocol schema | Persistence and Agent decisions become coupled to wire DTOs | DB and Agent depend on kernel/plain records; schema remains an inbound validation adapter |
| P2 | Visibility rules were present but not first-class | Hidden role leaks become likely when adding Agent or spectator modes | Add `VisibilityPolicy` as a domain service used by server adapters |

## Target Pattern Map

| Concern | Pattern | Planned Owner |
|---|---|---|
| Game session lifecycle | Aggregate Root | `GameSession` in `@wiai/game` |
| Client and Agent actions | Command Pattern | `CommandBus` and command handlers |
| Phase-specific behavior | State Pattern | `PhasePolicy` implementations |
| Role assignment and settlement variants | Strategy Pattern | `RoleAssignmentStrategy`, `SettlementPolicy` |
| Hidden information | Policy/Specification | `VisibilityPolicy`, action guards |
| Colyseus, Drizzle, Agent provider | Adapter Pattern | `apps/server`, `@wiai/db`, `@wiai/agent` |
| Persistence consistency | Unit of Work | `@wiai/db` port used by server application services |
| Durable audit trail | Domain Events | `GameEvent` emitted by command handlers |
| Wire validation | DTO Mapper | `@wiai/schema` maps payloads to domain command intents |

## Non-Negotiable Design Rules

1. The domain core must not import Zod, Colyseus, Drizzle, React, browser APIs, or Node HTTP APIs.
2. `WiaiRoom` is an adapter, not a rules object.
3. Every accepted mutation enters through a command handler.
4. Every command returns a typed result, not an exception-driven control flow.
5. Phase behavior belongs to phase policies, not scattered switch statements.
6. Agent code receives visible context only and never receives full game state.
7. Persistence happens through a Unit of Work after domain validation succeeds.
8. Frontend components never calculate hidden information, winner, or next phase.

## Recommended Implementation Shape

```text
apps/web
  UI, view models, command DTO sending

apps/server
  Colyseus adapter, application services, command dispatch wiring, mapper composition

packages/kernel
  ids, branded types, enum values, Result, domain error primitives

packages/game
  aggregate, command handlers, phase policies, settlement, visibility, domain events

packages/schema
  Zod DTOs, wire validation, command intent mappers

packages/db
  repositories, migrations, Unit of Work, event store adapter

packages/agent
  AgentProvider strategy interface and provider implementations
```

This keeps local setup simple while leaving clear extension points for new phases, Agent providers, persistence backends, and future game modes.
