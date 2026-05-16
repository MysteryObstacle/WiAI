import type {
  AnswerSnapshot,
  BallotSnapshot,
  MessageSnapshot,
  SessionPlayerSnapshot,
  WiaiSnapshot
} from "@/game-client/types";

export type PlayerPublicStatus =
  | "current"
  | "topVoted"
  | "submitted"
  | "waiting"
  | "spoke"
  | "voted"
  | "inactive";

export type DossierTab = "stats" | "answer" | "discussion" | "vote";

export type PlayerStatusSummary = {
  status: PlayerPublicStatus;
  speechCount: number;
  voteCount: number;
  answerCharacterCount: number;
  castVoteTargetGameNumber: number | undefined;
  receivedVoteActorGameNumbers: number[];
  isCurrent: boolean;
  isPreviousRoundTopVoted: boolean;
  isSubmitted: boolean;
  hasVoted: boolean;
};

export type VoteGraphNode = {
  playerId: string;
  gameNumber: number;
  label: string;
  x: number;
  y: number;
  isCurrent: boolean;
  isSelected: boolean;
  hasVoted: boolean;
  votesAgainst: number;
};

export type VoteGraphEdge = {
  id: string;
  actorSessionPlayerId: string;
  targetSessionPlayerId: string;
  actorGameNumber: number;
  targetGameNumber: number;
};

export function sortedPlayers(players: SessionPlayerSnapshot[]) {
  return [...players].sort((left, right) => left.gameNumber - right.gameNumber);
}

export function splitPlayerColumns(players: SessionPlayerSnapshot[]) {
  const sorted = sortedPlayers(players);
  const splitIndex = Math.ceil(sorted.length / 2);

  return {
    left: sorted.slice(0, splitIndex),
    right: sorted.slice(splitIndex)
  };
}

export function answersForRound(snapshot: WiaiSnapshot): AnswerSnapshot[] {
  return snapshot.answers.filter((answer) => answer.roundIndex === snapshot.roundIndex);
}

export function messagesForRound(snapshot: WiaiSnapshot): MessageSnapshot[] {
  return snapshot.messages.filter((message) => message.roundIndex === snapshot.roundIndex);
}

export function ballotsForRound(snapshot: WiaiSnapshot): BallotSnapshot[] {
  return snapshot.ballots.filter((ballot) => ballot.roundIndex === snapshot.roundIndex);
}

export function getSubmittedAnswerCount(snapshot: WiaiSnapshot) {
  return answersForRound(snapshot).length;
}

export function getPlayerAnswer(snapshot: WiaiSnapshot, sessionPlayerId: string) {
  return answersForRound(snapshot).find((answer) => answer.sessionPlayerId === sessionPlayerId);
}

export function getPlayerMessages(snapshot: WiaiSnapshot, sessionPlayerId: string) {
  return messagesForRound(snapshot).filter((message) => message.sessionPlayerId === sessionPlayerId);
}

export function getOwnBallot(
  snapshot: WiaiSnapshot,
  currentSessionPlayer: SessionPlayerSnapshot | undefined
) {
  if (!currentSessionPlayer) return undefined;
  return ballotsForRound(snapshot).find(
    (ballot) => ballot.actorSessionPlayerId === currentSessionPlayer.id
  );
}

export function getVotesAgainst(snapshot: WiaiSnapshot, targetSessionPlayerId: string) {
  return ballotsForRound(snapshot).filter(
    (ballot) => !ballot.abstain && ballot.targetSessionPlayerId === targetSessionPlayerId
  ).length;
}

export function getBallotsAgainstPlayer(snapshot: WiaiSnapshot, targetSessionPlayerId: string) {
  return ballotsForRound(snapshot).filter(
    (ballot) => !ballot.abstain && ballot.targetSessionPlayerId === targetSessionPlayerId
  );
}

export function getPlayerBallot(snapshot: WiaiSnapshot, sessionPlayerId: string) {
  return ballotsForRound(snapshot).find((ballot) => ballot.actorSessionPlayerId === sessionPlayerId);
}

