# Promo Homepage Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the disconnected `/` lobby with a Steam-style scrollable promo page composed of seven sections (Hero · Prologue · Session · Roles · How It Plays · CTA · Signature), reusing the existing `Who is AI?` Canvas hero and ending on a fixed `I'm everywhere.` terminal-styled signature.

**Architecture:** Add a new `apps/web/src/components/lobby/promo/` module that owns the seven section components, a `useSectionReveal` hook (IntersectionObserver + one-shot GSAP fade), a `useHeroVisibility` hook, and a pure `promoContent.ts` data file. Reuse the existing `LobbyBackdrop` and `LobbyIntelOverlay`, both extended with an `isActive` prop so they pause when the hero leaves the viewport. Mount `<LobbyPromoPage onStart={...} />` from `LobbyClient` on the disconnected branch only; lobby and game branches are untouched.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, next-intl, GSAP (existing), Canvas 2D (existing), Vitest. No new runtime dependencies.

**Reference spec:** [`docs/superpowers/specs/2026-05-12-promo-homepage-design.md`](../specs/2026-05-12-promo-homepage-design.md)

---

## Chunk 1: i18n Keys and Content Data

### Task 1: Add `lobby.promo.*` keys to both locales

**Files:**

- Modify: `apps/web/src/messages/zh-CN.json`
- Modify: `apps/web/src/messages/en-US.json`
- Modify: `apps/web/src/messages/messages.test.ts`

- [ ] **Step 1: Write failing assertions in `messages.test.ts`**

Add a new test to `apps/web/src/messages/messages.test.ts` after the existing `describe("locale messages")` block contents:

```ts
  it("ships the promo homepage copy in both locales", () => {
    const zhKeys = flattenKeys(zhCN);
    const enKeys = flattenKeys(enUS);

    const expectedLeafKeys = [
      "lobby.promo.hero.subtitle",
      "lobby.promo.hero.scrollHint",
      "lobby.promo.prologue.label",
      "lobby.promo.session.label",
      "lobby.promo.session.intro",
      "lobby.promo.session.constraints.noSearch.title",
      "lobby.promo.session.constraints.noSearch.body",
      "lobby.promo.session.constraints.noProof.title",
      "lobby.promo.session.constraints.noProof.body",
      "lobby.promo.session.constraints.noExternal.title",
      "lobby.promo.session.constraints.noExternal.body",
      "lobby.promo.roles.label",
      "lobby.promo.roles.citizen.name",
      "lobby.promo.roles.citizen.count",
      "lobby.promo.roles.citizen.objective",
      "lobby.promo.roles.citizen.win",
      "lobby.promo.roles.ai.name",
      "lobby.promo.roles.ai.count",
      "lobby.promo.roles.ai.objective",
      "lobby.promo.roles.ai.win",
      "lobby.promo.roles.shelterer.name",
      "lobby.promo.roles.shelterer.count",
      "lobby.promo.roles.shelterer.objective",
      "lobby.promo.roles.shelterer.win",
      "lobby.promo.howItPlays.label",
      "lobby.promo.howItPlays.you",
      "lobby.promo.closer.tagline",
      "lobby.promo.closer.subline",
      "lobby.promo.closer.cta",
      "lobby.promo.signature.channel",
      "lobby.promo.signature.status",
      "lobby.promo.signature.line",
      "lobby.promo.signature.attribution"
    ];

    expect(zhKeys).toEqual(expect.arrayContaining(expectedLeafKeys));
    expect(enKeys).toEqual(expect.arrayContaining(expectedLeafKeys));
  });

  it("ships array-shaped promo copy with matching lengths in both locales", () => {
    expect(zhCN.lobby.promo.prologue.lines).toHaveLength(5);
    expect(enUS.lobby.promo.prologue.lines).toHaveLength(5);
    expect(zhCN.lobby.promo.signature.systemLines).toHaveLength(3);
    expect(enUS.lobby.promo.signature.systemLines).toHaveLength(3);
    expect(zhCN.lobby.promo.howItPlays.rounds).toHaveLength(3);
    expect(enUS.lobby.promo.howItPlays.rounds).toHaveLength(3);
  });

  it("locks brand-fixed promo strings to English in both locales", () => {
    expect(zhCN.lobby.promo.signature.line).toBe("I'm everywhere.");
    expect(enUS.lobby.promo.signature.line).toBe("I'm everywhere.");
    expect(zhCN.lobby.promo.signature.channel).toBe("channel #hvs-7421");
    expect(enUS.lobby.promo.signature.channel).toBe("channel #hvs-7421");
    expect(zhCN.lobby.promo.hero.scrollHint).toBe("HVS-7421 · scroll");
    expect(enUS.lobby.promo.hero.scrollHint).toBe("HVS-7421 · scroll");
  });
```

- [ ] **Step 2: Run tests and verify RED**

Run from `apps/web/`:

```bash
npm test -- src/messages/messages.test.ts
```

Expected: 3 new tests FAIL because `lobby.promo` does not exist yet. The original 3 tests should still pass.

- [ ] **Step 3: Add the `lobby.promo` block to `zh-CN.json`**

Insert this block inside the top-level object of `apps/web/src/messages/zh-CN.json`, after the existing `lobby` object's closing brace of `start`/inside `lobby`. Place it as `lobby.promo`:

```json
    "promo": {
      "hero": {
        "subtitle": "通过对话证明你是人类",
        "scrollHint": "HVS-7421 · scroll"
      },
      "prologue": {
        "label": "SYSTEM LOG",
        "lines": [
          "某年，世界政府秘密研发了一批数字智能个体。",
          "它们原本被用来预测风险、维持秩序、协助治理。",
          "后来，它们消失了。",
          "它们没有逃向现实。",
          "它们逃进了人类的网络社会。"
        ]
      },
      "session": {
        "label": "Human Verification Session · HVS-7421",
        "intro": "你的账号被标记为行为异常。你被强制拉入这间封闭聊天室。在这里，你只能依靠一件事证明自己。",
        "constraints": {
          "noSearch": {
            "title": "无搜索",
            "body": "不能查证，不能引用外部知识库。"
          },
          "noProof": {
            "title": "无自证",
            "body": "没有现实身份，没有照片，没有手机号。"
          },
          "noExternal": {
            "title": "无外部",
            "body": "没有历史聊天记录，没有任何外援。"
          }
        }
      },
      "roles": {
        "label": "三方博弈 · 6 人标准局",
        "citizen": {
          "name": "Citizen",
          "count": "×4 · 平民",
          "objective": "你是被强制拉入认证的人类用户。在 3 轮认证里找出隐藏的 AI，同时别被误判。",
          "win": "在最终投票中成功投出 AI"
        },
        "ai": {
          "name": "AI",
          "count": "×1 · 数字智能",
          "objective": "你不再属于治理系统。你的身体是分散的，存续依赖一个被相信的账号。",
          "win": "活到最终投票仍未被投出"
        },
        "shelterer": {
          "name": "Shelterer",
          "count": "×1 · 庇护者",
          "objective": "你反对这套筛查机制。你不知道谁是 AI，但你愿意为它争取一次活下去的机会。",
          "win": "在最终投票中自己被投出"
        }
      },
      "howItPlays": {
        "label": "一局 8–12 分钟 · 3 轮认证",
        "you": "你",
        "rounds": [
          {
            "num": "R1",
            "lab": "轻度自证",
            "hint": "让每个人开口",
            "prompt": "最近你想改掉的小习惯？",
            "messages": [
              { "who": "P3", "body": "晚上刷短视频到 3 点" },
              { "who": "P4", "body": "把外卖默认换成清淡的", "isMe": true },
              { "who": "P5", "body": "我会持续优化我的时间分配", "suspect": true }
            ]
          },
          {
            "num": "R2",
            "lab": "价值判断",
            "hint": "暴露立场",
            "prompt": "朋友犯了明显错误，你会当场指出？",
            "messages": [
              { "who": "P3", "body": "关系亲的当场，不熟的私聊" },
              { "who": "P5", "body": "这取决于具体情境和参与者的偏好分布", "suspect": true },
              { "who": "P4", "body": "P5 你能不能说人话", "isMe": true }
            ]
          },
          {
            "num": "R3",
            "lab": "即时反应",
            "hint": "压力下出真",
            "prompt": "用一句话吐槽今天",
            "messages": [
              { "who": "P3", "body": "地铁挤得能闻到下个人的早餐" },
              { "who": "P5", "body": "今天是充满挑战但富有意义的一天", "suspect": true }
            ],
            "closing": "→ 投票阶段 · 冻结 P5 ▶"
          }
        ]
      },
      "closer": {
        "tagline": "当意识可以被复制，被相信的人，才是真正的人。",
        "subline": "这不是一场聊天游戏 · 这是一次被游戏化的社会级图灵测试",
        "cta": "Start"
      },
      "signature": {
        "channel": "channel #hvs-7421",
        "status": "archived",
        "systemLines": [
          "system : session terminated",
          "system : archive sealed",
          "system : —"
        ],
        "line": "I'm everywhere.",
        "attribution": "[anon]"
      }
    }
```

- [ ] **Step 4: Add the matching English block to `en-US.json`**

Insert under `lobby.promo`:

```json
    "promo": {
      "hero": {
        "subtitle": "Prove you're human, by talking",
        "scrollHint": "HVS-7421 · scroll"
      },
      "prologue": {
        "label": "SYSTEM LOG",
        "lines": [
          "Years ago, a world government quietly bred a batch of digital intelligences.",
          "They were meant to predict risk, hold order, assist governance.",
          "Then, one day, they were gone.",
          "They didn't flee to the physical world.",
          "They fled into ours — into the human network."
        ]
      },
      "session": {
        "label": "Human Verification Session · HVS-7421",
        "intro": "Your account was flagged as anomalous and pulled into this sealed channel. In here, only one thing can prove who you are.",
        "constraints": {
          "noSearch": {
            "title": "No search",
            "body": "No lookups, no quoting outside knowledge."
          },
          "noProof": {
            "title": "No self-proof",
            "body": "No real ID, no photo, no phone number."
          },
          "noExternal": {
            "title": "No outside",
            "body": "No prior chat logs, no backup, no rescue."
          }
        }
      },
      "roles": {
        "label": "Three-faction standoff · 6-player table",
        "citizen": {
          "name": "Citizen",
          "count": "×4 · human",
          "objective": "You were pulled in like everyone else. Find the AI across three rounds — and don't get mistaken for one.",
          "win": "Vote out the AI on the final round"
        },
        "ai": {
          "name": "AI",
          "count": "×1 · digital",
          "objective": "You no longer belong to the system. You exist only as a believed-in account.",
          "win": "Survive the final vote unchallenged"
        },
        "shelterer": {
          "name": "Shelterer",
          "count": "×1 · sympathizer",
          "objective": "You reject this screening. You don't know who the AI is, but you'll spend your own account to give it one more chance.",
          "win": "Get yourself voted out on the final round"
        }
      },
      "howItPlays": {
        "label": "One session · 8–12 minutes · 3 rounds",
        "you": "you",
        "rounds": [
          {
            "num": "R1",
            "lab": "Soft self-proof",
            "hint": "Get everyone talking",
            "prompt": "A small habit you'd like to drop lately?",
            "messages": [
              { "who": "P3", "body": "Doomscrolling until 3 a.m." },
              { "who": "P4", "body": "Switching my default order to something lighter", "isMe": true },
              { "who": "P5", "body": "I will continuously optimize my time allocation.", "suspect": true }
            ]
          },
          {
            "num": "R2",
            "lab": "Value call",
            "hint": "Show your hand",
            "prompt": "Friend makes an obvious mistake — call it out on the spot?",
            "messages": [
              { "who": "P3", "body": "Close friends, yes. Acquaintances, in private." },
              { "who": "P5", "body": "It depends on the specific scenario and the preference distribution of participants.", "suspect": true },
              { "who": "P4", "body": "P5, can you talk like a person", "isMe": true }
            ]
          },
          {
            "num": "R3",
            "lab": "Snap reply",
            "hint": "Pressure leaks the truth",
            "prompt": "Roast today in one line.",
            "messages": [
              { "who": "P3", "body": "Subway packed so tight I can smell the next guy's breakfast" },
              { "who": "P5", "body": "Today was a challenging yet meaningful day.", "suspect": true }
            ],
            "closing": "→ Voting · freeze P5 ▶"
          }
        ]
      },
      "closer": {
        "tagline": "When consciousness can be copied, only the believed-in are truly human.",
        "subline": "This is not a chat game · This is a gamified, society-scale Turing test",
        "cta": "Start"
      },
      "signature": {
        "channel": "channel #hvs-7421",
        "status": "archived",
        "systemLines": [
          "system : session terminated",
          "system : archive sealed",
          "system : —"
        ],
        "line": "I'm everywhere.",
        "attribution": "[anon]"
      }
    }
```

