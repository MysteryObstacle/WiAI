"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Eye } from "lucide-react";
import { useRevealTimeline } from "@/animations/useRevealTimeline";
import type { WiaiSnapshot } from "@/game-client/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { answersForRound } from "./gameViewModel";

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
  const tReveal = useTranslations("game.reveal");
  const answers = answersForRound(snapshot);

  return (
    <ScrollArea className={cn("pr-3", compact ? "h-[300px]" : "max-h-[520px]")}>
      <div className={cn("grid gap-2.5", compact ? "grid-cols-1" : "sm:grid-cols-2")} ref={listRef}>
        {answers.map((answer, index) => {
          const player = snapshot.sessionPlayers.find((item) => item.id === answer.sessionPlayerId);
          const playerLabel = player
            ? tGame("player.label", { gameNumber: player.gameNumber })
            : tGame("player.unknown");
          const answerContent = (
            <>
              <span className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{tReveal("answerNumber", { number: index + 1 })}</span>
                <span>{playerLabel}</span>
              </span>
              <strong className="mt-2 block truncate text-sm">{playerLabel}</strong>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                {answer.content || tAnswer("submitted")}
              </p>
              <span className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                <Eye className="size-3" aria-hidden />
                {tReveal("answerMeta", { count: answer.content.length })}
              </span>
            </>
          );

          if (!onFocusPlayer) {
            return (
              <article className="rounded-lg border border-border bg-input/50 p-3.5" key={answer.id}>
                {answerContent}
              </article>
            );
          }

          return (
            <button
              className={cn(
                "rounded-lg border border-border bg-input/50 p-3.5 text-left transition-colors hover:bg-accent",
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
  const answers = answersForRound(snapshot);
  const selectedAnswer =
    answers.find((answer) => answer.sessionPlayerId === focusedPlayerId) ?? answers[0];
  const selectedPlayer = snapshot.sessionPlayers.find(
    (player) => player.id === selectedAnswer?.sessionPlayerId
  );
  const selectedIndex = Math.max(
    0,
    answers.findIndex((answer) => answer.id === selectedAnswer?.id)
  );
  const selectedPlayerLabel = selectedPlayer
    ? tGame("player.label", { gameNumber: selectedPlayer.gameNumber })
    : tGame("player.unknown");

  const focusByOffset = (offset: number) => {
    if (!onFocusPlayer || answers.length === 0) return;
    const nextIndex = (selectedIndex + offset + answers.length) % answers.length;
    const nextAnswer = answers[nextIndex];
    if (nextAnswer) {
      onFocusPlayer(nextAnswer.sessionPlayerId);
    }
  };

  return (
    <Card className="h-full min-h-0">
      <CardHeader className="shrink-0">
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("hint")}</CardDescription>
      </CardHeader>
      <CardContent className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)]">
        <section className="min-h-0">
          <div className="mb-2 flex items-center justify-between">
            <strong className="text-sm">{t("answerWall")}</strong>
            <Badge variant="outline">{answers.length}</Badge>
          </div>
          <AnswerList
            snapshot={snapshot}
            compact
            {...(focusedPlayerId ? { focusedPlayerId } : {})}
            {...(onFocusPlayer ? { onFocusPlayer } : {})}
          />
        </section>

        <section className="flex min-h-0 flex-col gap-4">
          <article className="min-h-0 flex-1 rounded-lg border border-border bg-input/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {t("currentViewing", { player: selectedPlayerLabel })}
              </span>
              <Badge variant="secondary">{t("answerMeta", { count: selectedAnswer?.content.length ?? 0 })}</Badge>
            </div>
            <p className="mt-4 text-base leading-relaxed">
            {selectedAnswer?.content || tAnswer("submitted")}
            </p>
          </article>

          <div className="flex flex-wrap gap-2">
            {["template", "thinDetail", "tooRational", "real"].map((key) => (
              <Badge
                className={cn(
                  "rounded-md",
                  key === "real" ? "border-emerald-400/50 text-emerald-300" : "border-destructive/45 text-destructive"
                )}
                key={key}
                variant="outline"
              >
                {t(`tags.${key}`)}
              </Badge>
            ))}
          </div>

          <div className="flex justify-between gap-3">
            <Button variant="secondary" onClick={() => focusByOffset(-1)} disabled={answers.length < 2}>
              <ArrowLeft aria-hidden data-icon="inline-start" />
              {t("previous")}
            </Button>
            <Button variant="secondary" onClick={() => focusByOffset(1)} disabled={answers.length < 2}>
              {t("next")}
              <ArrowRight aria-hidden data-icon="inline-end" />
            </Button>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
