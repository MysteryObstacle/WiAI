# Game Command Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the live game screen as a shadcn-first matrix command console with side player columns, a central phase console, a bottom action bar, and a secondary investigation sheet.

**Architecture:** Add a small tested view-model layer for player/status derivation, then compose new domain components around existing phase behavior. Keep server state and room commands unchanged; only change the web presentation layer and preserve existing E2E test selectors for the playable loop.

**Tech Stack:** Next.js App Router, React 19, TypeScript, next-intl, shadcn/ui components, Tailwind utilities, GSAP for minimal wrapper transitions, Vitest, Playwright.

---

## Scope Check

This plan implements one subsystem: the live game screen UI. It does not change domain rules, Colyseus commands, role assignment, persistence, lobby behavior, or settlement logic.

## File Structure

- Create `apps/web/src/components/game/gameViewModel.ts`: pure helpers for sorting players, splitting player columns, deriving public status, vote counts, submitted counts, and default focus.
- Create `apps/web/src/components/game/gameViewModel.test.ts`: Vitest coverage for the helpers.
- Create `apps/web/src/components/game/TopStatusBar.tsx`: compact phase, timer, room, and identity status bar. It preserves `data-testid="phase-name"`.
- Create `apps/web/src/components/game/PlayerStatusCard.tsx`: shadcn-composed player card using `Avatar`, `Badge`, and semantic tokens.
- Create `apps/web/src/components/game/PlayerColumns.tsx`: left/right player columns for the 6-8 player desktop target.
- Create `apps/web/src/components/game/ActionBar.tsx`: bottom current-focus and phase-command row.
- Create `apps/web/src/components/game/InvestigationSheet.tsx`: shadcn `Sheet` + `Tabs` dossier surface for focused player context.
- Create `apps/web/src/components/game/CommandConsole.tsx`: central `Card` wrapper for the active phase task.
- Modify `apps/web/src/components/game/GameClient.tsx`: widen the live-game shell container for the new desktop structure.
- Modify `apps/web/src/components/game/GameLayout.tsx`: compose the command-console master layout and own focused-player state.
- Modify `apps/web/src/components/game/RevealPanel.tsx`: support selected/focused answer display while preserving `AnswerList`.
- Modify `apps/web/src/components/game/DiscussionPanel.tsx`: organize discussion around the focused player while keeping send behavior.
- Modify `apps/web/src/components/game/VotePanel.tsx`: make player-card selection drive vote target while preserving `data-testid="vote-option-N"` and `data-testid="cast-vote"`.
- Modify `apps/web/src/animations/usePhaseTransition.ts`: restrict GSAP to `y` and `autoAlpha` on the central command console wrapper.
- Modify `apps/web/src/messages/en-US.json` and `apps/web/src/messages/zh-CN.json`: add labels for the command console, action bar, dossier tabs, and public status text.
- Modify `tests/e2e/full-game.spec.ts`: keep existing full-game flow assertions and add checks for command-console layout test IDs.

---

### Task 1: Add Tested Game View-Model Helpers

