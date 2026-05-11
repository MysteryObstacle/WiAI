# Document Map

This handbook is organized as an Agile software development package for the WiAI rewrite.

Product-facing name:

```text
Who is AI
```

Engineering name:

```text
WiAI / wiai
```

## Reading Order For A New Codex Session

1. `00-meta/document-map.md`
2. `00-meta/agile-workflow.md`
3. `00-meta/diagram-index.md`
4. `00-meta/document-review-2026-05-11.md`
5. `01-product/prd.md`
6. `01-product/product-flow-diagrams.md`
7. `01-product/personas.md`
8. `02-user-stories/epics.md`
9. `02-user-stories/user-stories.md`
10. `02-user-stories/use-case-diagram.md`
11. `03-backlog/product-backlog.md`
12. `03-backlog/backlog-flow-diagrams.md`
13. `04-technical-design/architecture-overview.md`
14. `04-technical-design/system-uml-diagrams.md`
15. `04-technical-design/domain-model-diagrams.md`
16. `04-technical-design/package-dependency-diagrams.md`
17. `04-technical-design/visibility-and-trust-diagrams.md`
18. `04-technical-design/design-pattern-oop-audit.md`
19. `04-technical-design/runtime-referee-design.md`
20. `04-technical-design/runtime-sequence-diagrams.md`
21. `05-api-spec/colyseus-room-protocol.md`
22. `05-api-spec/protocol-sequence-diagrams.md`
23. `06-database/table-design.md`
24. `06-database/database-diagrams.md`
25. `07-ui-ux/screen-specs.md`
26. `07-ui-ux/ui-flow-diagrams.md`
27. `07-ui-ux/frontend-architecture-diagrams.md`
28. `07-ui-ux/design-concept-brief.md`
29. `09-definition-of-done/definition-of-done.md`
30. `09-definition-of-done/quality-gate-diagrams.md`
31. `10-sprint-planning/sprint-00-inception.md`
32. `10-sprint-planning/sprint-roadmap-diagrams.md`
33. `11-codex-handoff/implementation-prompt.md`

## Folder Responsibilities

| Folder | Purpose |
|---|---|
| [00-meta](./README.md) | How to use and maintain this handbook, including diagram index |
| [01-product](../01-product/README.md) | Product requirements and acceptance rules |
| [02-user-stories](../02-user-stories/README.md) | Agile epics, stories, and story map |
| [03-backlog](../03-backlog/README.md) | Product backlog, priorities, and release plan |
| [04-technical-design](../04-technical-design/README.md) | Architecture, modules, runtime, deployment |
| [05-api-spec](../05-api-spec/README.md) | Colyseus messages, HTTP routes, Agent protocol, errors |
| [06-database](../06-database/README.md) | ERD, tables, repositories, migration strategy |
| [07-ui-ux](../07-ui-ux/README.md) | UX principles, IA, screens, components, motion |
| [08-adr](../08-adr/README.md) | Architecture Decision Records |
| [09-definition-of-done](../09-definition-of-done/README.md) | DoD, testing, review, debugging standards |
| [10-sprint-planning](../10-sprint-planning/README.md) | Sprint-level scope and acceptance gates |
| [11-codex-handoff](../11-codex-handoff/README.md) | Prompts and session checklists for future Codex work |

## Maintenance Rules

- Product behavior changes must update `01-product`, `02-user-stories`, and `03-backlog`.
- Protocol changes must update `05-api-spec`, relevant tests, and at least one sprint document.
- Database changes must update `06-database/table-design.md` and `06-database/repository-contracts.md`.
- Architecture changes must add or update an ADR under `08-adr`.
- Completion criteria changes must update `09-definition-of-done`.
- UI implementation must not start before the design concept gate in `07-ui-ux/design-concept-brief.md` is satisfied.
- Each top-level handbook folder must keep a `README.md` that explains purpose, reading order, file list, and update rules.
- Do not add new code names that violate the WiAI naming convention.
