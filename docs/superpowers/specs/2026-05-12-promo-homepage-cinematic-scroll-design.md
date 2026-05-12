# Promo Homepage Cinematic Scroll Redesign — Design Spec

**Status:** Pending user review  
**Date:** 2026-05-12  
**Scope:** WiAI web app — disconnected home lobby `/` only

## 1. Goal

Redesign the disconnected homepage from a stacked promotional page into a full-screen cinematic scroll experience. The page should feel closer to the scroll-driven staging of `https://maximatherapy.com/`, but translated into WiAI's own language: a black human-verification system, hand-drawn suspect sheets, red marker accusations, countdown pressure, and a final archival trace.

The new experience must solve the current visual mismatch between the Hero and Prologue, remove the plain R1/R2/R3 round showcase, replace the tagline, make the final easter-egg section feel deliberate, and introduce generated raster images in a hand-drawn evidence-board style.

## 2. Non-goals

- No changes to room creation, joining, connected lobby, or in-game UI.
- No new route; the experience remains the disconnected `/` entry.
- No photorealistic sci-fi illustrations. The user-approved direction is hand-drawn, anxious, and documentary.
- No marketing-style landing page hero with split text/media panels.
- No manual SVG illustration for the main visuals; primary visuals should be generated raster images and live UI layers.
- No display of R1/R2/R3 as separate visible blocks.

## 3. Creative Direction

The page becomes a black system stage that absorbs hand-drawn evidence sheets. The approved image reference uses:

- white paper texture;
- pencil-like character portraits;
- nine-grid video/avatar layouts;
- anxious facial expressions;
- thick red marker circles and slashes;
- seven-segment digital countdown numbers;
- loose, imperfect sketch lines.

WiAI should use this style as a contrast against the black digital interface. The page should not become cute or playful; the hand-drawn look should feel like a human record being judged by a cold system.

## 4. User-Visible Structure

The page is composed as one long scroll scene with pinned full-screen stages. It should feel like the viewport is a camera moving through a dossier, not like a stack of ordinary sections.

### Stage 1: Hero Matrix

The first viewport keeps the existing `Who is AI?` character-matrix hero. The background is pure near-black, not a separate gray/gradient world. The current subtitle and Start button remain visible.

As the user scrolls, the gray dot matrix should drift, dim, and begin to break apart. This transition prepares the Prologue instead of cutting to a different background.

### Stage 2: Prologue Assimilation

The Hero canvas remains visually connected while Prologue lines appear one by one:

1. 某年，世界政府秘密研发了一批数字智能个体。
2. 它们原本被用来预测风险、维持秩序、协助治理。
3. 后来，它们消失了。
4. 它们没有逃向现实。
5. 它们逃进了人类的网络社会。

The dot matrix fades out during this stage, leaving a black field with faint residual pixels. Prologue must not use the current black radial gradient.

### Stage 3: Human Verification Session

The scroll reveals the session context: an account has been forced into a Human Verification Session. The three constraints remain, but they are integrated into the cinematic stage as system restrictions rather than static columns:

- 无搜索;
- 无自证;
- 无外部。

The first generated hand-drawn image appears here as a scanned evidence sheet: a nine-grid of worried participant portraits with a `00:14` countdown and rough red circles.

### Stage 4: Decisive Final Round

The page keeps the label `一局 8–12 分钟 · 3 轮认证`, but the content below it shows only one complete decisive round. Do not display `R1`, `R2`, or `R3`.

The final round should play out in scroll-driven beats:

1. **Question:** `说出一个你无法证明、但你害怕被系统判定为假的记忆。`
2. **Answers:** several players answer with imperfect, sensory, human details.
3. **Suspicion:** one answer sounds too composed, complete, or optimized.
4. **Discussion:** players interrogate the answer; the Shelterer subtly redirects suspicion.
5. **Vote:** red marks spread across the evidence sheet and the final target is frozen.

The round should feel morally uncomfortable: the person who sounds least human may not be the AI, and the person being believed may be the one who survives.

### Stage 5: Vote Freeze

The second generated image or UI composite shows the final voting state: red marker rings, a freezing label, and an almost-paper physicality. The scroll should push from chat bubbles into the vote sheet, then into a system archive overlay.

The final vote should have one clean dramatic result. The exact target can be a player ID such as `P5`, but the page should frame the result as a system decision rather than a fair truth.

### Stage 6: CTA Question

Replace the old closer tagline with:

`当一个存在无法被看见，只有被相信——谁才是人类？`

The Start button remains available and opens the existing create/join dialog. The CTA should appear after the vote freeze, not as an unrelated marketing block.

### Stage 7: Archive Easter Egg

The final section becomes a full archival scene instead of a small terminal box. The system clears the vote record, seals the session, and leaves a faint trace:

```text
system : session terminated
system : archive sealed
[anon] : I'm everywhere.
```

The final line appears after the archive has settled. It should feel like the hidden intelligence remained inside the system, not like a joke footer.

## 5. Motion Design

Use GSAP with ScrollTrigger for the cinematic stages. `gsap/ScrollTrigger` is available in the current dependency tree and is appropriate for this chosen C direction.

The motion model:

- one or more pinned full-screen containers;
- scrubbed progress tied to scroll position;
- opacity, scale, y-position, blur, and clip/mask changes across stages;
- red marker overlays that draw or reveal during the final round;
- generated images that rotate or slide like scanned paper entering the system;
- no page sections resizing as content appears.

Reduced motion must disable pinning-heavy transitions where practical and present the stages as readable stacked panels with final states visible.

## 6. Visual Assets

