# Development Rules For Codex

## Always Preserve Boundaries

- `packages/kernel` contains shared primitives only.
- `packages/game` is pure.
- `apps/server` adapts Colyseus to game rules.
- `apps/web` renders state and sends commands.
- `packages/db` persists plain objects.
- `packages/agent` produces suggestions.
- `packages/schema` validates wire DTOs and maps them into command intents.

Forbidden imports:

```text
packages/game -> packages/schema
packages/game -> packages/db
packages/game -> packages/agent
packages/agent -> packages/game
packages/db -> packages/schema
apps/web -> packages/game
```

## Use Explicit Patterns

Use these patterns intentionally:

| Concern | Pattern |
|---|---|
| user and Agent actions | Command Pattern |
| phase behavior | State Pattern via `PhasePolicy` |
| settlement and role assignment | Strategy Pattern |
| external systems | Adapter Pattern |
| persistence consistency | Unit of Work |
| hidden information | Policy/Specification |

## Prefer Small Files

Split when a file mixes:

- validation and mutation
- persistence and rules
- UI layout and protocol
- Agent policy and command execution
- phase-specific behavior from multiple phases
- adapter code and domain behavior

## Verification Discipline

Minimum verification by work type:

| Work | Verification |
|---|---|
| schema | schema unit tests |
| rules | game unit tests |
| DB | repository tests |
| room | server integration tests |
| UI | component test or E2E path |
| full flow | Playwright |

## Naming

Use:

```text
WiAI, wiai, Wiai, WIAI_
```

Do not use:

```text
WhoisAI, WhoIsAi, whoisai, who_is_ai
```
