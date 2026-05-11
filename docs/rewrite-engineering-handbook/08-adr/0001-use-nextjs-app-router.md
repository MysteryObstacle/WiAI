# ADR 0001: Use Next.js App Router

## Context

The UI direction favors Vercel and shadcn/ui. The app also needs future product pages, rules pages, replay pages, Agent debug views, and admin surfaces.

## Decision

Use React with Next.js App Router for `apps/web`.

## Consequences

- Live game room must use client components.
- Static and admin-style pages can use Server Components.
- Vercel preview workflow becomes straightforward.
- Colyseus server remains separate.

## Alternatives Considered

- Vite React: simpler local dev, weaker fit for future Vercel product surfaces.
- Vue: existing project used it, but migration value is low and desired UI ecosystem is React-first.

