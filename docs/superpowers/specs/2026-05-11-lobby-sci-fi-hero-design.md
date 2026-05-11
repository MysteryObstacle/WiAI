# Lobby Sci-Fi Hero — Design Spec

**Status:** Approved for implementation planning  
**Date:** 2026-05-11  
**Scope:** WiAI web app — lobby (pre-game) home surface only

## 1. Goal

Make the lobby landing feel more **sci-fi / cinematic** (inspired by the *atmosphere* of sites like [artefakt.mov](https://artefakt.mov/), not a visual copy), while keeping **readability and playability** aligned with `docs/frontend/ui-constraints.md`.

## 2. Non-goals

- No WebGL/full-screen shader stack for the lobby.
- No real-person photography or region-specific silhouette requirements.
- No change to game-phase UI, Colyseus flows, or room logic.
- Do not copy third-party assets, logos, or layouts from reference sites.

## 3. User-visible behavior

### 3.1 Title and copy

- **Primary heading (H1):** Always the English string **`Who is AI`**, regardless of `zh-CN` / `en-US`.
- **Subtitle / description:** Continues to use **`next-intl`** from the existing `app.description` key (Chinese users see Chinese copy; English users see English copy).

**i18n implementation note:** Add an explicit message key (e.g. `app.heroTitle`) whose value is **`Who is AI` in both `zh-CN.json` and `en-US.json`**, so the “forced English” rule is data-visible and documented, not a magic string scattered in JSX.

### 3.2 Background atmosphere

- **Dark, restrained base** consistent with the current dark theme tokens (`globals.css` / shadcn variables). Optional very subtle cool tint or soft vignette; avoid a second competing full-page gradient that fights `body` tokens.
- **Light film-style grain:** low-opacity noise (CSS or SVG filter), static or nearly static.
- **Abstract human silhouettes:** **pure vector / geometric** shapes (inline SVG or small React-presentational components). No licensed photo silhouettes required for MVP.
- **Flicker:** silhouettes use **slow, irregular opacity (and optionally tiny translate)** animation to suggest “presence.” Must remain **subtle** and **low frequency** to reduce visual noise and photosensitivity risk (avoid rapid strobing; target roughly **≤ 1 pulse per second** effective change for any single layer, staggered across layers).

### 3.3 Motion and accessibility

- Use **GSAP** (existing `gsap` + `@gsap/react`) for title entrance and silhouette timelines.
- **`prefers-reduced-motion: reduce`:** disable flicker loops; silhouettes become **static** or a **single slow opacity settle** (no repeating flash). Title may use a **short, non-repeating** fade/slide-in or skip motion entirely.
- Backdrop layer: **`pointer-events: none`** so it never steals clicks from cards or controls.

### 3.4 Where it appears

- **Show** the full hero atmosphere when `LobbyClient` renders the **disconnected lobby** (create/join flow) — the shell with `PageHeader` + panels.
- **Hide or strongly de-emphasize** when:
  - user is inside **connected lobby** (`LobbyRoom`), or
  - **game** is visible (`GameClient`).

De-emphasize means: remove flicker, optionally remove silhouettes, leave a flat token background so `ui-constraints` “game-state clarity” dominates.

## 4. Architecture

| Unit | Responsibility |
|------|------------------|
| **`LobbyBackdrop`** (new) | Fixed `inset-0` decorative layer: gradient/noise container + silhouette group. No business state. |
| **`LobbyClient`** | Composes backdrop + existing `AppShell` content; toggles backdrop visibility by connection/game phase. |
| **`PageHeader` / `PageTitle`** | Either accept optional overrides for hero title/description wiring, or introduce a thin **`LobbyHeroHeading`** wrapper used only in lobby that renders `heroTitle` + `t('app.description')`. Prefer minimal changes to shared layout primitives. |

**Dependencies:** GSAP timelines scoped with `gsap.context` (or `useGSAP`) and cleaned up on unmount.

## 5. Testing and acceptance

- **Visual:** Heading reads `Who is AI`; description switches with locale; silhouettes flicker gently on default OS motion settings.
- **a11y:** With OS “reduce motion” on, no repeating high-contrast flash; interactive elements still reachable.
- **Functional:** Create/join cards and language switch behave unchanged.
- **Performance:** No sustained high CPU from the backdrop on a mid-range laptop (timelines should be few, vector-only).

## 6. Open items for implementation plan

- Exact count of silhouettes (suggest **4–6**) and placement grid (corners / lower third).
- Whether noise is CSS-only or inline SVG filter (pick simpler first).

## 7. Relation to existing docs

- **`docs/frontend/ui-constraints.md`:** Atmosphere is allowed if **scoped** to lobby and **reduced** when gameplay matters.
- **`docs/frontend/i18n-constraints.md`:** All user-facing strings via `next-intl`; exception for hero title encoded as **same English value in both locale files** under one key.
