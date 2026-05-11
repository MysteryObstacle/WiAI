"use client";

import type { Room } from "colyseus.js";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { PhaseHeader } from "./PhaseHeader";
import { AnswerPanel } from "./AnswerPanel";
import { RevealPanel } from "./RevealPanel";
import { DiscussionPanel } from "./DiscussionPanel";
import { VotePanel } from "./VotePanel";
import { SettlementPanel } from "./SettlementPanel";
import { usePhaseTransition } from "@/animations/usePhaseTransition";

export function GameLayout({
  room,
  snapshot,
  currentSessionPlayer
}: {
  room: Room;
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
}) {
  const transitionRef = usePhaseTransition(snapshot.phaseVersion);

  return (
    <section className="game-table" ref={transitionRef}>
      <PhaseHeader snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />
      <aside className="player-rail" aria-label="Players">
        {snapshot.sessionPlayers
          .sort((left, right) => left.gameNumber - right.gameNumber)
          .map((player) => (
            <div
              className={
                player.id === currentSessionPlayer?.id ? "session-player current" : "session-player"
              }
              key={player.id}
            >
              <span className="game-number">{player.gameNumber}</span>
              <div>
                <strong>{player.displayName}</strong>
                <span>
                  {player.playerType === "ai" ? "Agent" : "Human"}
                  {player.role ? ` / ${player.role}` : ""}
                </span>
              </div>
            </div>
          ))}
      </aside>
      <div className="action-surface">
        {snapshot.phase === "answer_prep" ? (
          <AnswerPanel room={room} snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />
        ) : null}
        {snapshot.phase === "answer_reveal" ? <RevealPanel snapshot={snapshot} /> : null}
        {snapshot.phase === "discussion" ? (
          <DiscussionPanel room={room} snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />
        ) : null}
        {snapshot.phase === "voting" ? (
          <VotePanel room={room} snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />
        ) : null}
        {snapshot.phase === "settlement" ? <SettlementPanel snapshot={snapshot} /> : null}
      </div>
    </section>
  );
}
