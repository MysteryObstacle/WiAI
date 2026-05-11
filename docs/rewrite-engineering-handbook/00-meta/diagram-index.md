# Diagram Index

This page maps diagram types to handbook topics.

| Topic | Diagram File | Mermaid Types |
|---|---|---|
| Product flow | `01-product/product-flow-diagrams.md` | flowchart, stateDiagram |
| Users and use cases | `02-user-stories/use-case-diagram.md` | flowchart |
| Backlog lifecycle | `03-backlog/backlog-flow-diagrams.md` | flowchart, quadrantChart |
| System architecture | `04-technical-design/system-uml-diagrams.md` | flowchart, classDiagram |
| Domain model | `04-technical-design/domain-model-diagrams.md` | classDiagram |
| Package dependencies | `04-technical-design/package-dependency-diagrams.md` | flowchart |
| Runtime referee | `04-technical-design/runtime-sequence-diagrams.md` | sequenceDiagram, stateDiagram |
| Hidden information and trust | `04-technical-design/visibility-and-trust-diagrams.md` | flowchart, sequenceDiagram |
| API and protocol | `05-api-spec/protocol-sequence-diagrams.md` | sequenceDiagram |
| Database | `06-database/database-diagrams.md` | erDiagram, flowchart |
| UI/UX | `07-ui-ux/ui-flow-diagrams.md` | flowchart, journey |
| Frontend architecture | `07-ui-ux/frontend-architecture-diagrams.md` | flowchart |
| Design concept gate | `07-ui-ux/design-concept-brief.md` | flowchart |
| Quality gates | `09-definition-of-done/quality-gate-diagrams.md` | flowchart |
| Sprint planning | `10-sprint-planning/sprint-roadmap-diagrams.md` | gantt, flowchart |
| Codex handoff | `11-codex-handoff/codex-workflow-diagrams.md` | flowchart, sequenceDiagram |

## Diagram Policy

- Prefer one focused diagram per question.
- Use Mermaid in Markdown so diagrams live with documentation.
- Keep diagrams implementation-oriented: names should match planned code modules.
- Split diagrams before they become unreadable.
- Mermaid diagrams use WiAI naming: `WiaiRoom`, `WiaiState`, `@wiai/*`, `WIAI_`.
- When a diagram affects implementation boundaries, link it from the relevant handoff or sprint document.
