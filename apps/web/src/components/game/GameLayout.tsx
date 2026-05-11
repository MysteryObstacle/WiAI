"use client";

import { useTranslations } from "next-intl";
import type { Room } from "colyseus.js";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { PhaseHeader } from "./PhaseHeader";
import { AnswerPanel } from "./AnswerPanel";
import { RevealPanel } from "./RevealPanel";
import { DiscussionPanel } from "./DiscussionPanel";
import { VotePanel } from "./VotePanel";
import { SettlementPanel } from "./SettlementPanel";
import { usePhaseTransition } from "@/animations/usePhaseTransition";
import { PlayerNumber } from "./PlayerNumber";
import { cn } from "@/lib/utils";

interface GameLayoutProps {
  room: Room;
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
}

export function GameLayout({ room, snapshot, currentSessionPlayer }: GameLayoutProps) {
  const transitionRef = usePhaseTransition(snapshot.phaseVersion);
  const t = useTranslations();
  const tPlayerType = useTranslations("playerType");

  return (
    <div
      className="grid gap-4 lg:grid-cols-[280px_1fr] lg:grid-areas-[header_header,players_action]"
      ref={transitionRef}
    >
      <PhaseHeader snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />

      <aside className="space-y-2.5 lg:col-start-1 lg:row-start-2" aria-label={t("a11y.players")}>
        {snapshot.sessionPlayers
          .sort((left, right) => left.gameNumber - right.gameNumber)
          .map((player) => (
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg border border-border bg-input p-3",
                player.id === currentSessionPlayer?.id && "border-accent"
              )}
              key={player.id}
            >
              <PlayerNumber number={player.gameNumber} />
              <div>
                <strong className="block">{player.displayName}</strong>
                <span className="text-sm text-muted-foreground">
                  {player.playerType === "ai" ? tPlayerType("ai") : tPlayerType("human")}
                  {player.role ? ` / ${player.role}` : ""}
                </span>
              </div>
            </div>
          ))}
      </aside>

      <div className="lg:col-start-2 lg:row-start-2 min-w-0">
        {snapshot.phase === "answer_prep" && (
          <AnswerPanel room={room} snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />
        )}
        {snapshot.phase === "answer_reveal" && <RevealPanel snapshot={snapshot} />}
        {snapshot.phase === "discussion" && (
          <DiscussionPanel room={room} snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />
        )}
        {snapshot.phase === "voting" && (
          <VotePanel room={room} snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />
        )}
        {snapshot.phase === "settlement" && <SettlementPanel snapshot={snapshot} />}
      </div>
    </div>
  );
}
