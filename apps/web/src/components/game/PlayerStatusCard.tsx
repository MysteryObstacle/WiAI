"use client";

import { useTranslations } from "next-intl";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPlayerStatusSummary } from "./gameViewModel";

type PlayerStatusCardProps = {
  player: SessionPlayerSnapshot;
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
  isFocused: boolean;
  onFocus: (playerId: string) => void;
};

const statusDotClass: Record<string, string> = {
  current: "bg-primary",
  topVoted: "bg-destructive",
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
  onFocus
}: PlayerStatusCardProps) {
  const tCommand = useTranslations("game.command");
  const tGame = useTranslations("game");
  const summary = getPlayerStatusSummary(snapshot, player, currentSessionPlayer);
  const playerLabel = tGame("player.label", { gameNumber: player.gameNumber });

  return (
    <button
      className={cn(
        "group flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-3 text-left text-card-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isFocused && "border-primary bg-accent/70",
        summary.isCurrent && "ring-1 ring-primary/25",
        summary.isPreviousRoundTopVoted && "border-destructive/55 bg-destructive/5"
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
            <strong className="truncate text-sm">{playerLabel}</strong>
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

      <span className="grid w-full grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
        <span className="rounded-md bg-input/70 px-2 py-1">
          {tCommand("metrics.speech", { count: summary.speechCount })}
        </span>
        <span className="rounded-md bg-input/70 px-2 py-1">
          {tCommand("metrics.votes", { count: summary.voteCount })}
        </span>
        <span className="rounded-md bg-input/70 px-2 py-1">
          {summary.isSubmitted ? tCommand("metrics.answerSubmitted") : tCommand("metrics.answerMissing")}
        </span>
        <span className="rounded-md bg-input/70 px-2 py-1">
          {summary.hasVoted ? tCommand("metrics.voteSubmitted") : tCommand("metrics.voteMissing")}
        </span>
      </span>
    </button>
  );
}
