# Agile Workflow

WiAI uses a lightweight Agile process. The goal is fast delivery without turning documentation into ceremony.

## Work Item Types

| Type | Meaning |
|---|---|
| Epic | Large outcome spanning multiple stories |
| Story | User-visible behavior with acceptance criteria |
| Task | Engineering work needed to complete a story |
| Bug | Incorrect behavior after a story is accepted |
| Tech Debt | Internal improvement that reduces future cost |
| Spike | Time-boxed research with a written conclusion |

## Lifecycle

```text
Idea -> Backlog -> Sprint Candidate -> In Progress -> Review -> Done
```

Rules:

- Every sprint item must trace to an Epic or explicit technical foundation.
- Every Story must have acceptance criteria.
- Every Task must name expected files or modules.
- Every Done item must satisfy the Definition of Done.

## Sprint Rhythm

Recommended sprint length for the rewrite:

```text
1 week
```

Recommended sequence:

1. Sprint 00: project inception and repository scaffold.
2. Sprint 01: pure rules, schemas, and database foundation.
3. Sprint 02: Colyseus playable loop.
4. Sprint 03: Agent and persistence completion.
5. Sprint 04: Next.js UI, animation, and E2E hardening.

## Ceremony Outputs

| Ceremony | Output |
|---|---|
| Sprint Planning | sprint goal, committed stories, task breakdown |
| Daily Sync | blockers, changed assumptions, verification notes |
| Review | demo notes, accepted stories, rejected stories |
| Retrospective | one process improvement and one technical improvement |

## Estimation Scale

Use simple story points:

```text
1 = trivial
2 = small
3 = medium
5 = complex
8 = split before implementation
```

Any story estimated as 8 must be decomposed before coding.

