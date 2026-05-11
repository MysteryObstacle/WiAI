"use client";

import { useTranslations } from "next-intl";
import { useRevealTimeline } from "@/animations/useRevealTimeline";
import type { WiaiSnapshot } from "@/game-client/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface RevealPanelProps {
  snapshot: WiaiSnapshot;
}

export function RevealPanel({ snapshot }: RevealPanelProps) {
  const listRef = useRevealTimeline(snapshot.phaseVersion);
  const t = useTranslations("game.reveal");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("hint")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5" ref={listRef}>
          {snapshot.answers.map((answer) => {
            const player = snapshot.sessionPlayers.find((item) => item.id === answer.sessionPlayerId);
            return (
              <article className="rounded-lg border border-border bg-input p-3.5" key={answer.id}>
                <span className="text-xs text-muted-foreground">Player {player?.gameNumber ?? "?"}</span>
                <p className="mt-1.5 text-foreground">{answer.content || "Submitted"}</p>
              </article>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
