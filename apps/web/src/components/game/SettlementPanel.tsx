"use client";

import { useTranslations } from "next-intl";
import { Crown } from "lucide-react";
import { useSettlementReveal } from "@/animations/useSettlementReveal";
import type { WiaiSnapshot } from "@/game-client/types";
import { Card, CardContent } from "@/components/ui/card";
import { PlayerNumber } from "./PlayerNumber";

interface SettlementPanelProps {
  snapshot: WiaiSnapshot;
}

export function SettlementPanel({ snapshot }: SettlementPanelProps) {
  const ref = useSettlementReveal(snapshot.phaseVersion);
  const t = useTranslations("game.settlement");
  const frozen = snapshot.sessionPlayers.find((player) => player.id === snapshot.result.frozenSessionPlayerId);

  return (
    <Card ref={ref}>
      <CardContent className="space-y-6 pt-5">
        <div className="flex flex-col items-center gap-2 rounded-lg border border-accent/35 bg-[#0d171b] p-7 text-center">
          <Crown aria-hidden className="h-8 w-8 text-accent" />
          <span className="text-muted-foreground">{t("winner")}</span>
          <h2 data-testid="settlement-winner" className="text-3xl font-bold capitalize text-accent-strong sm:text-4xl lg:text-5xl">
            {snapshot.result.winnerSide || t("undecided")}
          </h2>
          <p className="text-muted-foreground">
            {t("frozenPlayer")}:{" "}
            <strong className="text-foreground">
              {frozen ? `Player ${frozen.gameNumber} / ${frozen.displayName}` : t("unknown")}
            </strong>
          </p>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {snapshot.sessionPlayers
            .sort((left, right) => left.gameNumber - right.gameNumber)
            .map((player) => (
              <article className="rounded-lg border border-border bg-input p-3.5" key={player.id}>
                <span className="text-xs text-muted-foreground">Player {player.gameNumber}</span>
                <strong className="mt-1 block">{player.displayName}</strong>
                <p className="mt-1 capitalize text-accent-strong">{player.role || "hidden"}</p>
              </article>
            ))}
        </div>

        <div className="space-y-2.5">
          {snapshot.ballots
            .filter((ballot) => ballot.ballotType === "decision")
            .map((ballot) => {
              const actor = snapshot.sessionPlayers.find((player) => player.id === ballot.actorSessionPlayerId);
              const target = snapshot.sessionPlayers.find((player) => player.id === ballot.targetSessionPlayerId);
              return (
                <div
                  className="flex items-center justify-between rounded-lg border border-border bg-input p-3"
                  key={ballot.id}
                >
                  <span className="text-muted-foreground">Player {actor?.gameNumber ?? "?"}</span>
                  <strong className="text-warning">
                    {ballot.abstain ? t("abstained") : `Player ${target?.gameNumber ?? "?"}`}
                  </strong>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
