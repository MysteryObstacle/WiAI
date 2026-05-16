"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { WiaiSnapshot } from "@/game-client/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  answersForRound,
  ballotsForRound,
  getDefaultDossierTab,
  getFocusedPlayer,
  getPlayerAnswer,
  getPlayerMessages,
  getPlayerStatusSummary,
  getPublicPlayerName,
  getVotesAgainst,
  messagesForRound,
  type DossierTab
} from "./gameViewModel";

type InvestigationPanelProps = {
  snapshot: WiaiSnapshot;
  focusedPlayerId: string;
};

export function InvestigationPanel({
  snapshot,
  focusedPlayerId
}: InvestigationPanelProps) {
  const t = useTranslations("game.dossier");
  const tGame = useTranslations("game");
  const tCommand = useTranslations("game.command");
  const defaultTab = getDefaultDossierTab(snapshot.phase);
  const [tab, setTab] = useState<DossierTab>(defaultTab);
  const focusedPlayer = getFocusedPlayer(snapshot, focusedPlayerId);
  const answer = focusedPlayer ? getPlayerAnswer(snapshot, focusedPlayer.id) : undefined;
  const messages = focusedPlayer ? getPlayerMessages(snapshot, focusedPlayer.id) : [];
  const votesAgainst = focusedPlayer ? getVotesAgainst(snapshot, focusedPlayer.id) : 0;
  const question = snapshot.questions.find((item) => item.roundIndex === snapshot.roundIndex);
  const roundAnswers = answersForRound(snapshot);
  const roundMessages = messagesForRound(snapshot);
  const roundBallots = ballotsForRound(snapshot);
  const statusSummary = focusedPlayer
    ? getPlayerStatusSummary(snapshot, focusedPlayer, undefined, undefined)
    : undefined;
  const publicName = focusedPlayer
    ? getPublicPlayerName(
        focusedPlayer,
        tGame("player.label", { gameNumber: focusedPlayer.gameNumber })
      )
    : "";

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab, focusedPlayerId]);

  return (
    <Card data-testid="investigation-panel" className="h-full min-h-0">
      <CardHeader className="shrink-0">
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {focusedPlayer ? `${t("focused")}: ${publicName}` : t("description")}
        </CardDescription>
      </CardHeader>

      {!focusedPlayer ? (
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("noPlayer")}</p>
        </CardContent>
      ) : (
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as DossierTab)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger className="text-xs" value="player">{t("player")}</TabsTrigger>
              <TabsTrigger className="text-xs" value="answer">{t("answer")}</TabsTrigger>
              <TabsTrigger className="text-xs" value="discussion">{t("discussion")}</TabsTrigger>
              <TabsTrigger className="text-xs" value="vote">{t("vote")}</TabsTrigger>
              <TabsTrigger className="text-xs" value="history">{t("history")}</TabsTrigger>
            </TabsList>

            <ScrollArea className="mt-3 min-h-0 flex-1 pr-3">
              <TabsContent value="player" className="mt-0">
                <div className="flex flex-col gap-3">
                  <div className="rounded-lg border border-border bg-input/50 p-3">
                    <strong>{publicName}</strong>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {tGame("player.label", { gameNumber: focusedPlayer.gameNumber })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <Metric label={tCommand("metrics.speech", { count: statusSummary?.speechCount ?? 0 })} />
                    <Metric label={tCommand("metrics.mentions", { count: statusSummary?.mentionCount ?? 0 })} />
                    <Metric label={tCommand("metrics.votes", { count: statusSummary?.voteCount ?? 0 })} />
                    <Metric label={`${tCommand("metrics.heat")} ${statusSummary?.heat ?? 0}/3`} />
                  </div>
                  <article className="rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-muted-foreground">
                    <strong className="mb-1 block text-foreground">{t("roundTask")}</strong>
                    {question?.prompt ?? tGame("question.waiting")}
                  </article>
                </div>
              </TabsContent>

              <TabsContent value="answer" className="mt-0">
                <div className="flex flex-col gap-3">
                  <article className="rounded-lg border border-border bg-input/50 p-3">
                    <strong className="text-sm">{t("currentAnswer")}</strong>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {answer?.content || t("noAnswer")}
                    </p>
                  </article>
                  <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
                    {t("answerProgress", { count: roundAnswers.length, total: snapshot.sessionPlayers.length })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="discussion" className="mt-0">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("noMessages")}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {messages.map((message) => (
                      <article className="rounded-lg border border-border bg-input p-3" key={message.id}>
                        <p className="text-sm">{message.content}</p>
                      </article>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  {t("messageProgress", { count: roundMessages.length })}
                </p>
              </TabsContent>

              <TabsContent value="vote" className="mt-0">
                <div className="flex flex-col gap-3">
                  <article className="rounded-lg border border-border bg-input/50 p-3">
                    <strong className="text-2xl">{votesAgainst}</strong>
                    <span className="ml-2 text-sm text-muted-foreground">{t("votesAgainst", { count: votesAgainst })}</span>
                  </article>
                  <div className="flex flex-col gap-2">
                    {roundBallots.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t("noVotes")}</p>
                    ) : (
                      roundBallots.map((ballot) => {
                        const actor = snapshot.sessionPlayers.find(
                          (player) => player.id === ballot.actorSessionPlayerId
                        );
                        const target = snapshot.sessionPlayers.find(
                          (player) => player.id === ballot.targetSessionPlayerId
                        );

                        return (
                          <article className="rounded-lg border border-border bg-card p-3 text-xs" key={ballot.id}>
                            <span className="text-muted-foreground">
                              {actor
                                ? tGame("player.label", { gameNumber: actor.gameNumber })
                                : tGame("player.unknown")}
                            </span>
                            <span className="px-2 text-muted-foreground">-&gt;</span>
                            <span>
                              {ballot.abstain
                                ? t("abstained")
                                : target
                                  ? tGame("player.label", { gameNumber: target.gameNumber })
                                  : tGame("player.unknown")}
                            </span>
                          </article>
                        );
                      })
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
                  <article className="rounded-lg border border-border bg-input/50 p-3">
                    <strong className="mb-1 block text-foreground">{t("roundQuestion")}</strong>
                    {question?.prompt ?? tGame("question.waiting")}
                  </article>
                  <article className="rounded-lg border border-border bg-card p-3">
                    {t("historySummary", {
                      answers: roundAnswers.length,
                      messages: roundMessages.length,
                      votes: roundBallots.length
                    })}
                  </article>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}

function Metric({ label }: { label: string }) {
  return <span className="rounded-md border border-border bg-card px-2 py-1.5">{label}</span>;
}
