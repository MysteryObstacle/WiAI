"use client";

import { useTranslations } from "next-intl";
import { useRevealTimeline } from "@/animations/useRevealTimeline";
import type { WiaiSnapshot } from "@/game-client/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface RevealPanelProps {
  snapshot: WiaiSnapshot;
  focusedPlayerId?: string;
  onFocusPlayer?: (playerId: string) => void;
}

export function AnswerList({
  snapshot,
  compact = false,
  focusedPlayerId,
  onFocusPlayer
}: RevealPanelProps & { compact?: boolean }) {
  const listRef = useRevealTimeline(snapshot.phaseVersion);
  const tGame = useTranslations("game");
  const tAnswer = useTranslations("game.answer");

  return (
    <ScrollArea className={cn("pr-3", compact ? "h-[300px]" : "max-h-[520px]")}>
      <div className="flex flex-col gap-2.5" ref={listRef}>
        {snapshot.answers.map((answer) => {
          const player = snapshot.sessionPlayers.find((item) => item.id === answer.sessionPlayerId);
          const answerContent = (
            <>
              <span className="text-xs text-muted-foreground">
                {player ? tGame("player.label", { gameNumber: player.gameNumber }) : tGame("player.unknown")}
              </span>
              <p className="mt-1.5 text-foreground">{answer.content || tAnswer("submitted")}</p>
            </>
          );

          if (!onFocusPlayer) {
            return (
              <article className="rounded-lg border border-border bg-input p-3.5" key={answer.id}>
                {answerContent}
              </article>
            );
          }

          return (
            <button
              className={cn(
                "rounded-lg border border-border bg-input p-3.5 text-left transition-colors hover:bg-accent",
                answer.sessionPlayerId === focusedPlayerId && "border-primary bg-accent"
              )}
              key={answer.id}
              type="button"
              onClick={() => onFocusPlayer(answer.sessionPlayerId)}
            >
              {answerContent}
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}

export function RevealPanel({ snapshot, focusedPlayerId, onFocusPlayer }: RevealPanelProps) {
  const t = useTranslations("game.reveal");
  const tGame = useTranslations("game");
  const tAnswer = useTranslations("game.answer");
  const selectedAnswer =
    snapshot.answers.find((answer) => answer.sessionPlayerId === focusedPlayerId) ?? snapshot.answers[0];
  const selectedPlayer = snapshot.sessionPlayers.find(
    (player) => player.id === selectedAnswer?.sessionPlayerId
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("hint")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <article className="rounded-lg border border-border bg-input p-4">
          <span className="text-xs text-muted-foreground">
            {selectedPlayer
              ? tGame("player.label", { gameNumber: selectedPlayer.gameNumber })
              : tGame("player.unknown")}
          </span>
          <p className="mt-2 text-base leading-relaxed">
            {selectedAnswer?.content || tAnswer("submitted")}
          </p>
        </article>
        <AnswerList
          snapshot={snapshot}
          compact
          {...(focusedPlayerId ? { focusedPlayerId } : {})}
          {...(onFocusPlayer ? { onFocusPlayer } : {})}
        />
      </CardContent>
    </Card>
  );
}