export function getPlayerSpeechCount(snapshot: WiaiSnapshot, sessionPlayerId: string) {
  return getPlayerMessages(snapshot, sessionPlayerId).length;
}

export function getPlayerMentionCount(snapshot: WiaiSnapshot, player: SessionPlayerSnapshot) {
  const gameNumberPattern = new RegExp(`(^|[^0-9])#?${player.gameNumber}(号|\\b)`, "i");
  const displayName = player.displayName.trim().toLowerCase();

  return messagesForRound(snapshot).filter((message) => {
    if (message.sessionPlayerId === player.id) return false;
    const content = message.content.toLowerCase();
    return gameNumberPattern.test(content) || (displayName.length > 0 && content.includes(displayName));
  }).length;
}

export function getPlayerVoteCount(snapshot: WiaiSnapshot, sessionPlayerId: string) {
  return getVotesAgainst(snapshot, sessionPlayerId);
}

export function getPlayerPublicStatus(
  snapshot: WiaiSnapshot,
  player: SessionPlayerSnapshot,
  currentSessionPlayer: SessionPlayerSnapshot | undefined
): PlayerPublicStatus {
  if (!player.isActive) return "inactive";
  if (isPreviousRoundTopVoted(snapshot, player.id)) return "topVoted";
  if (player.id === currentSessionPlayer?.id) return "current";

  if (snapshot.phase === "answer_prep") {
    return getPlayerAnswer(snapshot, player.id) ? "submitted" : "waiting";
  }

  if (snapshot.phase === "discussion") {
    return getPlayerMessages(snapshot, player.id).length > 0 ? "spoke" : "waiting";
  }

  if (snapshot.phase === "voting") {
    return ballotsForRound(snapshot).some((ballot) => ballot.actorSessionPlayerId === player.id)
      ? "voted"
      : "waiting";
  }

  return "waiting";
}

export function getPlayerStatusSummary(
  snapshot: WiaiSnapshot,
  player: SessionPlayerSnapshot,
  currentSessionPlayer: SessionPlayerSnapshot | undefined
): PlayerStatusSummary {
  const speechCount = getPlayerSpeechCount(snapshot, player.id);
  const voteCount = getPlayerVoteCount(snapshot, player.id);
  const answerCharacterCount = getPlayerAnswer(snapshot, player.id)?.content.length ?? 0;
  const playerBallot = getPlayerBallot(snapshot, player.id);
  const castVoteTarget = snapshot.sessionPlayers.find(
    (item) => item.id === playerBallot?.targetSessionPlayerId
  );
  const receivedVoteActorGameNumbers = getBallotsAgainstPlayer(snapshot, player.id)
    .map((ballot) =>
      snapshot.sessionPlayers.find((item) => item.id === ballot.actorSessionPlayerId)?.gameNumber
    )
    .filter((gameNumber): gameNumber is number => typeof gameNumber === "number")
    .sort((left, right) => left - right);

  return {
    status: getPlayerPublicStatus(snapshot, player, currentSessionPlayer),
    speechCount,
    voteCount,
    answerCharacterCount,
    castVoteTargetGameNumber: castVoteTarget?.gameNumber,
    receivedVoteActorGameNumbers,
    isCurrent: player.id === currentSessionPlayer?.id,
    isPreviousRoundTopVoted: isPreviousRoundTopVoted(snapshot, player.id),
    isSubmitted: Boolean(getPlayerAnswer(snapshot, player.id)),
    hasVoted: ballotsForRound(snapshot).some((ballot) => ballot.actorSessionPlayerId === player.id)
  };
}

export function getDefaultFocusedPlayerId(
  snapshot: WiaiSnapshot,
  currentSessionPlayer: SessionPlayerSnapshot | undefined
) {
  return currentSessionPlayer?.id ?? sortedPlayers(snapshot.sessionPlayers)[0]?.id ?? "";
}

