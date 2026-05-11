"use client";

import { useTranslations } from "next-intl";
import type { Room } from "colyseus.js";
import { Send, X } from "lucide-react";
import { useMemo, useState } from "react";
import { sendAnswer, sendCancelAnswer } from "@/game-client/roomCommands";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{ownAnswer ? t("lockedHint") : t("inputHint")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          data-testid="answer-input"
          value={ownAnswer ? t("submitted") : content}
          disabled={Boolean(ownAnswer)}
          onChange={(event) => setContent(event.target.value)}
          placeholder={t("placeholder")}
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            data-testid="submit-answer"
            disabled={Boolean(ownAnswer) || content.trim().length === 0}
            onClick={() => {
              sendAnswer(room, content);
              setContent("");
            }}
          >
            <Send aria-hidden className="h-4 w-4" />
            {t("submit")}
          </Button>
          {ownAnswer && (
            <Button variant="secondary" onClick={() => sendCancelAnswer(room)}>
              <X aria-hidden className="h-4 w-4" />
              {t("cancel")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
