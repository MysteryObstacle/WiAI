# Lobby Sci-Fi Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fixed, non-interactive lobby atmosphere (grain + abstract flickering silhouette vectors + GSAP motion) and force the lobby H1 to **Who is AI** via i18n key `app.heroTitle`, while keeping `app.description` locale-specific; hide the atmosphere when the connected `LobbyRoom` or `GameClient` is shown.

**Architecture:** `LobbyBackdrop` is a client component mounted as the first child inside `AppShell` (which gains `relative` + stacking context). It owns SVG silhouettes, a CSS noise overlay, and GSAP timelines created inside `gsap.context` for cleanup. Visibility is driven by a tiny pure helper so behavior is unit-tested without `@testing-library/react`. Reduced motion is honored via `window.matchMedia("(prefers-reduced-motion: reduce)")` before starting repeating flicker loops.

**Tech Stack:** Next.js 16 App Router, React 19, `next-intl`, Tailwind v4, existing `gsap` + `@gsap/react`, Vitest.

---

## File map

| Path | Action | Role |
|------|--------|------|
| `apps/web/src/messages/zh-CN.json` | Modify | Add `app.heroTitle` (same English string as spec). |
| `apps/web/src/messages/en-US.json` | Modify | Add `app.heroTitle` (identical value). |
| `apps/web/src/messages/messages.test.ts` | Modify | Assert `heroTitle` parity and literal. |
| `apps/web/src/components/lobby/lobbyBackdropVisibility.ts` | Create | Pure function `showLobbySciFiBackdrop(isConnected, hasRoom)` — game view does not mount this tree. |
| `apps/web/src/components/lobby/lobbyBackdropVisibility.test.ts` | Create | Vitest tests for visibility matrix. |
| `apps/web/src/components/lobby/LobbyBackdrop.tsx` | Create | Fixed layer, noise, silhouettes, GSAP. |
| `apps/web/src/components/lobby/LobbyClient.tsx` | Modify | Compose backdrop + pass `title={t("heroTitle")}`. |
| `apps/web/src/components/layout/AppShell.tsx` | Modify | Add `relative` to `<main>` for z-stacking. |
| `apps/web/src/styles/globals.css` | Modify (optional) | Only if a shared utility class for film grain is cleaner than Tailwind arbitrary values in `LobbyBackdrop`. |

---

### Task 1: i18n keys for forced English hero title

**Files:**

- Modify: `apps/web/src/messages/zh-CN.json` (inside `"app"` object)
- Modify: `apps/web/src/messages/en-US.json` (inside `"app"` object)

- [ ] **Step 1: Add `heroTitle` to both locale files**

In **both** files under `app`, add the same key (keep existing keys; `title` remains for metadata / `aria-label` where still needed):

```json
"heroTitle": "Who is AI"
```

`zh-CN` continues to use Chinese for `title` / `description` as today; only `heroTitle` is English in both files per design spec.

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/messages/zh-CN.json apps/web/src/messages/en-US.json
git commit -m "feat(i18n): add app.heroTitle for lobby English H1"
```

---

### Task 2: Message sync test for `app.heroTitle`

**Files:**

- Modify: `apps/web/src/messages/messages.test.ts`

- [ ] **Step 1: Extend the locale test**

After the existing `flattenKeys` sync test, the new keys stay in sync automatically. Add a dedicated `it` block:

```ts
it("forces lobby hero title to English in both locales", () => {
  expect(zhCN.app.heroTitle).toBe("Who is AI");
  expect(enUS.app.heroTitle).toBe("Who is AI");
});
```

Use type-safe access: ensure `zhCN.app` is typed — JSON import may need `as { app: { heroTitle: string } }` only if TypeScript complains; otherwise direct `zhCN.app.heroTitle` is fine if `app` exists.

- [ ] **Step 2: Run tests**

```bash
npm run test -w apps/web -- src/messages/messages.test.ts
```

Expected: all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/messages/messages.test.ts
git commit -m "test(i18n): assert app.heroTitle is English in both locales"
```

---

### Task 3: Pure visibility helper + tests (TDD)

**Files:**

