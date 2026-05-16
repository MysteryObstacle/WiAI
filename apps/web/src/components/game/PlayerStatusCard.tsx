"use client";

import { useTranslations } from "next-intl";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPlayerStatusSummary, getPublicPlayerName } from "./gameViewModel";

type PlayerStatusCardProps = {
  player: SessionPlayerSnapshot;
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
  isFocused: boolean;
  selectedPlayerId?: string | undefined;
  onFocus: (playerId: string) => void;
};

const statusDotClass: Record<string, string> = {
  current: "bg-primary",
  selected: "bg-destructive",
  submitted: "bg-emerald-400",
  waiting: "bg-warning",
  spoke: "bg-primary",
  voted: "bg-emerald-400",
  inactive: "bg-muted-foreground"
};

export function PlayerStatusCard({
  player,
  snapshot,
  currentSessionPlayer,
  isFocused,
  selectedPlayerId,
  onFocus
}: PlayerStatusCardProps) {
  const tCommand = useTranslations("game.command");
  const tGame = useTranslations("game");
  const summary = getPlayerStatusSummary(snapshot, player, currentSessionPlayer, selectedPlayerId);
  const publicName = getPublicPlayerName(
    player,
    tGame("player.label", { gameNumber: player.gameNumber })
  );

  return (
    <button
      className={cn(
        "group flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-3 text-left text-card-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isFocused && "border-primary bg-accent/70",
        summary.isCurrent && "ring-1 ring-primary/25",
        summary.isSelected && "border-destructive/70 bg-destructive/5 ring-1 ring-destructive/20"
      )}
      type="button"
      onClick={() => onFocus(player.id)}
    >
      <span className="flex w-full items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-input font-mono text-sm">
          {player.gameNumber}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-2">
            <strong className="truncate text-sm">{publicName}</strong>
            {summary.isCurrent ? <Badge variant="outline">{tCommand("you")}</Badge> : null}
          </span>
          <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={cn("size-1.5 rounded-full", statusDotClass[summary.status])}
              aria-hidden
            />
            {tCommand(`status.${summary.status}`)}
          </span>
        </span>
      </span>

      <span className="grid w-full grid-cols-3 gap-1.5 text-[11px] text-muted-foreground">
        <span className="rounded-md bg-input/70 px-2 py-1">
          {tCommand("metrics.speech", { count: summary.speechCount })}
        </span>
        <span className="rounded-md bg-input/70 px-2 py-1">
          {tCommand("metrics.mentions", { count: summary.mentionCount })}
        </span>
        <span className="rounded-md bg-input/70 px-2 py-1">
          {tCommand("metrics.votes", { count: summary.voteCount })}
        </span>
      </span>

      <span className="flex w-full items-center gap-2">
        <span className="text-[11px] text-muted-foreground">{tCommand("metrics.heat")}</span>
        <span className="flex gap-1" aria-hidden>
          {Array.from({ length: 3 }, (_, index) => (
            <span
              className={cn(
                "h-1.5 w-5 rounded-full bg-muted",
                summary.heat > index && "bg-destructive"
              )}
              key={index}
            />
          ))}
        </span>
      </span>
    </button>
  );
}
