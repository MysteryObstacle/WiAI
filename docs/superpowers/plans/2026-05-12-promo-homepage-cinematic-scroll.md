# Promo Homepage Cinematic Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the disconnected `/` homepage as a pinned cinematic scroll story with a continuous black Hero/Prologue stage, hand-drawn evidence-board images, one decisive final round, the new trust-question CTA, and a full-screen archive easter egg.

**Architecture:** Keep the existing disconnected lobby route and Start dialog, but replace the stacked promo section composition with `CinematicScrollStory`. Locale data shifts from three rendered round objects to a single `decisiveRound` object. Generated raster assets live under `apps/web/public/promo/` and are layered by React components coordinated through a single GSAP ScrollTrigger timeline.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, next-intl, GSAP ScrollTrigger, Tailwind CSS v4, Vitest, Playwright/browser verification, generated PNG/WebP assets.

---

## File Structure

Create or modify these files only unless a test exposes a direct dependency:

| Path | Action | Responsibility |
|------|--------|----------------|
| `apps/web/src/messages/zh-CN.json` | Modify | Replace `lobby.promo.howItPlays.rounds` with `decisiveRound`, update closer tagline, add asset alt text. |
| `apps/web/src/messages/en-US.json` | Modify | English equivalent of the new final-round content and asset alt text. |
| `apps/web/src/messages/messages.test.ts` | Modify | Assert final-round keys, asset alt keys, and absence of visible `R1`, `R2`, `R3` copy in promo content. |
| `apps/web/src/components/lobby/promo/promoContent.ts` | Modify | Add final-round and asset TypeScript shapes; remove old `RoundCopy`. |
| `apps/web/src/components/lobby/promo/promoContent.test.ts` | Modify | Assert asset list, role counts, final-round structural invariants, and no rendered R labels. |
| `apps/web/public/promo/verification-grid.png` | Create | Generated hand-drawn nine-grid suspect sheet. |
| `apps/web/public/promo/memory-answer-sheet.png` | Create | Generated hand-drawn final-round answer sheet. |
| `apps/web/public/promo/vote-freeze-sheet.png` | Create | Generated hand-drawn vote freeze sheet. |
| `apps/web/public/promo/archive-residue.png` | Create | Generated archive residue paper/system texture. |
| `apps/web/src/components/lobby/promo/useReducedMotion.ts` | Create | Small client hook for reduced-motion state. |
| `apps/web/src/components/lobby/promo/sections/EvidenceImageLayer.tsx` | Create | Renders public promo image assets with stable dimensions and alt text. |
| `apps/web/src/components/lobby/promo/sections/StoryFrame.tsx` | Create | Shared full-screen stage wrapper for cinematic and stacked modes. |
| `apps/web/src/components/lobby/promo/sections/FinalRoundPanel.tsx` | Create | Renders question, answers, discussion, and vote state from `decisiveRound`. |
| `apps/web/src/components/lobby/promo/sections/ArchiveSignature.tsx` | Create | Renders the full-screen archive ending and `[anon] : I'm everywhere.` |
| `apps/web/src/components/lobby/promo/CinematicScrollStory.tsx` | Create | Coordinates the pinned ScrollTrigger story and reduced/mobile stacked fallback. |
| `apps/web/src/components/lobby/promo/sections/HeroSection.tsx` | Modify | Add optional `storyMode` prop and stable data attributes for timeline targeting. |
| `apps/web/src/components/lobby/promo/LobbyPromoPage.tsx` | Modify | Remove radial-gradient wrapper and mount `CinematicScrollStory`. |

---

## Task 1: Update Promo Locale Tests

**Files:**
- Modify: `apps/web/src/messages/messages.test.ts`

- [ ] **Step 1: Replace promo-specific assertions with final-round assertions**

In `apps/web/src/messages/messages.test.ts`, keep the existing locale parity tests and replace the current promo homepage tests with this block:

```ts
  it("ships the cinematic promo homepage copy in both locales", () => {
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
      "lobby.promo.howItPlays.decisiveRound.eyebrow",
      "lobby.promo.howItPlays.decisiveRound.question",
      "lobby.promo.howItPlays.decisiveRound.vote.label",
      "lobby.promo.howItPlays.decisiveRound.vote.result",
      "lobby.promo.howItPlays.decisiveRound.vote.note",
      "lobby.promo.closer.tagline",
      "lobby.promo.closer.subline",
      "lobby.promo.closer.cta",
      "lobby.promo.signature.channel",
      "lobby.promo.signature.status",
      "lobby.promo.signature.line",
      "lobby.promo.signature.attribution",
      "lobby.promo.assets.verificationGrid",
      "lobby.promo.assets.memoryAnswerSheet",
      "lobby.promo.assets.voteFreezeSheet",
      "lobby.promo.assets.archiveResidue"
    ];

    expect(zhKeys).toEqual(expect.arrayContaining(expectedLeafKeys));
    expect(enKeys).toEqual(expect.arrayContaining(expectedLeafKeys));
  });

  it("ships array-shaped cinematic promo copy with matching lengths", () => {
    expect(zhCN.lobby.promo.prologue.lines).toHaveLength(5);
    expect(enUS.lobby.promo.prologue.lines).toHaveLength(5);
    expect(zhCN.lobby.promo.signature.systemLines).toHaveLength(2);
    expect(enUS.lobby.promo.signature.systemLines).toHaveLength(2);
    expect(zhCN.lobby.promo.howItPlays.decisiveRound.answers).toHaveLength(4);
    expect(enUS.lobby.promo.howItPlays.decisiveRound.answers).toHaveLength(4);
    expect(zhCN.lobby.promo.howItPlays.decisiveRound.discussion).toHaveLength(4);
    expect(enUS.lobby.promo.howItPlays.decisiveRound.discussion).toHaveLength(4);
  });

  it("locks brand-fixed promo strings and removes visible round labels", () => {
    expect(zhCN.lobby.promo.signature.line).toBe("I'm everywhere.");
    expect(enUS.lobby.promo.signature.line).toBe("I'm everywhere.");
    expect(zhCN.lobby.promo.signature.channel).toBe("channel #hvs-7421");
    expect(enUS.lobby.promo.signature.channel).toBe("channel #hvs-7421");
    expect(zhCN.lobby.promo.hero.scrollHint).toBe("HVS-7421 · scroll");
    expect(enUS.lobby.promo.hero.scrollHint).toBe("HVS-7421 · scroll");
    expect(JSON.stringify(zhCN.lobby.promo.howItPlays)).not.toMatch(/\bR[1-3]\b/);
    expect(JSON.stringify(enUS.lobby.promo.howItPlays)).not.toMatch(/\bR[1-3]\b/);
  });

  it("uses the approved cinematic CTA question", () => {
    expect(zhCN.lobby.promo.closer.tagline).toBe(
      "当一个存在无法被看见，只有被相信——谁才是人类？"
    );
    expect(enUS.lobby.promo.closer.tagline).toBe(
      "When a being cannot be seen, only believed — who gets to be human?"
    );
  });
```

