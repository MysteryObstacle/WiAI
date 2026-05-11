# Promo Homepage — Design Spec

**Status:** Pending user review  
**Date:** 2026-05-12  
**Scope:** WiAI web app — disconnected home lobby `/` only

## 1. Goal

Replace the current single-screen disconnected lobby with a **Steam-style scrollable promotional homepage** that uses the world-building from `Story Abstract.md` and the marketing copy from `Steam.md` to make the game feel exciting, intelligible, and worth starting. The page must keep the existing sci-fi character-matrix hero, then continue downward through six promo sections and end on a fixed terminal-styled signature line — `I'm everywhere.` — that echoes the LUCY-flavoured world hint.

The page must not change room creation, join, lobby, or in-game UI. It only replaces what users see when they land on `/` while disconnected.

## 2. Non-goals

- No new route. Stay on `/`.
- No third-party scroll plugin (`gsap/ScrollTrigger` is paid; we will not introduce it).
- No real photography or third-party brand assets.
- No live gameplay data on the promo page. All chat/HUD content is decorative.
- No changes to `LobbyRoom`, `GameClient`, room creation flow, or i18n keys outside the new `lobby.promo.*` namespace (existing keys remain untouched).
- The connected lobby and gameplay UI remain restrained and unchanged.

## 3. User-visible behavior

### 3.1 Page strategy

The disconnected `/` route renders a **single long vertical page** with seven sections stacked top to bottom. The user scrolls to read; the page does not auto-play.

When the user is connected to a room or in-game, the page is fully unmounted; `LobbyClient` keeps its existing branching for `LobbyRoom` and `GameClient`.

### 3.2 Section list

The page is composed of these sections, in this order. Every section displays a small monospaced timestamp `[hh:mm]` (decorative; consistent within a session) and a section tag `NN / NAME` for HVS log feel.

1. **HERO** — existing Canvas character matrix + `Who is AI?` glyph title + one-line bilingual subtitle + primary `Start` button + a downward scroll hint `▾ HVS-7421 · scroll`.
2. **PROLOGUE** — five short system-log lines drawn from `Steam.md` opening copy ("某年..." → "它们逃进了人类的网络社会。"). Each line appears via a single staggered fade as the section enters the viewport.
3. **SESSION** — explains the **Human Verification Session**: one-paragraph framing plus three short constraint columns: `无搜索`, `无自证`, `无外部`. Copy is paraphrased from `Rule Abstract.md`.
4. **ROLES** — three role cards side-by-side on desktop (stacked on mobile): **Citizen ×4**, **AI ×1**, **Shelterer ×1**. Each card includes the role name, count line, a short in-world objective, and a one-line `WIN` condition.
5. **HOW IT PLAYS** — header `一局 8–12 分钟 · 3 轮认证`, then three rounds (R1 轻度自证 / R2 价值判断 / R3 即时反应). Each round has a big numeral + label + role hint on the left, and a mini chat preview on the right with 2–3 message bubbles and a system prompt. R3 ends with a system line `→ 投票阶段 · 冻结 P5 ▶`. The chat content is hard-coded marketing copy, not live game data.
6. **CTA** — the main tagline `当意识可以被复制，被相信的人，才是真正的人。` plus a smaller subline `这不是一场聊天游戏 · 这是一次被游戏化的社会级图灵测试`, plus a large secondary `Start` button.
7. **SIGNATURE** — a green-on-near-black terminal-styled chat box, deliberately stylistically broken from sections 2–6 (no particle texture, monospaced green palette). The box ends with one prominent line: `[anon] : I'm everywhere.` This section is always rendered (not probabilistic).

### 3.3 Hero behavior on scroll

The Canvas hero occupies 100% of the first viewport. When the user scrolls past the hero, the Canvas `requestAnimationFrame` loop and the existing GSAP timelines (`flicker`, HUD reveal) **pause** until the hero is at least partially back in view. The visual ambience is preserved on subsequent sections by a shared static dark background with a faint character grain texture (CSS background-image), so the page never visually "breaks" into a different theme.

### 3.4 HUD intel overlay scope

The existing `LobbyIntelOverlay` continues to flash HUD panels, but **only while the hero is at least partially in view**. When the hero leaves the viewport, the overlay stops cycling and its panels fade out. This keeps the HUD as a Hero-specific decoration instead of distracting overlays floating across promotional content.

### 3.5 Section reveal motion

As each of sections 2–6 enters the viewport, its content fades in with a short upward translation (`opacity 0→1`, `y 16→0`) and stagger of ~0.06 s per item. Each section plays its entrance once and stays visible afterward. Section 7 (signature) plays the same entrance, with the `signature` line itself delayed by ~1.4 s and a blinking caret afterward.

### 3.6 Easter-egg-style signature, always shown

Section 7 is part of the page, not a hidden Easter egg. It always renders for every visitor. Its content is fixed: `I'm everywhere.` This is intentional — it lands as the page's final beat regardless of probability.

