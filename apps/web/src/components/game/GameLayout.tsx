"use client";

import type { Room } from "colyseus.js";
import { useEffect, useMemo, useState } from "react";
import { usePhaseTransition } from "@/animations/usePhaseTransition";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnswerPanel } from "./AnswerPanel";
import { CommandConsole } from "./CommandConsole";
import { DiscussionPanel } from "./DiscussionPanel";
import { getDefaultFocusedPlayerId, sortedPlayers } from "./gameViewModel";
import { InvestigationPanel } from "./InvestigationPanel";
import { PlayerColumn, PlayerRail } from "./PlayerColumns";
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
  const [selectedVoteTargetId, setSelectedVoteTargetId] = useState<string | undefined>();

  useEffect(() => {
    const exists = snapshot.sessionPlayers.some((player) => player.id === focusedPlayerId);
    if (!exists) {
      setFocusedPlayerId(getDefaultFocusedPlayerId(snapshot, currentSessionPlayer));
    }
  }, [currentSessionPlayer, focusedPlayerId, snapshot]);

  useEffect(() => {
    if (snapshot.phase !== "voting") {
      setSelectedVoteTargetId(undefined);
    }
  }, [snapshot.phase]);

  const compactPlayers = useMemo(
    () => sortedPlayers(snapshot.sessionPlayers),
    [snapshot.sessionPlayers]
  );

  const focusPlayer = (playerId: string) => {
    setFocusedPlayerId(playerId);
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
          onSelectVoteTarget={setSelectedVoteTargetId}
          room={room}
          selectedVoteTargetId={selectedVoteTargetId}
          snapshot={snapshot}
        />
      )}
      {snapshot.phase === "settlement" && <SettlementPanel snapshot={snapshot} />}
    </>
  );

  return (
    <div className="flex h-[calc(100vh-2.5rem)] min-h-0 flex-col gap-3 overflow-hidden">
      <TopStatusBar snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />

      <div className="xl:hidden">
        <PlayerRail
          currentSessionPlayer={currentSessionPlayer}
          focusedPlayerId={focusedPlayerId}
          onFocusPlayer={focusPlayer}
          players={compactPlayers}
          snapshot={snapshot}
          testId="player-compact-rail"
        />
      </div>

      <div
        className="grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[260px_minmax(0,1fr)_320px]"
        data-testid="game-command-shell"
      >
        <aside className="hidden min-h-0 lg:block" data-testid="player-left-panel">
          <ScrollArea className="h-full pr-2">
            <PlayerColumn
              currentSessionPlayer={currentSessionPlayer}
              focusedPlayerId={focusedPlayerId}
              onFocusPlayer={focusPlayer}
              players={compactPlayers}
              snapshot={snapshot}
              testId="player-column-left"
            />
          </ScrollArea>
        </aside>
        <CommandConsole ref={transitionRef} className="h-full min-h-0 [&>[data-slot=card]]:h-full">
          {phaseContent}
        </CommandConsole>
        <aside className="min-h-0">
          <InvestigationPanel
            focusedPlayerId={focusedPlayerId}
            snapshot={snapshot}
          />
        </aside>
      </div>
    </div>
  );
}
