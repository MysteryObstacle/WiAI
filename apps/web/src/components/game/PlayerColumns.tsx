"use client";

import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { PlayerStatusCard } from "./PlayerStatusCard";

type PlayerColumnProps = {
  players: SessionPlayerSnapshot[];
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
  focusedPlayerId: string;
  onFocusPlayer: (playerId: string) => void;
  testId?: string;
};

export function PlayerColumn({
  players,
  snapshot,
  currentSessionPlayer,
  focusedPlayerId,
  onFocusPlayer,
  testId
}: PlayerColumnProps) {
  return (
    <div className="flex flex-col gap-3" data-testid={testId}>
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

export function PlayerRail({
  players,
  snapshot,
  currentSessionPlayer,
  focusedPlayerId,
  onFocusPlayer,
  testId
}: PlayerColumnProps) {
  return (
    <div className="overflow-x-auto pb-1" data-testid={testId}>
      <div className="flex w-max gap-3">
        {players.map((player) => (
          <div className="w-[220px]" key={player.id}>
            <PlayerStatusCard
              currentSessionPlayer={currentSessionPlayer}
              isFocused={player.id === focusedPlayerId}
              onFocus={onFocusPlayer}
              player={player}
              snapshot={snapshot}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