**Files:**
- Create: `apps/web/src/components/game/gameViewModel.ts`
- Create: `apps/web/src/components/game/gameViewModel.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/src/components/game/gameViewModel.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import {
  getDefaultFocusedPlayerId,
  getPlayerPublicStatus,
  getSubmittedAnswerCount,
  getVotesAgainst,
  splitPlayerColumns,
  sortedPlayers
} from "./gameViewModel";

function player(overrides: Partial<SessionPlayerSnapshot>): SessionPlayerSnapshot {
  return {
    id: overrides.id ?? "p1",
    lobbyPlayerId: overrides.lobbyPlayerId ?? "l1",
    gameNumber: overrides.gameNumber ?? 1,
    displayName: overrides.displayName ?? "Ada",
    playerType: overrides.playerType ?? "human",
    role: overrides.role ?? "",
    controlMode: overrides.controlMode ?? "human",
    isActive: overrides.isActive ?? true
  };
}

function snapshot(overrides: Partial<WiaiSnapshot>): WiaiSnapshot {
  const players = overrides.sessionPlayers ?? [
    player({ id: "p1", gameNumber: 1, displayName: "Ada" }),
    player({ id: "p2", gameNumber: 2, displayName: "Debug 1" }),
    player({ id: "p3", gameNumber: 3, displayName: "Debug 2" }),
    player({ id: "p4", gameNumber: 4, displayName: "Agent" })
  ];

  return {
    roomId: "room-1",
    roomCode: "ABCD",
    status: "playing",
    phase: "answer_prep",
    phaseVersion: 1,
    roundIndex: 0,
    phaseEndsAt: Date.now() + 60_000,
    lobbyPlayers: [],
    sessionPlayers: players,
    answers: [],
    messages: [],
    ballots: [],
    questions: [{ roundIndex: 0, kind: "memory", prompt: "Name a human detail." }],
    result: { winnerSide: "", frozenSessionPlayerId: "" },
    ...overrides
  };
}

describe("gameViewModel", () => {
  it("sorts players by public game number", () => {
    const players = [
      player({ id: "p3", gameNumber: 3 }),
      player({ id: "p1", gameNumber: 1 }),
      player({ id: "p2", gameNumber: 2 })
    ];

    expect(sortedPlayers(players).map((item) => item.gameNumber)).toEqual([1, 2, 3]);
  });

  it("splits six to eight players into balanced side columns", () => {
    const players = Array.from({ length: 7 }, (_, index) =>
      player({ id: `p${index + 1}`, gameNumber: index + 1 })
    );

    const columns = splitPlayerColumns(players);

    expect(columns.left.map((item) => item.gameNumber)).toEqual([1, 2, 3, 4]);
    expect(columns.right.map((item) => item.gameNumber)).toEqual([5, 6, 7]);
  });

  it("counts submitted answers for the active round", () => {
    const state = snapshot({
      roundIndex: 1,
      answers: [
        { id: "a1", roundIndex: 1, sessionPlayerId: "p1", content: "A", submittedAt: "" },
        { id: "a2", roundIndex: 0, sessionPlayerId: "p2", content: "Old", submittedAt: "" }
      ]
    });

    expect(getSubmittedAnswerCount(state)).toBe(1);
  });

  it("derives public status without exposing hidden identity", () => {
    const state = snapshot({
      phase: "answer_prep",
      answers: [{ id: "a1", roundIndex: 0, sessionPlayerId: "p2", content: "A", submittedAt: "" }]
    });

    expect(getPlayerPublicStatus(state, state.sessionPlayers[0]!, state.sessionPlayers[0])).toBe("current");
    expect(getPlayerPublicStatus(state, state.sessionPlayers[1]!, state.sessionPlayers[0])).toBe("submitted");
    expect(getPlayerPublicStatus(state, state.sessionPlayers[2]!, state.sessionPlayers[0])).toBe("waiting");
  });

  it("counts non-abstain votes against a target in the active round", () => {
    const state = snapshot({
      phase: "voting",
      ballots: [
        {
          id: "b1",
          roundIndex: 0,
          actorSessionPlayerId: "p1",
          ballotType: "suspicion",
          targetSessionPlayerId: "p4",
          abstain: false
        },
        {
          id: "b2",
          roundIndex: 0,
          actorSessionPlayerId: "p2",
          ballotType: "suspicion",
          targetSessionPlayerId: "p4",
          abstain: false
        },
        {
          id: "b3",
          roundIndex: 0,
          actorSessionPlayerId: "p3",
          ballotType: "suspicion",
          targetSessionPlayerId: "",
          abstain: true
        }
      ]
    });

    expect(getVotesAgainst(state, "p4")).toBe(2);
  });

  it("uses the current player as the initial focus when available", () => {
    const state = snapshot({});

    expect(getDefaultFocusedPlayerId(state, state.sessionPlayers[1])).toBe("p2");
    expect(getDefaultFocusedPlayerId(state, undefined)).toBe("p1");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm run test -w apps/web -- gameViewModel.test.ts
```

Expected: FAIL because `./gameViewModel` does not exist.

- [ ] **Step 3: Implement the helpers**

Create `apps/web/src/components/game/gameViewModel.ts`:

