# Database Documents

## Purpose

This directory defines the WiAI persistence model, local SQLite strategy, production PostgreSQL path, and repository contracts.

## Read First

1. [table-design.md](./table-design.md)
2. [database-diagrams.md](./database-diagrams.md)
3. [repository-contracts.md](./repository-contracts.md)
4. [migration-strategy.md](./migration-strategy.md)

## Files

| File | Purpose |
|---|---|
| [table-design.md](./table-design.md) | Planned relational tables and key constraints |
| [erd.md](./erd.md) | Focused ER diagram |
| [database-diagrams.md](./database-diagrams.md) | Database ERD and persistence flow diagrams |
| [repository-contracts.md](./repository-contracts.md) | Repository API expectations |
| [migration-strategy.md](./migration-strategy.md) | SQLite local and PostgreSQL production migration plan |

## Update Rules

- Schema changes must update [table-design.md](./table-design.md), [database-diagrams.md](./database-diagrams.md), and repository contracts.
- Keep SQLite and PostgreSQL compatibility explicit; do not rely on database-specific behavior unless documented.
- Persistence changes that affect gameplay replay or settlement must update technical design and tests.
