"use client";

import { useTranslations } from "next-intl";
import { Crown } from "lucide-react";
import { useSettlementReveal } from "@/animations/useSettlementReveal";
import type { WiaiSnapshot } from "@/game-client/types";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicPlayerName } from "./gameViewModel";

interface SettlementPanelProps {
  snapshot: WiaiSnapshot;
}

export function SettlementPanel({ snapshot }: SettlementPanelProps) {
  const ref = useSettlementReveal(snapshot.phaseVersion);
  const t = useTranslations("game.settlement");
  const tGame = useTranslations("game");
  const tRole = useTranslations("role");
  const tWinnerSide = useTranslations("winnerSide");
  const frozen = snapshot.sessionPlayers.find((player) => player.id === snapshot.result.frozenSessionPlayerId);
  const winnerLabel = snapshot.result.winnerSide ? tWinnerSide(snapshot.result.winnerSide) : tWinnerSide("undecided");

  return (
    <Card ref={ref}>
      <CardContent className="flex flex-col gap-6 pt-5">
        <div className="settlement-hero flex flex-col items-center gap-2 rounded-lg border border-primary/35 bg-secondary p-7 text-center">
          <Crown aria-hidden className="size-8 text-primary" />
          <span className="text-muted-foreground">{t("winner")}</span>
          <h2 data-testid="settlement-winner" className="text-3xl font-bold capitalize text-primary sm:text-4xl lg:text-5xl">
            {winnerLabel}
          </h2>
          <p className="text-muted-foreground">
            {t("frozenPlayer")}:{" "}
            <strong className="text-foreground">
              {frozen ? getFrozenPlayerLabel() : t("unknown")}
            </strong>
          </p>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {snapshot.sessionPlayers
            .sort((left, right) => left.gameNumber - right.gameNumber)
            .map((player) => (
              <article className="role-card rounded-lg border border-border bg-input p-3.5" key={player.id}>
                <span className="text-xs text-muted-foreground">
                  {tGame("player.label", { gameNumber: player.gameNumber })}
                </span>
                <strong className="mt-1 block">
                  {getPublicPlayerName(
                    player,
                    tGame("player.label", { gameNumber: player.gameNumber })
                  )}
                </strong>
                <p className="mt-1 text-primary">{player.role ? tRole(player.role) : tRole("hidden")}</p>
              </article>
            ))}
        </div>

        <div className="flex flex-col gap-2.5">
          {snapshot.ballots
            .filter((ballot) => ballot.ballotType === "decision")
            .map((ballot) => {
              const actor = snapshot.sessionPlayers.find((player) => player.id === ballot.actorSessionPlayerId);
              const target = snapshot.sessionPlayers.find((player) => player.id === ballot.targetSessionPlayerId);
              return (
                <div
                  className="vote-row flex items-center justify-between rounded-lg border border-border bg-input p-3"
                  key={ballot.id}
                >
                  <span className="text-muted-foreground">
                    {actor ? tGame("player.label", { gameNumber: actor.gameNumber }) : tGame("player.unknown")}
                  </span>
                  <strong className="text-warning">
                    {ballot.abstain
                      ? t("abstained")
                      : target
                        ? tGame("player.label", { gameNumber: target.gameNumber })
                        : tGame("player.unknown")}
                  </strong>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );

  function getFrozenPlayerLabel() {
    if (!frozen) return t("unknown");
    const playerLabel = tGame("player.label", { gameNumber: frozen.gameNumber });
    const publicName = getPublicPlayerName(frozen, playerLabel);
    return publicName === playerLabel ? playerLabel : `${playerLabel} / ${publicName}`;
  }
}