```ts
import type {
  AnswerSnapshot,
  BallotSnapshot,
  MessageSnapshot,
  SessionPlayerSnapshot,
  WiaiSnapshot
} from "@/game-client/types";

export type PlayerPublicStatus =
  | "current"
  | "submitted"
  | "waiting"
  | "spoke"
  | "voted"
  | "inactive";

export function sortedPlayers(players: SessionPlayerSnapshot[]) {
  return [...players].sort((left, right) => left.gameNumber - right.gameNumber);
}

export function splitPlayerColumns(players: SessionPlayerSnapshot[]) {
  const sorted = sortedPlayers(players);
  const splitIndex = Math.ceil(sorted.length / 2);

  return {
    left: sorted.slice(0, splitIndex),
    right: sorted.slice(splitIndex)
  };
}

export function answersForRound(snapshot: WiaiSnapshot): AnswerSnapshot[] {
  return snapshot.answers.filter((answer) => answer.roundIndex === snapshot.roundIndex);
}

export function messagesForRound(snapshot: WiaiSnapshot): MessageSnapshot[] {
  return snapshot.messages.filter((message) => message.roundIndex === snapshot.roundIndex);
}

export function ballotsForRound(snapshot: WiaiSnapshot): BallotSnapshot[] {
  return snapshot.ballots.filter((ballot) => ballot.roundIndex === snapshot.roundIndex);
}

export function getSubmittedAnswerCount(snapshot: WiaiSnapshot) {
  return answersForRound(snapshot).length;
}

export function getPlayerAnswer(snapshot: WiaiSnapshot, sessionPlayerId: string) {
  return answersForRound(snapshot).find((answer) => answer.sessionPlayerId === sessionPlayerId);
}

export function getPlayerMessages(snapshot: WiaiSnapshot, sessionPlayerId: string) {
  return messagesForRound(snapshot).filter((message) => message.sessionPlayerId === sessionPlayerId);
}

export function getOwnBallot(snapshot: WiaiSnapshot, currentSessionPlayer: SessionPlayerSnapshot | undefined) {
  if (!currentSessionPlayer) return undefined;
  return ballotsForRound(snapshot).find((ballot) => ballot.actorSessionPlayerId === currentSessionPlayer.id);
}

export function getVotesAgainst(snapshot: WiaiSnapshot, targetSessionPlayerId: string) {
  return ballotsForRound(snapshot).filter(
    (ballot) => !ballot.abstain && ballot.targetSessionPlayerId === targetSessionPlayerId
  ).length;
}

export function getPlayerPublicStatus(
  snapshot: WiaiSnapshot,
  player: SessionPlayerSnapshot,
  currentSessionPlayer: SessionPlayerSnapshot | undefined
): PlayerPublicStatus {
  if (!player.isActive) return "inactive";
  if (player.id === currentSessionPlayer?.id) return "current";

  if (snapshot.phase === "answer_prep") {
    return getPlayerAnswer(snapshot, player.id) ? "submitted" : "waiting";
  }

  if (snapshot.phase === "discussion") {
    return getPlayerMessages(snapshot, player.id).length > 0 ? "spoke" : "waiting";
  }

  if (snapshot.phase === "voting") {
    return ballotsForRound(snapshot).some((ballot) => ballot.actorSessionPlayerId === player.id)
      ? "voted"
      : "waiting";
  }

  return "waiting";
}

export function getDefaultFocusedPlayerId(
  snapshot: WiaiSnapshot,
  currentSessionPlayer: SessionPlayerSnapshot | undefined
) {
  return currentSessionPlayer?.id ?? sortedPlayers(snapshot.sessionPlayers)[0]?.id ?? "";
}

export function getFocusedPlayer(snapshot: WiaiSnapshot, focusedPlayerId: string) {
  return snapshot.sessionPlayers.find((player) => player.id === focusedPlayerId);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
npm run test -w apps/web -- gameViewModel.test.ts
```

Expected: PASS for all `gameViewModel` tests.

- [ ] **Step 5: Commit Task 1**

```bash
git add apps/web/src/components/game/gameViewModel.ts apps/web/src/components/game/gameViewModel.test.ts
git commit -m "feat(web): add game command view model"
```

---

### Task 2: Add Command Console Shell Components

**Files:**
- Create: `apps/web/src/components/game/TopStatusBar.tsx`
- Create: `apps/web/src/components/game/PlayerStatusCard.tsx`
- Create: `apps/web/src/components/game/PlayerColumns.tsx`
- Create: `apps/web/src/components/game/ActionBar.tsx`
- Create: `apps/web/src/components/game/CommandConsole.tsx`
- Modify: `apps/web/src/messages/en-US.json`
- Modify: `apps/web/src/messages/zh-CN.json`

- [ ] **Step 1: Add message keys**

In both message files, add this object under `game`:

```json
"command": {
  "room": "Room {roomCode}",
  "phaseRail": "Phase progress",
  "submittedCount": "{submitted}/{total} submitted",
  "focus": "Focus: {player}",
  "noFocus": "No player focused",
  "openDossier": "Open dossier",
  "status": {
    "current": "You",
    "submitted": "Submitted",
    "waiting": "Waiting",
    "spoke": "Spoke",
    "voted": "Voted",
    "inactive": "Inactive"
  }
}
```

For `zh-CN.json`, use this translation:

```json
"command": {
  "room": "房间 {roomCode}",
  "phaseRail": "阶段进度",
  "submittedCount": "已提交 {submitted}/{total}",
  "focus": "当前焦点：{player}",
  "noFocus": "暂无焦点玩家",
  "openDossier": "打开档案",
  "status": {
    "current": "你",
    "submitted": "已提交",
    "waiting": "等待中",
    "spoke": "已发言",
    "voted": "已投票",
    "inactive": "离线"
  }
}
```

- [ ] **Step 2: Create the top status bar**

Create `apps/web/src/components/game/TopStatusBar.tsx`:

