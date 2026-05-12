import { err, ok, type Result } from "@wiai/kernel";
import { assignRoles } from "../roleAssignment";
import {
  addLobbyPlayer,
  appendEvent,
  beginPhase,
  beginRound,
  findSessionPlayerByGameNumber,
  getActiveSessionPlayers,
  getCurrentRoundAnswers,
  getCurrentRoundBallots,
  getHostLobbyPlayer,
  getOnlineLobbyPlayers,
  readyLobbyPlayer
} from "../state";
import type {
  Ballot,
  AddDebugPlayersIntent,
  CancelSubmitAnswerIntent,
  DomainCommand,
  GameErrorCode,
  GameEvent,
  GameState,
  SendChatIntent,
  StartGameIntent,
  SubmitAnswerIntent,
  SubmitBallotIntent
} from "../types";
import {
  expectedBallotType,
  maybeAdvanceAfterAnswer,
  maybeAdvanceAfterBallot
} from "../policies/phasePolicies";

export type CommandResult = Result<GameEvent[], GameErrorCode>;

export function executeCommand(state: GameState, command: DomainCommand): CommandResult {
  const beforeEventCount = state.events.length;

  const result = execute(state, command);
  if (!result.ok) {
    return result;
  }

  return ok(state.events.slice(beforeEventCount));
}

function execute(state: GameState, command: DomainCommand): CommandResult {
  switch (command.type) {
    case "ready":
      return handleReady(state, command.actorLobbyPlayerId, command.isReady);
    case "start_game":
      return handleStartGame(state, command);
    case "add_debug_players":
      return handleAddDebugPlayers(state, command);
    case "submit_answer":
      return handleSubmitAnswer(state, command);
    case "cancel_submit_answer":
      return handleCancelSubmitAnswer(state, command);
    case "send_chat":
      return handleSendChat(state, command);
    case "submit_ballot":
      return handleSubmitBallot(state, command);
  }
}

function handleReady(state: GameState, actorLobbyPlayerId: string, isReady: boolean): CommandResult {
  if (!state.lobbyPlayers.some((player) => player.id === actorLobbyPlayerId)) {
    return err("not_joined", "Client has no bound lobby player");
  }
  if (state.status !== "lobby") {
    return err("room_not_lobby", "Ready can only be changed in lobby");
  }

  readyLobbyPlayer(state, actorLobbyPlayerId, isReady);
  return ok([]);
}

function handleStartGame(state: GameState, command: StartGameIntent): CommandResult {
  const host = getHostLobbyPlayer(state);
  if (!host || host.id !== command.actorLobbyPlayerId) {
    return err("not_host", "Only the host can start the game");
  }
  if (state.status !== "lobby") {
    return err("room_not_lobby", "Room is not in lobby");
  }

  const onlinePlayers = getOnlineLobbyPlayers(state);
  if (onlinePlayers.length < state.config.minPlayers) {
    return err("not_enough_players", "Online player count is below the room minimum");
  }

  const everyoneReady = onlinePlayers.every((player) => player.isHost || player.isReady);
  if (!everyoneReady) {
    return err("players_not_ready", "Non-host players are not all ready");
  }

  state.status = "playing";
  state.sessionId = `session_${state.roomId}`;
  state.sessionPlayers = assignRoles(state.lobbyPlayers);
  beginRound(state, 0);
  appendEvent(state, "game.started", {
    actorLobbyPlayerId: command.actorLobbyPlayerId,
    roundIndex: 0,
    payload: {
      sessionId: state.sessionId,
      players: state.sessionPlayers.map((player) => ({
        id: player.id,
        gameNumber: player.gameNumber,
        playerType: player.playerType,
        controlMode: player.controlMode
      }))
    }
  });
  beginPhase(state, "answer_prep");
  return ok([]);
}

function handleAddDebugPlayers(
  state: GameState,
  command: AddDebugPlayersIntent
): CommandResult {
  const host = getHostLobbyPlayer(state);
  if (!host || host.id !== command.actorLobbyPlayerId) {
    return err("not_host", "Only the host can add debug players");
  }
  if (state.status !== "lobby") {
    return err("room_not_lobby", "Debug players can only be added in lobby");
  }
  if (command.count < 1) {
    return err("invalid_debug_player_count", "Debug player count must be positive");
  }

  const onlinePlayers = getOnlineLobbyPlayers(state);
  if (onlinePlayers.length + command.count > state.config.maxPlayers) {
    return err("room_full", "Debug players would exceed room maximum");
  }

  const existingDebugCount = state.lobbyPlayers.filter((player) =>
    player.id.startsWith("lp_debug_")
  ).length;

  for (let offset = 1; offset <= command.count; offset += 1) {
    const debugNumber = existingDebugCount + offset;
    addLobbyPlayer(state, {
      id: `lp_debug_${debugNumber}`,
      nickname: `Debug ${debugNumber}`,
      isHost: false,
      isReady: true,
      status: "online"
    });
  }

  return ok([]);
}

