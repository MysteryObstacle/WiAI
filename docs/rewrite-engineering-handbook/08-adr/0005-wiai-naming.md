# ADR 0005: WiAI Naming

## Context

`WhoisAI` and `WhoIsAi` are too long and awkward for code identifiers. `WAI` conflicts with Web Accessibility Initiative terminology.

## Decision

Use:

```text
Product name: Who is AI
Display abbreviation: WiAI
Machine slug: wiai
TypeScript prefix: Wiai
Package scope: @wiai/*
Environment prefix: WIAI_
```

## Consequences

- Code identifiers are shorter.
- Accessibility terminology confusion is avoided.
- New code must not introduce `WhoisAI`, `WhoIsAi`, `whoisai`, or `who_is_ai`.

