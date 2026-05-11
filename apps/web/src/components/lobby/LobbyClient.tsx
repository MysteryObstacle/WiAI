"use client";

import { useEffect, useState } from "react";
import { GameClient } from "@/components/game/GameClient";
import { CreateRoomPanel } from "./CreateRoomPanel";
import { JoinRoomPanel } from "./JoinRoomPanel";
import { LobbyRoom } from "./LobbyRoom";
import { useRoomConnection } from "@/game-client/useRoomConnection";

export function LobbyClient({ initialRoomCode = "" }: { initialRoomCode?: string }) {
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
    <main className="app-shell">
      <section className="lobby-stage" aria-label="Create or join Who is AI">
        <div className="brand-lockup">
          <div className="brand-mark">Wi</div>
          <div>
            <h1>Who is AI</h1>
            <p>Find the hidden AI through answers, discussion, and a final vote.</p>
          </div>
        </div>

        {isConnected && connection.room ? (
          <LobbyRoom
            room={connection.room}
            snapshot={connection.snapshot}
            currentLobbyPlayer={connection.currentLobbyPlayer}
          />
        ) : (
          <div className="entry-grid">
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

        {connection.error ? <p className="inline-error">{connection.error}</p> : null}
      </section>
    </main>
  );
}
