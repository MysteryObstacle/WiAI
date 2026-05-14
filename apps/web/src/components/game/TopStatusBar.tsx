"use client";

import { Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type TopStatusBarProps = {
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
};

const railPhases: Array<WiaiSnapshot["phase"]> = [
  "answer_prep",
  "answer_reveal",
  "discussion",
  "voting"
];

export function TopStatusBar({ snapshot, currentSessionPlayer }: TopStatusBarProps) {
  const tGame = useTranslations("game");
  const tCommand = useTranslations("game.command");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  const remainingSeconds = Math.max(0, Math.ceil((snapshot.phaseEndsAt - now) / 1000));
  const identity = useMemo(() => {
    if (!currentSessionPlayer) return tGame("identity.spectating");
    return tGame("identity.player", { gameNumber: currentSessionPlayer.gameNumber });
  }, [currentSessionPlayer, tGame]);

  return (
    <Card
      data-testid="game-status-bar"
      className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-sm font-semibold tracking-tight">Who is AI</strong>
          <Badge variant="outline">{tCommand("room", { roomCode: snapshot.roomCode })}</Badge>
          <Badge variant="secondary">{tGame("round", { round: snapshot.roundIndex + 1 })}</Badge>
        </div>
        <div
          className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
          aria-label={tCommand("phaseRail")}
        >
          {railPhases.map((phase) => (
            <span
              className={phase === snapshot.phase ? "text-foreground" : "text-muted-foreground"}
              key={phase}
            >
              {tGame(`phase.${phase}`)}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:justify-end">
        <strong data-testid="phase-name" className="text-base">
          {tGame(`phase.${snapshot.phase}`)}
        </strong>
        <span className="inline-flex items-center gap-2 font-mono text-sm">
          <Timer aria-hidden />
          {snapshot.phase === "settlement"
            ? tGame("final")
            : tGame("countdown", { seconds: remainingSeconds })}
        </span>
        <span className="text-sm text-muted-foreground">{identity}</span>
      </div>
    </Card>
  );
}
