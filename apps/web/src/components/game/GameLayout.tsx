"use client";

import type { Room } from "colyseus.js";
import { useEffect, useMemo, useState } from "react";
import { usePhaseTransition } from "@/animations/usePhaseTransition";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
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

  const playerColumns = useMemo(
    () => splitPlayerColumns(snapshot.sessionPlayers),
    [snapshot.sessionPlayers]
  );

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
