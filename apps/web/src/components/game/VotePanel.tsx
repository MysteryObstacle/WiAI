"use client";

import type { Room } from "colyseus.js";
import { Vote } from "lucide-react";
import { useMemo, useState } from "react";
import { sendBallot } from "@/game-client/roomCommands";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";

export function VotePanel({
  room,
  snapshot,
  currentSessionPlayer
}: {
  room: Room;
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
}) {
  const ballotType = snapshot.roundIndex === 2 ? "decision" : "suspicion";
  const ownBallot = useMemo(
    () => snapshot.ballots.find((ballot) => ballot.actorSessionPlayerId === currentSessionPlayer?.id),
    [currentSessionPlayer?.id, snapshot.ballots]
  );
  const [targetGameNumber, setTargetGameNumber] = useState<number | null>(null);

  return (
    <section className="panel action-panel">
      <div className="panel-heading">
        <h2>{ballotType === "decision" ? "Final decision" : "Suspicion vote"}</h2>
        <p>{ownBallot ? "Vote recorded." : "Choose one active player. Self-votes are blocked."}</p>
      </div>
      <div className="vote-grid">
        {snapshot.sessionPlayers
          .filter((player) => player.isActive && player.id !== currentSessionPlayer?.id)
          .map((player) => (
            <button
              data-testid={`vote-option-${player.gameNumber}`}
              className={targetGameNumber === player.gameNumber ? "vote-option selected" : "vote-option"}
              key={player.id}
              type="button"
              disabled={Boolean(ownBallot)}
              onClick={() => setTargetGameNumber(player.gameNumber)}
            >
              <span>{player.gameNumber}</span>
              <strong>{player.displayName}</strong>
              <small>{player.playerType === "ai" ? "Agent" : "Human"}</small>
            </button>
          ))}
      </div>
      <div className="button-row">
        <button
          data-testid="cast-vote"
          className="primary-button"
          type="button"
          disabled={Boolean(ownBallot) || targetGameNumber === null}
          onClick={() => {
            if (targetGameNumber !== null) {
              sendBallot(room, { ballotType, targetGameNumber, abstain: false });
            }
          }}
        >
          <Vote aria-hidden size={18} />
          Cast vote
        </button>
        {ballotType === "suspicion" ? (
          <button
            className="secondary-button"
            type="button"
            disabled={Boolean(ownBallot)}
            onClick={() => sendBallot(room, { ballotType: "suspicion", abstain: true })}
          >
            Abstain
          </button>
        ) : null}
      </div>
    </section>
  );
}
