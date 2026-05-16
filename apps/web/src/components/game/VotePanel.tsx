"use client";

import { useTranslations } from "next-intl";
import type { Room } from "colyseus.js";
import { Check, Vote } from "lucide-react";
import { useMemo } from "react";
import { useVoteGraphMotion } from "@/animations/useVoteGraphMotion";
import { sendBallot } from "@/game-client/roomCommands";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  getOwnBallot,
  getPublicPlayerName,
  getVoteGraphEdges,
  getVoteGraphNodes
} from "./gameViewModel";

interface VotePanelProps {
  room: Room;
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
  focusedPlayerId: string;
  selectedVoteTargetId?: string | undefined;
  onFocusPlayer: (playerId: string) => void;
  onSelectVoteTarget: (playerId: string | undefined) => void;
}

export function VotePanel({
  room,
  snapshot,
  currentSessionPlayer,
  focusedPlayerId,
  selectedVoteTargetId,
  onFocusPlayer,
  onSelectVoteTarget
}: VotePanelProps) {
  const t = useTranslations("game.vote");
  const tGame = useTranslations("game");
  const ballotType = snapshot.roundIndex === 2 ? "decision" : "suspicion";
  const ownBallot = getOwnBallot(snapshot, currentSessionPlayer);
  const lockedTargetId = ownBallot?.abstain ? undefined : ownBallot?.targetSessionPlayerId;
  const effectiveTargetId = lockedTargetId || selectedVoteTargetId;
  const selectedPlayer = snapshot.sessionPlayers.find((player) => player.id === effectiveTargetId);
  const focusedPlayer = snapshot.sessionPlayers.find((player) => player.id === focusedPlayerId);
  const nodes = useMemo(
    () => getVoteGraphNodes(snapshot, currentSessionPlayer, effectiveTargetId),
    [currentSessionPlayer, effectiveTargetId, snapshot]
  );
  const edges = useMemo(() => getVoteGraphEdges(snapshot), [snapshot]);
  const currentNode = nodes.find((node) => node.playerId === currentSessionPlayer?.id);
  const selectedNode = nodes.find((node) => node.playerId === effectiveTargetId);
  const graphRef = useVoteGraphMotion(
    `${snapshot.phaseVersion}:${edges.length}:${effectiveTargetId ?? "none"}`
  );
  const previewEdge = !ownBallot && currentNode && selectedNode && currentNode.playerId !== selectedNode.playerId
    ? { x1: currentNode.x, y1: currentNode.y, x2: selectedNode.x, y2: selectedNode.y }
    : undefined;

  return (
    <Card className="h-full min-h-0">
      <CardHeader className="shrink-0">
        <CardTitle>{ballotType === "decision" ? t("decisionTitle") : t("suspicionTitle")}</CardTitle>
        <CardDescription>{ownBallot ? t("recorded") : t("hint")}</CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <div
          ref={graphRef}
          className="relative min-h-[360px] flex-1 overflow-hidden rounded-lg border border-border bg-input/40"
        >
          <svg
            className="absolute inset-0 size-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
            aria-hidden
          >
            <defs>
              <marker
                id="vote-arrow"
                markerHeight="5"
                markerWidth="5"
                orient="auto"
                refX="4"
                refY="2.5"
              >
                <path d="M0,0 L5,2.5 L0,5 Z" fill="currentColor" />
              </marker>
            </defs>
            <line x1="42" y1="42" x2="58" y2="58" className="text-border" stroke="currentColor" strokeWidth="0.7" />
            <line x1="58" y1="42" x2="42" y2="58" className="text-border" stroke="currentColor" strokeWidth="0.7" />
            {edges.map((edge) => {
              const actor = nodes.find((node) => node.playerId === edge.actorSessionPlayerId);
              const target = nodes.find((node) => node.playerId === edge.targetSessionPlayerId);
              if (!actor || !target) return null;

              return (
                <line
                  className="vote-graph-edge text-primary"
                  key={edge.id}
                  markerEnd="url(#vote-arrow)"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="0.9"
                  x1={actor.x}
                  x2={target.x}
                  y1={actor.y}
                  y2={target.y}
                />
              );
            })}
            {previewEdge ? (
              <line
                className="vote-graph-edge text-destructive"
                markerEnd="url(#vote-arrow)"
                stroke="currentColor"
                strokeDasharray="2 2"
                strokeLinecap="round"
                strokeWidth="0.8"
                x1={previewEdge.x1}
                x2={previewEdge.x2}
                y1={previewEdge.y1}
                y2={previewEdge.y2}
              />
            ) : null}
          </svg>

          <div className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/80 font-mono text-xs text-muted-foreground">
            VOTE
          </div>

          {nodes.map((node) => {
            const player = snapshot.sessionPlayers.find((item) => item.id === node.playerId);
            if (!player) return null;
            const isSelf = player.id === currentSessionPlayer?.id;
            const isDisabled = Boolean(ownBallot) || isSelf || !player.isActive;
            const label = getPublicPlayerName(
              player,
              tGame("player.label", { gameNumber: player.gameNumber })
            );

            return (
              <button
                data-testid={`vote-option-${player.gameNumber}`}
                className={cn(
                  "vote-graph-node absolute grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-center transition-all hover:-translate-y-[calc(50%+2px)] hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-55",
                  node.isCurrent && "ring-1 ring-primary/45",
                  node.isSelected &&
                    "vote-graph-selected border-destructive bg-destructive/10 text-destructive ring-2 ring-destructive/20"
                )}
                disabled={isDisabled}
                key={node.playerId}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                type="button"
                onClick={() => {
                  onSelectVoteTarget(player.id);
                  onFocusPlayer(player.id);
                }}
              >
                <span className="font-mono text-lg font-semibold">{player.gameNumber}</span>
                <span className="max-w-14 truncate text-[10px] text-muted-foreground">{label}</span>
                {node.hasVoted ? (
                  <Check className="absolute -right-0.5 -top-0.5 size-4 rounded-full bg-emerald-400 p-0.5 text-background" aria-hidden />
                ) : null}
                {node.votesAgainst > 0 ? (
                  <span className="absolute -bottom-1 rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px]">
                    {t("voteCount", { count: node.votesAgainst })}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <article className="rounded-lg border border-border bg-input/50 p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">{t("currentSelection")}</span>
            {selectedPlayer ? (
              <Badge variant="outline">
                {tGame("player.label", { gameNumber: selectedPlayer.gameNumber })}{" "}
                {getPublicPlayerName(
                  selectedPlayer,
                  tGame("player.label", { gameNumber: selectedPlayer.gameNumber })
                )}
              </Badge>
            ) : (
              <Badge variant="secondary">{focusedPlayer ? t("notSelected") : t("noTarget")}</Badge>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t("selectionHint")}</p>
        </article>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            data-testid="cast-vote"
            disabled={Boolean(ownBallot) || !selectedPlayer}
            onClick={() => {
              if (selectedPlayer) {
                sendBallot(room, { ballotType, targetGameNumber: selectedPlayer.gameNumber, abstain: false });
              }
            }}
          >
            <Vote aria-hidden data-icon="inline-start" />
            {selectedPlayer
              ? t("castTarget", { gameNumber: selectedPlayer.gameNumber })
              : t("cast")}
          </Button>
          {ballotType === "suspicion" && (
            <Button
              variant="secondary"
              disabled={Boolean(ownBallot)}
              onClick={() => sendBallot(room, { ballotType: "suspicion", abstain: true })}
            >
              {t("abstain")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
