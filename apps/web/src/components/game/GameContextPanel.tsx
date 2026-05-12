"use client";

import { useTranslations } from "next-intl";
import type { WiaiSnapshot } from "@/game-client/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "./EmptyState";
import { AnswerList } from "./RevealPanel";

type GameContextPanelProps = {
  snapshot: WiaiSnapshot;
};

const phaseHintKey: Record<WiaiSnapshot["phase"], string> = {
  lobby: "answerPrepHint",
  answer_prep: "answerPrepHint",
  answer_reveal: "answerRevealHint",
  discussion: "discussionHint",
  voting: "votingHint",
  settlement: "settlementHint"
};

export function GameContextPanel({ snapshot }: GameContextPanelProps) {
  const t = useTranslations("game.context");
  const shouldShowAnswers =
    snapshot.answers.length > 0 &&
    (snapshot.phase === "discussion" || snapshot.phase === "voting" || snapshot.phase === "settlement");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t(phaseHintKey[snapshot.phase])}</CardDescription>
      </CardHeader>
      <CardContent>
        {shouldShowAnswers ? <AnswerList snapshot={snapshot} compact /> : <EmptyState message={t(phaseHintKey[snapshot.phase])} />}
      </CardContent>
    </Card>
  );
}
