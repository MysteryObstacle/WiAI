"use client";

import { useRevealTimeline } from "@/animations/useRevealTimeline";
import type { WiaiSnapshot } from "@/game-client/types";

export function RevealPanel({ snapshot }: { snapshot: WiaiSnapshot }) {
  const listRef = useRevealTimeline(snapshot.phaseVersion);

  return (
    <section className="panel action-panel">
      <div className="panel-heading">
        <h2>Answers revealed</h2>
        <p>Read the wording before discussion opens.</p>
      </div>
      <div className="answer-list" ref={listRef}>
        {snapshot.answers.map((answer) => {
          const player = snapshot.sessionPlayers.find((item) => item.id === answer.sessionPlayerId);
          return (
            <article className="answer-card" key={answer.id}>
              <span>Player {player?.gameNumber ?? "?"}</span>
              <p>{answer.content || "Submitted"}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