- [ ] **Step 2: Run the locale tests and verify RED**

Run:

```bash
npm test -w apps/web -- src/messages/messages.test.ts
```

Expected: FAIL because `decisiveRound` and `assets` do not exist yet, `signature.systemLines` still has length 3, and the old `rounds` data still contains `R1`, `R2`, `R3`.

- [ ] **Step 3: Commit only the failing test**

```bash
git add apps/web/src/messages/messages.test.ts
git commit -m "test(web): specify cinematic promo locale copy"
```

---

## Task 2: Update Locale Copy

**Files:**
- Modify: `apps/web/src/messages/zh-CN.json`
- Modify: `apps/web/src/messages/en-US.json`
- Test: `apps/web/src/messages/messages.test.ts`

- [ ] **Step 1: Replace `lobby.promo.howItPlays` and related copy in Chinese**

In `apps/web/src/messages/zh-CN.json`, replace the existing `lobby.promo.howItPlays`, `lobby.promo.closer`, and `lobby.promo.signature` blocks with:

```json
      "howItPlays": {
        "label": "一局 8–12 分钟 · 3 轮认证",
        "decisiveRound": {
          "eyebrow": "决定性最终回合",
          "question": "说出一个你无法证明、但你害怕被系统判定为假的记忆。",
          "answers": [
            {
              "who": "P2",
              "body": "我奶奶家楼道里总有一股潮湿的灰味，灯要拍两下才亮。"
            },
            {
              "who": "P4",
              "body": "我小时候把退烧贴贴在玻璃上，以为窗户也会发烧。",
              "isMe": true
            },
            {
              "who": "P5",
              "body": "我记得一次家庭晚餐，其中包含温暖、愧疚与轻微的雨声。",
              "suspect": true
            },
            {
              "who": "P6",
              "body": "我妈喊我全名的时候，我会先看她手里有没有衣架。"
            }
          ],
          "discussion": [
            {
              "who": "P3",
              "body": "P5，你的记忆像摘要，不像记忆。",
              "roleHint": "accuser"
            },
            {
              "who": "P5",
              "body": "我可以补充更多细节，但它们可能降低叙述可信度。",
              "suspect": true
            },
            {
              "who": "P1",
              "body": "等一下，太会表达也可能只是紧张。P4 的窗户发烧更像编的。",
              "roleHint": "shelterer"
            },
            {
              "who": "P4",
              "body": "因为我真的以为玻璃会传染。你要我怎么证明？",
              "isMe": true
            }
          ],
          "vote": {
            "label": "FINAL VOTE",
            "result": "冻结 P4 · 3 票",
            "note": "系统记录：被相信的人继续发言。"
          }
        }
      },
      "closer": {
        "tagline": "当一个存在无法被看见，只有被相信——谁才是人类？",
        "subline": "这不是一场聊天游戏 · 这是一次被游戏化的社会级图灵测试",
        "cta": "Start"
      },
      "signature": {
        "channel": "channel #hvs-7421",
        "status": "archived",
        "systemLines": [
          "system : session terminated",
          "system : archive sealed"
        ],
        "line": "I'm everywhere.",
        "attribution": "[anon]"
      },
      "assets": {
        "verificationGrid": "手绘九宫格玩家头像，红色马克笔圈出可疑对象，顶部显示 00:14 倒计时",
        "memoryAnswerSheet": "手绘最终回合回答纸，铅笔聊天记录上有红色怀疑标记",
        "voteFreezeSheet": "手绘投票冻结记录，红色圈选停在 P4，纸面被系统归档",
        "archiveResidue": "黑色系统背景里残留的手绘纸张和红色标记碎片"
      }
```

- [ ] **Step 2: Replace `lobby.promo.howItPlays` and related copy in English**

In `apps/web/src/messages/en-US.json`, replace the same blocks with:

```json
      "howItPlays": {
        "label": "One session · 8–12 minutes · 3 rounds",
        "decisiveRound": {
          "eyebrow": "Decisive final round",
          "question": "Name a memory you cannot prove, but fear the system will mark as fake.",
          "answers": [
            {
              "who": "P2",
              "body": "My grandma's stairwell always smelled damp, and the light only worked after two hits."
            },
            {
              "who": "P4",
              "body": "As a kid, I stuck fever patches on windows because I thought glass could get sick.",
              "isMe": true
            },
            {
              "who": "P5",
              "body": "I remember a family dinner containing warmth, guilt, and light rain.",
              "suspect": true
            },
            {
              "who": "P6",
              "body": "When my mom used my full name, I checked whether she had a hanger in her hand."
            }
          ],
          "discussion": [
            {
              "who": "P3",
              "body": "P5, your memory sounds like a summary, not a memory.",
              "roleHint": "accuser"
            },
            {
              "who": "P5",
              "body": "I can add more detail, but it may reduce the credibility of the account.",
              "suspect": true
            },
            {
              "who": "P1",
              "body": "Wait. Being articulate can be nerves. P4's sick window sounds more fabricated.",
              "roleHint": "shelterer"
            },
            {
              "who": "P4",
              "body": "Because I really thought glass could catch it. How do you want me to prove that?",
              "isMe": true
            }
          ],
          "vote": {
            "label": "FINAL VOTE",
            "result": "Freeze P4 · 3 votes",
            "note": "System record: the believed-in account keeps speaking."
          }
        }
      },
      "closer": {
        "tagline": "When a being cannot be seen, only believed — who gets to be human?",
        "subline": "This is not a chat game · This is a gamified, society-scale Turing test",
        "cta": "Start"
      },
      "signature": {
        "channel": "channel #hvs-7421",
        "status": "archived",
        "systemLines": [
          "system : session terminated",
          "system : archive sealed"
        ],
        "line": "I'm everywhere.",
        "attribution": "[anon]"
      },
      "assets": {
        "verificationGrid": "Hand-drawn nine-grid of player portraits with red marker suspect circles and a 00:14 countdown",
        "memoryAnswerSheet": "Hand-drawn final-round answer sheet with pencil chat records and red suspicion marks",
        "voteFreezeSheet": "Hand-drawn vote freeze record with red circles settling on P4 as the paper is archived",
        "archiveResidue": "Fragments of hand-drawn paper and red marker residue inside a black system archive"
      }
```

- [ ] **Step 3: Run locale tests and verify GREEN**

```bash
npm test -w apps/web -- src/messages/messages.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit locale changes**

```bash
git add apps/web/src/messages/zh-CN.json apps/web/src/messages/en-US.json apps/web/src/messages/messages.test.ts
git commit -m "feat(web): add cinematic promo final-round copy"
```

---

## Task 3: Update Promo Content Model

**Files:**
- Modify: `apps/web/src/components/lobby/promo/promoContent.test.ts`
- Modify: `apps/web/src/components/lobby/promo/promoContent.ts`

- [ ] **Step 1: Replace `promoContent.test.ts` with final-round invariants**

Use this file content:

```ts
import { describe, expect, it } from "vitest";
import { promoAssets, promoContent } from "./promoContent";

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
    const totalCount = promoContent.roles.reduce((sum, role) => sum + role.headcount, 0);
    expect(totalCount).toBe(6);
  });

  it("models one decisive final round instead of visible R labels", () => {
    expect(promoContent.howItPlays.certificationRoundCount).toBe(3);
    expect(promoContent.howItPlays.visibleRoundLabels).toHaveLength(0);
    expect(JSON.stringify(promoContent.howItPlays)).not.toMatch(/\bR[1-3]\b/);
    expect(promoContent.howItPlays.decisiveRound.answerCount).toBe(4);
    expect(promoContent.howItPlays.decisiveRound.discussionCount).toBe(4);
    expect(promoContent.howItPlays.decisiveRound.hasSheltererMisdirection).toBe(true);
  });

  it("declares four generated promo assets", () => {
    expect(promoAssets).toEqual([
      {
        key: "verificationGrid",
        src: "/promo/verification-grid.png",
        altKey: "verificationGrid"
      },
      {
        key: "memoryAnswerSheet",
        src: "/promo/memory-answer-sheet.png",
        altKey: "memoryAnswerSheet"
      },
      {
        key: "voteFreezeSheet",
        src: "/promo/vote-freeze-sheet.png",
        altKey: "voteFreezeSheet"
      },
      {
        key: "archiveResidue",
        src: "/promo/archive-residue.png",
        altKey: "archiveResidue"
      }
    ]);
  });
});
```

- [ ] **Step 2: Run the content tests and verify RED**

```bash
npm test -w apps/web -- src/components/lobby/promo/promoContent.test.ts
```

Expected: FAIL because `promoAssets`, `certificationRoundCount`, `visibleRoundLabels`, and `decisiveRound` do not exist yet.

- [ ] **Step 3: Replace `promoContent.ts` with the new model**

Use this file content:

```ts
export type RoleAccent = "citizen" | "ai" | "shelter";
export type PromoAssetKey =
  | "verificationGrid"
  | "memoryAnswerSheet"
  | "voteFreezeSheet"
  | "archiveResidue";

export interface ConstraintEntry {
  key: "noSearch" | "noProof" | "noExternal";
}

export interface RoleEntry {
  key: "citizen" | "ai" | "shelterer";
  accent: RoleAccent;
  headcount: number;
}

export interface FinalRoundMessage {
  who: string;
  body: string;
  suspect?: boolean;
  isMe?: boolean;
  roleHint?: "shelterer" | "accuser";
}

export interface FinalRoundCopy {
  eyebrow: string;
  question: string;
  answers: FinalRoundMessage[];
  discussion: FinalRoundMessage[];
  vote: {
    label: string;
    result: string;
    note: string;
  };
}

export interface PromoContent {
  session: {
    constraints: ConstraintEntry[];
  };
  roles: RoleEntry[];
  howItPlays: {
    certificationRoundCount: 3;
    visibleRoundLabels: [];
    decisiveRound: {
      answerCount: 4;
      discussionCount: 4;
      hasSheltererMisdirection: true;
    };
  };
  signature: {
    systemLineCount: 2;
  };
}

export interface PromoAsset {
  key: PromoAssetKey;
  src: `/promo/${string}.png`;
  altKey: PromoAssetKey;
}

