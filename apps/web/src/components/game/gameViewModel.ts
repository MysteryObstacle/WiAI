import type {
  AnswerSnapshot,
  BallotSnapshot,
  MessageSnapshot,
  SessionPlayerSnapshot,
  WiaiSnapshot
} from "@/game-client/types";

export type PlayerPublicStatus =
  | "current"
  | "submitted"
  | "waiting"
  | "spoke"
  | "voted"
  | "inactive";

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

export function getPlayerPublicStatus(
  snapshot: WiaiSnapshot,
  player: SessionPlayerSnapshot,
  currentSessionPlayer: SessionPlayerSnapshot | undefined
): PlayerPublicStatus {
  if (!player.isActive) return "inactive";
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
