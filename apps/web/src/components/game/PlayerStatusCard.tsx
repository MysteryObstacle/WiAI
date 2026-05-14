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