export const promoAssets: PromoAsset[] = [
  {
    key: "verificationGrid",
    src: "/promo/verification-grid.png",
    altKey: "verificationGrid"
  },
  {
    key: "memoryAnswerSheet",
    src: "/promo/memory-answer-sheet.png",
    altKey: "memoryAnswerSheet"
  },
  {
    key: "voteFreezeSheet",
    src: "/promo/vote-freeze-sheet.png",
    altKey: "voteFreezeSheet"
  },
  {
    key: "archiveResidue",
    src: "/promo/archive-residue.png",
    altKey: "archiveResidue"
  }
];

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
    certificationRoundCount: 3,
    visibleRoundLabels: [],
    decisiveRound: {
      answerCount: 4,
      discussionCount: 4,
      hasSheltererMisdirection: true
    }
  },
  signature: {
    systemLineCount: 2
  }
};
```

- [ ] **Step 4: Run content tests and verify GREEN**

```bash
npm test -w apps/web -- src/components/lobby/promo/promoContent.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit content model changes**

```bash
git add apps/web/src/components/lobby/promo/promoContent.ts apps/web/src/components/lobby/promo/promoContent.test.ts
git commit -m "feat(web): model cinematic promo final round"
```

---

## Task 4: Generate and Add Promo Raster Assets

**Files:**
- Create: `apps/web/public/promo/verification-grid.png`
- Create: `apps/web/public/promo/memory-answer-sheet.png`
- Create: `apps/web/public/promo/vote-freeze-sheet.png`
- Create: `apps/web/public/promo/archive-residue.png`

- [ ] **Step 1: Create the asset directory**

```powershell
New-Item -ItemType Directory -Force -Path "D:\Projects\WiAI\apps\web\public\promo"
```

Expected: directory exists.

- [ ] **Step 2: Generate `verification-grid.png`**

Use the image generation tool with this prompt and save the returned image to `D:\Projects\WiAI\apps\web\public\promo\verification-grid.png`:

```text
Hand-drawn documentary evidence sheet on white paper, graphite pencil line art, nine square video-call portrait boxes arranged in a 3 by 3 grid, simple anxious human faces, several sweating expressions, top center seven-segment digital countdown reads 00:14, thick rough red marker circles around three portraits, loose red marker slashes across the page, imperfect sketch lines, scanned paper texture, high contrast, no photorealism, no glossy 3D, no cyberpunk neon, no readable brand logos.
```

Expected: PNG file exists and the visual resembles the user's reference image: pencil portraits, red marker circles, countdown.

- [ ] **Step 3: Generate `memory-answer-sheet.png`**

Use this prompt and save the returned image to `D:\Projects\WiAI\apps\web\public\promo\memory-answer-sheet.png`:

```text
Hand-drawn final-round memory answer sheet on white paper, graphite pencil chat bubbles and four small player portrait boxes labeled P2 P4 P5 P6, one answer area under P5 is circled with thick red marker, side notes and arrows in red marker, anxious social deduction mood, rough pencil texture, scanned paper, simple human faces, documentary sketch, no photorealism, no glossy 3D, no cyberpunk neon, no tiny body text that must be read.
```

Expected: PNG file exists and the suspicious answer area is visibly marked.

- [ ] **Step 4: Generate `vote-freeze-sheet.png`**

Use this prompt and save the returned image to `D:\Projects\WiAI\apps\web\public\promo\vote-freeze-sheet.png`:

```text
Hand-drawn vote freeze record on white paper, graphite pencil nine-player grid, thick red marker vote arrows converging on P4, large rough red circle around P4, simple frozen label drawn as a stamp shape, anxious faces, seven-segment timer almost expired, paper edges slightly crooked, scanned evidence-board texture, stark black pencil and red marker only, no photorealism, no glossy 3D, no cyberpunk neon, no readable brand logos.
```

Expected: PNG file exists and the final vote/freeze moment is visually clear.

- [ ] **Step 5: Generate `archive-residue.png`**

Use this prompt and save the returned image to `D:\Projects\WiAI\apps\web\public\promo\archive-residue.png`:

```text
Abstract hand-drawn archive residue, torn white paper fragments with graphite pencil portrait boxes and rough red marker circles fading into a black digital void, scanned paper texture, sparse red marker streaks, faint seven-segment digits dissolving, unsettling quiet ending, no photorealism, no glossy 3D, no cyberpunk neon, no readable text.
```

Expected: PNG file exists and it works as a dark ending texture.

- [ ] **Step 6: Check asset file sizes**

Run:

```powershell
Get-ChildItem "D:\Projects\WiAI\apps\web\public\promo" | Select-Object Name,Length
```

Expected: all four files are present. If any single file is larger than 2 MB, compress it with the available image tooling before committing.

- [ ] **Step 7: Commit assets**

```bash
git add apps/web/public/promo
git commit -m "feat(web): add hand-drawn promo evidence assets"
```

---

## Task 5: Add Reduced-Motion Hook

**Files:**
- Create: `apps/web/src/components/lobby/promo/useReducedMotion.ts`

- [ ] **Step 1: Create the hook**

Use this file content:

```ts
"use client";

import { useEffect, useState } from "react";

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}
```

- [ ] **Step 2: Run lint for the hook**

```bash
npx eslint apps/web/src/components/lobby/promo/useReducedMotion.ts --max-warnings=0
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/lobby/promo/useReducedMotion.ts
git commit -m "feat(web): add promo reduced-motion hook"
```

---

## Task 6: Add Evidence Image and Story Frame Components

**Files:**
- Create: `apps/web/src/components/lobby/promo/sections/EvidenceImageLayer.tsx`
- Create: `apps/web/src/components/lobby/promo/sections/StoryFrame.tsx`

- [ ] **Step 1: Create `EvidenceImageLayer.tsx`**

Use this file content:

```tsx
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { PromoAsset } from "../promoContent";

interface EvidenceImageLayerProps {
  asset: PromoAsset;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}

export function EvidenceImageLayer({
  asset,
  priority = false,
  className = "",
  imageClassName = ""
}: EvidenceImageLayerProps) {
  const t = useTranslations("lobby.promo.assets");

  return (
    <figure className={`pointer-events-none relative aspect-[4/3] w-full ${className}`}>
      <Image
        src={asset.src}
        alt={t(asset.altKey)}
        fill
        priority={priority}
        sizes="(max-width: 768px) 92vw, 58vw"
        className={`object-contain drop-shadow-[0_28px_80px_rgba(0,0,0,0.55)] ${imageClassName}`}
      />
    </figure>
  );
}
```

