"use client";

import { useTranslations } from "next-intl";
import type { Room } from "colyseus.js";
import { Send } from "lucide-react";
import { useState } from "react";
import { sendChat } from "@/game-client/roomCommands";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "./EmptyState";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getPublicPlayerName } from "./gameViewModel";

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
  const focusedName = focusedPlayer
    ? getPublicPlayerName(focusedPlayer, focusedPlayerLabel)
    : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("hint")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {focusedPlayer ? (
          <article className="rounded-lg border border-border bg-input p-3">
            <span className="text-xs text-muted-foreground">
              {focusedName === focusedPlayerLabel
                ? focusedPlayerLabel
                : `${focusedPlayerLabel} / ${focusedName}`}
            </span>
            <p className="mt-2 text-sm text-muted-foreground">
              {focusedAnswer?.content ?? t("empty")}
            </p>
          </article>
        ) : null}
        <ScrollArea className="h-[420px] pr-4">
          {snapshot.messages.length === 0 ? (
            <EmptyState message={t("empty")} />
          ) : (
            <div className="flex flex-col gap-2.5">
              {snapshot.messages.map((message) => {
                const player = snapshot.sessionPlayers.find((item) => item.id === message.sessionPlayerId);
                return (
                  <article
                    className={cn(
                      "w-fit max-w-[560px] rounded-lg border border-border bg-input p-3",
                      message.sessionPlayerId === currentSessionPlayer?.id && "ml-auto border-primary/45"
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
