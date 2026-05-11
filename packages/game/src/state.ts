import type { GamePhase } from "@wiai/kernel";
import type {
  GameConfig,
  GameEvent,
  GameEventType,
  GameState,
  LobbyPlayer,
  Question,
  Round,
  SessionPlayer
} from "./types";

const defaultQuestions: Question[] = [
  {
    roundIndex: 0,
    kind: "value_judgment",
    prompt: "If you had to remove one everyday app from your phone, which would it be and why?"
  },
  {
    roundIndex: 1,
    kind: "preference",
    prompt: "Choose one skill every person should learn before age twenty and explain it briefly."
  },
  {
    roundIndex: 2,
    kind: "scenario",
    prompt: "A team has one hour to fix a critical issue. What role do you take first?"
  }
];

export type CreateInitialGameStateInput = {
  roomId: string;
  roomCode: string;
  config: GameConfig;
  questions?: Question[];
};

export function createInitialGameState(input: CreateInitialGameStateInput): GameState {
  return {
    roomId: input.roomId,
    roomCode: input.roomCode,
    status: "lobby",
    phase: "lobby",
    phaseVersion: 0,
    roundIndex: -1,
    phaseEndsAt: 0,
    config: input.config,
    lobbyPlayers: [],
    sessionId: "",
    sessionPlayers: [],
    rounds: [],
    questions: input.questions ?? defaultQuestions,
    answers: [],
    messages: [],
    ballots: [],
    events: [],
    nextEventSequence: 1
  };
}

export function addLobbyPlayer(
  state: GameState,
  player: Pick<LobbyPlayer, "id" | "nickname" | "isHost"> & Partial<Pick<LobbyPlayer, "isReady" | "status">>
): LobbyPlayer {
  const lobbyPlayer: LobbyPlayer = {
    id: player.id,
    nickname: player.nickname,
    isHost: player.isHost,
    isReady: player.isReady ?? false,
    status: player.status ?? "online"
  };

  state.lobbyPlayers.push(lobbyPlayer);
  appendEvent(state, "player.joined", {
    actorLobbyPlayerId: lobbyPlayer.id,
    payload: { nickname: lobbyPlayer.nickname, isHost: lobbyPlayer.isHost }
  });

  return lobbyPlayer;
}

export function readyLobbyPlayer(state: GameState, lobbyPlayerId: string, isReady: boolean): void {
  const player = state.lobbyPlayers.find((item) => item.id === lobbyPlayerId);
  if (!player) {
    return;
  }

  player.isReady = isReady;
  appendEvent(state, "player.ready_changed", {
    actorLobbyPlayerId: player.id,
    payload: { isReady }
  });
}

export function getOnlineLobbyPlayers(state: GameState): LobbyPlayer[] {
  return state.lobbyPlayers.filter((player) => player.status === "online");
}

export function getHostLobbyPlayer(state: GameState): LobbyPlayer | undefined {
  return state.lobbyPlayers.find((player) => player.isHost);
}

export function getActiveSessionPlayers(state: GameState): SessionPlayer[] {
  return state.sessionPlayers.filter((player) => player.isActive);
}

export function findSessionPlayerByLobbyId(
  state: GameState,
  lobbyPlayerId: string
): SessionPlayer | undefined {
  return state.sessionPlayers.find((player) => player.lobbyPlayerId === lobbyPlayerId);
}

export function findSessionPlayerByGameNumber(
  state: GameState,
  gameNumber: number
): SessionPlayer | undefined {
  return state.sessionPlayers.find((player) => player.gameNumber === gameNumber);
}

export function getCurrentRound(state: GameState): Round {
  const round = state.rounds.find((item) => item.roundIndex === state.roundIndex);
  if (!round) {
    throw new Error("round_not_started");
  }

  return round;
}

export function getCurrentQuestion(state: GameState): Question {
  return getCurrentRound(state).question;
}

export function getCurrentRoundAnswers(state: GameState) {
  return state.answers.filter((answer) => answer.roundIndex === state.roundIndex);
}

export function getCurrentRoundBallots(state: GameState, ballotType?: "suspicion" | "decision") {
  return state.ballots.filter(
    (ballot) =>
      ballot.roundIndex === state.roundIndex &&
      (ballotType === undefined || ballot.ballotType === ballotType)
  );
}

export function beginRound(state: GameState, roundIndex: number): void {
  const question = state.questions[roundIndex] ?? {
    roundIndex,
    kind: "fallback",
    prompt: `Round ${roundIndex + 1}: convince the table you are human.`
  };

  if (!state.rounds.some((round) => round.roundIndex === roundIndex)) {
    state.rounds.push({
      id: `round_${roundIndex}`,
      roundIndex,
      question
    });
  }

  state.roundIndex = roundIndex;
}

export function beginPhase(state: GameState, phase: GamePhase, now = Date.now()): GameEvent {
  state.phase = phase;
  state.phaseVersion += 1;
  state.phaseEndsAt = now + getPhaseDuration(state, phase);

  const eventInput: {
    roundIndex?: number;
    phase: GamePhase;
    payload: unknown;
  } = {
    phase,
    payload: {
      phase,
      phaseVersion: state.phaseVersion,
      phaseEndsAt: state.phaseEndsAt
    }
  };
  if (state.roundIndex >= 0) {
    eventInput.roundIndex = state.roundIndex;
  }

  return appendEvent(state, "phase.started", eventInput);
}

export function appendEvent(
  state: GameState,
  type: GameEventType,
  input: {
    actorSessionPlayerId?: string;
    actorLobbyPlayerId?: string;
    roundIndex?: number;
    phase?: GamePhase;
    payload: unknown;
  }
): GameEvent {
  const event: GameEvent = {
    id: `event_${state.roomId}_${state.nextEventSequence}`,
    sequence: state.nextEventSequence,
    sessionId: state.sessionId || `session_${state.roomId}`,
    roomId: state.roomId,
    type,
    payload: input.payload,
    createdAt: new Date().toISOString()
  };

  if (input.actorSessionPlayerId !== undefined) {
    event.actorSessionPlayerId = input.actorSessionPlayerId;
  }
  if (input.actorLobbyPlayerId !== undefined) {
    event.actorLobbyPlayerId = input.actorLobbyPlayerId;
  }
  if (input.roundIndex !== undefined) {
    event.roundIndex = input.roundIndex;
  }
  if (input.phase !== undefined) {
    event.phase = input.phase;
  }

  state.nextEventSequence += 1;
  state.events.push(event);
  return event;
}

function getPhaseDuration(state: GameState, phase: GamePhase): number {
  if (phase === "lobby") {
    return 0;
  }

  return state.config.phaseDurationsMs[phase];
}
