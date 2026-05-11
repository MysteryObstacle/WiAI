# UI/UX Experience Principles

## Product Feel

WiAI should feel like a tense, readable investigation room, not a marketing page and not a dense admin tool.

Design keywords:

```text
clear, restrained, suspicious, quick, readable, social
```

## UI Rules

- First screen is the usable app, not a landing hero.
- Use shadcn/ui primitives.
- Use DOM UI for all text-heavy gameplay.
- Preserve mobile readability.
- Do not hide current phase or timer.
- Use disabled states instead of letting users discover invalid commands through errors.

## Information Priority

During game:

1. Phase and countdown.
2. Current question.
3. Required player action.
4. Player roster and suspicion context.
5. Public answers or discussion.
6. Secondary room/debug details.

## Motion

GSAP is for ceremony:

- phase transition
- answer reveal
- vote confirmation
- settlement reveal

Motion must never decide state.

