# Motion Spec

## Principles

- Motion follows server state.
- Motion clarifies what changed.
- Motion respects `prefers-reduced-motion`.
- Motion can be skipped without breaking gameplay.
- shadcn/ui owns component appearance and state styling.
- GSAP is a lightweight transition layer, not the visual design system.
- Animate transform and opacity only unless there is a documented exception.
- Avoid persistent decorative motion during reading, typing, or voting decisions.

## GSAP Boundaries

Allowed:

- phase-level wrapper transitions
- staggered answer, message, or settlement reveal
- short action-confirmation feedback
- existing homepage-style canvas texture when kept behind content

Avoid:

- custom hover, focus, selected, disabled, or validation behavior that should belong to shadcn/ui
- large glow effects, decorative trails, and constant pulsing
- animations that require page-level CSS skins or global selectors
- layout-property animation such as width, height, top, or left

## Phase Transition

Trigger:

```text
state.phase changes
```

Behavior:

- fade/slide the central command console wrapper
- keep the top status bar and player columns stable
- focus primary action when appropriate
- keep duration short, generally 0.25-0.4s

## Answer Reveal

Trigger:

```text
phase enters answer_reveal
```

Behavior:

- reveal answers one by one
- preserve final static list after animation
- use a subtle stagger on answer rows or selected-answer changes
- avoid decorative sticker or card-flip effects unless implemented through existing component variants

## Vote Feedback

Trigger:

```text
current player submits a ballot
```

Behavior:

- briefly emphasize the selected target player card using scale or opacity only
- update vote state with static readable content after the confirmation
- do not use persistent trails, large glows, or complex custom line animations

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
