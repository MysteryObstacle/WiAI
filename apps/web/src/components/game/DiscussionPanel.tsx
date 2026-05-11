"use client";

import { useTranslations } from "next-intl";
import type { Room } from "colyseus.js";
import { Send } from "lucide-react";
import { useState } from "react";
import { sendChat } from "@/game-client/roomCommands";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { RevealPanel } from "./RevealPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "./EmptyState";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DiscussionPanelProps {
  room: Room;
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
}

export function DiscussionPanel({ room, snapshot, currentSessionPlayer }: DiscussionPanelProps) {
  const t = useTranslations("game.discussion");
  const tA11y = useTranslations("a11y");
  const [content, setContent] = useState("");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("hint")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ScrollArea className="h-[360px] pr-4">
            {snapshot.messages.length === 0 ? (
              <EmptyState message={t("empty")} />
            ) : (
              <div className="space-y-2.5">
                {snapshot.messages.map((message) => {
                  const player = snapshot.sessionPlayers.find((item) => item.id === message.sessionPlayerId);
                  return (
                    <article
                      className={cn(
                        "w-fit max-w-[560px] rounded-lg border border-border bg-input p-3",
                        message.sessionPlayerId === currentSessionPlayer?.id && "ml-auto border-accent/45"
                      )}
                      key={message.id}
                    >
                      <span className="text-xs text-muted-foreground">Player {player?.gameNumber ?? "?"}</span>
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
              <Send aria-hidden className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      <RevealPanel snapshot={snapshot} />
    </div>
  );
}
