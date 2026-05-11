"use client";

import type { Room } from "colyseus.js";
import { Check, Clipboard, Play, ShieldAlert } from "lucide-react";
import { sendReady, sendStartGame } from "@/game-client/roomCommands";
import type { LobbyPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";

export function LobbyRoom({
  room,
  snapshot,
  currentLobbyPlayer
}: {
  room: Room;
  snapshot: WiaiSnapshot;
  currentLobbyPlayer: LobbyPlayerSnapshot | undefined;
}) {
  const isHost = Boolean(currentLobbyPlayer?.isHost);
  const nonHostPlayers = snapshot.lobbyPlayers.filter((player) => !player.isHost);
  const playersReady = nonHostPlayers.every((player) => player.isReady);
  const enoughPlayers = snapshot.lobbyPlayers.filter((player) => player.status === "online").length >= 3;
  const canStart = isHost && playersReady && enoughPlayers;
  const disabledReason = !isHost
    ? "Only the host can start"
    : !enoughPlayers
      ? "Need three human players"
      : !playersReady
        ? "Waiting for ready players"
        : "Ready";

  return (
    <section className="lobby-room">
      <div className="room-code-row">
        <div>
          <span className="section-label">Room code</span>
          <strong data-testid="room-code">{snapshot.roomCode}</strong>
        </div>
        <button
          className="icon-button"
          type="button"
          aria-label="Copy room code"
          title="Copy room code"
          onClick={() => void navigator.clipboard.writeText(snapshot.roomCode)}
        >
          <Clipboard aria-hidden size={18} />
        </button>
      </div>

      <div className="panel roster-panel">
        <div className="panel-heading compact">
          <h2>Lobby</h2>
          <p>{disabledReason}</p>
        </div>
        <div className="roster-list">
          {snapshot.lobbyPlayers.map((player) => (
            <div className="roster-row" key={player.id}>
              <div>
                <strong>{player.nickname}</strong>
                <span>{player.isHost ? "Host" : player.status}</span>
              </div>
              <div className="roster-actions">
                <span className={player.isHost || player.isReady ? "ready-pill active" : "ready-pill"}>
                  {player.isHost ? "Host" : player.isReady ? "Ready" : "Waiting"}
                </span>
                {isHost && !player.isHost ? (
                  <button className="mini-button" type="button" disabled title="Kick controls are P1-safe disabled">
                    <ShieldAlert aria-hidden size={14} />
                    Kick
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lobby-actions">
        {!isHost ? (
          <button
            data-testid="ready-toggle"
            className={currentLobbyPlayer?.isReady ? "secondary-button active" : "secondary-button"}
            type="button"
            onClick={() => sendReady(room, !currentLobbyPlayer?.isReady)}
          >
            <Check aria-hidden size={18} />
            {currentLobbyPlayer?.isReady ? "Ready" : "Mark ready"}
          </button>
        ) : null}
        <button
          data-testid="start-game"
          className="primary-button"
          type="button"
          disabled={!canStart}
          onClick={() => sendStartGame(room)}
        >
          <Play aria-hidden size={18} />
          Start game
        </button>
      </div>
    </section>
  );
}