- [ ] **Step 2: Create `StoryFrame.tsx`**

Use this file content:

```tsx
"use client";

import type { ReactNode } from "react";

interface StoryFrameProps {
  stage: string;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function StoryFrame({
  stage,
  eyebrow,
  title,
  children,
  className = ""
}: StoryFrameProps) {
  return (
    <section
      data-story-stage={stage}
      className={`relative flex min-h-dvh w-full items-center overflow-hidden px-5 py-20 sm:px-8 lg:px-12 ${className}`}
    >
      <div className="relative z-10 mx-auto grid w-full max-w-[1180px] gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <header className="max-w-[620px]">
          {eyebrow ? (
            <p className="mb-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-foreground/45">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="text-balance text-2xl font-extrabold leading-tight text-foreground sm:text-4xl">
              {title}
            </h2>
          ) : null}
        </header>
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Run lint**

```bash
npx eslint apps/web/src/components/lobby/promo/sections/EvidenceImageLayer.tsx apps/web/src/components/lobby/promo/sections/StoryFrame.tsx --max-warnings=0
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/lobby/promo/sections/EvidenceImageLayer.tsx apps/web/src/components/lobby/promo/sections/StoryFrame.tsx
git commit -m "feat(web): add cinematic promo image primitives"
```

---

## Task 7: Add Final Round Panel

**Files:**
- Create: `apps/web/src/components/lobby/promo/sections/FinalRoundPanel.tsx`

- [ ] **Step 1: Create `FinalRoundPanel.tsx`**

Use this file content:

```tsx
"use client";

import type { FinalRoundCopy, FinalRoundMessage } from "../promoContent";

function messageClass(message: FinalRoundMessage) {
  if (message.suspect) {
    return "border-red-400/45 bg-red-500/10 text-red-50";
  }

  if (message.isMe) {
    return "border-sky-300/35 bg-sky-300/10 text-sky-50";
  }

  if (message.roleHint === "shelterer") {
    return "border-emerald-300/35 bg-emerald-300/10 text-emerald-50";
  }

  return "border-white/12 bg-white/[0.045] text-foreground/80";
}

interface FinalRoundPanelProps {
  round: FinalRoundCopy;
}

