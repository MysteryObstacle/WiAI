# UI/UX Documents

## Purpose

This directory defines the player-facing experience, screen structure, component system, motion, frontend architecture, and visual design gate.

## Read First

1. [experience-principles.md](./experience-principles.md)
2. [information-architecture.md](./information-architecture.md)
3. [screen-specs.md](./screen-specs.md)
4. [ui-flow-diagrams.md](./ui-flow-diagrams.md)
5. [frontend-architecture-diagrams.md](./frontend-architecture-diagrams.md)
6. [design-concept-brief.md](./design-concept-brief.md)

## Files

| File | Purpose |
|---|---|
| [experience-principles.md](./experience-principles.md) | UX direction and product feel |
| [information-architecture.md](./information-architecture.md) | Page and navigation structure |
| [screen-specs.md](./screen-specs.md) | Required screens and states |
| [component-system.md](./component-system.md) | shadcn/ui component usage and variants |
| [motion-spec.md](./motion-spec.md) | GSAP and UI motion expectations |
| [ui-flow-diagrams.md](./ui-flow-diagrams.md) | Mermaid UI flow diagrams |
| [frontend-architecture-diagrams.md](./frontend-architecture-diagrams.md) | Next.js Server/Client component and state boundary diagrams |
| [design-concept-brief.md](./design-concept-brief.md) | Required visual concept gate before frontend implementation |

## Update Rules

- Do not start production UI implementation before the design concept gate is satisfied.
- Screen changes must update [screen-specs.md](./screen-specs.md), flows, and acceptance criteria.
- Motion changes must stay purposeful and must not hide authoritative game state.
