# WiAI Game Command Console Design

## Summary

Redesign the live game screen as a restrained matrix investigation console. The interface should extend the homepage's black-background, dot-grid, glyph-matrix language while staying grounded in shadcn/ui primitives and readable gameplay state.

The default live-game master is no longer a round table. The preferred structure is:

```text
top status bar
left player column | central command console | right player column
bottom focus/action bar
secondary investigation sheet/drawer
```

The design targets 6-8 players, with 3-4 player cards per side on desktop.

## Goals

- Make the current phase task immediately clear.
- Keep player state visible without crowding the central task.
- Preserve hidden identity rules; production player cards must not expose AI identity.
- Use the homepage matrix-tech visual language without introducing a separate game skin.
- Keep implementation compatible with shadcn/ui composition and semantic tokens.
- Use GSAP only for lightweight transitions, not component styling.

## Non-Goals

- Do not implement a round-table layout for the main live game screen.
- Do not copy Wolfcha's parchment, gold label, or warm card style.
- Do not build a generic full-screen chat interface.
- Do not create a large custom CSS animation system.
- Do not expose debug-only player type or AI identity labels in production gameplay.

## Master Layout

### Top Status Bar

The top bar contains the highest-priority status:

- product identity: `Who is AI`
- room code
- round number
- current phase
- countdown
- current player number
- known identity for the current player

The stage rail may live in or near this bar. It should remain lightweight and should not imply users can manually move the game flow backward.

### Player Columns

Player state appears in left and right columns. For 6-8 players, each side holds 3-4 compact player cards.

Each card may show:

- player number
- nickname
- current-player marker
- phase status such as waiting, submitted, spoke, voted, or inactive
- suspicion heat or vote count when publicly available
- selected/focus state

Player cards must not show hidden role or AI identity during normal play.

Clicking a player:

1. sets the current focus player,
2. opens or updates the investigation sheet/drawer,
3. keeps the active game phase unchanged.

### Central Command Console

The central command console is the primary gameplay surface. It only shows the active phase's main task.

It should feel like a shadcn-composed control surface, not a custom-skinned canvas. Use `Card`, `Field`, `Textarea`, `InputGroup`, `Tabs`, `ScrollArea`, `Button`, `Badge`, and related primitives where appropriate.

### Bottom Focus/Action Bar

The bottom bar shows:

- current focus player or current task state
- phase-specific actions
- shortcuts to dossier/history surfaces

Actions should be plain, predictable shadcn controls. Do not create decorative button skins.

### Investigation Sheet/Drawer

Secondary and historical information lives in a disclosure surface instead of a persistent right rail.

Suggested tabs:

- Player
- Answer
- Discussion
- Vote
- History

The sheet/drawer is for context lookup. It should not replace the central command console.

## Phase Designs

### Answer Prep

Central console:

- round and phase label
- question prompt
- answer guidance
- answer input
- submit and cancel controls
- submitted count

Player columns:

- submitted/waiting state only
- current player highlight
- no answers and no hidden identities

Investigation surface:

- current question
- answer guidance
- rule reminders

### Answer Reveal

Central console:

- selected player's full answer
- question context
- lightweight suspicion markers
- previous/next answer navigation

Player columns:

- answer available state
- answer summary only when appropriate
- selected player state

Investigation surface:

- all public answers
- question
- answer markers
- per-player notes

### Discussion

Central console:

- current focus player
- focus player's answer summary
- relevant suspicion points
- evidence-oriented message list
- reply input

Discussion should be organized around players and evidence, not as a generic chat room.

Player columns:

- speaker state
- mentioned/focus state
- suspicion heat

Investigation surface:

- player answer
- player message history
- incoming suspicion
- current vote/suspicion context when available

### Voting

Central console:

- selected target
- short reasoning context
- confirm vote action
- recorded vote state

Player columns:

- candidate cards act as target selectors
- current player's own card shows unavailable/self state
- submitted/recorded state after voting

Investigation surface:

- target answer
- related discussion
- current public vote context if available

## Visual Language

Use the homepage-inspired matrix-tech direction:

- black or dark neutral background
- sparse dot grid or glyph texture behind content
- white and muted-foreground text hierarchy
- semantic shadcn tokens for component colors
- restrained borders, radii, spacing, and typography

Avoid:

- warm parchment palettes
- gold-label social deduction card styling
- neon cyberpunk glow
- heavy custom card skins
- decorative nested cards

## Motion

Motion is shadcn-first and GSAP-minimal.

Use shadcn/Tailwind state styling for:

- hover
- focus
- selected
- disabled
- validation
- color transitions

Use GSAP only for:

- phase-level wrapper transition
- staggered answer/message/settlement reveal
- short confirmation feedback after an action

GSAP rules:

- animate `x`, `y`, `scale`, and `autoAlpha`
- do not animate layout properties such as width, height, top, or left
- keep phase transitions around 0.25-0.4s
- respect `prefers-reduced-motion`
- clean up timelines on unmount

Avoid:

- persistent player-card pulsing
- decorative trails
- large glow effects
- complex line animations
- motion required to understand game state

## Component Implications

Likely project components:

- `TopStatusBar`
- `PlayerColumns`
- `PlayerStatusCard`
- `CommandConsole`
- `ActionBar`
- `InvestigationSheet`
- phase console components for answer prep, answer reveal, discussion, and voting

Existing phase panels can be migrated into console-specific compositions instead of being rewritten as unrelated surfaces.

## Responsive Behavior

Desktop:

- two player columns flank the command console
- bottom action bar stays visible
- investigation context opens in `Sheet` or `Drawer`

Tablet:

- player columns may collapse into a two-row player strip or side sheet
- command console remains the main surface

Mobile:

- top status bar remains compact
- command console appears first
- current focus/action strip follows the console
- full roster and investigation context move into `Sheet` or `Drawer`

## Testing And Verification

Implementation should be verified with:

- typecheck
- lint
- relevant unit tests for data mapping and phase behavior
- existing full-game e2e flow
- browser screenshot review for desktop and mobile breakpoints
- reduced-motion check for phase transitions and reveal behavior
