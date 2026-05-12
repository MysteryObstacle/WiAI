"use client";

import { useTranslations } from "next-intl";
import type { SessionPlayerSnapshot } from "@/game-client/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { PlayerNumber } from "./PlayerNumber";
import { cn } from "@/lib/utils";

type PlayerRosterProps = {
  players: SessionPlayerSnapshot[];
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
};

export function PlayerRoster({ players, currentSessionPlayer }: PlayerRosterProps) {
  const tA11y = useTranslations("a11y");
  const tStatus = useTranslations("status");
  const tPlayerType = useTranslations("playerType");
  const tRole = useTranslations("role");

  return (
    <Card asChild>
      <aside aria-label={tA11y("players")}>
        <CardHeader>
          <CardTitle>{tA11y("players")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {[...players]
            .sort((left, right) => left.gameNumber - right.gameNumber)
            .map((player) => {
              const isCurrent = player.id === currentSessionPlayer?.id;
              const typeLabel = player.playerType === "ai" ? tPlayerType("ai") : tPlayerType("human");
              const roleLabel = player.role ? tRole(player.role) : tRole("hidden");

              return (
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-border bg-input p-3",
                    isCurrent && "border-primary"
                  )}
                  key={player.id}
                >
                  <PlayerNumber number={player.gameNumber} />
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate">{player.displayName}</strong>
                    <span className="block truncate text-sm text-muted-foreground">
                      {typeLabel} / {roleLabel}
                    </span>
                  </div>
                  {isCurrent ? <StatusBadge status="current" label={tStatus("currentPlayer")} /> : null}
                </div>
              );
            })}
        </CardContent>
      </aside>
    </Card>
  );
}
