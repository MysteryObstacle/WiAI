"use client";

import { Crown } from "lucide-react";
import { useSettlementReveal } from "@/animations/useSettlementReveal";
import type { WiaiSnapshot } from "@/game-client/types";

export function SettlementPanel({ snapshot }: { snapshot: WiaiSnapshot }) {
  const ref = useSettlementReveal(snapshot.phaseVersion);
  const frozen = snapshot.sessionPlayers.find(
    (player) => player.id === snapshot.result.frozenSessionPlayerId
  );

  return (
    <section className="panel action-panel settlement-panel" ref={ref}>
      <div className="settlement-hero">
        <Crown aria-hidden size={30} />
        <span>Winner</span>
        <h2 data-testid="settlement-winner">{snapshot.result.winnerSide || "Undecided"}</h2>
        <p>
          Frozen player:{" "}
          <strong>
            {frozen ? `Player ${frozen.gameNumber} / ${frozen.displayName}` : "Unknown"}
          </strong>
        </p>
      </div>
      <div className="role-grid">
        {snapshot.sessionPlayers
          .sort((left, right) => left.gameNumber - right.gameNumber)
          .map((player) => (
            <article className="role-card" key={player.id}>
              <span>Player {player.gameNumber}</span>
              <strong>{player.displayName}</strong>
              <p>{player.role || "hidden"}</p>
            </article>
          ))}
      </div>
      <div className="vote-table">
        {snapshot.ballots
          .filter((ballot) => ballot.ballotType === "decision")
          .map((ballot) => {
            const actor = snapshot.sessionPlayers.find(
              (player) => player.id === ballot.actorSessionPlayerId
            );
            const target = snapshot.sessionPlayers.find(
              (player) => player.id === ballot.targetSessionPlayerId
            );
            return (
              <div className="vote-row" key={ballot.id}>
                <span>Player {actor?.gameNumber ?? "?"}</span>
                <strong>{ballot.abstain ? "Abstained" : `Player ${target?.gameNumber ?? "?"}`}</strong>
              </div>
            );
          })}
      </div>
    </section>
  );
}
