import {
  type GameState,
  getCurrentQuestion
} from "@wiai/game";
import {
  AnswerState,
  BallotState,
  ChatMessageState,
  LobbyPlayerState,
  QuestionState,
  SessionPlayerState,
  WiaiState
} from "./WiaiState";

export function mapDomainStateToColyseus(domain: GameState, target: WiaiState): void {
  target.roomId = domain.roomId;
  target.roomCode = domain.roomCode;
  target.status = domain.status;
  target.phase = domain.phase;
  target.phaseVersion = domain.phaseVersion;
  target.roundIndex = domain.roundIndex;
  target.phaseEndsAt = domain.phaseEndsAt;

  target.lobbyPlayers.clear();
  for (const player of domain.lobbyPlayers) {
    const item = new LobbyPlayerState();
    item.id = player.id;
    item.nickname = player.nickname;
    item.isHost = player.isHost;
    item.isReady = player.isReady;
    item.status = player.status;
    target.lobbyPlayers.set(player.id, item);
  }

  target.sessionPlayers.clear();
  for (const player of domain.sessionPlayers) {
    const item = new SessionPlayerState();
    item.id = player.id;
    item.lobbyPlayerId = player.lobbyPlayerId ?? "";
    item.gameNumber = player.gameNumber;
    item.displayName = player.displayName;
    item.playerType = player.playerType;
    item.role = domain.phase === "settlement" ? player.role : "";
    item.controlMode = player.controlMode;
    item.isActive = player.isActive;
    target.sessionPlayers.set(player.id, item);
  }

  target.answers.clear();
  for (const answer of domain.answers.filter((item) => item.roundIndex === domain.roundIndex)) {
    const item = new AnswerState();
    item.id = answer.id;
    item.roundIndex = answer.roundIndex;
    item.sessionPlayerId = answer.sessionPlayerId;
    item.content =
      domain.phase === "answer_reveal" ||
      domain.phase === "discussion" ||
      domain.phase === "voting" ||
      domain.phase === "settlement"
        ? answer.content
        : "";
    item.submittedAt = answer.submittedAt;
    target.answers.set(answer.id, item);
  }

  target.messages.clear();
  for (const message of domain.messages.filter((item) => item.roundIndex === domain.roundIndex)) {
    const item = new ChatMessageState();
    item.id = message.id;
    item.roundIndex = message.roundIndex;
    item.sessionPlayerId = message.sessionPlayerId;
    item.content = message.content;
    item.createdAt = message.createdAt;
    target.messages.set(message.id, item);
  }

  target.ballots.clear();
  const visibleBallots =
    domain.phase === "settlement"
      ? domain.ballots
      : domain.ballots.filter((ballot) => ballot.roundIndex === domain.roundIndex);
  for (const ballot of visibleBallots) {
    const item = new BallotState();
    item.id = ballot.id;
    item.roundIndex = ballot.roundIndex;
    item.actorSessionPlayerId = ballot.actorSessionPlayerId;
    item.ballotType = ballot.ballotType;
    item.targetSessionPlayerId = domain.phase === "settlement" ? (ballot.targetSessionPlayerId ?? "") : "";
    item.abstain = ballot.abstain;
    target.ballots.set(ballot.id, item);
  }

  target.questions.clear();
  if (domain.roundIndex >= 0) {
    const question = getCurrentQuestion(domain);
    const item = new QuestionState();
    item.roundIndex = question.roundIndex;
    item.kind = question.kind;
    item.prompt = question.prompt;
    target.questions.push(item);
  }

  target.result.winnerSide = domain.result?.winnerSide ?? "";
  target.result.frozenSessionPlayerId = domain.result?.frozenSessionPlayerId ?? "";
}