```tsx
"use client";

import { Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type TopStatusBarProps = {
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
};

const railPhases: Array<WiaiSnapshot["phase"]> = ["answer_prep", "answer_reveal", "discussion", "voting"];

export function TopStatusBar({ snapshot, currentSessionPlayer }: TopStatusBarProps) {
  const tGame = useTranslations("game");
  const tCommand = useTranslations("game.command");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  const remainingSeconds = Math.max(0, Math.ceil((snapshot.phaseEndsAt - now) / 1000));
  const identity = useMemo(() => {
    if (!currentSessionPlayer) return tGame("identity.spectating");
    return tGame("identity.player", { gameNumber: currentSessionPlayer.gameNumber });
  }, [currentSessionPlayer, tGame]);

  return (
    <Card data-testid="game-status-bar" className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-sm font-semibold tracking-tight">Who is AI</strong>
          <Badge variant="outline">{tCommand("room", { roomCode: snapshot.roomCode })}</Badge>
          <Badge variant="secondary">{tGame("round", { round: snapshot.roundIndex + 1 })}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground" aria-label={tCommand("phaseRail")}>
          {railPhases.map((phase) => (
            <span
              className={phase === snapshot.phase ? "text-foreground" : "text-muted-foreground"}
              key={phase}
            >
              {tGame(`phase.${phase}`)}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:justify-end">
        <strong data-testid="phase-name" className="text-base">
          {tGame(`phase.${snapshot.phase}`)}
        </strong>
        <span className="inline-flex items-center gap-2 font-mono text-sm">
          <Timer aria-hidden />
          {snapshot.phase === "settlement" ? tGame("final") : tGame("countdown", { seconds: remainingSeconds })}
        </span>
        <span className="text-sm text-muted-foreground">{identity}</span>
      </div>
    </Card>
  );
}
```

- [ ] **Step 3: Create player status card and columns**

Create `apps/web/src/components/game/PlayerStatusCard.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPlayerPublicStatus, getVotesAgainst } from "./gameViewModel";

type PlayerStatusCardProps = {
  player: SessionPlayerSnapshot;
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
  isFocused: boolean;
  onFocus: (playerId: string) => void;
};

export function PlayerStatusCard({
  player,
  snapshot,
  currentSessionPlayer,
  isFocused,
  onFocus
}: PlayerStatusCardProps) {
  const tCommand = useTranslations("game.command");
  const status = getPlayerPublicStatus(snapshot, player, currentSessionPlayer);
  const votesAgainst = getVotesAgainst(snapshot, player.id);

  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left text-card-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isFocused && "border-primary bg-accent"
      )}
      type="button"
      onClick={() => onFocus(player.id)}
    >
      <Avatar>
        <AvatarFallback>{player.gameNumber}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm">{player.displayName}</strong>
        <span className="block truncate text-xs text-muted-foreground">
          {tCommand(`status.${status}`)}
        </span>
      </span>
      {votesAgainst > 0 ? <Badge variant="outline">{votesAgainst}</Badge> : null}
    </button>
  );
}
```

Create `apps/web/src/components/game/PlayerColumns.tsx`:

```tsx
"use client";

import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { PlayerStatusCard } from "./PlayerStatusCard";

type PlayerColumnProps = {
  players: SessionPlayerSnapshot[];
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
  focusedPlayerId: string;
  onFocusPlayer: (playerId: string) => void;
};

export function PlayerColumn({
  players,
  snapshot,
  currentSessionPlayer,
  focusedPlayerId,
  onFocusPlayer
}: PlayerColumnProps) {
  return (
    <div className="flex flex-col gap-3">
      {players.map((player) => (
        <PlayerStatusCard
          currentSessionPlayer={currentSessionPlayer}
          isFocused={player.id === focusedPlayerId}
          key={player.id}
          onFocus={onFocusPlayer}
          player={player}
          snapshot={snapshot}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create the command console wrapper and action bar**

Create `apps/web/src/components/game/CommandConsole.tsx`:

```tsx
"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CommandConsoleProps = {
  children: React.ReactNode;
  className?: string;
};

export const CommandConsole = React.forwardRef<HTMLDivElement, CommandConsoleProps>(
  function CommandConsole({ children, className }, ref) {
    return (
      <Card ref={ref} data-testid="command-console" className={cn("min-h-[520px] overflow-hidden", className)}>
        <CardContent className="flex h-full flex-col gap-4 p-5">{children}</CardContent>
      </Card>
    );
  }
);
```

Create `apps/web/src/components/game/ActionBar.tsx`:

```tsx
"use client";

import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFocusedPlayer } from "./gameViewModel";

type ActionBarProps = {
  snapshot: WiaiSnapshot;
  focusedPlayerId: string;
  onOpenDossier: () => void;
};

