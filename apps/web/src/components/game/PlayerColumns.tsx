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
