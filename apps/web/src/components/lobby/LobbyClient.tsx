"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GameClient } from "@/components/game/GameClient";
import { CreateRoomPanel } from "./CreateRoomPanel";
import { JoinRoomPanel } from "./JoinRoomPanel";
import { LobbyRoom } from "./LobbyRoom";
import { useRoomConnection } from "@/game-client/useRoomConnection";
import { AppShell, AppShellContainer } from "@/components/layout/AppShell";
import { PageHeader, BrandMark, PageTitle } from "@/components/layout/PageHeader";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { LobbyBackdrop } from "./LobbyBackdrop";
import { showLobbySciFiBackdrop } from "./lobbyBackdropVisibility";

interface LobbyClientProps {
  initialRoomCode?: string;
}

export function LobbyClient({ initialRoomCode = "" }: LobbyClientProps) {
  const t = useTranslations("app");
  const tErrors = useTranslations("errors");
  const [nickname, setNickname] = useState("Ada");
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const connection = useRoomConnection();

  useEffect(() => {
    const savedNickname = window.localStorage.getItem("wiai:nickname");
    const savedRoomCode = window.localStorage.getItem("wiai:lastRoomCode");
    if (savedNickname) {
      setNickname(savedNickname);
    }
    if (!initialRoomCode && savedRoomCode) {
      setRoomCode(savedRoomCode);
    }
  }, [initialRoomCode]);

  const isConnected = connection.status === "connected" && connection.room;
  const showBackdrop = showLobbySciFiBackdrop(Boolean(isConnected), Boolean(connection.room));
  const isGameVisible =
    isConnected &&
    (connection.snapshot.status === "playing" ||
      connection.snapshot.status === "ended" ||
      connection.snapshot.phase === "settlement");

  if (isGameVisible && connection.room) {
    return (
      <GameClient
        room={connection.room}
        snapshot={connection.snapshot}
        currentSessionPlayer={connection.currentSessionPlayer}
      />
    );
  }

  return (
    <AppShell>
      {showBackdrop ? <LobbyBackdrop /> : null}
      <AppShellContainer aria-label={t("title")} className="relative z-10">
        <div className="flex items-start justify-between">
          <PageHeader>
            <BrandMark />
            <PageTitle title={t("heroTitle")} description={t("description")} />
          </PageHeader>
          <LanguageSwitch />
        </div>

        {isConnected && connection.room ? (
          <LobbyRoom
            room={connection.room}
            snapshot={connection.snapshot}
            currentLobbyPlayer={connection.currentLobbyPlayer}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <CreateRoomPanel
              nickname={nickname}
              setNickname={setNickname}
              disabled={connection.status === "connecting"}
              onCreate={() => connection.createRoom(nickname)}
            />
            <JoinRoomPanel
              nickname={nickname}
              setNickname={setNickname}
              roomCode={roomCode}
              setRoomCode={setRoomCode}
              disabled={connection.status === "connecting"}
              onJoin={() => connection.joinRoomByCode(roomCode.trim(), nickname)}
            />
          </div>
        )}

        {connection.error ? (
          <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {tErrors("generic")}
          </p>
        ) : null}
      </AppShellContainer>
    </AppShell>
  );
}