export function ActionBar({ snapshot, focusedPlayerId, onOpenDossier }: ActionBarProps) {
  const tCommand = useTranslations("game.command");
  const focusedPlayer: SessionPlayerSnapshot | undefined = getFocusedPlayer(snapshot, focusedPlayerId);
  const focusLabel = focusedPlayer
    ? `${focusedPlayer.gameNumber} ${focusedPlayer.displayName}`
    : tCommand("noFocus");

  return (
    <Card data-testid="game-action-bar" className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="truncate text-sm text-muted-foreground">
        {focusedPlayer ? tCommand("focus", { player: focusLabel }) : tCommand("noFocus")}
      </span>
      <Button type="button" variant="outline" onClick={onOpenDossier}>
        <FileText data-icon="inline-start" />
        {tCommand("openDossier")}
      </Button>
    </Card>
  );
}
```

- [ ] **Step 5: Run typecheck to catch component API issues**

Run:

```bash
npm run typecheck -w apps/web
```

Expected: PASS after all new imports and message keys compile.

- [ ] **Step 6: Commit Task 2**

```bash
git add apps/web/src/components/game/TopStatusBar.tsx apps/web/src/components/game/PlayerStatusCard.tsx apps/web/src/components/game/PlayerColumns.tsx apps/web/src/components/game/ActionBar.tsx apps/web/src/components/game/CommandConsole.tsx apps/web/src/messages/en-US.json apps/web/src/messages/zh-CN.json
git commit -m "feat(web): add command console shell components"
```

---

### Task 3: Compose the New Game Layout Shell

**Files:**
- Modify: `apps/web/src/components/game/GameClient.tsx`
- Modify: `apps/web/src/components/game/GameLayout.tsx`

- [ ] **Step 1: Widen the live game shell**

In `apps/web/src/components/game/GameClient.tsx`, change the container call to:

```tsx
<AppShellContainer className="max-w-[1440px]">
  <GameLayout room={room} snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />
</AppShellContainer>
```

- [ ] **Step 2: Replace the three-column layout with the command layout**

Replace `GameLayout` with this composition:

```tsx
"use client";

import type { Room } from "colyseus.js";
import { useEffect, useMemo, useState } from "react";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { usePhaseTransition } from "@/animations/usePhaseTransition";
import { ActionBar } from "./ActionBar";
import { AnswerPanel } from "./AnswerPanel";
import { CommandConsole } from "./CommandConsole";
import { DiscussionPanel } from "./DiscussionPanel";
import { getDefaultFocusedPlayerId, splitPlayerColumns } from "./gameViewModel";
import { InvestigationSheet } from "./InvestigationSheet";
import { PlayerColumn } from "./PlayerColumns";
import { RevealPanel } from "./RevealPanel";
import { SettlementPanel } from "./SettlementPanel";
import { TopStatusBar } from "./TopStatusBar";
import { VotePanel } from "./VotePanel";

interface GameLayoutProps {
  room: Room;
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
}

