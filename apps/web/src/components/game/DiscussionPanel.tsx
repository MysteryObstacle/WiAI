"use client";

import type { Room } from "colyseus.js";
import { Send } from "lucide-react";
import { useState } from "react";
import { sendChat } from "@/game-client/roomCommands";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { RevealPanel } from "./RevealPanel";

export function DiscussionPanel({
  room,
  snapshot,
  currentSessionPlayer
}: {
  room: Room;
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
}) {
  const [content, setContent] = useState("");

  return (
    <section className="discussion-grid">
      <div className="panel action-panel">
        <div className="panel-heading">
          <h2>Discussion</h2>
          <p>Challenge vague answers and note suspicious patterns.</p>
        </div>
        <div className="message-list">
          {snapshot.messages.length === 0 ? <p className="empty-state">No messages yet.</p> : null}
          {snapshot.messages.map((message) => {
            const player = snapshot.sessionPlayers.find((item) => item.id === message.sessionPlayerId);
            return (
              <article
                className={
                  message.sessionPlayerId === currentSessionPlayer?.id
                    ? "message-bubble own"
                    : "message-bubble"
                }
                key={message.id}
              >
                <span>Player {player?.gameNumber ?? "?"}</span>
                <p>{message.content}</p>
              </article>
            );
          })}
        </div>
        <div className="chat-composer">
          <input
            data-testid="chat-input"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Ask a pointed question..."
          />
          <button
            data-testid="send-chat"
            className="icon-button accent"
            type="button"
            aria-label="Send chat"
            disabled={content.trim().length === 0}
            onClick={() => {
              sendChat(room, content);
              setContent("");
            }}
          >
            <Send aria-hidden size={18} />
          </button>
        </div>
      </div>
      <RevealPanel snapshot={snapshot} />
    </section>
  );
}