- Create: `apps/web/src/components/lobby/lobbyBackdropVisibility.ts`
- Create: `apps/web/src/components/lobby/lobbyBackdropVisibility.test.ts`

- [ ] **Step 1: Write failing tests first**

`apps/web/src/components/lobby/lobbyBackdropVisibility.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { showLobbySciFiBackdrop } from "./lobbyBackdropVisibility";

describe("showLobbySciFiBackdrop", () => {
  it("is true when disconnected (not connected)", () => {
    expect(showLobbySciFiBackdrop(false, false)).toBe(true);
  });

  it("is true when connected but no room yet", () => {
    expect(showLobbySciFiBackdrop(true, false)).toBe(true);
  });

  it("is false when connected lobby with room (LobbyRoom)", () => {
    expect(showLobbySciFiBackdrop(true, true)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm run test -w apps/web -- src/components/lobby/lobbyBackdropVisibility.test.ts
```

Expected: FAIL (module not found or function undefined).

- [ ] **Step 3: Implement minimal helper**

`apps/web/src/components/lobby/lobbyBackdropVisibility.ts`:

```ts
/**
 * When `LobbyClient` renders `GameClient`, this module is not mounted — no need to pass game visibility here.
 */
export function showLobbySciFiBackdrop(isConnected: boolean, hasRoom: boolean): boolean {
  return !(isConnected && hasRoom);
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm run test -w apps/web -- src/components/lobby/lobbyBackdropVisibility.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/lobby/lobbyBackdropVisibility.ts apps/web/src/components/lobby/lobbyBackdropVisibility.test.ts
git commit -m "feat(lobby): add backdrop visibility helper with tests"
```

---

### Task 4: `LobbyBackdrop` component (structure + CSS grain)

**Files:**

- Create: `apps/web/src/components/lobby/LobbyBackdrop.tsx`

- [ ] **Step 1: Add presentational shell**

Client component outline (GSAP added in Task 5). Use **CSS noise** first (no extra SVG filter file): a `div` with opacity ~0.06 and `background-image` repeating radial gradients (common film-grain approximation), `mix-blend-overlay`, `pointer-events-none`, `fixed inset-0 z-0`.

Silhouettes: **5** copies of a small inline SVG (geometric “head + shoulders” trapezoid + circle) positioned with Tailwind `absolute` in lower third (`bottom-0`, spread `left-[...]` percentages). Wrapper: `fixed inset-0 z-0 overflow-hidden pointer-events-none`.

- [ ] **Step 2: Manual smoke**

```bash
npm run dev -w apps/web
```

Temporarily render `<LobbyBackdrop />` in `LobbyClient` without GSAP to verify layout does not block clicks on buttons.

- [ ] **Step 3: Commit shell**

```bash
git add apps/web/src/components/lobby/LobbyBackdrop.tsx
git commit -m "feat(lobby): add LobbyBackdrop static layer and grain"
```

---

### Task 5: GSAP timelines + reduced motion

**Files:**

- Modify: `apps/web/src/components/lobby/LobbyBackdrop.tsx`

- [ ] **Step 1: Import and scope GSAP**

```tsx
import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";
```

Inside component:

```tsx
const rootRef = useRef<HTMLDivElement>(null);

useLayoutEffect(() => {
  const root = rootRef.current;
  if (!root) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = gsap.context(() => {
    const silhouettes = root.querySelectorAll("[data-silhouette]");
    if (reduceMotion) {
      gsap.set(silhouettes, { opacity: 0.35 });
      return;
    }
    silhouettes.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0.12 + i * 0.02 },
        {
          opacity: 0.42 + i * 0.02,
          duration: 2.8 + i * 0.35,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.4
        }
      );
    });
  }, root);

  return () => ctx.revert();
}, []);
```

Add `data-silhouette` on each silhouette wrapper. **Do not** use opacity flash faster than ~1Hz; `yoyo` with 2.5–5s period satisfies spec.

Optional title animation: **do not** animate H1 inside `LobbyBackdrop` (title lives in `PageTitle`). If desired later, animate `PageHeader` from `LobbyClient` with a separate `useGSAP` — **YAGNI for first pass**: skip title GSAP unless product insists after visual review.

