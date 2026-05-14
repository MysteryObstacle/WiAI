"use client";

import { useTranslations } from "next-intl";
import type { Room } from "colyseus.js";
import { Vote } from "lucide-react";
import { useState } from "react";
import { sendBallot } from "@/game-client/roomCommands";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlayerNumber } from "./PlayerNumber";
import { cn } from "@/lib/utils";
import { getOwnBallot, getPublicPlayerName } from "./gameViewModel";

interface VotePanelProps {
  room: Room;
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
  focusedPlayerId: string;
  onFocusPlayer: (playerId: string) => void;
}

export function VotePanel({
  room,
  snapshot,
  currentSessionPlayer,
  focusedPlayerId,
  onFocusPlayer
}: VotePanelProps) {
  const t = useTranslations("game.vote");
  const tGame = useTranslations("game");
  const ballotType = snapshot.roundIndex === 2 ? "decision" : "suspicion";
  const ownBallot = getOwnBallot(snapshot, currentSessionPlayer);
  const [targetGameNumber, setTargetGameNumber] = useState<number | null>(null);
  const selectedPlayer = snapshot.sessionPlayers.find((player) =>
    targetGameNumber === null ? player.id === focusedPlayerId : player.gameNumber === targetGameNumber
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ballotType === "decision" ? t("decisionTitle") : t("suspicionTitle")}</CardTitle>
        <CardDescription>{ownBallot ? t("recorded") : t("hint")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {selectedPlayer ? (
          <article className="rounded-lg border border-border bg-input p-3 text-sm text-muted-foreground">
            {t("hint")} #{selectedPlayer.gameNumber}{" "}
            {getPublicPlayerName(
              selectedPlayer,
              tGame("player.label", { gameNumber: selectedPlayer.gameNumber })
            )}
          </article>
        ) : null}
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {snapshot.sessionPlayers
            .filter((player) => player.isActive && player.id !== currentSessionPlayer?.id)
            .map((player) => (
              <button
                data-testid={`vote-option-${player.gameNumber}`}
                className={cn(
                  "flex items-start gap-3 rounded-lg border border-border bg-input p-3.5 text-left transition-colors hover:bg-accent disabled:opacity-50",
                  targetGameNumber === player.gameNumber && "border-warning ring-1 ring-warning/35"
                )}
                key={player.id}
                type="button"
                disabled={Boolean(ownBallot)}
                onClick={() => {
                  setTargetGameNumber(player.gameNumber);
                  onFocusPlayer(player.id);
                }}
              >
                <PlayerNumber number={player.gameNumber} />
                <div>
                  <strong className="block">
                    {getPublicPlayerName(
                      player,
                      tGame("player.label", { gameNumber: player.gameNumber })
                    )}
                  </strong>
                  <small className="text-xs text-muted-foreground">
                    {tGame("player.label", { gameNumber: player.gameNumber })}
                  </small>
                </div>
              </button>
            ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            data-testid="cast-vote"
            disabled={Boolean(ownBallot) || targetGameNumber === null}
            onClick={() => {
              if (targetGameNumber !== null) {
                sendBallot(room, { ballotType, targetGameNumber, abstain: false });
              }
            }}
          >
            <Vote aria-hidden data-icon="inline-start" />
            {t("cast")}
          </Button>
          {ballotType === "suspicion" && (
            <Button
              variant="secondary"
              disabled={Boolean(ownBallot)}
              onClick={() => sendBallot(room, { ballotType: "suspicion", abstain: true })}
            >
              {t("abstain")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
