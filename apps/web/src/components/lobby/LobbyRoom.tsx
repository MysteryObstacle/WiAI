"use client";

import { useTranslations } from "next-intl";
import type { Room } from "colyseus.js";
import { Check, Clipboard, Play, ShieldAlert, UserPlus } from "lucide-react";
import { sendAddDebugPlayers, sendReady, sendStartGame } from "@/game-client/roomCommands";
import type { LobbyPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/game/StatusBadge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface LobbyRoomProps {
  room: Room;
  snapshot: WiaiSnapshot;
  currentLobbyPlayer: LobbyPlayerSnapshot | undefined;
}

export function LobbyRoom({ room, snapshot, currentLobbyPlayer }: LobbyRoomProps) {
  const t = useTranslations();
  const tLobby = useTranslations("lobby");
  const tStatus = useTranslations("status");

  const isHost = Boolean(currentLobbyPlayer?.isHost);
  const nonHostPlayers = snapshot.lobbyPlayers.filter((player) => !player.isHost);
  const playersReady = nonHostPlayers.every((player) => player.isReady);
  const minPlayers = 3;
  const maxPlayers = 6;
  const onlinePlayerCount = snapshot.lobbyPlayers.filter((player) => player.status === "online").length;
  const enoughPlayers = onlinePlayerCount >= minPlayers;
  const canStart = isHost && playersReady && enoughPlayers;
  const debugPlayersToAdd = Math.max(0, minPlayers - onlinePlayerCount);
  const canAddDebugPlayers = isHost && debugPlayersToAdd > 0 && onlinePlayerCount < maxPlayers;
  const showDebugControls = process.env.NODE_ENV === "development" && isHost && snapshot.phase === "lobby";

  const disabledReason = !isHost
    ? tLobby("start.disabledReasons.notHost")
    : !enoughPlayers
      ? tLobby("start.disabledReasons.notEnoughPlayers")
      : !playersReady
        ? tLobby("start.disabledReasons.playersNotReady")
        : tLobby("start.disabledReasons.ready");

  const getPlayerStatus = (player: LobbyPlayerSnapshot) => {
    if (player.isHost) return tStatus("host");
    if (player.isReady) return tLobby("ready.ready");
    return tLobby("ready.waiting");
  };

  const getStatusBadgeStatus = (player: LobbyPlayerSnapshot): "host" | "ready" | "waiting" => {
    if (player.isHost) return "host";
    if (player.isReady) return "ready";
    return "waiting";
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-input p-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {tLobby("room.roomCode")}
            </span>
            <strong data-testid="room-code" className="mt-1 block font-mono text-3xl tracking-wider">
              {snapshot.roomCode}
            </strong>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                aria-label={t("a11y.copyRoomCode")}
                onClick={() => void navigator.clipboard.writeText(snapshot.roomCode)}
              >
                <Clipboard aria-hidden className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{tLobby("room.copyRoomCode")}</TooltipContent>
          </Tooltip>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>{tLobby("room.title")}</CardTitle>
            <CardDescription>{disabledReason}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.lobbyPlayers.map((player) => (
              <div
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-input p-3"
                key={player.id}
              >
                <div>
                  <strong className="block">{player.nickname}</strong>
                  <span className="text-sm text-muted-foreground">
                    {player.isHost ? tStatus("host") : player.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={getStatusBadgeStatus(player)} label={getPlayerStatus(player)} />
                  {isHost && !player.isHost && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="secondary" size="sm" disabled>
                          <ShieldAlert aria-hidden className="h-3.5 w-3.5" />
                          {tLobby("room.kick")}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{tLobby("room.kickDisabled")}</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          {!isHost && (
            <Button
              data-testid="ready-toggle"
              variant={currentLobbyPlayer?.isReady ? "secondary" : "secondary"}
              className={currentLobbyPlayer?.isReady ? "border-accent text-accent-strong" : ""}
              onClick={() => sendReady(room, !currentLobbyPlayer?.isReady)}
            >
              <Check aria-hidden className="h-4 w-4" />
              {currentLobbyPlayer?.isReady ? tLobby("ready.ready") : tLobby("ready.markReady")}
            </Button>
          )}
          {showDebugControls && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-testid="add-debug-players"
                  variant="secondary"
                  disabled={!canAddDebugPlayers}
                  onClick={() => sendAddDebugPlayers(room, debugPlayersToAdd)}
                >
                  <UserPlus aria-hidden className="h-4 w-4" />
                  {tLobby("debug.addPlayers")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {canAddDebugPlayers ? tLobby("debug.addPlayers") : tLobby("debug.addPlayersDisabled")}
              </TooltipContent>
            </Tooltip>
          )}
          <Button data-testid="start-game" disabled={!canStart} onClick={() => sendStartGame(room)} className="sm:ml-auto">
            <Play aria-hidden className="h-4 w-4" />
            {tLobby("start.button")}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