- [ ] **Step 2: Run lint + tests**

```bash
npm run lint -w apps/web
npm run test -w apps/web
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/lobby/LobbyBackdrop.tsx
git commit -m "feat(lobby): GSAP silhouette flicker with reduced motion guard"
```

---

### Task 6: Wire `LobbyClient` + `AppShell` stacking

**Files:**

- Modify: `apps/web/src/components/lobby/LobbyClient.tsx`
- Modify: `apps/web/src/components/layout/AppShell.tsx`

- [ ] **Step 1: Import helper + backdrop**

At top of `LobbyClient.tsx`:

```ts
import { LobbyBackdrop } from "./LobbyBackdrop";
import { showLobbySciFiBackdrop } from "./lobbyBackdropVisibility";
```

Compute once per render:

```ts
const showBackdrop = showLobbySciFiBackdrop(
  Boolean(isConnected),
  Boolean(connection.room)
);
```

When `isGameVisible` is true, `LobbyClient` returns `GameClient` early — `LobbyBackdrop` is not in the tree.

Replace `PageTitle` props:

```tsx
<PageTitle title={t("heroTitle")} description={t("description")} />
```

Wrap `AppShell` return body:

```tsx
return (
  <AppShell>
    {showBackdrop ? <LobbyBackdrop /> : null}
    <AppShellContainer aria-label={t("title")} className="relative z-10">
      {/* existing children */}
    </AppShellContainer>
  </AppShell>
);
```

- [ ] **Step 2: `AppShell` `<main>`**

In `AppShell.tsx`, add `relative` to the `main` `className` so `z-0` / `z-10` children stack predictably:

```tsx
className={cn("relative min-h-screen p-8", variant === "game" && "p-5", className)}
```

- [ ] **Step 3: Run full web checks**

```bash
npm run test -w apps/web
npm run typecheck -w apps/web
npm run lint -w apps/web
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/lobby/LobbyClient.tsx apps/web/src/components/layout/AppShell.tsx
git commit -m "feat(lobby): mount sci-fi backdrop on create/join surface only"
```

---

### Task 7: Final verification and doc pointer

- [ ] **Step 1: Manual acceptance (browser)**

1. `/` disconnected: see grain + silhouettes + H1 **Who is AI** + localized description.
2. Switch `zh-CN` / `en-US`: description changes; H1 stays English.
3. Create/join flow: buttons remain clickable; language switch works.
4. After connected to room: backdrop disappears; lobby UI clear.
5. OS “Reduce motion”: silhouettes static / no repeating tween (verify in devtools emulation).

- [ ] **Step 2: Optional README note**

If `docs/frontend/README.md` lists major UI features, add one sentence pointing to `docs/superpowers/specs/2026-05-11-lobby-sci-fi-hero-design.md`. Skip if README stays high-level only.

- [ ] **Step 3: Commit** (if doc touched)

```bash
git add docs/frontend/README.md
git commit -m "docs(frontend): mention lobby sci-fi hero spec"
```

---

## Plan self-review (spec coverage)

| Spec section | Task coverage |
|--------------|---------------|
| 3.1 Forced English H1 + i18n description | Task 1–2, Task 6 `heroTitle` + `description` |
| 3.2 Grain + abstract vectors + slow flicker | Task 4–5 |
| 3.3 GSAP + reduced motion + pointer-events | Task 5, `LobbyBackdrop` root classes |
| 3.4 Show/hide by lobby vs room vs game | Task 3 helper + Task 6 wiring; game path unmounts entire tree |
| Architecture table | `LobbyBackdrop`, `LobbyClient`, `AppShell`; no `LobbyHeroHeading` file needed (YAGNI) |
| Testing §5 | Automated: messages + visibility; Manual: checklist Task 7 |

**Placeholder scan:** None intentionally left; silhouette count fixed at five in Task 4 text.

**Type consistency:** `showLobbySciFiBackdrop(isConnected, hasRoom)` matches all call sites and tests.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-11-lobby-sci-fi-hero.md`. Two execution options:

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach do you want?
