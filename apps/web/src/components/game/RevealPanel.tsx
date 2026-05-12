"use client";

import { useTranslations } from "next-intl";
import { useRevealTimeline } from "@/animations/useRevealTimeline";
import type { WiaiSnapshot } from "@/game-client/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RevealPanelProps {
  snapshot: WiaiSnapshot;
}

export function AnswerList({ snapshot, compact = false }: RevealPanelProps & { compact?: boolean }) {
  const listRef = useRevealTimeline(snapshot.phaseVersion);
  const tGame = useTranslations("game");
  const tAnswer = useTranslations("game.answer");

  return (
    <ScrollArea className={compact ? "h-[300px] pr-3" : "max-h-[520px] pr-3"}>
      <div className="space-y-2.5" ref={listRef}>
        {snapshot.answers.map((answer) => {
          const player = snapshot.sessionPlayers.find((item) => item.id === answer.sessionPlayerId);
          return (
            <article className="rounded-lg border border-border bg-input p-3.5" key={answer.id}>
              <span className="text-xs text-muted-foreground">
                {player ? tGame("player.label", { gameNumber: player.gameNumber }) : tGame("player.unknown")}
              </span>
              <p className="mt-1.5 text-foreground">{answer.content || tAnswer("submitted")}</p>
            </article>
          );
        })}
      </div>
    </ScrollArea>
  );
}

export function RevealPanel({ snapshot }: RevealPanelProps) {
  const t = useTranslations("game.reveal");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("hint")}</CardDescription>
      </CardHeader>
      <CardContent>
        <AnswerList snapshot={snapshot} />
      </CardContent>
    </Card>
  );
}
