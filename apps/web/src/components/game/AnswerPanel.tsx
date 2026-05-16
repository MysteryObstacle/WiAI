"use client";

import { useTranslations } from "next-intl";
import type { Room } from "colyseus.js";
import { Check, Send, X } from "lucide-react";
import { useMemo, useState } from "react";
import { sendAnswer, sendCancelAnswer } from "@/game-client/roomCommands";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getSubmittedAnswerCount } from "./gameViewModel";

interface AnswerPanelProps {
  room: Room;
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
}

export function AnswerPanel({ room, snapshot, currentSessionPlayer }: AnswerPanelProps) {
  const t = useTranslations("game.answer");
  const [content, setContent] = useState("");
  const ownAnswer = useMemo(
    () => snapshot.answers.find((answer) => answer.sessionPlayerId === currentSessionPlayer?.id),
    [currentSessionPlayer?.id, snapshot.answers]
  );
  const question = snapshot.questions.find((item) => item.roundIndex === snapshot.roundIndex);
  const submittedCount = getSubmittedAnswerCount(snapshot);
  const draftLength = ownAnswer ? ownAnswer.content.length : content.length;

  return (
    <Card className="h-full min-h-0">
      <CardHeader className="shrink-0">
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{ownAnswer ? t("lockedHint") : t("inputHint")}</CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <section className="rounded-lg border border-border bg-input/50 p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{t("roundTheme")}</Badge>
            <span className="text-xs text-muted-foreground">
              {t("submittedCount", {
                submitted: submittedCount,
                total: snapshot.sessionPlayers.length
              })}
            </span>
          </div>
          <p className="text-base leading-relaxed text-foreground">
            {question?.prompt ?? t("waitingQuestion")}
          </p>
        </section>

        <section className="grid gap-2">
          <span className="text-xs font-medium text-muted-foreground">{t("referenceTitle")}</span>
          <div className="flex flex-wrap gap-2">
            {["concrete", "tradeoff", "emotion", "detail"].map((key) => (
              <Badge className="rounded-md" key={key} variant="secondary">
                {t(`reference.${key}`)}
              </Badge>
            ))}
          </div>
        </section>

        <section className="flex min-h-0 flex-1 flex-col gap-2 rounded-lg border border-border bg-background/60 p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("answerPaper")}</span>
            <span className="font-mono">{draftLength} / 500</span>
          </div>
          <Textarea
            data-testid="answer-input"
            value={ownAnswer ? ownAnswer.content : content}
            disabled={Boolean(ownAnswer)}
            maxLength={500}
            onChange={(event) => setContent(event.target.value)}
            placeholder={t("placeholder")}
            className="min-h-[220px] flex-1 resize-none border-border bg-input/40 p-4 text-base leading-relaxed focus-visible:ring-1"
          />
        </section>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            data-testid="submit-answer"
            disabled={Boolean(ownAnswer) || content.trim().length === 0}
            onClick={() => {
              sendAnswer(room, content);
              setContent("");
            }}
          >
            {ownAnswer ? (
              <Check aria-hidden data-icon="inline-start" />
            ) : (
              <Send aria-hidden data-icon="inline-start" />
            )}
            {ownAnswer ? t("submitted") : t("submit")}
          </Button>
          {ownAnswer && (
            <Button variant="secondary" onClick={() => sendCancelAnswer(room)}>
              <X aria-hidden data-icon="inline-start" />
              {t("cancel")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