### 3.7 Mouse interaction

The existing pointer-displacement effect on the Canvas hero remains. Sections 2–7 do not have pointer-driven motion.

### 3.8 Motion accessibility

When `prefers-reduced-motion: reduce` is set:

- The hero falls back to the existing low-intensity static state.
- Section reveal stagger is disabled; sections render in their final positions immediately.
- HUD cycling is disabled.
- The signature caret does not blink.

### 3.9 Bilingual content

All new copy is fully translated into both `zh-CN` and `en-US`. Brand-fixed text (`Who is AI?`, `HVS-7421`, `Human Verification Session`, `I'm everywhere.`) remains the same English string in both locales. `messages.test.ts` is extended to guard the new `lobby.promo.*` key tree across both locales.

### 3.10 Where it appears

- Renders only when `LobbyClient` is on its disconnected branch (`!isConnected`).
- Disappears when entering a room (`LobbyRoom`) or game (`GameClient`).

## 4. Architecture

All new code lives under `apps/web/src/components/lobby/promo/`.

| Unit | Responsibility |
|------|----------------|
| **`LobbyPromoPage`** | Top-level scroll container. Owns the shared background, mounts the seven sections in order, and exposes an `isHeroVisible` signal so `LobbyBackdrop` and `LobbyIntelOverlay` can pause when off-screen. |
| **`HeroSection`** | Renders the existing `LobbyBackdrop`, foreground heading copy, the primary `Start` button, and the scroll hint. Reuses `LobbyBackdrop` and the existing `Dialog` start flow. |
| **`PrologueSection`** | Renders five staggered system-log lines from `promoContent`. |
| **`SessionSection`** | Renders the HVS framing paragraph plus three constraint columns. |
| **`RolesSection`** | Renders three role cards (Citizen, AI, Shelterer) with name, count line, objective, win condition. |
| **`HowItPlaysSection`** | Renders the round header and three round rows; each row has a header column and a mini chat preview built from `promoContent`. |
| **`CloserSection`** | Renders the tagline, subline, and the secondary `Start` button. The button reuses the existing dialog opener owned by `LobbyClient` via prop callback. |
| **`SignatureSection`** | Renders the terminal-styled chat box with three system lines and the final `I'm everywhere.` line plus a blinking caret. Always rendered. |
| **`useSectionReveal`** | Shared hook: `IntersectionObserver` + a one-shot GSAP timeline for fade/translate entrance. Respects `prefers-reduced-motion`. |
| **`useHeroVisibility`** | Shared hook: tracks the hero ref's visibility ratio via `IntersectionObserver`, exposes a boolean signal consumed by `LobbyBackdrop` and `LobbyIntelOverlay` to gate their animation loops. |
| **`promoContent.ts`** | Pure data describing the chat scripts, role descriptors, prologue lines, and constraint columns by i18n key. No React imports. |
| **`LobbyBackdrop` (existing)** | Modified to accept an optional `isActive` prop that pauses the RAF loop and GSAP timelines when `false`. |
| **`LobbyIntelOverlay` (existing)** | Modified to accept an optional `isActive` prop; halts cycle and fades panels when `false`. |
| **`LobbyClient` (existing)** | Modified: the `!isConnected` branch renders `<LobbyPromoPage onStart={...} />` instead of the current single-screen layout. The disconnected-state Start dialog remains owned here. |

## 5. Technology decisions

- **Rendering**: Canvas 2D for the hero (unchanged); React + Tailwind for sections 2–7. No new dependencies.
- **Scroll animations**: `IntersectionObserver` to detect section entry plus a single GSAP timeline per section for the fade/translate. We deliberately do not introduce `gsap/ScrollTrigger`.
- **Hero pause**: `IntersectionObserver` on the hero container drives an `isHeroVisible` boolean. When `false`, `LobbyBackdrop` calls `cancelAnimationFrame` and pauses its GSAP timelines; on re-entry it resumes the loop.
- **Static background continuity**: Below the hero, a CSS `background-image: radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px); background-size: 4px 4px;` extends the particle look without a live Canvas.
- **Mini chat presentation**: Static React markup. Bubble suspect styling is a CSS class flag inside each message data entry in `promoContent.ts`.
- **i18n**: All copy is sourced through `next-intl`. Array-shaped content (prologue lines, round messages) is fetched via `t.raw()` and rendered.

## 6. Data and content model

`promoContent.ts` exports typed structures keyed by i18n keys (the actual strings live in the locale JSON files). The shape includes:

- `prologue.lines: string[]` — five entries.
- `session.constraints: { titleKey, bodyKey }[]` — three entries: `noSearch`, `noProof`, `noExternal`.
- `roles: { roleKey: { nameKey, countKey, objectiveKey, winKey, accent: 'citizen' | 'ai' | 'shelter' } }`.
- `howItPlays.rounds: { numLabel, labelKey, hintKey, promptKey, messages: { whoKey, bodyKey, suspect?: boolean, isMe?: boolean }[], closing?: { textKey } }[]` — three rounds.
- `signature.lines: { whoKey, bodyKey, style: 'faint' | 'normal' | 'signature' }[]` plus the `signatureLineKey`.

A constraint test (`promoContent.test.ts`) verifies:
- exactly three constraints, three roles, three rounds;
- each role's `accent` is unique and one of the allowed values;
- the cumulative role count (×4 + ×1 + ×1) is 6;
- each round's `messages` has at least three entries and contains at least one `suspect: true`.

## 7. i18n key plan

All under `lobby.promo.*`. Both `zh-CN.json` and `en-US.json` must define every key; `messages.test.ts` will assert this.

```
lobby.promo.hero.subtitle
lobby.promo.hero.scrollHint            // "HVS-7421 · scroll"

lobby.promo.prologue.label             // "SYSTEM LOG"
lobby.promo.prologue.lines             // string[5]

lobby.promo.session.label              // "Human Verification Session · HVS-7421"
lobby.promo.session.intro
lobby.promo.session.constraints.noSearch.{title,body}
lobby.promo.session.constraints.noProof.{title,body}
lobby.promo.session.constraints.noExternal.{title,body}

lobby.promo.roles.label                // "三方博弈 · 6 人标准局"
lobby.promo.roles.citizen.{name,count,objective,win}
lobby.promo.roles.ai.{name,count,objective,win}
lobby.promo.roles.shelterer.{name,count,objective,win}

lobby.promo.howItPlays.label           // "一局 8–12 分钟 · 3 轮认证"
lobby.promo.howItPlays.rounds          // array<{lab, hint, prompt, messages: [{who, body, suspect?, isMe?}], closing?}>
lobby.promo.howItPlays.you             // "你"

lobby.promo.closer.tagline
lobby.promo.closer.subline
lobby.promo.closer.cta                 // "Start"

lobby.promo.signature.channel          // "channel #hvs-7421"
lobby.promo.signature.status           // "archived"
lobby.promo.signature.systemLines      // string[3]
lobby.promo.signature.line             // "I'm everywhere."
lobby.promo.signature.attribution      // "[anon]"
```

Brand-fixed strings — `HVS-7421`, `Human Verification Session`, `I'm everywhere.`, `Who is AI?` — are identical English strings in both locales.

## 8. Layout and responsiveness

- Maximum content width: 920 px, centered.
- Vertical rhythm: each section has roughly `padding-block: clamp(48px, 8vh, 96px)` to keep breathing room on tall viewports.
- Mobile (≤640 px):
  - Roles cards stack vertically.
  - How-it-plays round rows switch to vertical (head above chat).
  - Closer tagline reduces size; Start button stays prominently centered.
- The top bar (BrandMark + LanguageSwitch) stays anchored to the top of the page above the hero; it does not become sticky.

## 9. Testing and acceptance

- **Pure-data unit tests:** `promoContent.test.ts` enforces section structural invariants (counts, suspect presence, role accent uniqueness, cumulative role count = 6).
- **i18n test:** extend `messages.test.ts` to assert every `lobby.promo.*` key exists in both locales and array lengths match (prologue 5, system lines 3, rounds 3, etc.).
- **Visual acceptance:** 
  - Disconnected `/` shows the seven sections in order with no layout breakage at 1440 / 1024 / 768 / 375 widths.
  - Scrolling past the hero stops Canvas redraw and HUD cycling.
  - Re-entering the hero resumes both.
- **Functional acceptance:**
  - Primary and closer `Start` buttons both open the existing create/join dialog.
  - Entering a room hides the entire promo page.
  - Language switch toggles every promo string between zh-CN and en-US.
- **Accessibility acceptance:**
  - `prefers-reduced-motion: reduce` disables stagger entrance, HUD cycling, and caret blink.
  - All foreground text passes WCAG AA contrast against the dark background.
- **Performance acceptance:**
  - No new dependencies in `package.json`.
  - With the hero off-screen, no per-frame Canvas work is observable in DevTools performance.
  - Typecheck does not introduce new errors beyond the existing shadcn/calendar set.

## 10. Relation to existing docs

- Supersedes the disconnected-state portion of `2026-05-11-lobby-sci-fi-hero-design.md`. The hero itself is reused; sections 2–7 are net new.
- `docs/frontend/ui-constraints.md`: this is an attraction layer for the disconnected route only. Connected lobby and game UI remain restrained.
- `docs/frontend/i18n-constraints.md`: all foreground copy continues to flow through `next-intl`.
- Game content references: `Steam.md` (prologue + tagline), `Story Abstract.md` (role tone), `Rule Abstract.md` (3-round structure, session constraints, role counts).