function handleSubmitAnswer(state: GameState, command: SubmitAnswerIntent): CommandResult {
  if (state.status !== "playing") {
    return err("room_not_playing", "Room is not playing");
  }
  if (state.phase !== "answer_prep") {
    return err("invalid_phase", "Answers are only accepted during answer_prep");
  }

  const actor = getActiveActor(state, command.actorSessionPlayerId);
  if (!actor) {
    return err("not_joined", "Actor is not an active session player");
  }

  const content = command.content.trim();
  if (!content) {
    return err("invalid_content", "Answer content cannot be empty");
  }

  const duplicate = getCurrentRoundAnswers(state).some(
    (answer) => answer.sessionPlayerId === actor.id
  );
  if (duplicate) {
    return err("duplicate_answer", "Actor already submitted an answer");
  }

  state.answers.push({
    id: `answer_${state.roundIndex}_${actor.id}`,
    roundIndex: state.roundIndex,
    sessionPlayerId: actor.id,
    content,
    submittedAt: new Date().toISOString()
  });
  appendEvent(state, "answer.submitted", {
    actorSessionPlayerId: actor.id,
    roundIndex: state.roundIndex,
    phase: state.phase,
    payload: { content }
  });
  maybeAdvanceAfterAnswer(state);
  return ok([]);
}

function handleCancelSubmitAnswer(
  state: GameState,
  command: CancelSubmitAnswerIntent
): CommandResult {
  if (state.phase !== "answer_prep") {
    return err("invalid_phase", "Answer cancellation is only allowed during answer_prep");
  }

  const answerIndex = state.answers.findIndex(
    (answer) =>
      answer.roundIndex === state.roundIndex &&
      answer.sessionPlayerId === command.actorSessionPlayerId
  );
  if (answerIndex < 0) {
    return err("answer_not_submitted", "Actor has no answer to cancel");
  }

  const [answer] = state.answers.splice(answerIndex, 1);
  appendEvent(state, "answer.cancelled", {
    actorSessionPlayerId: command.actorSessionPlayerId,
    roundIndex: state.roundIndex,
    phase: state.phase,
    payload: { answerId: answer!.id }
  });
  return ok([]);
}

function handleSendChat(state: GameState, command: SendChatIntent): CommandResult {
  if (state.phase !== "discussion") {
    return err("invalid_phase", "Chat is only accepted during discussion");
  }

  const actor = getActiveActor(state, command.actorSessionPlayerId);
  if (!actor) {
    return err("not_joined", "Actor is not an active session player");
  }

  const content = command.content.trim();
  if (!content) {
    return err("invalid_content", "Chat content cannot be empty");
  }

  state.messages.push({
    id: `message_${state.roundIndex}_${state.messages.length + 1}`,
    roundIndex: state.roundIndex,
    sessionPlayerId: actor.id,
    content,
    createdAt: new Date().toISOString()
  });
  appendEvent(state, "message.posted", {
    actorSessionPlayerId: actor.id,
    roundIndex: state.roundIndex,
    phase: state.phase,
    payload: { content }
  });
  return ok([]);
}

function handleSubmitBallot(state: GameState, command: SubmitBallotIntent): CommandResult {
  if (state.phase !== "voting") {
    return err("invalid_phase", "Ballots are only accepted during voting");
  }

  const actor = getActiveActor(state, command.actorSessionPlayerId);
  if (!actor) {
    return err("not_joined", "Actor is not an active session player");
  }

  const expectedType = expectedBallotType(state.roundIndex);
  if (command.ballotType !== expectedType) {
    return err("invalid_ballot_type", "Ballot type does not match current round");
  }
  if (command.ballotType === "decision" && command.abstain) {
    return err("decision_ballot_requires_target", "Decision ballot cannot abstain");
  }

  const duplicate = getCurrentRoundBallots(state, command.ballotType).some(
    (ballot) => ballot.actorSessionPlayerId === actor.id
  );
  if (duplicate) {
    return err("duplicate_ballot", "Actor already voted in this round");
  }

  let targetSessionPlayerId: string | undefined;
  if (!command.abstain) {
    if (command.targetGameNumber === undefined) {
      return err("invalid_target", "Non-abstain ballot requires a target");
    }

    const target = findSessionPlayerByGameNumber(state, command.targetGameNumber);
    if (!target || !target.isActive) {
      return err("invalid_target", "Ballot target does not exist or is inactive");
    }
    if (target.id === actor.id) {
      return err("forbidden_self_vote", "Actor cannot vote for self");
    }

    targetSessionPlayerId = target.id;
  }

  const ballot: Ballot = {
    id: `ballot_${state.roundIndex}_${actor.id}_${command.ballotType}`,
    roundIndex: state.roundIndex,
    actorSessionPlayerId: actor.id,
    ballotType: command.ballotType,
    abstain: command.abstain,
    createdAt: new Date().toISOString()
  };
  if (targetSessionPlayerId !== undefined) {
    ballot.targetSessionPlayerId = targetSessionPlayerId;
  }

  state.ballots.push(ballot);
  appendEvent(state, "ballot.submitted", {
    actorSessionPlayerId: actor.id,
    roundIndex: state.roundIndex,
    phase: state.phase,
    payload: {
      ballotType: command.ballotType,
      targetSessionPlayerId,
      abstain: command.abstain
    }
  });
  maybeAdvanceAfterBallot(state);
  return ok([]);
}

function getActiveActor(state: GameState, actorSessionPlayerId: string) {
  return getActiveSessionPlayers(state).find((player) => player.id === actorSessionPlayerId);
}