export function GameLayout({ room, snapshot, currentSessionPlayer }: GameLayoutProps) {
  const transitionRef = usePhaseTransition(snapshot.phaseVersion);
  const [focusedPlayerId, setFocusedPlayerId] = useState(() =>
    getDefaultFocusedPlayerId(snapshot, currentSessionPlayer)
  );
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  useEffect(() => {
    const exists = snapshot.sessionPlayers.some((player) => player.id === focusedPlayerId);
    if (!exists) {
      setFocusedPlayerId(getDefaultFocusedPlayerId(snapshot, currentSessionPlayer));
    }
  }, [currentSessionPlayer, focusedPlayerId, snapshot]);

  const playerColumns = useMemo(() => splitPlayerColumns(snapshot.sessionPlayers), [snapshot.sessionPlayers]);

  const focusPlayer = (playerId: string) => {
    setFocusedPlayerId(playerId);
    setIsDossierOpen(true);
  };

  const phaseContent = (
    <>
      {snapshot.phase === "answer_prep" && (
        <AnswerPanel room={room} snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />
      )}
      {snapshot.phase === "answer_reveal" && (
        <RevealPanel
          focusedPlayerId={focusedPlayerId}
          onFocusPlayer={setFocusedPlayerId}
          snapshot={snapshot}
        />
      )}
      {snapshot.phase === "discussion" && (
        <DiscussionPanel
          currentSessionPlayer={currentSessionPlayer}
          focusedPlayerId={focusedPlayerId}
          room={room}
          snapshot={snapshot}
        />
      )}
      {snapshot.phase === "voting" && (
        <VotePanel
          currentSessionPlayer={currentSessionPlayer}
          focusedPlayerId={focusedPlayerId}
          onFocusPlayer={setFocusedPlayerId}
          room={room}
          snapshot={snapshot}
        />
      )}
      {snapshot.phase === "settlement" && <SettlementPanel snapshot={snapshot} />}
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      <TopStatusBar snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />

      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_260px]">
        <aside className="hidden xl:block">
          <PlayerColumn
            currentSessionPlayer={currentSessionPlayer}
            focusedPlayerId={focusedPlayerId}
            onFocusPlayer={focusPlayer}
            players={playerColumns.left}
            snapshot={snapshot}
          />
        </aside>
        <CommandConsole ref={transitionRef}>{phaseContent}</CommandConsole>
        <aside className="hidden xl:block">
          <PlayerColumn
            currentSessionPlayer={currentSessionPlayer}
            focusedPlayerId={focusedPlayerId}
            onFocusPlayer={focusPlayer}
            players={playerColumns.right}
            snapshot={snapshot}
          />
        </aside>
      </div>

      <ActionBar
        focusedPlayerId={focusedPlayerId}
        onOpenDossier={() => setIsDossierOpen(true)}
        snapshot={snapshot}
      />

      <InvestigationSheet
        focusedPlayerId={focusedPlayerId}
        onOpenChange={setIsDossierOpen}
        open={isDossierOpen}
        snapshot={snapshot}
      />
    </div>
  );
}
```

- [ ] **Step 3: Run typecheck to expose prop mismatches**

Run:

```bash
npm run typecheck -w apps/web
```

Expected: FAIL until `InvestigationSheet`, `RevealPanel`, `DiscussionPanel`, and `VotePanel` accept the new props in later tasks.

- [ ] **Step 4: Commit after dependent tasks compile**

Do not commit Task 3 yet. Commit it together with Tasks 4 and 5 after the layout compiles and the phase panels accept their new props.

---

### Task 4: Add the Investigation Sheet

**Files:**
- Create: `apps/web/src/components/game/InvestigationSheet.tsx`
- Modify: `apps/web/src/messages/en-US.json`
- Modify: `apps/web/src/messages/zh-CN.json`

- [ ] **Step 1: Add dossier message keys**

Add this object under `game` in both locale files:

```json
"dossier": {
  "title": "Investigation dossier",
  "description": "Review the focused player's public evidence.",
  "player": "Player",
  "answer": "Answer",
  "discussion": "Discussion",
  "vote": "Vote",
  "history": "History",
  "noPlayer": "No player selected",
  "noAnswer": "No public answer for this round",
  "noMessages": "No messages from this player this round",
  "votesAgainst": "{count} votes against"
}
```

For `zh-CN.json`, use:

```json
"dossier": {
  "title": "调查档案",
  "description": "查看当前焦点玩家的公开证据。",
  "player": "玩家",
  "answer": "答案",
  "discussion": "发言",
  "vote": "投票",
  "history": "历史",
  "noPlayer": "暂无选中玩家",
  "noAnswer": "本轮暂无公开答案",
  "noMessages": "该玩家本轮暂无发言",
  "votesAgainst": "当前被投 {count} 票"
}
```

- [ ] **Step 2: Create the sheet**

Create `apps/web/src/components/game/InvestigationSheet.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import type { WiaiSnapshot } from "@/game-client/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getFocusedPlayer,
  getPlayerAnswer,
  getPlayerMessages,
  getVotesAgainst
} from "./gameViewModel";

type InvestigationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: WiaiSnapshot;
  focusedPlayerId: string;
};

