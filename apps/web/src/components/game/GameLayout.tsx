"use client";

import type { Room } from "colyseus.js";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { PhaseHeader } from "./PhaseHeader";
import { AnswerPanel } from "./AnswerPanel";
import { RevealPanel } from "./RevealPanel";
import { DiscussionPanel } from "./DiscussionPanel";
import { VotePanel } from "./VotePanel";
import { SettlementPanel } from "./SettlementPanel";
import { usePhaseTransition } from "@/animations/usePhaseTransition";
import { PlayerRoster } from "./PlayerRoster";
import { GameContextPanel } from "./GameContextPanel";

interface GameLayoutProps {
  room: Room;
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
}

export function GameLayout({ room, snapshot, currentSessionPlayer }: GameLayoutProps) {
  const transitionRef = usePhaseTransition(snapshot.phaseVersion);

  return (
    <div
      className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]"
      ref={transitionRef}
    >
      <PhaseHeader snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />

      <div className="lg:col-start-1 lg:row-start-2">
        <PlayerRoster players={snapshot.sessionPlayers} currentSessionPlayer={currentSessionPlayer} />
      </div>

      <div className="lg:col-start-2 lg:row-start-2 min-w-0">
        {snapshot.phase === "answer_prep" && (
          <AnswerPanel room={room} snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />
        )}
        {snapshot.phase === "answer_reveal" && <RevealPanel snapshot={snapshot} />}
        {snapshot.phase === "discussion" && (
          <DiscussionPanel room={room} snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />
        )}
        {snapshot.phase === "voting" && (
          <VotePanel room={room} snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />
        )}
        {snapshot.phase === "settlement" && <SettlementPanel snapshot={snapshot} />}
      </div>

      <aside className="lg:col-start-3 lg:row-start-2">
        <GameContextPanel snapshot={snapshot} />
      </aside>
    </div>
  );
}