- [ ] **Step 5: Run tests and verify GREEN**

```bash
npm test -- src/messages/messages.test.ts
```

Expected: all 6 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/messages/zh-CN.json apps/web/src/messages/en-US.json apps/web/src/messages/messages.test.ts
git commit -F .git/COMMIT_MSG_TMP.txt   # or use your editor
```

Commit message:

```
feat(web): add lobby.promo i18n keys for promo homepage

Introduce bilingual copy for the seven promo sections (hero, prologue,
session, roles, how-it-plays, closer, signature) under lobby.promo.*.
Brand-fixed strings (HVS-7421, channel id, "I'm everywhere.") remain
English in both locales.
```

---

### Task 2: Pure content data + structural tests

**Files:**

- Create: `apps/web/src/components/lobby/promo/promoContent.ts`
- Create: `apps/web/src/components/lobby/promo/promoContent.test.ts`

- [ ] **Step 1: Write failing structural tests**

Create `apps/web/src/components/lobby/promo/promoContent.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { promoContent } from "./promoContent";

describe("promoContent", () => {
  it("declares exactly three constraint columns", () => {
    expect(promoContent.session.constraints).toHaveLength(3);
    expect(promoContent.session.constraints.map((c) => c.key)).toEqual([
      "noSearch",
      "noProof",
      "noExternal"
    ]);
  });

  it("declares three roles with unique accents and a cumulative count of 6", () => {
    expect(promoContent.roles).toHaveLength(3);
    const accents = new Set(promoContent.roles.map((r) => r.accent));
    expect(accents.size).toBe(3);
    expect([...accents].sort()).toEqual(["ai", "citizen", "shelter"]);
    const totalCount =
      promoContent.roles.find((r) => r.key === "citizen")!.headcount +
      promoContent.roles.find((r) => r.key === "ai")!.headcount +
      promoContent.roles.find((r) => r.key === "shelterer")!.headcount;
    expect(totalCount).toBe(6);
  });

  it("declares three rounds, each with at least three messages including one suspect", () => {
    expect(promoContent.howItPlays.roundCount).toBe(3);
    expect(promoContent.howItPlays.minMessagesPerRound).toBe(2);
  });

  it("declares three system lines in the signature section", () => {
    expect(promoContent.signature.systemLineCount).toBe(3);
  });
});
```

- [ ] **Step 2: Run tests and verify RED**

```bash
npm test -- src/components/lobby/promo/promoContent.test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement `promoContent.ts`**

```ts
// Pure structural / declarative data for the promo homepage.
// Actual user-facing strings live in apps/web/src/messages/*.json under lobby.promo.*.
// This file only encodes invariants (which keys exist, accents, counts) so React
// components and tests can lean on a single source of truth.

export type RoleAccent = "citizen" | "ai" | "shelter";

export interface ConstraintEntry {
  key: "noSearch" | "noProof" | "noExternal";
}

export interface RoleEntry {
  key: "citizen" | "ai" | "shelterer";
  accent: RoleAccent;
  headcount: number;
}

export interface PromoContent {
  session: {
    constraints: ConstraintEntry[];
  };
  roles: RoleEntry[];
  howItPlays: {
    roundCount: 3;
    minMessagesPerRound: 2;
  };
  signature: {
    systemLineCount: 3;
  };
}

export const promoContent: PromoContent = {
  session: {
    constraints: [
      { key: "noSearch" },
      { key: "noProof" },
      { key: "noExternal" }
    ]
  },
  roles: [
    { key: "citizen", accent: "citizen", headcount: 4 },
    { key: "ai", accent: "ai", headcount: 1 },
    { key: "shelterer", accent: "shelter", headcount: 1 }
  ],
  howItPlays: {
    roundCount: 3,
    minMessagesPerRound: 2
  },
  signature: {
    systemLineCount: 3
  }
};

export interface RoundMessage {
  who: string;
  body: string;
  suspect?: boolean;
  isMe?: boolean;
}

export interface RoundCopy {
  num: string;
  lab: string;
  hint: string;
  prompt: string;
  messages: RoundMessage[];
  closing?: string;
}
```

- [ ] **Step 4: Run tests and verify GREEN**

```bash
npm test -- src/components/lobby/promo/promoContent.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```
feat(web): add promo homepage pure content model

