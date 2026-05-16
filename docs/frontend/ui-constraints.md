# UI Constraints

## Goal

The WiAI frontend should feel like a restrained matrix investigation console: tense, readable, sparse, technological, and immediately playable. It should not feel like a marketing page, a dense admin dashboard, a decorative board-game skin, or a neon sci-fi shell.

## Visual Direction

Use the **restrained matrix console** direction:

- Dark or neutral surfaces with careful contrast.
- Low decoration and no visual noise.
- Sparse matrix, glyph, and dot-grid texture may echo the homepage, but it must remain secondary to readable game state.
- Strong hierarchy for phase, timer, question, and current action.
- Clear suspicion and player context without crowding the main task.
- shadcn/Vercel-style spacing, radius, borders, and typography.

The UI may feel atmospheric, but readability and game-state clarity are more important than mood. Avoid warm parchment, gold-label, tabletop, and heavy character-card treatments unless they are explicitly redesigned through the matrix-console language.

## shadcn/ui Usage

shadcn/ui is the base component system for production UI work.

Use shadcn/ui primitives for:

- `Button`
- `Input`
- `Textarea`
- `Card`
- `Badge`
- `Avatar`
- `Separator`
- `Tooltip`
- `Dialog`
- `Sheet`
- `Drawer`
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
- `PlayerStatusPanel`: desktop live-game left panel containing all active players.
- `ActionCard`: the primary current action for the active phase.
- `StageMainCanvas` / `CommandConsole`: central live-game control surface for the active phase task.
- `ContextPanel`: secondary information such as messages, revealed answers, or vote context.
- `InvestigationPanel`: persistent right-side player dossier for this game's statistics, answer record, discussion evidence, and vote context. It must not add a separate history tab.
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
- Large custom animation styles that compete with shadcn/ui component states.
- Custom card skins that override shadcn radius, border, typography, or semantic color tokens for visual novelty.

Allowed exceptions:

- One-off layout utilities in the component that owns that layout.
- Minimal animation hooks required by GSAP transition utilities, if documented near the component.
- Homepage-derived canvas or matrix texture components, if they are background-only and do not replace shadcn primitives.
- Global CSS variables required by shadcn or app-wide theme tokens.

## Layout Principles

Desktop live game layout:

- Top region: product identity, room code, round, phase, countdown, current player number, and known identity.
- Left region: complete player status panel with all players.
- Center region: a command console that only shows the active phase's primary task.
- Right region: persistent investigation panel with player statistics, answer record, discussion evidence, and vote context.
- Column heights are determined by the page height; columns scroll internally.

Do not use the round-table layout as the default live-game master. The preferred live-game master is a three-column command-console layout inspired by the homepage matrix style.

Mobile live game layout:

- Top: phase, timer, room identity, and current question.
- Main: one primary command console.
- Player context: compact horizontal player rail plus a roster `Sheet` or `Drawer`.
- Secondary context: `Sheet`, `Drawer`, `Tabs`, or another shadcn-supported disclosure pattern.

The app must preserve the current phase, countdown, question, and primary action across all breakpoints.

## Live Game Command Console

The live game command console is the primary gameplay surface.

- During answer prep, `AnswerPrepCard` shows the question, answer guidance chips, answer-paper input, character count, submit/modify state, and submitted count.
- During answer reveal, `AnswerRevealCard` shows an answer card wall, selected full answer, suspicion tags, and previous/next navigation.
- During discussion, `DiscussionCard` shows the focus player, focus summary, relevant messages, quick replies, and the user's reply input.
- During voting, `VotingDecisionCard` shows player ID nodes connected as a regular N-sided polygon, public vote arrows from voter to target, current selected target, and confirmation action. Do not draw a central VOTE label, X table, or checkmarks as a substitute for vote arrows.

The player status panel shows public number, phase status, speech count, current vote count, answer status, and vote status. It must not show nicknames, mention counts, or heat scores during the game. Red status dots mean "most voted in the previous round" only.

## Motion Principles

Use shadcn/ui for static component appearance and state styling. Use GSAP only as a lightweight transition layer.

Allowed GSAP use:

- Phase-level wrapper transitions using `transform` and `autoAlpha`.
- Staggered reveal of answer or settlement rows.
- Short confirmation feedback on a selected player or submitted action.

Avoid GSAP for:

- Persistent player-card pulsing.
- Decorative trails, large glow effects, or complex line animations.
- Replacing shadcn hover, focus, selected, disabled, or validation states.
- Animating layout properties such as width, height, top, or left.

All motion must respect `prefers-reduced-motion`, clean up timelines on unmount, and leave content readable without animation.

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
