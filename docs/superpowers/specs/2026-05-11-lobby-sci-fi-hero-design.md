# Lobby Glyph Matrix Hero — Design Spec

**Status:** Approved for implementation planning  
**Date:** 2026-05-11  
**Scope:** WiAI web app — disconnected home lobby only

## 1. Goal

Rework the home lobby hero so it feels closer to a character-grid / hacker investigation interface: a dark field where many tiny glyphs form the central **`Who is AI?`** title, with occasional random bright character bursts and game-themed intel windows around it. The effect should feel like a sci-fi game promotion page while staying out of the connected lobby and gameplay UI.

## 2. Non-goals

- Do not copy third-party assets, layout, logo, or exact animation from the reference site.
- Do not use real-person photography.
- Do not animate every glyph as a DOM node.
- Do not change room creation, join, lobby, or game logic.
- Do not show the effect after entering a room or game.

## 3. User-visible behavior

### 3.1 Title and copy

- The visual hero title is rendered in the character matrix as **`Who is AI?`** with a question mark.
- The accessible / React heading remains backed by i18n key `app.heroTitle`, whose value should be **`Who is AI`** in both `zh-CN` and `en-US`.
- The subtitle remains locale-specific via `app.description`.
- The create/join room controls stay in front of the effect and remain clickable.

### 3.2 Character matrix field

- The home page background uses a dark, low-contrast character field.
- Characters are drawn from a limited set such as `W H O I S A I ? 0 1 / : . * + -`.
- Most glyphs remain dim; a small subset flickers, changes character, or brightens briefly.
- The central **`Who is AI?`** is not a normal text element visually. It is composed from many glyph positions, similar to pixel art or ASCII dot-matrix type.

### 3.3 Random character bursts

- Do not draw human silhouettes in the background.
- Instead, brief clusters of white characters appear in random screen positions.
- Each burst appears suddenly and disappears suddenly.
- Burst positions should be randomized per page load and per reveal cycle, so the screen does not feel patterned.
- Bursts must remain lower priority than the title.

### 3.4 Game intel HUD windows

- Add small game-themed HUD windows around the central **`Who is AI?`** title.
- HUD windows should flash in and out near the title, not sit permanently on the page.
- Each reveal cycle randomizes:
  - position around the title
  - panel size
  - content label and values
  - visible duration
- Use game/reasoning themed labels such as:
  - `ANSWER HASH`
  - `VOTE TRACE`
  - `SUSPECT MAP`
  - `ROUND LOCKED`
  - `ROLE: UNKNOWN`
  - `DISCUSSION NOISE`
  - `CONFIDENCE`
  - `ALIBI DELTA`
- HUD windows are promotional/decorative only. They do not reflect live room state and must not imply real gameplay data.
- HUD windows should be readable for a moment when visible, but stay visually secondary to the title.
- HUD windows should use React/Tailwind overlay elements instead of drawing all panel text into Canvas, so panel composition remains maintainable.
- HUD windows must be `pointer-events: none` and must not block the **Start** button or dialog.

### 3.5 Mouse interaction

- When the pointer approaches the central glyph title, glyphs within a radius are pushed outward from the pointer.
- Displaced glyphs ease back toward their original positions when the pointer leaves.
- The interaction should affect the glyph matrix itself, especially the central title. It should not move the form controls.
- The canvas layer remains `pointer-events: none`; pointer tracking can be registered on `window` or the container.

### 3.6 Motion and accessibility

- Default mode uses fast title-character flicker, occasional random character bursts, and HUD windows that flash in and out.
- `prefers-reduced-motion: reduce` disables repeating flicker loops, pointer displacement, and HUD flash cycles, or reduces them to a static low-intensity state.
- Avoid rapid high-contrast full-screen flashing. Random bursts can be quick, but should stay local and sparse.

### 3.7 Where it appears

- Show the full effect only when `LobbyClient` renders the disconnected create/join surface.
- Hide it when `LobbyRoom` is visible.
- Hide it when `GameClient` is visible.

## 4. Architecture

| Unit | Responsibility |
|------|----------------|
| **`LobbyBackdrop`** | Client-only decorative layer. Owns the full-screen `<canvas>`, render loop, pointer tracking, and GSAP-driven animation state. |
| **Glyph layout helpers** | Pure functions that produce stable glyph points for the central title, random burst clusters, and pointer displacement. Keep math testable without a browser canvas. |
| **`LobbyIntelOverlay`** | Client-only decorative React overlay that renders randomized game intel HUD windows around the title. |
| **`LobbyClient`** | Mounts `LobbyBackdrop` only on the disconnected create/join surface and keeps existing room/game branches unchanged. |
| **`PageHeader` / `PageTitle`** | Continue to provide accessible title and localized description in the foreground layer. |

## 5. Technology decision

Use **Canvas 2D for rendering** and **GSAP for animation state**.

GSAP is the animation engine, not the renderer. It should drive values such as:

- global intro opacity
- flicker intensity
- random burst reveal progress
- HUD window reveal progress
- pointer displacement strength

Canvas 2D should draw the dense glyph field each frame. React/Tailwind should render the smaller HUD windows, because those panels are few, structured, and easier to maintain as DOM.

## 6. Data and rendering model

- Maintain a stable list of glyph points with:
  - base x/y
  - current x/y
  - target brightness
  - current character
  - layer type: ambient, title, burst
- Generate title points from a case-sensitive bitmap/font mask for **`Who is AI?`**.
- Generate random burst clusters from seeded screen positions.
- Use `requestAnimationFrame` for drawing.
- Use GSAP timelines to mutate high-level state, not individual DOM nodes.
- Generate HUD window data from a small local pool of labels and fake values; regenerate the pool per page load and per reveal cycle.
- Keep HUD window count low: 2-4 visible panels at a time.

## 7. Testing and acceptance

- **Visual:** `/` disconnected page shows a central glyph-built `Who is AI?`, static gray grid pixels, occasional random white character bursts, and sci-fi game intel HUD windows flashing around the title.
- **Interaction:** moving the mouse over the title pushes glyphs outward and they ease back.
- **HUD randomness:** reloading the page or waiting through reveal cycles changes HUD positions, sizes, and content.
- **Scope:** entering a room or game removes the effect.
- **Accessibility:** reduced motion removes or heavily dampens flicker and displacement.
- **Functionality:** create room, join room, and language switch remain clickable and unchanged.
- **Performance:** no obvious jank on a normal laptop; canvas rendering should be bounded by viewport and device pixel ratio.

## 8. Relation to existing docs

- `docs/frontend/ui-constraints.md`: this is intentionally a home-page attraction layer only. Connected lobby and gameplay remain restrained and readable.
- `docs/frontend/i18n-constraints.md`: user-facing foreground text remains translated through `next-intl`; the branded visual title is represented through `app.heroTitle`.
