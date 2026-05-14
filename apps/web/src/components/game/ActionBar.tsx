"use client";

import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import type { WiaiSnapshot } from "@/game-client/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFocusedPlayer, getPublicPlayerName } from "./gameViewModel";

type ActionBarProps = {
  snapshot: WiaiSnapshot;
  focusedPlayerId: string;
  onOpenDossier: () => void;
};

export function ActionBar({ snapshot, focusedPlayerId, onOpenDossier }: ActionBarProps) {
  const tCommand = useTranslations("game.command");
  const tGame = useTranslations("game");
  const focusedPlayer = getFocusedPlayer(snapshot, focusedPlayerId);
  const focusLabel = focusedPlayer ? getFocusedPlayerLabel(focusedPlayer) : tCommand("noFocus");

  function getFocusedPlayerLabel(player: NonNullable<typeof focusedPlayer>) {
    const playerLabel = tGame("player.label", { gameNumber: player.gameNumber });
    const publicName = getPublicPlayerName(player, playerLabel);
    return publicName === playerLabel ? playerLabel : `${playerLabel} / ${publicName}`;
  }

  return (
    <Card
      data-testid="game-action-bar"
      className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="truncate text-sm text-muted-foreground">
        {focusedPlayer ? tCommand("focus", { player: focusLabel }) : tCommand("noFocus")}
      </span>
      <Button type="button" variant="outline" onClick={onOpenDossier}>
        <FileText data-icon="inline-start" />
        {tCommand("openDossier")}
      </Button>
    </Card>
  );
}
