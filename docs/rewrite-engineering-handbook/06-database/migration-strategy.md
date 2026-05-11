# Migration Strategy

## P0

Use SQLite locally:

```text
WIAI_DATABASE_URL=file:./.data/wiai.sqlite
```

Drizzle migrations are committed and repeatable.

## PostgreSQL Readiness

Before production:

- Run repository tests against PostgreSQL.
- Avoid SQLite-only raw SQL.
- Use portable timestamp handling.
- Avoid JSON queries that rely on SQLite-only behavior.
- Keep ids as text UUID/CUID-like strings.

## Data Conversion

The P0 rewrite does not migrate old Django data. It defines a new schema for the new project.

If old games need migration later, treat that as a separate data migration project with source extraction, transform scripts, and verification reports.

