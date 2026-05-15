"use client";

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
  getFocusedPlayer,
  getPlayerAnswer,
  getPlayerMessages,
  getPublicPlayerName,
  getVotesAgainst
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
  const focusedPlayer = getFocusedPlayer(snapshot, focusedPlayerId);
  const answer = focusedPlayer ? getPlayerAnswer(snapshot, focusedPlayer.id) : undefined;
  const messages = focusedPlayer ? getPlayerMessages(snapshot, focusedPlayer.id) : [];
  const votesAgainst = focusedPlayer ? getVotesAgainst(snapshot, focusedPlayer.id) : 0;
  const question = snapshot.questions.find((item) => item.roundIndex === snapshot.roundIndex);
  const publicName = focusedPlayer
    ? getPublicPlayerName(
        focusedPlayer,
        tGame("player.label", { gameNumber: focusedPlayer.gameNumber })
      )
    : "";

  return (
    <Card data-testid="investigation-panel" className="h-full min-h-0">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>

      {!focusedPlayer ? (
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("noPlayer")}</p>
        </CardContent>
      ) : (
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <Tabs defaultValue="player" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger className="text-xs" value="player">{t("player")}</TabsTrigger>
              <TabsTrigger className="text-xs" value="answer">{t("answer")}</TabsTrigger>
              <TabsTrigger className="text-xs" value="discussion">{t("discussion")}</TabsTrigger>
              <TabsTrigger className="text-xs" value="vote">{t("vote")}</TabsTrigger>
              <TabsTrigger className="text-xs" value="history">{t("history")}</TabsTrigger>
            </TabsList>

            <ScrollArea className="mt-3 min-h-0 flex-1 pr-3">
              <TabsContent value="player">
                <div className="flex flex-col gap-2">
                  <strong>{publicName}</strong>
                  <span className="text-sm text-muted-foreground">
                    {tGame("player.label", { gameNumber: focusedPlayer.gameNumber })}
                  </span>
                </div>
              </TabsContent>

              <TabsContent value="answer">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {answer?.content || t("noAnswer")}
                </p>
              </TabsContent>

              <TabsContent value="discussion">
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
              </TabsContent>

              <TabsContent value="vote">
                <p className="text-sm text-muted-foreground">
                  {t("votesAgainst", { count: votesAgainst })}
                </p>
              </TabsContent>

              <TabsContent value="history">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {question?.prompt ?? tGame("question.waiting")}
                </p>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}