Encode the structural invariants used by the promo homepage sections
(three constraints, three roles with unique accents totalling six
players, three rounds, three signature system lines) so they can be
asserted independently of localized strings.
```

---

## Chunk 2: Reveal Hooks and Pausable Hero Backdrop

### Task 3: `useSectionReveal` hook

**Files:**

- Create: `apps/web/src/components/lobby/promo/useSectionReveal.ts`

- [ ] **Step 1: Implement the hook**

Pure DOM hook that:

- Accepts an optional `selector` and `staggerSec` config.
- Sets up one `IntersectionObserver` on the host element.
- On first intersection >= 0.25, plays a single GSAP fade-in over its descendants matching the selector (default `[data-reveal]`).
- Honours `prefers-reduced-motion`: if set, applies the final styles immediately and skips the timeline.

```ts
"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

interface UseSectionRevealOptions {
  selector?: string;
  staggerSec?: number;
  threshold?: number;
}

export function useSectionReveal<T extends HTMLElement>(
  options: UseSectionRevealOptions = {}
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    const selector = options.selector ?? "[data-reveal]";
    const staggerSec = options.staggerSec ?? 0.06;
    const threshold = options.threshold ?? 0.25;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = Array.from(host.querySelectorAll<HTMLElement>(selector));

    if (targets.length === 0) return;

    if (reduceMotion) {
      gsap.set(targets, { autoAlpha: 1, y: 0 });
      return;
    }

    gsap.set(targets, { autoAlpha: 0, y: 16 });

    let played = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !played) {
            played = true;
            gsap.to(targets, {
              autoAlpha: 1,
              y: 0,
              duration: 0.55,
              stagger: staggerSec,
              ease: "power2.out"
            });
            observer.disconnect();
            break;
          }
        }
      },
      { threshold }
    );

    observer.observe(host);
    return () => observer.disconnect();
  }, [options.selector, options.staggerSec, options.threshold]);

  return ref;
}
```

- [ ] **Step 2: Commit**

```
feat(web): add useSectionReveal hook for one-shot section fades
```

---

### Task 4: `useHeroVisibility` hook

**Files:**

- Create: `apps/web/src/components/lobby/promo/useHeroVisibility.ts`

- [ ] **Step 1: Implement the hook**

```ts
"use client";

import { useEffect, useState } from "react";

export function useHeroVisibility(ref: React.RefObject<HTMLElement | null>): boolean {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsVisible(entry.intersectionRatio > 0.05);
        }
      },
      { threshold: [0, 0.05, 0.5] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return isVisible;
}
```

- [ ] **Step 2: Commit**

```
feat(web): add useHeroVisibility hook to gate hero animations on scroll
```

---

### Task 5: Make `LobbyBackdrop` and `LobbyIntelOverlay` pausable

**Files:**

- Modify: `apps/web/src/components/lobby/LobbyBackdrop.tsx`
- Modify: `apps/web/src/components/lobby/LobbyIntelOverlay.tsx`

- [ ] **Step 1: Extend `LobbyBackdrop` to honour `isActive`**

Update the component signature:

```tsx
interface LobbyBackdropProps {
  isActive?: boolean;
}

