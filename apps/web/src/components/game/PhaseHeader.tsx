"use client";

import { Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";

const phaseLabels: Record<WiaiSnapshot["phase"], string> = {
  lobby: "Lobby",
  answer_prep: "Answer prep",
  answer_reveal: "Answer reveal",
  discussion: "Discussion",
  voting: "Voting",
  settlement: "Settlement"
};

export function PhaseHeader({
  snapshot,
  currentSessionPlayer
}: {
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  const remainingSeconds = Math.max(0, Math.ceil((snapshot.phaseEndsAt - now) / 1000));
  const question = snapshot.questions[0];
  const identity = useMemo(() => {
    if (!currentSessionPlayer) {
      return "Spectating";
    }
    return `You are Player ${currentSessionPlayer.gameNumber}`;
  }, [currentSessionPlayer]);

  return (
    <header className="phase-header">
      <div>
        <span className="section-label">Round {snapshot.roundIndex + 1}</span>
        <h1 data-testid="phase-name">{phaseLabels[snapshot.phase]}</h1>
        <p>{question?.prompt ?? "Waiting for the table to begin."}</p>
      </div>
      <div className="phase-meta">
        <span>{identity}</span>
        <strong>
          <Timer aria-hidden size={18} />
          {snapshot.phase === "settlement" ? "Final" : `${remainingSeconds}s`}
        </strong>
      </div>
    </header>
  );
}
