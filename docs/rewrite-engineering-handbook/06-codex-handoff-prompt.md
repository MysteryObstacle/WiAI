# Codex Handoff Prompt

Use this prompt to start a new Codex session for implementation.

```text
We are building a new rewrite of Who is AI, not modifying the old Vue + Django implementation.

Read these docs first:
- docs/rewrite-engineering-handbook/README.md
- docs/rewrite-engineering-handbook/01-product-scope.md
- docs/rewrite-engineering-handbook/02-system-architecture.md
- docs/rewrite-engineering-handbook/03-domain-protocol.md
- docs/rewrite-engineering-handbook/04-implementation-plan.md
- docs/rewrite-engineering-handbook/05-quality-gates.md

Primary goal:
Build P0 of a TypeScript monorepo where one local command runs a playable React + Colyseus multiplayer game.

Accepted stack:
- React + Next.js App Router + shadcn/ui + Tailwind CSS + GSAP
- Node.js + TypeScript + Colyseus
- Colyseus Schema for synchronized live room state
- Zod for browser commands, HTTP payloads, and Agent protocol
- Drizzle ORM
- SQLite locally
- PostgreSQL later for production
- Vitest and Playwright

Naming:
- Product-facing name: Who is AI
- Display abbreviation: WiAI
- Machine slug: wiai
- Package scope: @wiai/*
- Env prefix: WIAI_
- TypeScript PascalCase prefix: Wiai
- Do not introduce WhoisAI, WhoIsAi, whoisai, or who_is_ai in new code.

Hard requirements:
- No Django.
- No Redis in P0.
- No separate referee process.
- No separate Agent worker process in P0.
- Browser never advances phase or decides winner.
- Colyseus Room hosts runtime, connection, clock, and live sync.
- Next.js route pages should stay Server Components where possible.
- Live game room UI, Colyseus client, localStorage, countdown effects, and GSAP must live in 'use client' components.
- packages/game owns command validation, phase advancement, referee logic, and settlement rules.
- Agent only returns action_suggestion. It never writes DB, mutates Colyseus state directly, or advances phase directly.
- P0 includes in-process mock Agent.
- npm install and npm run dev should be enough for local play.

Implement task-by-task from docs/rewrite-engineering-handbook/04-implementation-plan.md.
Keep tests close to each package.
After each meaningful task, run the package tests and update the implementation notes.
Before claiming P0 complete, run the quality gates from docs/rewrite-engineering-handbook/05-quality-gates.md.
```
