"use client";

import { useTranslations } from "next-intl";
import { Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { Card } from "@/components/ui/card";

interface PhaseHeaderProps {
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
}

export function PhaseHeader({ snapshot, currentSessionPlayer }: PhaseHeaderProps) {
  const t = useTranslations("game");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  const remainingSeconds = Math.max(0, Math.ceil((snapshot.phaseEndsAt - now) / 1000));
  const question = snapshot.questions[0];

  const identity = useMemo(() => {
    if (!currentSessionPlayer) {
      return t("identity.spectating");
    }
    return t("identity.player", { gameNumber: currentSessionPlayer.gameNumber });
  }, [currentSessionPlayer, t]);

  const phaseLabel = t(`phase.${snapshot.phase}`);

  return (
    <Card className="p-5 lg:col-span-3">
      <header className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("round", { round: snapshot.roundIndex + 1 })}
          </span>
          <h1 data-testid="phase-name" className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {phaseLabel}
          </h1>
          <p className="max-w-3xl text-muted-foreground leading-relaxed">
            {question?.prompt ?? t("question.waiting")}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end whitespace-nowrap">
          <span className="text-muted-foreground">{identity}</span>
          <strong className="inline-flex items-center gap-2 font-mono text-lg">
            <Timer aria-hidden className="h-4 w-4" />
            {snapshot.phase === "settlement" ? t("final") : t("countdown", { seconds: remainingSeconds })}
          </strong>
        </div>
      </header>
    </Card>
  );
}
