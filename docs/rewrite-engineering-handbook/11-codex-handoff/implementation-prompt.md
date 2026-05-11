# Implementation Prompt

Use this prompt to start a new Codex implementation session.

```text
We are implementing the WiAI rewrite of Who is AI.

Read first:
- docs/rewrite-engineering-handbook/00-meta/document-map.md
- docs/rewrite-engineering-handbook/00-meta/agile-workflow.md
- docs/rewrite-engineering-handbook/00-meta/diagram-index.md
- docs/rewrite-engineering-handbook/00-meta/document-review-2026-05-11.md
- docs/rewrite-engineering-handbook/01-product/prd.md
- docs/rewrite-engineering-handbook/01-product/product-flow-diagrams.md
- docs/rewrite-engineering-handbook/02-user-stories/epics.md
- docs/rewrite-engineering-handbook/03-backlog/product-backlog.md
- docs/rewrite-engineering-handbook/04-technical-design/architecture-overview.md
- docs/rewrite-engineering-handbook/04-technical-design/system-uml-diagrams.md
- docs/rewrite-engineering-handbook/04-technical-design/domain-model-diagrams.md
- docs/rewrite-engineering-handbook/04-technical-design/package-dependency-diagrams.md
- docs/rewrite-engineering-handbook/04-technical-design/visibility-and-trust-diagrams.md
- docs/rewrite-engineering-handbook/04-technical-design/design-pattern-oop-audit.md
- docs/rewrite-engineering-handbook/04-technical-design/runtime-sequence-diagrams.md
- docs/rewrite-engineering-handbook/05-api-spec/colyseus-room-protocol.md
- docs/rewrite-engineering-handbook/05-api-spec/protocol-sequence-diagrams.md
- docs/rewrite-engineering-handbook/06-database/table-design.md
- docs/rewrite-engineering-handbook/06-database/database-diagrams.md
- docs/rewrite-engineering-handbook/07-ui-ux/screen-specs.md
- docs/rewrite-engineering-handbook/07-ui-ux/frontend-architecture-diagrams.md
- docs/rewrite-engineering-handbook/07-ui-ux/design-concept-brief.md
- docs/rewrite-engineering-handbook/09-definition-of-done/definition-of-done.md
- docs/rewrite-engineering-handbook/09-definition-of-done/quality-gate-diagrams.md
- docs/rewrite-engineering-handbook/10-sprint-planning/sprint-00-inception.md

Implement sprint-by-sprint.

Hard constraints:
- Product name is Who is AI.
- Engineering name is WiAI / wiai.
- Use Next.js App Router for apps/web.
- Use Colyseus for apps/server.
- Use packages/game for pure domain rules, command handlers, phase policies, settlement, and visibility.
- Use packages/kernel for shared ids, value objects, Result, and stable enum values.
- Use Zod for commands and Agent protocol.
- Use Colyseus Schema for live state.
- Use Drizzle with SQLite locally.
- Agent can only return action_suggestion.
- No Django, Redis, Python worker, or separate referee process in P0.
- Do not start frontend implementation until the design concept gate has a concrete visual direction for lobby, room, game table, settlement, and Agent diagnostics.
- packages/game must not import packages/schema, packages/db, packages/agent, Colyseus, Drizzle, React, or browser APIs.
- packages/agent must not import packages/game or receive full game state.
- Use Command Pattern for actions, phase policies for phase behavior, Strategy Pattern for settlement/role assignment/Agent providers, and Unit of Work for accepted command persistence.
```