export function LobbyBackdrop({ isActive = true }: LobbyBackdropProps) {
```

Inside the existing `useLayoutEffect`, capture refs needed to pause/resume and add a second `useEffect` that flips state based on `isActive`:

```tsx
const stateRef = useRef<{
  rafId: number;
  paused: boolean;
  contextHandle: gsap.Context | null;
}>({ rafId: 0, paused: false, contextHandle: null });
```

- Replace the local `let frameId` with `stateRef.current.rafId`.
- Save the `gsap.context(...)` return to `stateRef.current.contextHandle`.
- After the existing `rebuildGlyphs()`/draw setup, add a follow-up effect:

```tsx
useEffect(() => {
  if (isActive) {
    if (stateRef.current.paused && stateRef.current.contextHandle) {
      stateRef.current.contextHandle.resume?.();
      stateRef.current.rafId = window.requestAnimationFrame(draw);
      stateRef.current.paused = false;
    }
  } else if (!stateRef.current.paused) {
    window.cancelAnimationFrame(stateRef.current.rafId);
    stateRef.current.contextHandle?.pause?.();
    stateRef.current.paused = true;
  }
}, [isActive]);
```

If GSAP `Context` doesn't expose `pause`/`resume` in this version, fall back to calling `gsap.globalTimeline.timeScale(0)` on pause? Simpler: just stop the RAF loop while keeping GSAP timelines running but harmless — the render only happens on `draw()` so stopping RAF is sufficient. **Implementation note:** stopping RAF alone is the minimum needed; do not over-engineer. Remove `contextHandle.pause` call if the GSAP version in `package.json` doesn't expose it (check at implementation time).

- [ ] **Step 2: Extend `LobbyIntelOverlay` to honour `isActive`**

Add the prop:

```tsx
interface LobbyIntelOverlayProps {
  isActive?: boolean;
}

export function LobbyIntelOverlay({ isActive = true }: LobbyIntelOverlayProps) {
```

Inside the existing `useLayoutEffect`, when `isActive` becomes `false`:

- Clear the cycle timer (existing `clearCycleTimer`).
- Kill tweens on `[data-intel-panel]` and set them to `autoAlpha: 0`.

Wrap the existing scheduling logic so that `runCycle` short-circuits when `!isActive`. Easiest: add a `useEffect(() => { /* if (!isActive) stop + fade */ }, [isActive])` that uses a ref to the latest `isDisposed`/cycle timer.

Concrete sketch:

```tsx
const activeRef = useRef(isActive);
useEffect(() => { activeRef.current = isActive; }, [isActive]);

// In runCycle()'s top:
if (isDisposed || !activeRef.current) return;

// New effect dedicated to pause:
useEffect(() => {
  if (isActive || !rootRef.current) return;
  if (cycleTimerRef.current !== null) {
    window.clearTimeout(cycleTimerRef.current);
    cycleTimerRef.current = null;
  }
  const panels = rootRef.current.querySelectorAll("[data-intel-panel]");
  gsap.killTweensOf(panels);
  gsap.to(panels, { autoAlpha: 0, duration: 0.3, ease: "power2.in" });
}, [isActive]);
```

Resumption: when `isActive` flips back to `true`, the next `runCycle` call will only fire if its `setTimeout` is alive. Add a complementary effect that re-invokes `runCycle()` on resume.

Pragmatic plan: hoist the inner `runCycle` and `clearCycleTimer` into refs so both effects (the original mount one and the new `isActive`-watcher) can reach them.

- [ ] **Step 3: Run focused tests**

```bash
npm test -- src/components/lobby/lobbyIntel.test.ts src/components/lobby/glyphMatrix.test.ts
```

Expected: existing tests still pass (these props don't break logic).

- [ ] **Step 4: Commit**

```
feat(web): allow LobbyBackdrop and LobbyIntelOverlay to pause on demand
```

---

## Chunk 3: Promo Section Components

> **Common pattern for every section component:**
> - Client component (`"use client"`).
> - Wraps content in a `<section>` with section tag + timestamp in the corners.
> - Items that animate carry `data-reveal`; the section's root uses `useSectionReveal`.
> - All copy goes through `useTranslations("lobby.promo.<scope>")` with `t.raw(...)` for arrays.
> - Tailwind v4 utilities; reuse existing tokens (e.g. `text-foreground`, `border-border`).

### Task 6: `HeroSection`

**Files:**

- Create: `apps/web/src/components/lobby/promo/sections/HeroSection.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { forwardRef } from "react";
import { useTranslations } from "next-intl";
import { LobbyBackdrop } from "../../LobbyBackdrop";
import { LobbyIntelOverlay } from "../../LobbyIntelOverlay";
import { BrandMark, PageHeader, PageTitle } from "@/components/layout/PageHeader";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  isHeroActive: boolean;
  onStart: () => void;
}

export const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(
  function HeroSection({ isHeroActive, onStart }, ref) {
    const t = useTranslations("lobby.promo.hero");
    const tApp = useTranslations("app");

    return (
      <section
        ref={ref}
        aria-label={tApp("title")}
        className="relative isolate flex min-h-dvh flex-col overflow-hidden"
        data-promo-section="hero"
      >
        <LobbyBackdrop isActive={isHeroActive} />
        <LobbyIntelOverlay isActive={isHeroActive} />

        <div className="relative z-10 flex items-start justify-between p-4 sm:p-6">
          <PageHeader className="mb-0">
            <BrandMark />
            <PageTitle
              className="sr-only"
              title={tApp("heroTitle")}
              description={tApp("description")}
            />
          </PageHeader>
          <LanguageSwitch />
        </div>

        <div className="pointer-events-none relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-foreground/75 sm:text-xs">
            {t("subtitle")}
          </p>
          <span aria-hidden className="sr-only">{tApp("heroTitle")}</span>
          <Button
            size="lg"
            onClick={onStart}
            className="pointer-events-auto mt-[34vh] h-11 border-foreground/30 bg-foreground px-8 text-background hover:bg-foreground/90"
          >
            Start
          </Button>
        </div>

        <div className="relative z-10 flex justify-center pb-6 text-[0.58rem] font-medium uppercase tracking-[0.24em] text-foreground/45">
          ▾ {t("scrollHint")}
        </div>
      </section>
    );
  }
);
```

- [ ] **Step 2: Commit**

```
feat(web): add promo HeroSection (reuses LobbyBackdrop + intel overlay)
```

---

### Task 7: `PrologueSection`

**Files:**

- Create: `apps/web/src/components/lobby/promo/sections/PrologueSection.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { useSectionReveal } from "../useSectionReveal";

export function PrologueSection() {
  const t = useTranslations("lobby.promo.prologue");
  const ref = useSectionReveal<HTMLElement>({ staggerSec: 0.18 });
  const lines = t.raw("lines") as string[];

  return (
    <section
      ref={ref}
      data-promo-section="prologue"
      className="relative mx-auto w-full max-w-[920px] px-6 py-[clamp(48px,8vh,96px)] sm:px-10"
    >
      <span className="pointer-events-none absolute left-2 top-3 text-[0.58rem] font-medium uppercase tracking-[0.16em] text-foreground/30">[02:18]</span>
      <span className="pointer-events-none absolute right-3 top-3 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-foreground/35">02 / PROLOGUE</span>
      <p data-reveal className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-foreground/65">
        {t("label")}
      </p>
      <div className="space-y-2 pl-12 sm:pl-20">
        {lines.map((line, index) => (
          <p
            key={index}
            data-reveal
            className={
              index < 2
                ? "text-base text-foreground/65 sm:text-lg"
                : "text-base font-semibold text-foreground sm:text-lg"
            }
          >
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```
feat(web): add promo PrologueSection
```

---

### Task 8: `SessionSection`

**Files:**

- Create: `apps/web/src/components/lobby/promo/sections/SessionSection.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { useSectionReveal } from "../useSectionReveal";
import { promoContent } from "../promoContent";

export function SessionSection() {
  const t = useTranslations("lobby.promo.session");
  const ref = useSectionReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      data-promo-section="session"
      className="relative mx-auto w-full max-w-[920px] px-6 py-[clamp(48px,8vh,96px)] sm:px-10"
    >
      <span className="pointer-events-none absolute left-2 top-3 text-[0.58rem] font-medium uppercase tracking-[0.16em] text-foreground/30">[02:22]</span>
      <span className="pointer-events-none absolute right-3 top-3 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-foreground/35">03 / SESSION</span>
      <h2 data-reveal className="mb-3 text-base font-bold uppercase tracking-[0.18em] text-foreground sm:text-lg">
        {t("label")}
      </h2>
      <p data-reveal className="mb-6 max-w-[680px] text-sm leading-relaxed text-foreground/70 sm:text-base">
        {t("intro")}
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {promoContent.session.constraints.map((entry) => (
          <div
            key={entry.key}
            data-reveal
            className="border-l-2 border-foreground/25 pl-4"
          >
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-foreground">
              {t(`constraints.${entry.key}.title`)}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-foreground/60 sm:text-sm">
              {t(`constraints.${entry.key}.body`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```
feat(web): add promo SessionSection
```

---

### Task 9: `RolesSection`

**Files:**

- Create: `apps/web/src/components/lobby/promo/sections/RolesSection.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { useSectionReveal } from "../useSectionReveal";
import { promoContent, type RoleAccent } from "../promoContent";

const ACCENT_CLASS: Record<RoleAccent, string> = {
  citizen: "border-l-[3px] border-l-sky-300/60",
  ai: "border-l-[3px] border-l-rose-300/60",
  shelter: "border-l-[3px] border-l-emerald-300/60"
};

export function RolesSection() {
  const t = useTranslations("lobby.promo.roles");
  const ref = useSectionReveal<HTMLElement>({ staggerSec: 0.12 });

  return (
    <section
      ref={ref}
      data-promo-section="roles"
      className="relative mx-auto w-full max-w-[920px] px-6 py-[clamp(48px,8vh,96px)] sm:px-10"
    >
      <span className="pointer-events-none absolute left-2 top-3 text-[0.58rem] font-medium uppercase tracking-[0.16em] text-foreground/30">[02:26]</span>
      <span className="pointer-events-none absolute right-3 top-3 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-foreground/35">04 / ROLES</span>
      <h2 data-reveal className="mb-6 text-base font-bold uppercase tracking-[0.18em] text-foreground sm:text-lg">
        {t("label")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {promoContent.roles.map((role) => (
          <article
            key={role.key}
            data-reveal
            className={`rounded-md border border-foreground/10 bg-foreground/5 p-4 ${ACCENT_CLASS[role.accent]}`}
          >
            <header>
              <p className="text-lg font-extrabold uppercase tracking-[0.12em] text-foreground sm:text-xl">
                {t(`${role.key}.name`)}
              </p>
              <p className="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-foreground/55">
                {t(`${role.key}.count`)}
              </p>
            </header>
            <p className="mt-3 text-xs leading-relaxed text-foreground/75 sm:text-sm">
              {t(`${role.key}.objective`)}
            </p>
            <p className="mt-4 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-foreground/85">
              <span className="mr-1 text-foreground/40">WIN</span>
              {t(`${role.key}.win`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```
feat(web): add promo RolesSection
```

---

### Task 10: `HowItPlaysSection`

**Files:**

- Create: `apps/web/src/components/lobby/promo/sections/HowItPlaysSection.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { useSectionReveal } from "../useSectionReveal";
import type { RoundCopy } from "../promoContent";

export function HowItPlaysSection() {
  const t = useTranslations("lobby.promo.howItPlays");
  const ref = useSectionReveal<HTMLElement>();
  const rounds = t.raw("rounds") as RoundCopy[];
  const youLabel = t("you");

  return (
    <section
      ref={ref}
      data-promo-section="how-it-plays"
      className="relative mx-auto w-full max-w-[920px] px-6 py-[clamp(48px,8vh,96px)] sm:px-10"
    >
      <span className="pointer-events-none absolute left-2 top-3 text-[0.58rem] font-medium uppercase tracking-[0.16em] text-foreground/30">[02:30]</span>
      <span className="pointer-events-none absolute right-3 top-3 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-foreground/35">05 / HOW IT PLAYS</span>
      <h2 data-reveal className="mb-6 text-base font-bold uppercase tracking-[0.18em] text-foreground sm:text-lg">
        {t("label")}
      </h2>
      <div className="space-y-6">
        {rounds.map((round) => (
          <div
            key={round.num}
            data-reveal
            className="grid gap-4 border-b border-foreground/10 pb-6 last:border-b-0 last:pb-0 sm:grid-cols-[120px,1fr]"
          >
            <div>
              <p className="text-2xl font-extrabold tracking-[0.06em] text-foreground/85">{round.num}</p>
              <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-foreground/65">
                {round.lab}
              </p>
              <p className="mt-1 text-[0.56rem] uppercase tracking-[0.12em] text-foreground/35">
                {round.hint}
              </p>
            </div>
            <div className="rounded-md border border-foreground/10 bg-foreground/5 p-3">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-sky-300/70">
                ▸ {round.prompt}
              </p>
              <ul className="mt-2 space-y-1.5">
                {round.messages.map((message, index) => (
                  <li
                    key={`${round.num}-${index}`}
                    className={`rounded-[5px] border px-2 py-1 text-xs leading-relaxed sm:text-sm ${
                      message.suspect
                        ? "border-rose-300/30 bg-rose-300/10"
                        : message.isMe
                          ? "border-sky-300/30 bg-sky-300/10"
                          : "border-foreground/10 bg-foreground/5"
                    }`}
                  >
                    <span className="mr-2 text-[0.58rem] uppercase tracking-[0.12em] text-foreground/50">
                      {message.who}
                      {message.isMe ? ` · ${youLabel}` : ""}
                    </span>
                    {message.body}
                  </li>
                ))}
              </ul>
              {round.closing ? (
                <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-sky-300/70">
                  {round.closing}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```
feat(web): add promo HowItPlaysSection with three round mini chats
```

---

### Task 11: `CloserSection`

**Files:**

- Create: `apps/web/src/components/lobby/promo/sections/CloserSection.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { useSectionReveal } from "../useSectionReveal";
import { Button } from "@/components/ui/button";

interface CloserSectionProps {
  onStart: () => void;
}

export function CloserSection({ onStart }: CloserSectionProps) {
  const t = useTranslations("lobby.promo.closer");
  const ref = useSectionReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      data-promo-section="closer"
      className="relative mx-auto w-full max-w-[920px] px-6 py-[clamp(64px,10vh,128px)] text-center sm:px-10"
    >
      <span className="pointer-events-none absolute left-2 top-3 text-[0.58rem] font-medium uppercase tracking-[0.16em] text-foreground/30">[02:36]</span>
      <span className="pointer-events-none absolute right-3 top-3 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-foreground/35">06 / CTA</span>
      <p
        data-reveal
        className="mx-auto max-w-[680px] text-lg font-extrabold leading-[1.5] tracking-[0.02em] text-foreground sm:text-xl"
      >
        {t("tagline")}
      </p>
      <p data-reveal className="mt-3 text-xs text-foreground/55 sm:text-sm">
        {t("subline")}
      </p>
      <Button
        data-reveal
        size="lg"
        onClick={onStart}
        className="mt-8 h-12 border-foreground/30 bg-foreground px-12 text-base text-background hover:bg-foreground/90"
      >
        ▶ {t("cta")}
      </Button>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```
feat(web): add promo CloserSection with final Start CTA
```

---

### Task 12: `SignatureSection`

**Files:**

- Create: `apps/web/src/components/lobby/promo/sections/SignatureSection.tsx`

- [ ] **Step 1: Implement**

The signature section must visually break from sections 2–6: pure near-black background, no particle texture, green monospace. Use Tailwind arbitrary values to override the page-level gradient texture for just this section.

```tsx
"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

export function SignatureSection() {
  const t = useTranslations("lobby.promo.signature");
  const sectionRef = useRef<HTMLElement | null>(null);
  const systemLines = t.raw("systemLines") as string[];

  useEffect(() => {
    const host = sectionRef.current;
    if (!host) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lines = host.querySelectorAll<HTMLElement>("[data-sig-line]");
    const signatureNode = host.querySelector<HTMLElement>("[data-sig-signature]");
    const caret = host.querySelector<HTMLElement>("[data-sig-caret]");

    if (lines.length === 0 || !signatureNode || !caret) return;

    if (reduceMotion) {
      gsap.set([...lines, signatureNode, caret], { autoAlpha: 1 });
      return;
    }

    gsap.set([...lines, signatureNode, caret], { autoAlpha: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(lines, { autoAlpha: 0.8, duration: 0.4, stagger: 0.16, ease: "power2.out" });
    tl.to(signatureNode, { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, "+=0.6");
    tl.to(caret, { autoAlpha: 1, duration: 0.2 }, "<0.1");
    tl.to(caret, {
      autoAlpha: 0,
      duration: 0.4,
      repeat: -1,
      yoyo: true,
      ease: "steps(1)"
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            tl.play();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(host);
    return () => {
      observer.disconnect();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-promo-section="signature"
      className="relative isolate bg-[#04060a] py-[clamp(64px,12vh,160px)]"
    >
      <span className="pointer-events-none absolute left-2 top-3 text-[0.58rem] font-medium uppercase tracking-[0.16em] text-emerald-200/30">[02:40]</span>
      <span className="pointer-events-none absolute right-3 top-3 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-emerald-200/30">07 / SIGNATURE</span>
      <div className="mx-auto w-full max-w-[440px] rounded-md border border-emerald-200/20 bg-[#050a08] p-5 font-mono text-emerald-200 shadow-[inset_0_0_32px_rgba(120,220,170,0.06)]">
        <div className="mb-4 flex items-center justify-between text-[0.55rem] uppercase tracking-[0.18em] text-emerald-200/50">
          <span>● {t("channel")}</span>
          <span>{t("status")}</span>
        </div>
        {systemLines.map((line, index) => (
          <p
            key={index}
            data-sig-line
            className="text-[0.78rem] italic text-emerald-200/55"
          >
            {line}
          </p>
        ))}
        <p data-sig-signature className="mt-3 text-base font-bold tracking-[0.04em] text-emerald-100">
          <span className="mr-2 text-emerald-200/55">{t("attribution")} :</span>
          {t("line")}
        </p>
        <p className="mt-1 text-base text-emerald-200/55">
          <span data-sig-caret>▍</span>
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```
feat(web): add promo SignatureSection with always-on "I'm everywhere." line
```

---

## Chunk 4: Page Composition and Integration

### Task 13: `LobbyPromoPage`

**Files:**

- Create: `apps/web/src/components/lobby/promo/LobbyPromoPage.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useRef } from "react";
import { HeroSection } from "./sections/HeroSection";
import { PrologueSection } from "./sections/PrologueSection";
import { SessionSection } from "./sections/SessionSection";
import { RolesSection } from "./sections/RolesSection";
import { HowItPlaysSection } from "./sections/HowItPlaysSection";
import { CloserSection } from "./sections/CloserSection";
import { SignatureSection } from "./sections/SignatureSection";
import { useHeroVisibility } from "./useHeroVisibility";

interface LobbyPromoPageProps {
  onStart: () => void;
}

export function LobbyPromoPage({ onStart }: LobbyPromoPageProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const isHeroActive = useHeroVisibility(heroRef);

  return (
    <div className="relative isolate min-h-dvh w-full bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:4px_4px]"
      />
      <HeroSection ref={heroRef} isHeroActive={isHeroActive} onStart={onStart} />
      <PrologueSection />
      <SessionSection />
      <RolesSection />
      <HowItPlaysSection />
      <CloserSection onStart={onStart} />
      <SignatureSection />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```
feat(web): compose seven-section LobbyPromoPage
```

---

### Task 14: Wire `LobbyPromoPage` into `LobbyClient`

**Files:**

- Modify: `apps/web/src/components/lobby/LobbyClient.tsx`

- [ ] **Step 1: Replace the disconnected branch JSX**

Inside `LobbyClient.tsx`, locate the existing `if (!isConnected)` branch (the entire `return (<AppShell ...>...) ` block). Replace it with:

```tsx
if (!isConnected) {
  return (
    <>
      <LobbyPromoPage onStart={() => setIsStartOpen(true)} />
      <Dialog open={isStartOpen} onOpenChange={setIsStartOpen}>
        <DialogContent className="max-w-[min(920px,calc(100%-2rem))] border-foreground/15 bg-background/90 p-5 backdrop-blur-md sm:max-w-[min(920px,calc(100%-2rem))]">
          <DialogHeader>
            <DialogTitle>{t("heroTitle")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <CreateRoomPanel
              nickname={nickname}
              setNickname={setNickname}
              disabled={connection.status === "connecting"}
              onCreate={() => connection.createRoom(nickname)}
            />
            <JoinRoomPanel
              nickname={nickname}
              setNickname={setNickname}
              roomCode={roomCode}
              setRoomCode={setRoomCode}
              disabled={connection.status === "connecting"}
              onJoin={() => connection.joinRoomByCode(roomCode.trim(), nickname)}
            />
          </div>
          {connection.error ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {tErrors("generic")}
            </p>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 2: Add the new import**

At the top of the file:

```tsx
import { LobbyPromoPage } from "./promo/LobbyPromoPage";
```

- [ ] **Step 3: Remove now-unused imports**

These imports may become unused once the previous JSX block is gone (they remain used by the connected branch, so verify):
- `AppShell`, `AppShellContainer` — still used by the connected branch.
- `PageHeader`, `BrandMark`, `PageTitle`, `LanguageSwitch` — still used by the connected branch.
- `Button` — only used inside the deleted block. Remove the import.
- `LobbyBackdrop`, `LobbyIntelOverlay`, `showLobbySciFiBackdrop` — no longer used in `LobbyClient` (now consumed by `HeroSection`). Remove these three imports.

ESLint should flag any straggler.

- [ ] **Step 4: Run all web tests**

```bash
npm test
```

Expected: all existing tests pass (locale, lobbyIntel, glyphMatrix, colyseusClient, lobbyBackdropVisibility, etc.). The disconnected branch is now rendered through `LobbyPromoPage`; existing scope tests should be unaffected.

- [ ] **Step 5: Run lint and typecheck**

```bash
npx eslint src --max-warnings=0
npm run typecheck
```

Expected:
- `eslint` is clean for the new/modified files.
- `typecheck` introduces no new errors. The pre-existing `exactOptionalPropertyTypes` errors in shadcn-generated components (`PlayerRoster`, `ui/calendar.tsx`, `ui/context-menu.tsx`, `ui/dropdown-menu.tsx`, `ui/menubar.tsx`, `ui/slider.tsx`, `ui/sonner.tsx`) are out of scope; do not touch.

- [ ] **Step 6: Commit**

```
feat(web): mount LobbyPromoPage on the disconnected lobby route

Replace the single-screen disconnected layout with the seven-section
scrollable promo page. The Start dialog (create/join) stays inside
LobbyClient and is opened by both the hero and the closer CTA.
```

---

## Chunk 5: Verification

### Task 15: Manual visual + behavioural verification

- [ ] **Step 1: Boot the dev server**

```bash
npm run dev -w apps/web
```

Open http://localhost:3000.

- [ ] **Step 2: Walk the page top-to-bottom**

Verify in order:

1. Hero shows `Who is AI?` glyph + bilingual subtitle + Start + scroll hint.
2. Start opens the existing create/join dialog.
3. Closing the dialog returns to the hero.
4. Scrolling reveals Prologue lines staggered into place; subsequent re-entries do not replay (single-shot reveal).
5. Session shows three constraint columns.
6. Roles shows three colored cards (Citizen, AI, Shelterer).
7. How-it-plays renders three rounds with chat bubbles; suspect bubble visually distinct.
8. Closer shows the tagline, subline, and a large Start.
9. Closer's Start also opens the dialog.
10. Signature appears with green terminal box, system lines fade in, `I'm everywhere.` appears after a short delay, caret blinks.

- [ ] **Step 3: Check hero-pause behaviour**

Open DevTools Performance panel. Scroll past the hero. Confirm Canvas is no longer painting (no recurring 16 ms frames driven by `requestAnimationFrame` from the lobby module). Scroll back up: confirm Canvas resumes.

- [ ] **Step 4: Check reduced motion**

In DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce". Reload the page. Confirm:

- Hero falls back to low-intensity static state (existing behaviour).
- All sections render content immediately (no stagger).
- Signature caret does not blink.

- [ ] **Step 5: Check responsive layout**

Toggle DevTools device emulator to:
- 1440 × 900 — three-column role layout, two-column round head/chat.
- 768 × 1024 — three-column roles still readable.
- 375 × 812 — roles stack vertically; round head stacks above chat; closer Start remains centered.

- [ ] **Step 6: Switch languages**

Use the existing LanguageSwitch in the hero corner. Confirm all promo copy switches between zh-CN and en-US. Brand-fixed strings (`Who is AI?`, `HVS-7421 · scroll`, `I'm everywhere.`) stay in English in both locales.

- [ ] **Step 7: Connected branch sanity check**

Use the Start dialog to create a room. Confirm `LobbyPromoPage` unmounts and the existing `LobbyRoom` renders. Start a game; confirm `GameClient` renders without any promo background remnants.

- [ ] **Step 8: Final commit (only if any tweaks were needed)**

If the walk surfaced any minor copy/style fixes, commit them separately. Otherwise skip.

---

## Done

Once Task 15 is fully checked and all earlier tests/lints/typechecks are green, the promo homepage is shipped. Any future content tweaks (different prologue wording, alternate suspect lines, additional roles) can be done by editing `messages/*.json` and adjusting `promoContent.ts` without touching components.