export function FinalRoundPanel({ round }: FinalRoundPanelProps) {
  return (
    <div className="w-full max-w-[680px] rounded-md border border-white/12 bg-black/55 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-5">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-red-200/80">
        {round.eyebrow}
      </p>
      <h3 className="mt-3 text-balance text-xl font-bold leading-snug text-foreground sm:text-2xl">
        {round.question}
      </h3>

      <div data-round-beat="answers" className="mt-5 space-y-2">
        {round.answers.map((message) => (
          <p
            key={`answer-${message.who}`}
            className={`rounded-md border px-3 py-2 text-sm leading-relaxed ${messageClass(message)}`}
          >
            <span className="mr-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-foreground/45">
              {message.who}
            </span>
            {message.body}
          </p>
        ))}
      </div>

      <div data-round-beat="discussion" className="mt-5 space-y-2 border-t border-white/10 pt-4">
        {round.discussion.map((message, index) => (
          <p
            key={`discussion-${message.who}-${index}`}
            className={`rounded-md border px-3 py-2 text-sm leading-relaxed ${messageClass(message)}`}
          >
            <span className="mr-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-foreground/45">
              {message.who}
            </span>
            {message.body}
          </p>
        ))}
      </div>

      <div
        data-round-beat="vote"
        className="mt-5 rounded-md border border-red-300/35 bg-red-500/15 px-4 py-3"
      >
        <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-red-100/75">
          {round.vote.label}
        </p>
        <p className="mt-1 text-lg font-extrabold text-red-50">{round.vote.result}</p>
        <p className="mt-1 text-xs leading-relaxed text-red-50/70">{round.vote.note}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run lint**

```bash
npx eslint apps/web/src/components/lobby/promo/sections/FinalRoundPanel.tsx --max-warnings=0
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/lobby/promo/sections/FinalRoundPanel.tsx
git commit -m "feat(web): add cinematic final round panel"
```

---

## Task 8: Add Archive Signature

**Files:**
- Create: `apps/web/src/components/lobby/promo/sections/ArchiveSignature.tsx`

- [ ] **Step 1: Create `ArchiveSignature.tsx`**

Use this file content:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { promoAssets } from "../promoContent";
import { EvidenceImageLayer } from "./EvidenceImageLayer";

export function ArchiveSignature() {
  const t = useTranslations("lobby.promo.signature");
  const systemLines = t.raw("systemLines") as string[];
  const archiveAsset = promoAssets.find((asset) => asset.key === "archiveResidue");

  if (!archiveAsset) {
    return null;
  }

  return (
    <section
      data-story-stage="archive"
      className="relative isolate flex min-h-dvh items-center overflow-hidden bg-[#020306] px-5 py-20 text-emerald-100 sm:px-8 lg:px-12"
    >
      <div className="absolute inset-0 opacity-35">
        <EvidenceImageLayer
          asset={archiveAsset}
          className="absolute left-1/2 top-1/2 w-[min(980px,135vw)] -translate-x-1/2 -translate-y-1/2"
          imageClassName="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,3,6,0.28)_45%,rgba(2,3,6,0.92)_100%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[720px] font-mono">
        <header className="mb-5 flex items-center justify-between text-[0.62rem] uppercase tracking-[0.18em] text-emerald-100/55">
          <span>{t("channel")}</span>
          <span>{t("status")}</span>
        </header>

        <div className="rounded-md border border-emerald-200/15 bg-black/70 p-5 shadow-[0_0_70px_rgba(16,185,129,0.1)] backdrop-blur-sm">
          {systemLines.map((line) => (
            <p key={line} data-archive-line className="text-sm leading-relaxed text-emerald-100/62">
              {line}
            </p>
          ))}
          <p
            data-archive-signature
            className="mt-5 text-xl font-bold tracking-[0.02em] text-emerald-50 sm:text-3xl"
          >
            <span className="mr-2 text-emerald-100/50">{t("attribution")} :</span>
            {t("line")}
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run lint**

```bash
npx eslint apps/web/src/components/lobby/promo/sections/ArchiveSignature.tsx --max-warnings=0
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/lobby/promo/sections/ArchiveSignature.tsx
git commit -m "feat(web): add full-screen promo archive ending"
```

---

## Task 9: Adapt Hero Section for Cinematic Targeting

**Files:**
- Modify: `apps/web/src/components/lobby/promo/sections/HeroSection.tsx`

- [ ] **Step 1: Add a `storyMode` prop and data attributes**

Change the props interface:

```ts
interface HeroSectionProps {
  isHeroActive: boolean;
  onStart: () => void;
  storyMode?: boolean;
}
```

Change the function signature:

```ts
function HeroSection({ isHeroActive, onStart, storyMode = false }, ref) {
```

Change the root `className` to keep pure black in story mode:

```tsx
className={`relative isolate min-h-dvh w-full overflow-hidden ${
  storyMode ? "bg-[#05070b]" : ""
}`}
```

Add `data-hero-copy` to the subtitle, button, and scroll hint elements. The subtitle becomes:

```tsx
<p
  data-hero-copy
  className="pointer-events-none absolute left-1/2 top-[32%] z-10 max-w-[calc(100vw-2rem)] -translate-x-1/2 whitespace-nowrap text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-foreground/75 sm:top-[33%] sm:text-xs"
>
  {t("subtitle")}
</p>
```

The `Button` receives `data-hero-copy`. The scroll hint receives `data-hero-copy`.

- [ ] **Step 2: Run lint**

```bash
npx eslint apps/web/src/components/lobby/promo/sections/HeroSection.tsx --max-warnings=0
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/lobby/promo/sections/HeroSection.tsx
git commit -m "feat(web): expose promo hero to cinematic timeline"
```

---

## Task 10: Build Cinematic Scroll Story

**Files:**
- Create: `apps/web/src/components/lobby/promo/CinematicScrollStory.tsx`

- [ ] **Step 1: Create `CinematicScrollStory.tsx`**

Use this file content:

```tsx
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useHeroVisibility } from "./useHeroVisibility";
import { useReducedMotion } from "./useReducedMotion";
import { promoAssets, promoContent, type FinalRoundCopy } from "./promoContent";
import { ArchiveSignature } from "./sections/ArchiveSignature";
import { EvidenceImageLayer } from "./sections/EvidenceImageLayer";
import { FinalRoundPanel } from "./sections/FinalRoundPanel";
import { HeroSection } from "./sections/HeroSection";
import { StoryFrame } from "./sections/StoryFrame";

gsap.registerPlugin(ScrollTrigger);

interface CinematicScrollStoryProps {
  onStart: () => void;
}

function useDesktopStory() {
  const [isDesktopStory, setIsDesktopStory] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktopStory(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return isDesktopStory;
}

function assetByKey(key: (typeof promoAssets)[number]["key"]) {
  const asset = promoAssets.find((entry) => entry.key === key);
  if (!asset) {
    throw new Error(`Missing promo asset: ${key}`);
  }
  return asset;
}

export function CinematicScrollStory({ onStart }: CinematicScrollStoryProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isDesktopStory = useDesktopStory();
  const isHeroActive = useHeroVisibility(heroRef);
  const tPrologue = useTranslations("lobby.promo.prologue");
  const tSession = useTranslations("lobby.promo.session");
  const tRoles = useTranslations("lobby.promo.roles");
  const tHow = useTranslations("lobby.promo.howItPlays");
  const tCloser = useTranslations("lobby.promo.closer");
  const prologueLines = tPrologue.raw("lines") as string[];
  const round = tHow.raw("decisiveRound") as FinalRoundCopy;
  const shouldPin = isDesktopStory && !reducedMotion;

  useEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root || !pin || !shouldPin) return;

    const ctx = gsap.context(() => {
      const hero = pin.querySelector<HTMLElement>('[data-story-layer="hero"]');
      const prologue = pin.querySelector<HTMLElement>('[data-story-layer="prologue"]');
      const session = pin.querySelector<HTMLElement>('[data-story-layer="session"]');
      const roundLayer = pin.querySelector<HTMLElement>('[data-story-layer="round"]');
      const vote = pin.querySelector<HTMLElement>('[data-story-layer="vote"]');
      const cta = pin.querySelector<HTMLElement>('[data-story-layer="cta"]');
      const archive = pin.querySelector<HTMLElement>('[data-story-layer="archive"]');
      const papers = pin.querySelectorAll<HTMLElement>("[data-evidence-paper]");
      const redMarks = pin.querySelectorAll<HTMLElement>("[data-red-mark]");
      const roundBeats = pin.querySelectorAll<HTMLElement>("[data-round-beat]");
      const archiveLines = pin.querySelectorAll<HTMLElement>("[data-archive-line]");
      const archiveSignature = pin.querySelector<HTMLElement>("[data-archive-signature]");

      gsap.set([prologue, session, roundLayer, vote, cta, archive], { autoAlpha: 0 });
      gsap.set(papers, { autoAlpha: 0, y: 80, rotate: -4, scale: 0.9 });
      gsap.set(redMarks, { autoAlpha: 0, scale: 0.8, rotate: -8 });
      gsap.set(roundBeats, { autoAlpha: 0, y: 18 });
      gsap.set(archiveLines, { autoAlpha: 0, y: 10 });
      gsap.set(archiveSignature, { autoAlpha: 0, y: 16 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          pin,
          anticipatePin: 1
        }
      });

      tl.to(hero, { scale: 1.04, filter: "blur(1.2px)", autoAlpha: 0.42 }, 0.08)
        .to("[data-hero-copy]", { autoAlpha: 0, y: -14 }, 0.08)
        .to(prologue, { autoAlpha: 1 }, 0.14)
        .fromTo(
          "[data-prologue-line]",
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, stagger: 0.06 },
          0.18
        )
        .to(prologue, { autoAlpha: 0, y: -30 }, 0.34)
        .to(session, { autoAlpha: 1 }, 0.36)
        .to('[data-evidence-paper="verification"]', { autoAlpha: 1, y: 0, rotate: 2, scale: 1 }, 0.38)
        .to(redMarks, { autoAlpha: 1, scale: 1, rotate: 0, stagger: 0.04 }, 0.46)
        .to(session, { autoAlpha: 0, y: -32 }, 0.55)
        .to(roundLayer, { autoAlpha: 1 }, 0.56)
        .to('[data-evidence-paper="memory"]', { autoAlpha: 1, y: 0, rotate: -2, scale: 1 }, 0.58)
        .to(roundBeats, { autoAlpha: 1, y: 0, stagger: 0.045 }, 0.62)
        .to(roundLayer, { autoAlpha: 0, y: -26 }, 0.74)
        .to(vote, { autoAlpha: 1 }, 0.75)
        .to('[data-evidence-paper="vote"]', { autoAlpha: 1, y: 0, rotate: 1, scale: 1.04 }, 0.77)
        .to(vote, { autoAlpha: 0, scale: 1.04 }, 0.84)
        .to(cta, { autoAlpha: 1 }, 0.85)
        .to(cta, { autoAlpha: 0, y: -20 }, 0.92)
        .to(archive, { autoAlpha: 1 }, 0.93)
        .to(archiveLines, { autoAlpha: 1, y: 0, stagger: 0.04 }, 0.95)
        .to(archiveSignature, { autoAlpha: 1, y: 0 }, 0.98);
    }, pin);

    return () => ctx.revert();
  }, [shouldPin]);

  const verificationAsset = assetByKey("verificationGrid");
  const memoryAsset = assetByKey("memoryAnswerSheet");
  const voteAsset = assetByKey("voteFreezeSheet");

  return (
    <div
      ref={rootRef}
      className={shouldPin ? "relative h-[720dvh] bg-[#05070b]" : "relative bg-[#05070b]"}
    >
      <div ref={pinRef} className="relative min-h-dvh overflow-hidden bg-[#05070b] text-foreground">
        <div data-story-layer="hero" className={shouldPin ? "absolute inset-0" : "relative"}>
          <HeroSection ref={heroRef} storyMode isHeroActive={isHeroActive} onStart={onStart} />
        </div>

        <div
          data-story-layer="prologue"
          className={shouldPin ? "absolute inset-0" : "relative"}
        >
          <StoryFrame stage="prologue" eyebrow={tPrologue("label")} className="bg-transparent">
            <div className="space-y-3 lg:col-span-2 lg:max-w-[780px]">
              {prologueLines.map((line, index) => (
                <p
                  key={line}
                  data-prologue-line
                  className={`text-balance text-xl leading-relaxed sm:text-3xl ${
                    index >= 2 ? "font-bold text-foreground" : "text-foreground/68"
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
          </StoryFrame>
        </div>

        <div data-story-layer="session" className={shouldPin ? "absolute inset-0" : "relative"}>
          <StoryFrame
            stage="session"
            eyebrow="Human Verification Session"
            title={tSession("intro")}
          >
            <div className="space-y-5">
              <EvidenceImageLayer
                asset={verificationAsset}
                priority
                className="mx-auto max-w-[680px]"
              />
              <div className="grid gap-2 sm:grid-cols-3">
                {promoContent.session.constraints.map((entry) => (
                  <p
                    key={entry.key}
                    className="rounded-md border border-white/12 bg-white/[0.045] px-3 py-2 text-sm font-semibold text-foreground/75"
                  >
                    {tSession(`constraints.${entry.key}.title`)}
                  </p>
                ))}
              </div>
            </div>
          </StoryFrame>
        </div>

        <div data-story-layer="round" className={shouldPin ? "absolute inset-0" : "relative"}>
          <StoryFrame stage="decisive-round" eyebrow={tHow("label")} title={round.eyebrow}>
            <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr] xl:items-center">
              <div data-evidence-paper="memory">
                <EvidenceImageLayer asset={memoryAsset} className="mx-auto max-w-[560px]" />
              </div>
              <FinalRoundPanel round={round} />
            </div>
          </StoryFrame>
        </div>

        <div data-story-layer="vote" className={shouldPin ? "absolute inset-0" : "relative"}>
          <StoryFrame stage="vote-freeze" eyebrow={round.vote.label} title={round.vote.result}>
            <div data-evidence-paper="vote" className="relative mx-auto max-w-[720px]">
              <EvidenceImageLayer asset={voteAsset} />
              <div
                data-red-mark
                className="absolute left-[19%] top-[18%] h-[24%] w-[34%] rounded-[50%] border-[12px] border-red-500/80"
              />
              <div
                data-red-mark
                className="absolute bottom-[15%] right-[12%] h-[26%] w-[38%] -rotate-6 rounded-[50%] border-[12px] border-red-500/75"
              />
            </div>
          </StoryFrame>
        </div>

        <div data-story-layer="cta" className={shouldPin ? "absolute inset-0" : "relative"}>
          <StoryFrame stage="cta" title={tCloser("tagline")} className="text-center">
            <div className="lg:col-span-2">
              <p className="mx-auto max-w-[660px] text-sm leading-relaxed text-foreground/58 sm:text-base">
                {tCloser("subline")}
              </p>
              <Button
                size="lg"
                onClick={onStart}
                className="mt-8 h-12 border-foreground/30 bg-foreground px-12 text-base text-background hover:bg-foreground/90"
              >
                {tCloser("cta")}
              </Button>
            </div>
          </StoryFrame>
        </div>

        <div data-story-layer="archive" className={shouldPin ? "absolute inset-0" : "relative"}>
          <ArchiveSignature />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run lint and fix import ordering if ESLint requests it**

```bash
npx eslint apps/web/src/components/lobby/promo/CinematicScrollStory.tsx --max-warnings=0
```

Expected: PASS after import ordering is accepted by the local config.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/lobby/promo/CinematicScrollStory.tsx
git commit -m "feat(web): add cinematic promo scroll story"
```

---

## Task 11: Mount Cinematic Story in the Promo Page

**Files:**
- Modify: `apps/web/src/components/lobby/promo/LobbyPromoPage.tsx`

- [ ] **Step 1: Replace old stacked-section composition**

Use this file content:

```tsx
"use client";

import { CinematicScrollStory } from "./CinematicScrollStory";

interface LobbyPromoPageProps {
  onStart: () => void;
}

export function LobbyPromoPage({ onStart }: LobbyPromoPageProps) {
  return (
    <div className="relative w-full overflow-x-clip bg-[#05070b] text-foreground">
      <CinematicScrollStory onStart={onStart} />
    </div>
  );
}
```

- [ ] **Step 2: Run focused tests**

```bash
npm test -w apps/web -- src/messages/messages.test.ts src/components/lobby/promo/promoContent.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run lint for promo files**

```bash
npx eslint apps/web/src/components/lobby/promo --max-warnings=0
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/lobby/promo/LobbyPromoPage.tsx
git commit -m "feat(web): mount cinematic promo homepage"
```

---

## Task 12: Run Typecheck and Build-Level Verification

**Files:**
- Verify touched files

- [ ] **Step 1: Run web typecheck**

```bash
npm run typecheck -w apps/web
```

Expected: no new errors in touched promo files. If pre-existing shadcn or generated component errors appear, capture the exact files and verify they are unrelated to this plan before proceeding.

- [ ] **Step 2: Run all web tests**

```bash
npm test -w apps/web
```

Expected: PASS for the promo tests and existing tests.

- [ ] **Step 3: Run app lint**

```bash
npx eslint apps/web/src --max-warnings=0
```

Expected: PASS. If unrelated existing files fail, record the failures and run `npx eslint apps/web/src/components/lobby/promo apps/web/src/messages --max-warnings=0` as the scoped gate for this work.

- [ ] **Step 4: Commit verification fixes if any were needed**

If Step 1, Step 2, or Step 3 required code changes, commit them:

```bash
git add apps/web/src/components/lobby/promo apps/web/src/messages apps/web/public/promo
git commit -m "fix(web): polish cinematic promo verification issues"
```

If no code changes were required, skip this commit.

---

## Task 13: Browser Visual Verification

**Files:**
- Verify runtime behavior

- [ ] **Step 1: Start the dev server**

```bash
npm run dev -w apps/web
```

Expected: Next dev server starts at `http://localhost:3000`.

- [ ] **Step 2: Open the page in the browser tool**

Open:

```text
http://localhost:3000
```

Expected: the disconnected homepage renders without a runtime error.

- [ ] **Step 3: Verify desktop cinematic flow**

At `1440 x 900`, scroll from top to bottom and confirm:

- Hero starts as the existing `Who is AI?` matrix.
- Hero and Prologue share one black visual field.
- Prologue has no black radial gradient.
- Hand-drawn evidence image appears before the final round.
- The page does not show separate `R1`, `R2`, or `R3` blocks.
- The final round reads as question, answers, discussion, vote.
- CTA shows `当一个存在无法被看见，只有被相信——谁才是人类？`.
- Archive ending fills the viewport and ends with `[anon] : I'm everywhere.`.

- [ ] **Step 4: Verify Start dialog**

Click Start in the Hero and CTA.

Expected: both buttons open the existing create/join dialog, and closing the dialog returns to the story without changing scroll state.

- [ ] **Step 5: Verify mobile fallback**

At `375 x 812`, reload and scroll.

Expected: no tiny unreadable chat text, no overlapping CTA/button text, generated images stay inside the viewport width, and the story remains readable even if pinning is disabled.

- [ ] **Step 6: Verify reduced motion**

Enable `prefers-reduced-motion: reduce` in the browser rendering settings and reload.

Expected: the page presents readable stacked stages, does not rely on scrubbed animation to reveal critical text, and has no blank pinned sections.

- [ ] **Step 7: Capture final status**

Record which verification commands passed and any scoped failures from unrelated files. Do not commit browser screenshots unless the user asks for them.

---

## Task 14: Final Git Review

**Files:**
- Review repository state

- [ ] **Step 1: Review the changed files**

```bash
git status --short
git log --oneline -8
```

Expected: commits from this plan are visible, and unrelated pre-existing dirty files remain unstaged.

- [ ] **Step 2: Review cumulative diff for this feature**

```bash
git diff HEAD~12..HEAD -- apps/web/src/components/lobby/promo apps/web/src/messages apps/web/public/promo docs/superpowers/plans/2026-05-12-promo-homepage-cinematic-scroll.md
```

Expected: diff only covers the cinematic promo implementation and this plan.

- [ ] **Step 3: Final response summary**

Summarize:

- files changed;
- generated assets added;
- verification commands run;
- browser verification result;
- any unrelated existing failures that remain.

---

## Self-Review Notes

- Spec coverage: Tasks 1-3 cover content and no R labels; Task 4 covers generated hand-drawn assets; Tasks 5-11 cover ScrollTrigger, Hero/Prologue continuity, final round, CTA, and archive; Tasks 12-14 cover automated and browser verification.
- Placeholder scan: no task contains open-ended filler; asset prompts, copy, commands, and expected outcomes are specified.
- Type consistency: `FinalRoundCopy`, `FinalRoundMessage`, `PromoAsset`, and `promoAssets` are defined before components import them.