export function InvestigationSheet({
  open,
  onOpenChange,
  snapshot,
  focusedPlayerId
}: InvestigationSheetProps) {
  const t = useTranslations("game.dossier");
  const focusedPlayer = getFocusedPlayer(snapshot, focusedPlayerId);
  const answer = focusedPlayer ? getPlayerAnswer(snapshot, focusedPlayer.id) : undefined;
  const messages = focusedPlayer ? getPlayerMessages(snapshot, focusedPlayer.id) : [];
  const votesAgainst = focusedPlayer ? getVotesAgainst(snapshot, focusedPlayer.id) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>

        {!focusedPlayer ? (
          <p className="p-4 text-sm text-muted-foreground">{t("noPlayer")}</p>
        ) : (
          <Tabs defaultValue="player" className="min-h-0 px-4 pb-4">
            <TabsList>
              <TabsTrigger value="player">{t("player")}</TabsTrigger>
              <TabsTrigger value="answer">{t("answer")}</TabsTrigger>
              <TabsTrigger value="discussion">{t("discussion")}</TabsTrigger>
              <TabsTrigger value="vote">{t("vote")}</TabsTrigger>
            </TabsList>

            <ScrollArea className="mt-3 h-[calc(100vh-12rem)] pr-3">
              <TabsContent value="player">
                <div className="flex flex-col gap-2">
                  <strong>{focusedPlayer.displayName}</strong>
                  <span className="text-sm text-muted-foreground">#{focusedPlayer.gameNumber}</span>
                </div>
              </TabsContent>

              <TabsContent value="answer">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {answer?.content || t("noAnswer")}
                </p>
              </TabsContent>

              <TabsContent value="discussion">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("noMessages")}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {messages.map((message) => (
                      <article className="rounded-lg border border-border bg-input p-3" key={message.id}>
                        <p className="text-sm">{message.content}</p>
                      </article>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="vote">
                <p className="text-sm text-muted-foreground">{t("votesAgainst", { count: votesAgainst })}</p>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run typecheck -w apps/web
```

Expected: FAIL until phase panel prop updates are complete.

---

### Task 5: Migrate Phase Panels Into the Command Console

**Files:**
- Modify: `apps/web/src/components/game/RevealPanel.tsx`
- Modify: `apps/web/src/components/game/DiscussionPanel.tsx`
- Modify: `apps/web/src/components/game/VotePanel.tsx`

- [ ] **Step 1: Update `RevealPanel` props and selected answer logic**

Change `RevealPanelProps` to:

```ts
interface RevealPanelProps {
  snapshot: WiaiSnapshot;
  focusedPlayerId?: string;
  onFocusPlayer?: (playerId: string) => void;
}
```

Inside `RevealPanel`, compute the selected answer:

```ts
const selectedAnswer =
  snapshot.answers.find((answer) => answer.sessionPlayerId === focusedPlayerId) ?? snapshot.answers[0];
const selectedPlayer = snapshot.sessionPlayers.find(
  (player) => player.id === selectedAnswer?.sessionPlayerId
);
```

Render the central selected answer before the existing list:

```tsx
<Card>
  <CardHeader>
    <CardTitle>{t("title")}</CardTitle>
    <CardDescription>{t("hint")}</CardDescription>
  </CardHeader>
  <CardContent className="flex flex-col gap-4">
    <article className="rounded-lg border border-border bg-input p-4">
      <span className="text-xs text-muted-foreground">
        {selectedPlayer ? tGame("player.label", { gameNumber: selectedPlayer.gameNumber }) : tGame("player.unknown")}
      </span>
      <p className="mt-2 text-base leading-relaxed">
        {selectedAnswer?.content || tAnswer("submitted")}
      </p>
    </article>
    <AnswerList snapshot={snapshot} compact />
  </CardContent>
</Card>
```

- [ ] **Step 2: Update `DiscussionPanel` props and focus context**

Add props:

```ts
focusedPlayerId: string;
```

Compute the focused player and answer:

```ts
const focusedPlayer = snapshot.sessionPlayers.find((player) => player.id === focusedPlayerId);
const focusedAnswer = snapshot.answers.find(
  (answer) => answer.roundIndex === snapshot.roundIndex && answer.sessionPlayerId === focusedPlayerId
);
```

Add this focus block above the `ScrollArea`:

```tsx
{focusedPlayer ? (
  <article className="rounded-lg border border-border bg-input p-3">
    <span className="text-xs text-muted-foreground">
      {tGame("player.label", { gameNumber: focusedPlayer.gameNumber })} / {focusedPlayer.displayName}
    </span>
    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
      {focusedAnswer?.content ?? t("empty")}
    </p>
  </article>
) : null}
```

Keep `data-testid="chat-input"` and `data-testid="send-chat"` unchanged.

- [ ] **Step 3: Update `VotePanel` props and player-card candidate selection**

Add props:

```ts
focusedPlayerId: string;
onFocusPlayer: (playerId: string) => void;
```

When a vote option is clicked, update local target and focus:

```tsx
onClick={() => {
  setTargetGameNumber(player.gameNumber);
  onFocusPlayer(player.id);
}}
```

Keep these test IDs unchanged:

```tsx
data-testid={`vote-option-${player.gameNumber}`}
data-testid="cast-vote"
```

Add a central selected-target summary above the candidate grid:

```tsx
{targetGameNumber !== null ? (
  <article className="rounded-lg border border-border bg-input p-3 text-sm text-muted-foreground">
    {t("hint")} #{targetGameNumber}
  </article>
) : null}
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck -w apps/web
```

Expected: PASS.

- [ ] **Step 5: Commit Tasks 3-5**

```bash
git add apps/web/src/components/game/GameClient.tsx apps/web/src/components/game/GameLayout.tsx apps/web/src/components/game/InvestigationSheet.tsx apps/web/src/components/game/RevealPanel.tsx apps/web/src/components/game/DiscussionPanel.tsx apps/web/src/components/game/VotePanel.tsx apps/web/src/messages/en-US.json apps/web/src/messages/zh-CN.json
git commit -m "feat(web): compose live game command console"
```

---

### Task 6: Restrict Phase Motion To the Command Console Wrapper

**Files:**
- Modify: `apps/web/src/animations/usePhaseTransition.ts`

- [ ] **Step 1: Replace the hook implementation**

Use this implementation:

```ts
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function usePhaseTransition(phaseVersion: number) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        { y: 8, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.32, ease: "power2.out", clearProps: "transform,opacity,visibility" }
      );
    }, element);

    return () => ctx.revert();
  }, [phaseVersion]);

  return ref;
}
```

- [ ] **Step 2: Run lint and typecheck**

Run:

```bash
npm run lint -w apps/web
npm run typecheck -w apps/web
```

Expected: both commands PASS.

- [ ] **Step 3: Commit Task 6**

```bash
git add apps/web/src/animations/usePhaseTransition.ts
git commit -m "refactor(web): limit phase motion to console wrapper"
```

---

### Task 7: Preserve Full-Game E2E Flow And Add Layout Assertions

**Files:**
- Modify: `tests/e2e/full-game.spec.ts`
- Modify: game layout components if a required test ID is missing

- [ ] **Step 1: Confirm stable layout test IDs**

Confirm the Task 2 component snippets include these exact attributes:

```text
TopStatusBar root Card: data-testid="game-status-bar"
CommandConsole root Card: data-testid="command-console"
ActionBar root Card: data-testid="game-action-bar"
```

- [ ] **Step 2: Extend the E2E assertions**

In `tests/e2e/full-game.spec.ts`, after `start-game` click and before the round loop, add:

```ts
await expect(page.getByTestId("game-status-bar")).toBeVisible();
await expect(page.getByTestId("command-console")).toBeVisible();
await expect(page.getByTestId("game-action-bar")).toBeVisible();
```

Keep the existing assertions for:

```ts
page.getByTestId("phase-name")
page.getByTestId("answer-input")
page.getByTestId("submit-answer")
page.getByTestId("vote-option-4")
page.getByTestId("cast-vote")
page.getByTestId("settlement-winner")
```

- [ ] **Step 3: Run the web unit tests**

Run:

```bash
npm run test -w apps/web
```

Expected: PASS.

- [ ] **Step 4: Run the full E2E flow**

Run:

```bash
npm run test:e2e -- tests/e2e/full-game.spec.ts
```

Expected: PASS. If the server or web dev server is not already running, Playwright uses `playwright.config.ts` to start the configured web server.

- [ ] **Step 5: Commit Task 7**

```bash
git add tests/e2e/full-game.spec.ts apps/web/src/components/game/TopStatusBar.tsx apps/web/src/components/game/CommandConsole.tsx apps/web/src/components/game/ActionBar.tsx
git commit -m "test(e2e): cover command console game layout"
```

---

### Task 8: Browser Review And Final Verification

**Files:**
- Modify: only files needed to fix issues found during verification

- [ ] **Step 1: Run full repository verification**

Run:

```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e -- tests/e2e/full-game.spec.ts
```

Expected: all commands PASS.

- [ ] **Step 2: Start the development server**

Run:

```bash
npm run dev
```

Expected: web app is available at `http://localhost:3000` and server app is running through the root dev script.

