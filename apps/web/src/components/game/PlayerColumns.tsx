"use client";

import { useTranslations } from "next-intl";
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
  const tCommand = useTranslations("game.command");

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
      <div className="mt-1 rounded-lg border border-border bg-card/70 p-3 text-xs text-muted-foreground">
        <div className="mb-2 font-medium text-foreground">{tCommand("legend.title")}</div>
        <div className="grid gap-1.5">
          <LegendItem className="bg-emerald-400" label={tCommand("legend.done")} />
          <LegendItem className="bg-warning" label={tCommand("legend.waiting")} />
          <LegendItem className="bg-destructive" label={tCommand("legend.topVoted")} />
          <LegendItem className="bg-muted-foreground" label={tCommand("legend.inactive")} />
        </div>
      </div>
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

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`size-1.5 rounded-full ${className}`} aria-hidden />
      {label}
    </span>
  );
}