Implementation should generate and store raster assets under a public app asset directory such as `apps/web/public/promo/`.

Target assets:

1. **verification-grid** — hand-drawn nine-grid of anxious participant portraits, seven-segment countdown, red marker circles.
2. **memory-answer-sheet** — sketched chat/evidence sheet with one suspicious answer marked.
3. **vote-freeze-sheet** — final vote page with red slashes, frozen participant, and system decision marks.
4. **archive-residue** — abstract paper/system residue for the final `[anon]` reveal.

Prompt style should stay close to the reference image: graphite pencil, white paper, rough red marker, simple faces, hand-drawn documentary board, no glossy 3D, no photorealism.

## 7. Component Architecture

All new or heavily revised code stays under `apps/web/src/components/lobby/promo/`.

| Unit | Responsibility |
|------|----------------|
| `LobbyPromoPage` | Top-level disconnected homepage wrapper. Owns scroll stage composition and Start dialog callback. |
| `CinematicScrollStory` | Main pinned scroll scene. Registers ScrollTrigger timelines and coordinates stage progress. |
| `HeroSection` | Reuses the existing matrix canvas and top controls, but exposes elements to the cinematic timeline. |
| `StoryFrame` | Reusable full-screen stage wrapper for Prologue, session, decisive round, CTA, and archive beats. |
| `EvidenceImageLayer` | Renders generated paper assets with controlled transform/opacity states. |
| `FinalRoundPanel` | Renders the decisive question, answer bubbles, discussion snippets, and vote state. |
| `ArchiveSignature` | Renders the full-screen archive ending and the final `I'm everywhere.` line. |
| `promoContent.ts` | Defines structural data for stages, final round beats, role counts, and asset metadata. |
| `useReducedMotion` or local helper | Switches ScrollTrigger experience to stacked readable panels when motion is reduced. |

Existing `LobbyBackdrop` and `LobbyIntelOverlay` may stay reusable, but their animation loops must not run unnecessarily when the hero is no longer active or visible.

## 8. Content Model

The locale files should move from `howItPlays.rounds` to a final-round-focused structure while preserving enough data for tests.

Suggested shape:

```ts
howItPlays: {
  label: string;
  decisiveRound: {
    eyebrow: string;
    question: string;
    answers: Array<{ who: string; body: string; suspect?: boolean; isMe?: boolean }>;
    discussion: Array<{ who: string; body: string; roleHint?: "shelterer" | "accuser" }>;
    vote: {
      label: string;
      result: string;
      note: string;
    };
  };
}
```

The old title can remain: `一局 8–12 分钟 · 3 轮认证`. The visible round labels `R1`, `R2`, `R3` must be removed from the homepage.

## 9. Copy Requirements

Chinese closer tagline:

`当一个存在无法被看见，只有被相信——谁才是人类？`

English equivalent:

`When a being cannot be seen, only believed — who gets to be human?`

The final round question:

Chinese: `说出一个你无法证明、但你害怕被系统判定为假的记忆。`  
English: `Name a memory you cannot prove, but fear the system will mark as fake.`

The exact answer and discussion copy can be tuned during implementation, but it must support the same emotional arc: sensory human detail, suspicion, misdirection, vote, archive.

## 10. Layout and Responsiveness

Desktop:

- full-screen pinned story stages;
- generated evidence sheets can be large, partially cropped, and layered;
- copy should sit as system overlays, not as boxed marketing cards.

Tablet/mobile:

- preserve the same stage order;
- reduce transform distance and rotation;
- avoid tiny chat text;
- if pinning causes awkward viewport behavior, fall back to stacked full-height panels with simpler reveal transitions.

Text must not overlap or spill out of buttons, panels, or evidence sheets at 375 px width.

## 11. Testing and Acceptance

Automated checks:

- existing locale tests updated for the new final-round copy shape;
- `promoContent.test.ts` updated so it no longer requires three rendered round objects;
- lint and typecheck for touched files;
- unit tests should confirm no visible `R1`, `R2`, `R3` copy remains in promo content.

Browser verification:

- open `/` at desktop and mobile sizes;
- confirm Hero and Prologue feel visually continuous;
- confirm ScrollTrigger stages advance with scroll and do not produce blank screens;
- confirm generated images load;
- confirm Start opens the existing create/join dialog from both Hero and CTA;
- confirm connected lobby and game routes are unchanged;
- confirm reduced-motion mode remains readable.

Visual acceptance:

- no black radial Prologue gradient;
- no separated R1/R2/R3 showcase;
- final round is understandable as answer → discussion → vote;
- the hand-drawn red-marker assets are visible and materially affect the page;
- the archive ending feels like a final scene, not a small footer.

## 12. Risks and Mitigations

- **ScrollTrigger complexity:** keep one coordinated timeline per pinned scene rather than many nested triggers.
- **Mobile pinning issues:** provide a reduced stacked layout for narrow screens if the cinematic timeline is too cramped.
- **Generated image legibility:** avoid embedding important body copy inside image pixels; critical text remains real HTML.
- **Performance:** use compressed WebP/PNG assets and pause the live canvas when it is not contributing to the current stage.
- **Style drift:** generated image prompts must explicitly avoid glossy, realistic, cyberpunk, or 3D output.

## 13. Relation to Existing Specs

This spec supersedes the visual direction of `docs/superpowers/specs/2026-05-12-promo-homepage-design.md` for the disconnected promo page. It keeps the same route and Start dialog behavior, but replaces the stacked promo section model with a cinematic pinned-scroll model and a hand-drawn evidence-board art direction.
