"use client";

import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import type { WiaiSnapshot } from "@/game-client/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFocusedPlayer } from "./gameViewModel";

type ActionBarProps = {
  snapshot: WiaiSnapshot;
  focusedPlayerId: string;
  onOpenDossier: () => void;
};

export function ActionBar({ snapshot, focusedPlayerId, onOpenDossier }: ActionBarProps) {
  const tCommand = useTranslations("game.command");
  const focusedPlayer = getFocusedPlayer(snapshot, focusedPlayerId);
  const focusLabel = focusedPlayer
    ? `${focusedPlayer.gameNumber} ${focusedPlayer.displayName}`
    : tCommand("noFocus");

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
