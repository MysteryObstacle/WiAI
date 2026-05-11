# ADR 0003: Use Drizzle With SQLite And PostgreSQL

## Context

The rewrite needs one-command local development and a production-capable relational database path.

## Decision

Use Drizzle ORM. Use SQLite locally and PostgreSQL for production.

## Consequences

- P0 local setup has no database service dependency.
- Schema and repository code must stay portable.
- PostgreSQL tests are required before production.

## Alternatives Considered

- Prisma: strong tooling but heavier for this lightweight TypeScript stack.
- Raw SQL: maximum control but more duplicated typing and validation work.
- MongoDB: less aligned with relational game audit data.