- [ ] **Step 3: Perform desktop browser review**

Open `http://localhost:3000`, create a room, add debug players, and start a game. Verify:

- top status bar is visible and compact
- player columns appear on desktop
- central command console is the largest gameplay region
- bottom action bar is visible
- answer input, chat input, and vote controls remain usable
- no player card exposes hidden role or AI identity

- [ ] **Step 4: Perform mobile browser review**

Use a mobile viewport around `390x844`. Verify:

- the command console appears before secondary context
- desktop-only player columns do not crush the central action
- roster/dossier access remains available through shadcn disclosure UI
- text does not overlap inside buttons, cards, or badges

- [ ] **Step 5: Perform reduced-motion review**

Enable reduced motion in the browser or emulate it with Playwright. Verify:

- phase content remains readable
- phase transitions do not animate
- answer reveal remains visible as static content

- [ ] **Step 6: Final commit**

Commit any verification fixes:

```bash
git add apps/web/src/components/game apps/web/src/animations tests/e2e/full-game.spec.ts apps/web/src/messages
git commit -m "fix(web): polish command console verification issues"
```

If no fixes were required, skip this commit.

---

## Self-Review

- Spec coverage: The plan covers the command-console master layout, 6-8 player side columns, central phase task console, bottom action bar, investigation sheet, hidden-identity rule, shadcn-first styling, and GSAP-minimal motion.
- Test coverage: Pure view-model tests cover derived layout/status behavior; existing full-game E2E remains the primary playable-loop guard; new E2E assertions cover the shell landmarks.
- Type consistency: `focusedPlayerId`, `onFocusPlayer`, `currentSessionPlayer`, and `snapshot` prop names are consistent across planned components.
- Accessibility: Player cards are buttons, sheets include titles and descriptions, existing input and vote controls keep stable labels and test IDs.
- Motion boundary: Only `usePhaseTransition` uses GSAP, and it animates `y` plus `autoAlpha` with cleanup.
