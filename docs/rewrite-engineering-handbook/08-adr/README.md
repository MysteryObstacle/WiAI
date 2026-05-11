# Architecture Decision Records

## Purpose

This directory records why major technical decisions were made for the WiAI rewrite.

## Read First

1. [0001-use-nextjs-app-router.md](./0001-use-nextjs-app-router.md)
2. [0002-use-colyseus.md](./0002-use-colyseus.md)
3. [0003-use-drizzle-sqlite-postgres.md](./0003-use-drizzle-sqlite-postgres.md)
4. [0004-agent-suggestion-boundary.md](./0004-agent-suggestion-boundary.md)
5. [0005-wiai-naming.md](./0005-wiai-naming.md)
6. [0006-use-clean-domain-boundaries.md](./0006-use-clean-domain-boundaries.md)

## ADR Format

```text
Context
Decision
Consequences
Alternatives Considered
```

## Files

| File | Purpose |
|---|---|
| [0001-use-nextjs-app-router.md](./0001-use-nextjs-app-router.md) | Why the rewrite uses Next.js App Router |
| [0002-use-colyseus.md](./0002-use-colyseus.md) | Why Colyseus owns realtime multiplayer runtime |
| [0003-use-drizzle-sqlite-postgres.md](./0003-use-drizzle-sqlite-postgres.md) | Why Drizzle, SQLite, and PostgreSQL are the persistence path |
| [0004-agent-suggestion-boundary.md](./0004-agent-suggestion-boundary.md) | Why Agents only return action suggestions |
| [0005-wiai-naming.md](./0005-wiai-naming.md) | Why the code abbreviation is WiAI/wiai |
| [0006-use-clean-domain-boundaries.md](./0006-use-clean-domain-boundaries.md) | Why the rewrite uses clean domain boundaries and explicit patterns |

## Update Rules

- Add an ADR when a decision changes architecture, persistence, runtime, deployment, or naming.
- Do not rewrite history silently; supersede old ADRs with a new dated decision when direction changes.
- Link affected technical docs from the ADR consequences section.
