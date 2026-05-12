# Lobby Matrix Intel Overlay Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add randomized sci-fi game intel HUD windows around the existing `Who is AI?` Canvas glyph title, while keeping the current static gray pixel grid, fast title glyph flicker, Start dialog, and homepage-only scope.

**Architecture:** Keep `LobbyBackdrop` as the Canvas renderer for dense glyph visuals. Add a separate `LobbyIntelOverlay` React client component for a small number of structured HUD windows, because panel labels, fake values, sizing, and positioning are easier to maintain in DOM/Tailwind than inside Canvas. A pure `lobbyIntel` helper generates deterministic randomized panel data for unit tests and non-deterministic cycles at runtime.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui primitives already in the app, GSAP, Canvas 2D, Vitest.

---

## Chunk 1: Intel Data Model

### Task 1: Add Pure Intel Panel Generator

**Files:**

- Create: `apps/web/src/components/lobby/lobbyIntel.ts`
- Create: `apps/web/src/components/lobby/lobbyIntel.test.ts`

- [ ] **Step 1: Write failing tests**

Create `apps/web/src/components/lobby/lobbyIntel.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createIntelPanels } from "./lobbyIntel";

describe("createIntelPanels", () => {
  it("creates deterministic panels from a seed", () => {
    const first = createIntelPanels({ seed: 42, count: 4 });
    const second = createIntelPanels({ seed: 42, count: 4 });

    expect(second).toEqual(first);
    expect(first).toHaveLength(4);
  });

  it("places panels around the title area, not in the exact center", () => {
    const panels = createIntelPanels({ seed: 7, count: 8 });

    expect(
      panels.every((panel) => panel.leftPct < 38 || panel.leftPct > 62 || panel.topPct < 34 || panel.topPct > 56)
    ).toBe(true);
  });

  it("randomizes labels, values, dimensions, and durations", () => {
    const panels = createIntelPanels({ seed: 99, count: 8 });
    const labels = new Set(panels.map((panel) => panel.label));
    const widths = new Set(panels.map((panel) => panel.width));
    const durations = new Set(panels.map((panel) => panel.visibleMs));

    expect(labels.size).toBeGreaterThan(1);
    expect(widths.size).toBeGreaterThan(1);
    expect(durations.size).toBeGreaterThan(1);
    expect(panels.every((panel) => panel.layer === "intel")).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
npm run test -w apps/web -- src/components/lobby/lobbyIntel.test.ts
```

Expected: FAIL because `./lobbyIntel` does not exist.

- [ ] **Step 3: Implement `lobbyIntel.ts`**

Create `apps/web/src/components/lobby/lobbyIntel.ts`:

```ts
export interface IntelPanel {
  id: string;
  layer: "intel";
  label: string;
  value: string;
  detail: string;
  leftPct: number;
  topPct: number;
  width: number;
  height: number;
  visibleMs: number;
}

interface CreateIntelPanelsOptions {
  seed: number;
  count: number;
}

const INTEL_LABELS = [
  "ANSWER HASH",
  "VOTE TRACE",
  "SUSPECT MAP",
  "ROUND LOCKED",
  "ROLE: UNKNOWN",
  "DISCUSSION NOISE",
  "CONFIDENCE",
  "ALIBI DELTA"
] as const;

const INTEL_DETAILS = [
  "signal accepted",
  "identity unresolved",
  "vote entropy rising",
  "answer vector drift",
  "human pattern mismatch",
  "reasoning trace split",
  "lobby packet armed",
  "suspect cluster hot"
] as const;

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function randomHex(random: () => number): string {
  return `0x${Math.floor(random() * 0xfffff).toString(16).padStart(5, "0").toUpperCase()}`;
}

function panelPosition(random: () => number): { leftPct: number; topPct: number } {
  const zones = [
    { left: [12, 32], top: [18, 36] },
    { left: [68, 88], top: [18, 38] },
    { left: [10, 34], top: [58, 76] },
    { left: [66, 90], top: [58, 78] },
    { left: [18, 38], top: [40, 52] },
    { left: [62, 82], top: [40, 52] }
  ] as const;
  const zone = zones[Math.floor(random() * zones.length)] ?? zones[0];
  return {
    leftPct: Math.round(zone.left[0] + random() * (zone.left[1] - zone.left[0])),
    topPct: Math.round(zone.top[0] + random() * (zone.top[1] - zone.top[0]))
  };
}

export function createIntelPanels(options: CreateIntelPanelsOptions): IntelPanel[] {
  const random = seededRandom(options.seed);

  return Array.from({ length: options.count }, (_, index) => {
    const label = INTEL_LABELS[Math.floor(random() * INTEL_LABELS.length)] ?? INTEL_LABELS[0];
    const detail = INTEL_DETAILS[Math.floor(random() * INTEL_DETAILS.length)] ?? INTEL_DETAILS[0];
    const position = panelPosition(random);

    return {
      id: `${options.seed}-${index}-${label}`,
      layer: "intel",
      label,
      value: label.includes("CONFIDENCE") ? `${Math.round(35 + random() * 62)}%` : randomHex(random),
      detail,
      leftPct: position.leftPct,
      topPct: position.topPct,
      width: Math.round(132 + random() * 92),
      height: Math.round(54 + random() * 46),
      visibleMs: Math.round(360 + random() * 620)
    };
  });
}
```