export function getFocusedPlayer(snapshot: WiaiSnapshot, focusedPlayerId: string) {
  return snapshot.sessionPlayers.find((player) => player.id === focusedPlayerId);
}

export function getPublicPlayerName(player: SessionPlayerSnapshot, fallbackName: string) {
  return /^mock\s*ai$/i.test(player.displayName.trim()) ? fallbackName : player.displayName;
}

export function getDefaultDossierTab(phase: WiaiSnapshot["phase"]): DossierTab {
  if (phase === "answer_reveal") return "answer";
  if (phase === "discussion") return "discussion";
  if (phase === "voting") return "vote";
  if (phase === "settlement") return "vote";
  return "stats";
}

export function getPreviousRoundTopVotedPlayerIds(snapshot: WiaiSnapshot) {
  const previousRoundIndex = snapshot.phase === "settlement"
    ? snapshot.roundIndex
    : snapshot.roundIndex - 1;
  if (previousRoundIndex < 0) return [];

  const voteCounts = new Map<string, number>();
  snapshot.ballots
    .filter((ballot) => ballot.roundIndex === previousRoundIndex && !ballot.abstain)
    .forEach((ballot) => {
      voteCounts.set(
        ballot.targetSessionPlayerId,
        (voteCounts.get(ballot.targetSessionPlayerId) ?? 0) + 1
      );
    });

  const maxVotes = Math.max(0, ...voteCounts.values());
  if (maxVotes === 0) return [];

  return [...voteCounts.entries()]
    .filter(([, count]) => count === maxVotes)
    .map(([sessionPlayerId]) => sessionPlayerId);
}

export function isPreviousRoundTopVoted(snapshot: WiaiSnapshot, sessionPlayerId: string) {
  return getPreviousRoundTopVotedPlayerIds(snapshot).includes(sessionPlayerId);
}

export function getVoteGraphNodes(
  snapshot: WiaiSnapshot,
  currentSessionPlayer: SessionPlayerSnapshot | undefined,
  selectedTargetId: string | undefined
): VoteGraphNode[] {
  const players = sortedPlayers(snapshot.sessionPlayers);
  const center = 50;
  const radius = 35;
  const currentIndex = Math.max(
    0,
    players.findIndex((player) => player.id === currentSessionPlayer?.id)
  );
  const startAngle = Math.PI / 2 - (currentIndex / Math.max(1, players.length)) * Math.PI * 2;

  return players.map((player, index) => {
    const angle = startAngle + (index / Math.max(1, players.length)) * Math.PI * 2;
    return {
      playerId: player.id,
      gameNumber: player.gameNumber,
      label: String(player.gameNumber),
      x: Math.round((center + Math.cos(angle) * radius) * 100) / 100,
      y: Math.round((center + Math.sin(angle) * radius) * 100) / 100,
      isCurrent: player.id === currentSessionPlayer?.id,
      isSelected: player.id === selectedTargetId,
      hasVoted: ballotsForRound(snapshot).some((ballot) => ballot.actorSessionPlayerId === player.id),
      votesAgainst: getVotesAgainst(snapshot, player.id)
    };
  });
}

export function getVoteGraphEdges(snapshot: WiaiSnapshot): VoteGraphEdge[] {
  return ballotsForRound(snapshot)
    .filter((ballot) => !ballot.abstain && ballot.targetSessionPlayerId)
    .flatMap((ballot) => {
      const actor = snapshot.sessionPlayers.find((player) => player.id === ballot.actorSessionPlayerId);
      const target = snapshot.sessionPlayers.find((player) => player.id === ballot.targetSessionPlayerId);
      if (!actor || !target) return [];

      return [
        {
          id: ballot.id,
          actorSessionPlayerId: actor.id,
          targetSessionPlayerId: target.id,
          actorGameNumber: actor.gameNumber,
          targetGameNumber: target.gameNumber
        }
      ];
    });
}
