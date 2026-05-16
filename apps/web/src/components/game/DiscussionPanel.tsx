"use client";

import { useTranslations } from "next-intl";
import type { Room } from "colyseus.js";
import { Send } from "lucide-react";
import { useState } from "react";
import { sendChat } from "@/game-client/roomCommands";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "./EmptyState";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  getPlayerMentionCount,
  getVotesAgainst,
  messagesForRound
} from "./gameViewModel";

interface DiscussionPanelProps {
  room: Room;
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
  focusedPlayerId: string;
}

export function DiscussionPanel({ room, snapshot, currentSessionPlayer, focusedPlayerId }: DiscussionPanelProps) {
  const t = useTranslations("game.discussion");
  const tGame = useTranslations("game");
  const tA11y = useTranslations("a11y");
  const [content, setContent] = useState("");
  const focusedPlayer = snapshot.sessionPlayers.find((player) => player.id === focusedPlayerId);
  const focusedAnswer = snapshot.answers.find(
    (answer) => answer.roundIndex === snapshot.roundIndex && answer.sessionPlayerId === focusedPlayerId
  );
  const focusedPlayerLabel = focusedPlayer
    ? tGame("player.label", { gameNumber: focusedPlayer.gameNumber })
    : "";
  const roundMessages = messagesForRound(snapshot);
  const relatedMessages = focusedPlayer
    ? roundMessages.filter(
        (message) =>
          message.sessionPlayerId === focusedPlayer.id ||
          mentionsPlayer(message.content, focusedPlayer)
      )
    : roundMessages;
  const mentionCount = focusedPlayer ? getPlayerMentionCount(snapshot, focusedPlayer) : 0;
  const voteCount = focusedPlayer ? getVotesAgainst(snapshot, focusedPlayer.id) : 0;
  const quickReplies = ["agree", "challenge", "ask", "example"] as const;

  return (
    <Card className="h-full min-h-0">
      <CardHeader className="shrink-0">
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("hint")}</CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        {focusedPlayer ? (
          <section className="grid gap-3 rounded-lg border border-border bg-input/50 p-4 md:grid-cols-[1fr_auto]">
            <div>
              <span className="text-xs text-muted-foreground">
                {t("currentFocus")}
              </span>
              <h3 className="mt-1 text-lg font-semibold">{focusedPlayerLabel}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {focusedAnswer?.content ?? t("empty")}
              </p>
            </div>
            <div className="grid min-w-36 grid-cols-2 gap-2 md:grid-cols-1">
              <Badge variant="outline">{t("mentioned", { count: mentionCount })}</Badge>
              <Badge variant="outline">{t("votes", { count: voteCount })}</Badge>
            </div>
          </section>
        ) : null}
        <ScrollArea className="min-h-0 flex-1 pr-4">
          {relatedMessages.length === 0 ? (
            <EmptyState message={t("empty")} />
          ) : (
            <div className="flex flex-col gap-2.5">
              {relatedMessages.map((message) => {
                const player = snapshot.sessionPlayers.find((item) => item.id === message.sessionPlayerId);
                const isMentioned =
                  focusedPlayer && message.sessionPlayerId !== focusedPlayer.id
                    ? mentionsPlayer(message.content, focusedPlayer)
                    : false;
                return (
                  <article
                    className={cn(
                      "w-fit max-w-[640px] rounded-lg border border-border bg-input/50 p-3",
                      message.sessionPlayerId === currentSessionPlayer?.id && "ml-auto border-primary/45",
                      isMentioned && "border-destructive/45"
                    )}
                    key={message.id}
                  >
                    <span className="text-xs text-muted-foreground">
                      {player ? tGame("player.label", { gameNumber: player.gameNumber }) : tGame("player.unknown")}
                    </span>
                    <p className="mt-1 text-foreground">{message.content}</p>
                  </article>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <div className="flex flex-wrap gap-2">
          {quickReplies.map((key) => (
            <Button
              key={key}
              size="sm"
              type="button"
              variant="secondary"
              onClick={() => setContent(t(`quick.${key}`))}
            >
              {t(`quick.${key}`)}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Input
            data-testid="chat-input"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={t("placeholder")}
          />
          <Button
            data-testid="send-chat"
            size="icon"
            aria-label={tA11y("sendChat")}
            disabled={content.trim().length === 0}
            onClick={() => {
              sendChat(room, content);
              setContent("");
            }}
          >
            <Send aria-hidden data-icon="inline-start" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function mentionsPlayer(content: string, player: SessionPlayerSnapshot) {
  return new RegExp(`(^|[^0-9])#?${player.gameNumber}(号|\\b)`, "i").test(content);
}
