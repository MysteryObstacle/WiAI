"use client";

import { useTranslations } from "next-intl";
import type { WiaiSnapshot } from "@/game-client/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getFocusedPlayer,
  getPlayerAnswer,
  getPlayerMessages,
  getPublicPlayerName,
  getVotesAgainst
} from "./gameViewModel";

type InvestigationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: WiaiSnapshot;
  focusedPlayerId: string;
};

export function InvestigationSheet({
  open,
  onOpenChange,
  snapshot,
  focusedPlayerId
}: InvestigationSheetProps) {
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>

        {!focusedPlayer ? (
          <p className="p-4 text-sm text-muted-foreground">{t("noPlayer")}</p>
        ) : (
          <Tabs defaultValue="player" className="min-h-0 px-4 pb-4">
            <TabsList>
              <TabsTrigger value="player">{t("player")}</TabsTrigger>
              <TabsTrigger value="answer">{t("answer")}</TabsTrigger>
              <TabsTrigger value="discussion">{t("discussion")}</TabsTrigger>
              <TabsTrigger value="vote">{t("vote")}</TabsTrigger>
              <TabsTrigger value="history">{t("history")}</TabsTrigger>
            </TabsList>

            <ScrollArea className="mt-3 h-[calc(100vh-12rem)] pr-3">
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
        )}
      </SheetContent>
    </Sheet>
  );
}
