"use client";

import { Sparkles } from "lucide-react";

export function CreateRoomPanel({
  nickname,
  setNickname,
  disabled,
  onCreate
}: {
  nickname: string;
  setNickname: (value: string) => void;
  disabled: boolean;
  onCreate: () => void;
}) {
  return (
    <section className="panel entry-panel">
      <div className="panel-heading">
        <h2>Create room</h2>
        <p>Host a new table and invite two more players.</p>
      </div>
      <label className="field">
        <span>Nickname</span>
        <input
          data-testid="create-nickname"
          value={nickname}
          maxLength={24}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="Ada"
        />
      </label>
      <button
        data-testid="create-room"
        className="primary-button"
        type="button"
        disabled={disabled || nickname.trim().length === 0}
        onClick={onCreate}
      >
        <Sparkles aria-hidden size={18} />
        Create room
      </button>
    </section>
  );
}
