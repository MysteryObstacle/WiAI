# UI Constraints

## Goal

The WiAI frontend should feel like a restrained investigation room: tense, readable, sparse, and immediately playable. It should not feel like a marketing page, a dense admin dashboard, or a decorative game skin.

## Visual Direction

Use the **restrained investigation room** direction:

- Dark or neutral surfaces with careful contrast.
- Low decoration and no visual noise.
- Strong hierarchy for phase, timer, question, and current action.
- Clear suspicion and player context without crowding the main task.
- shadcn/Vercel-style spacing, radius, borders, and typography.

The UI may feel atmospheric, but readability and game-state clarity are more important than mood.

## shadcn/ui Usage

shadcn/ui is the base component system for production UI work.

Use shadcn/ui primitives for:

- `Button`
- `Input`
- `Textarea`
- `Card`
- `Badge`
- `Separator`
- `Tooltip`
- `Dialog`
- `Sheet`
- `Tabs`
- `ScrollArea`
- `Alert`

Do not recreate these primitives with custom CSS classes. If a primitive needs a project-specific shape, wrap it in a domain component or add an explicit variant.

## Component Boundaries

Pages should compose project components. They should not own styling details.

Recommended project components:

- `AppShell`: page frame, max width, responsive shell regions.
- `PageHeader`: product mark, room status, connection status, language switch entry.
- `PhaseBanner`: phase name, countdown, round, current question.
- `PlayerRoster`: player list, player status badges, current-player marker.
- `ActionCard`: the primary current action for the active phase.
- `ContextPanel`: secondary information such as messages, revealed answers, or vote context.
- `EmptyState`: consistent empty and waiting states.
- `StatusBadge`: host, ready, disconnected, current player, locked, submitted.

Each component must expose intentional props and variants. Avoid passing raw class names through multiple layers unless there is a clear composition need.

## Styling Rules

Use this order of preference:

1. shadcn/ui primitive defaults.
2. Project component variants.
3. Tailwind utilities inside the component that owns the layout.
4. Global CSS only for Tailwind imports, shadcn tokens, theme variables, body defaults, and necessary animation primitives.

Forbidden patterns:

- Large page-specific CSS classes such as `.lobby-stage`, `.game-table`, or `.vote-grid` in `globals.css`.
- Styling core controls with raw `button`, `input`, or `textarea` selectors beyond global resets.
- Duplicating shadcn primitives as custom `.primary-button`, `.secondary-button`, or `.panel` classes.
- Nested cards used only for decoration.
- Hard-coded colors in page components when a token or variant should exist.

Allowed exceptions:

- One-off layout utilities in the component that owns that layout.
- Animation classes required by GSAP or transition hooks, if documented near the component.
- Global CSS variables required by shadcn or app-wide theme tokens.

## Layout Principles

Desktop live game layout:

- Left region: players and status.
- Center region: phase, question, and primary action.
- Right region: context such as messages, revealed answers, vote status, or round summary.

Mobile live game layout:

- Top: phase, timer, room identity, and current question.
- Main: one primary action.
- Secondary context: `Sheet`, `Tabs`, or another shadcn-supported disclosure pattern.

The app must preserve the current phase, countdown, question, and primary action across all breakpoints.

## Information Priority

During live game screens, information priority is:

1. Current phase and countdown.
2. Current question.
3. Required player action.
4. Own player identity and status.
5. Player roster and suspicion context.
6. Public answers, discussion, votes, and settlement context.
7. Secondary room details and debug-only information.

Lower-priority information may move into a secondary panel on smaller screens, but it must not disappear if the player needs it to make a decision.

## Page-Level Guidance

The create/join screen is the usable app entry, not a hero page. It should quickly answer:

- What game am I joining?
- What name will I use?
- Am I creating or joining a room?
- What should I do next?

The lobby should make readiness and start conditions obvious. Disabled start actions must explain why they are disabled.

The game screen should change the primary action by phase while keeping the shell stable. Players should not need to relearn the page at every phase.

The settlement screen should clearly show winner side, frozen player, revealed roles, and final decision votes.

## Accessibility

- All actionable controls must use semantic shadcn-compatible controls.
- Icon-only buttons need accessible labels.
- Disabled controls need visible explanatory text or a tooltip.
- Color cannot be the only status indicator.
- Focus states must remain visible.
- Message, vote, and settlement content must be readable without animation.

## Implementation Gate

Before implementing UI changes, update or confirm:

- The target page or component.
- The shadcn primitives and project components it will use.
- The variants needed.
- The locale keys needed.
- The responsive behavior.
- The verification path: typecheck, lint, relevant tests, and browser screenshot review when layout changes.
