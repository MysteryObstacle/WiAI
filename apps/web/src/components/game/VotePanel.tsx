"use client";

import { useTranslations } from "next-intl";
import type { Room } from "colyseus.js";
import { Vote } from "lucide-react";
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
  const polygonPoints = nodes.map((node) => `${node.x},${node.y}`).join(" ");
  const closedPolygonPoints =
    nodes.length > 0 ? `${polygonPoints} ${nodes[0]?.x},${nodes[0]?.y}` : "";
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
                id="vote-arrow-primary"
                markerHeight="8"
                markerUnits="strokeWidth"
                markerWidth="8"
                orient="auto"
                refX="7"
                refY="4"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="#f5f5f5" />
              </marker>
              <marker
                id="vote-arrow-destructive"
                markerHeight="8"
                markerUnits="strokeWidth"
                markerWidth="8"
                orient="auto"
                refX="7"
                refY="4"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="#ef4444" />
              </marker>
            </defs>
            {nodes.length > 1 ? (
              <polyline
                className="text-border"
                fill="none"
                points={closedPolygonPoints}
                stroke="currentColor"
                strokeWidth="0.8"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
            {edges.map((edge) => {
              const actor = nodes.find((node) => node.playerId === edge.actorSessionPlayerId);
              const target = nodes.find((node) => node.playerId === edge.targetSessionPlayerId);
              if (!actor || !target) return null;
              const line = trimVoteLine(actor, target);

              return (
                <line
                  className="vote-graph-edge text-primary"
                  key={edge.id}
                  markerEnd="url(#vote-arrow-primary)"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="0.9"
                  vectorEffect="non-scaling-stroke"
                  x1={line.x1}
                  x2={line.x2}
                  y1={line.y1}
                  y2={line.y2}
                />
              );
            })}
            {previewEdge ? <PreviewVoteLine edge={previewEdge} /> : null}
          </svg>

          {nodes.map((node) => {
            const player = snapshot.sessionPlayers.find((item) => item.id === node.playerId);
            if (!player) return null;
            const isSelf = player.id === currentSessionPlayer?.id;
            const isDisabled = Boolean(ownBallot) || isSelf || !player.isActive;
            const label = tGame("player.label", { gameNumber: player.gameNumber });

            return (
              <button
                data-testid={`vote-option-${player.gameNumber}`}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-55",
                  node.isCurrent && "ring-1 ring-primary/45",
                  node.isSelected &&
                    "ring-2 ring-destructive/25"
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
                <span
                  className={cn(
                    "vote-graph-node grid size-14 place-items-center rounded-full border border-border bg-card text-center transition-colors hover:border-primary",
                    node.isCurrent && "border-primary",
                    node.isSelected && "vote-graph-selected border-destructive bg-destructive/10 text-destructive"
                  )}
                >
                  <span className="sr-only">{label}</span>
                  <span className="font-mono text-lg font-semibold">{player.gameNumber}</span>
                </span>
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
                {tGame("player.label", { gameNumber: selectedPlayer.gameNumber })}
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

function PreviewVoteLine({ edge }: { edge: { x1: number; y1: number; x2: number; y2: number } }) {
  const line = trimVoteLine(
    { x: edge.x1, y: edge.y1 },
    { x: edge.x2, y: edge.y2 }
  );

  return (
    <line
      className="vote-graph-edge text-destructive"
      markerEnd="url(#vote-arrow-destructive)"
      stroke="currentColor"
      strokeDasharray="2 2"
      strokeLinecap="round"
      strokeWidth="0.8"
      vectorEffect="non-scaling-stroke"
      x1={line.x1}
      x2={line.x2}
      y1={line.y1}
      y2={line.y2}
    />
  );
}

function trimVoteLine(
  from: { x: number; y: number },
  to: { x: number; y: number },
  trim = 6
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) {
    return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
  }

  const ux = dx / length;
  const uy = dy / length;

  return {
    x1: from.x + ux * trim,
    y1: from.y + uy * trim,
    x2: to.x - ux * trim,
    y2: to.y - uy * trim
  };
}
