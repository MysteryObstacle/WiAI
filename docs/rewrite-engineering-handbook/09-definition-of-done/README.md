# Definition Of Done Documents

## Purpose

This directory defines what "done" means for WiAI implementation work.

## Read First

1. [definition-of-done.md](./definition-of-done.md)
2. [testing-strategy.md](./testing-strategy.md)
3. [quality-gate-diagrams.md](./quality-gate-diagrams.md)
4. [review-checklist.md](./review-checklist.md)

## Files

| File | Purpose |
|---|---|
| [definition-of-done.md](./definition-of-done.md) | Completion criteria for stories, sprints, and P0 |
| [testing-strategy.md](./testing-strategy.md) | Unit, integration, and E2E testing expectations |
| [review-checklist.md](./review-checklist.md) | Code and design review checklist |
| [observability-debugging.md](./observability-debugging.md) | Logging, debugging, and diagnostic expectations |
| [quality-gate-diagrams.md](./quality-gate-diagrams.md) | Mermaid quality gate and test pyramid diagrams |

## Update Rules

- New risk areas need matching test or review criteria.
- P0 cannot be marked complete unless the quality gate passes.
- Changes to architecture or API contracts should add targeted verification expectations here.
