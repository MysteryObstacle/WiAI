"use client";

import { LogIn } from "lucide-react";

export function JoinRoomPanel({
  nickname,
  setNickname,
  roomCode,
  setRoomCode,
  disabled,
  onJoin
}: {
  nickname: string;
  setNickname: (value: string) => void;
  roomCode: string;
  setRoomCode: (value: string) => void;
  disabled: boolean;
  onJoin: () => void;
}) {
  return (
    <section className="panel entry-panel">
      <div className="panel-heading">
        <h2>Join room</h2>
        <p>Enter a room code from the host.</p>
      </div>
      <label className="field">
        <span>Nickname</span>
        <input
          data-testid="join-nickname"
          value={nickname}
          maxLength={24}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="Grace"
        />
      </label>
      <label className="field">
        <span>Room code</span>
        <input
          data-testid="join-code"
          value={roomCode}
          maxLength={16}
          onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
          placeholder="ABC123"
        />
      </label>
      <button
        data-testid="join-room"
        className="secondary-button"
        type="button"
        disabled={disabled || nickname.trim().length === 0 || roomCode.trim().length === 0}
        onClick={onJoin}
      >
        <LogIn aria-hidden size={18} />
        Join room
      </button>
    </section>
  );
}
