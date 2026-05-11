# WiAI Rewrite Engineering Handbook

> Product name: `Who is AI`  
> Engineering shorthand: `WiAI` / `wiai`

This directory is the Agile software engineering handbook for the React + Next.js + Colyseus rewrite. It is designed so a new Codex session can read the documents in order and start implementation without relying on the old Vue + Django codebase.

## 1. Accepted Stack

```text
React + Next.js App Router + shadcn/ui + Tailwind CSS + GSAP
Node.js + TypeScript + Colyseus
Drizzle ORM + SQLite local + PostgreSQL production
Zod for commands / HTTP / Agent protocol
Colyseus Schema for live room state sync
Vitest + Playwright
```

## 2. Naming Standard

```text
Product name: Who is AI
Display abbreviation: WiAI
Machine slug: wiai
Package scope: @wiai/*
Environment prefix: WIAI_
Database file: wiai.sqlite
Service names: wiai-web, wiai-server
TypeScript PascalCase prefix: Wiai
```

Do not introduce these names in new project code:

```text
WhoisAI
WhoIsAi
whoisai
who_is_ai
```

## 3. Agile Documentation Structure

| Folder | Purpose |
|---|---|
| [00-meta](./00-meta/README.md) | Documentation map, [diagram index](./00-meta/diagram-index.md), Agile workflow, glossary, [document review](./00-meta/document-review-2026-05-11.md) |
| [01-product](./01-product/README.md) | PRD, personas, journeys, non-functional requirements, acceptance criteria, [product flow diagrams](./01-product/product-flow-diagrams.md) |
| [02-user-stories](./02-user-stories/README.md) | Epics, stories, story map, [use-case diagram](./02-user-stories/use-case-diagram.md) |
| [03-backlog](./03-backlog/README.md) | Product backlog, prioritization, release plan, [backlog flow diagrams](./03-backlog/backlog-flow-diagrams.md) |
| [04-technical-design](./04-technical-design/README.md) | Architecture, boundaries, design-pattern audit, referee, Agent, deployment, [system UML diagrams](./04-technical-design/system-uml-diagrams.md), [domain model](./04-technical-design/domain-model-diagrams.md), [package dependencies](./04-technical-design/package-dependency-diagrams.md), [trust boundaries](./04-technical-design/visibility-and-trust-diagrams.md) |
| [05-api-spec](./05-api-spec/README.md) | Colyseus protocol, HTTP routes, Agent protocol, error codes, [protocol sequences](./05-api-spec/protocol-sequence-diagrams.md) |
| [06-database](./06-database/README.md) | ERD, table design, repository contracts, migration strategy, [database diagrams](./06-database/database-diagrams.md) |
| [07-ui-ux](./07-ui-ux/README.md) | UX principles, IA, screens, components, motion, [UI flow diagrams](./07-ui-ux/ui-flow-diagrams.md), [frontend architecture](./07-ui-ux/frontend-architecture-diagrams.md), [design concept brief](./07-ui-ux/design-concept-brief.md) |
| [08-adr](./08-adr/README.md) | Architecture decision records |
| [09-definition-of-done](./09-definition-of-done/README.md) | DoD, testing, review, observability, [quality gate diagrams](./09-definition-of-done/quality-gate-diagrams.md) |
| [10-sprint-planning](./10-sprint-planning/README.md) | Sprint plans from inception to P0 completion |
| [11-codex-handoff](./11-codex-handoff/README.md) | Codex implementation prompt, development rules, [workflow diagrams](./11-codex-handoff/codex-workflow-diagrams.md) |

## 4. Recommended Reading Order

For a new implementation session:

1. [00-meta/document-map.md](./00-meta/document-map.md)
2. [00-meta/agile-workflow.md](./00-meta/agile-workflow.md)
3. [00-meta/diagram-index.md](./00-meta/diagram-index.md)
4. [01-product/prd.md](./01-product/prd.md)
5. [01-product/product-flow-diagrams.md](./01-product/product-flow-diagrams.md)
6. [01-product/acceptance-criteria.md](./01-product/acceptance-criteria.md)
7. [02-user-stories/epics.md](./02-user-stories/epics.md)
8. [02-user-stories/user-stories.md](./02-user-stories/user-stories.md)
9. [03-backlog/product-backlog.md](./03-backlog/product-backlog.md)
10. [04-technical-design/architecture-overview.md](./04-technical-design/architecture-overview.md)
11. [04-technical-design/system-uml-diagrams.md](./04-technical-design/system-uml-diagrams.md)
12. [04-technical-design/domain-model-diagrams.md](./04-technical-design/domain-model-diagrams.md)
13. [04-technical-design/package-dependency-diagrams.md](./04-technical-design/package-dependency-diagrams.md)
14. [04-technical-design/visibility-and-trust-diagrams.md](./04-technical-design/visibility-and-trust-diagrams.md)
15. [04-technical-design/design-pattern-oop-audit.md](./04-technical-design/design-pattern-oop-audit.md)
16. [04-technical-design/runtime-referee-design.md](./04-technical-design/runtime-referee-design.md)
17. [05-api-spec/colyseus-room-protocol.md](./05-api-spec/colyseus-room-protocol.md)
18. [06-database/table-design.md](./06-database/table-design.md)
19. [07-ui-ux/screen-specs.md](./07-ui-ux/screen-specs.md)
20. [07-ui-ux/frontend-architecture-diagrams.md](./07-ui-ux/frontend-architecture-diagrams.md)
21. [07-ui-ux/design-concept-brief.md](./07-ui-ux/design-concept-brief.md)
22. [09-definition-of-done/definition-of-done.md](./09-definition-of-done/definition-of-done.md)
23. [09-definition-of-done/quality-gate-diagrams.md](./09-definition-of-done/quality-gate-diagrams.md)
24. [10-sprint-planning/sprint-00-inception.md](./10-sprint-planning/sprint-00-inception.md)
25. [11-codex-handoff/implementation-prompt.md](./11-codex-handoff/implementation-prompt.md)

## 5. Development Principles

### Clean Domain Boundaries

```text
adapters -> application services -> domain core -> shared kernel
```

`packages/game` depends on `packages/kernel` only. It must not import Zod, Colyseus, Drizzle, React, browser APIs, `packages/schema`, `packages/db`, or `packages/agent`.

### Server Authority

The browser sends commands only. It never advances phase, assigns roles, counts final votes, or decides winner.

### Colyseus Runtime, Pure Referee

```text
WiaiRoom = runtime adapter, connections, room clock, live state sync
packages/game = commands, phase machine, role assignment, settlement
```

### Agent Safety

Agent returns `action_suggestion` only. The server validates and executes suggestions through the same command path as human actions.

### Local First

P0 local setup requires only:

```bash
npm install
npm run dev
```

No Redis, Django, Python worker, Docker, or PostgreSQL is required for P0 local play.

## 6. Legacy Flat Files

The older files at the root of this handbook are retained as quick summaries:

- `01-product-scope.md`
- `02-system-architecture.md`
- `03-domain-protocol.md`
- `04-implementation-plan.md`
- `05-quality-gates.md`
- `06-codex-handoff-prompt.md`

For implementation, prefer the Agile folder structure above.
