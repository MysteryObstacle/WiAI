# Motion Spec

## Principles

- Motion follows server state.
- Motion clarifies what changed.
- Motion respects `prefers-reduced-motion`.
- Motion can be skipped without breaking gameplay.

## Phase Transition

Trigger:

```text
state.phase changes
```

Behavior:

- fade out old action panel
- slide/fade in new phase header
- focus primary action when appropriate

## Answer Reveal

Trigger:

```text
phase enters answer_reveal
```

Behavior:

- reveal answers one by one
- preserve final static list after animation

## Settlement Reveal

Trigger:

```text
phase enters settlement
```

Behavior:

- reveal frozen player
- reveal role
- reveal winner side
- show full role table