- [ ] **Step 4: Run test and verify GREEN**

Run:

```bash
npm run test -w apps/web -- src/components/lobby/lobbyIntel.test.ts
```

Expected: PASS.

---

## Chunk 2: HUD Overlay Component

### Task 2: Create `LobbyIntelOverlay`

**Files:**

- Create: `apps/web/src/components/lobby/LobbyIntelOverlay.tsx`

- [ ] **Step 1: Implement client component**

Create `apps/web/src/components/lobby/LobbyIntelOverlay.tsx`:

```tsx
"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef, useState } from "react";
import { createIntelPanels, type IntelPanel } from "./lobbyIntel";

function createRuntimeSeed(): number {
  return Math.floor(Math.random() * 1_000_000_000);
}

export function LobbyIntelOverlay() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [panels, setPanels] = useState<IntelPanel[]>(() =>
    createIntelPanels({ seed: createRuntimeSeed(), count: 3 })
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setPanels(createIntelPanels({ seed: 20260511, count: 2 }));
      return;
    }

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.2 });

      timeline
        .call(() => setPanels(createIntelPanels({ seed: createRuntimeSeed(), count: 2 + Math.floor(Math.random() * 3) })))
        .fromTo(
          "[data-intel-panel]",
          { autoAlpha: 0, y: 4, scale: 0.98 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.08, stagger: 0.03, ease: "steps(1)" }
        )
        .to("[data-intel-panel]", { autoAlpha: 1, duration: 0.42 })
        .to("[data-intel-panel]", { autoAlpha: 0, duration: 0.06, stagger: 0.02, ease: "steps(1)" })
        .to({}, { duration: 0.55 });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
      {panels.map((panel) => (
        <div
          key={panel.id}
          data-intel-panel
          className="absolute border border-emerald-100/25 bg-black/35 p-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-emerald-50/80 opacity-0 shadow-[0_0_22px_rgba(52,211,153,0.12)] backdrop-blur-[1px]"
          style={{
            left: `${panel.leftPct}%`,
            top: `${panel.topPct}%`,
            width: panel.width,
            minHeight: panel.height
          }}
        >
          <div className="mb-1 flex items-center justify-between gap-2 text-emerald-100">
            <span>{panel.label}</span>
            <span>{panel.value}</span>
          </div>
          <div className="text-emerald-100/55">{panel.detail}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Run lint for the new component**

Run:

```bash
npm run lint -w apps/web
```

Expected: PASS.

---

## Chunk 3: Home Page Wiring

### Task 3: Mount Intel Overlay on the Promotional Homepage

**Files:**

- Modify: `apps/web/src/components/lobby/LobbyClient.tsx`

- [ ] **Step 1: Import the overlay**

Add:

```ts
import { LobbyIntelOverlay } from "./LobbyIntelOverlay";
```

- [ ] **Step 2: Mount it next to `LobbyBackdrop` only on disconnected homepage branch**

In the `if (!isConnected)` return branch:

```tsx
<AppShell className="overflow-hidden p-0">
  {showBackdrop ? (
    <>
      <LobbyBackdrop />
      <LobbyIntelOverlay />
    </>
  ) : null}
  {/* existing AppShellContainer and Dialog */}
</AppShell>
```

Do not mount `LobbyIntelOverlay` in the connected `LobbyRoom` branch or `GameClient` branch.

- [ ] **Step 3: Run automated checks**

Run:

```bash
npm run test -w apps/web
npm run lint -w apps/web
```

Expected: tests and lint PASS.

Run typecheck too:

```bash
npm run typecheck -w apps/web
```

Expected: may still FAIL on existing unrelated shadcn/UI exact optional property type issues. If failures are unchanged and not in `LobbyIntelOverlay`, record them as pre-existing.

---

## Chunk 4: Visual Acceptance

### Task 4: Manual Browser Verification

**Files:**

- Verify: `apps/web/src/components/lobby/LobbyBackdrop.tsx`
- Verify: `apps/web/src/components/lobby/LobbyIntelOverlay.tsx`
- Verify: `apps/web/src/components/lobby/LobbyClient.tsx`

- [ ] **Step 1: Start or reuse dev server**

Run if needed:

```bash
npm run dev -w apps/web
```

Open `http://localhost:3000`.

- [ ] **Step 2: Verify visual behavior**

Expected:

- Central `Who is AI?` remains the strongest visual anchor.
- 2-4 HUD windows flash around the title.
- HUD positions, sizes, labels, and fake values change across cycles or reloads.
- HUD windows never block Start button or modal.
- Background gray pixel grid stays stable.
- Entering room or game removes Canvas and HUD overlay.
- Reduced motion removes repeated HUD flashes or keeps panels static/low intensity.

---

## Plan Review

- Spec 3.4 HUD windows: covered by `lobbyIntel.ts`, `LobbyIntelOverlay.tsx`, and `LobbyClient.tsx` wiring.
- Random position/size/content/duration: covered by `createIntelPanels`.
- Homepage-only scope: covered by mounting in disconnected branch only.
- Accessibility: covered through reduced-motion branch in `LobbyIntelOverlay`.
- No live room state implication: all panel values are fake local data from a hardcoded pool.

No unresolved placeholders remain.
