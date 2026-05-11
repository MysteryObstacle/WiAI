"use client";

import type { Room } from "colyseus.js";
import { Send, X } from "lucide-react";
import { useMemo, useState } from "react";
import { sendAnswer, sendCancelAnswer } from "@/game-client/roomCommands";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";

export function AnswerPanel({
  room,
  snapshot,
  currentSessionPlayer
}: {
  room: Room;
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
}) {
  const [content, setContent] = useState("");
  const ownAnswer = useMemo(
    () => snapshot.answers.find((answer) => answer.sessionPlayerId === currentSessionPlayer?.id),
    [currentSessionPlayer?.id, snapshot.answers]
  );

  return (
    <section className="panel action-panel">
      <div className="panel-heading">
        <h2>Submit your answer</h2>
        <p>{ownAnswer ? "Your answer is locked for this round." : "Keep it specific enough to sound human."}</p>
      </div>
      <textarea
        data-testid="answer-input"
        value={ownAnswer ? "Submitted" : content}
        disabled={Boolean(ownAnswer)}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write a concise answer..."
      />
      <div className="button-row">
        <button
          data-testid="submit-answer"
          className="primary-button"
          type="button"
          disabled={Boolean(ownAnswer) || content.trim().length === 0}
          onClick={() => {
            sendAnswer(room, content);
            setContent("");
          }}
        >
          <Send aria-hidden size={18} />
          Submit
        </button>
        {ownAnswer ? (
          <button className="secondary-button" type="button" onClick={() => sendCancelAnswer(room)}>
            <X aria-hidden size={18} />
            Cancel
          </button>
        ) : null}
      </div>
    </section>
  );
}
