import type {
  BallotType,
  ControlMode,
  GamePhase,
  PlayerRole,
  PlayerType,
  WinnerSide
} from "@wiai/kernel";

export type RoomStatus = "lobby" | "playing" | "ended";
export type LobbyPlayerStatus = "online" | "disconnected" | "left";

export type PhaseDurations = {
  answer_prep: number;
  answer_reveal: number;
  discussion: number;
  voting: number;
  settlement: number;
};

export type GameConfig = {
  minPlayers: number;
  maxPlayers: number;
  phaseDurationsMs: PhaseDurations;
};

export type Question = {
  roundIndex: number;
  kind: string;
  prompt: string;
};

export type LobbyPlayer = {
  id: string;
  nickname: string;
  isHost: boolean;
  isReady: boolean;
  status: LobbyPlayerStatus;
};

export type SessionPlayer = {
  id: string;
  lobbyPlayerId?: string;
  gameNumber: number;
  displayName: string;
  playerType: PlayerType;
  role: PlayerRole;
  controlMode: ControlMode;
  isActive: boolean;
};

export type Round = {
  id: string;
  roundIndex: number;
  question: Question;
};

export type Answer = {
  id: string;
  roundIndex: number;
  sessionPlayerId: string;
  content: string;
  submittedAt: string;
};

export type ChatMessage = {
  id: string;
  roundIndex: number;
  sessionPlayerId: string;
  content: string;
  createdAt: string;
};

export type Ballot = {
  id: string;
  roundIndex: number;
  actorSessionPlayerId: string;
  ballotType: BallotType;
  targetSessionPlayerId?: string;
  abstain: boolean;
  createdAt: string;
};

export type GameResult = {
  winnerSide: WinnerSide;
  frozenSessionPlayerId: string;
};

export type GameEventType =
  | "room.created"
  | "player.joined"
  | "player.left"
  | "player.ready_changed"
  | "game.started"
  | "phase.started"
  | "answer.submitted"
  | "answer.cancelled"
  | "answer.revealed"
  | "message.posted"
  | "ballot.submitted"
  | "round.completed"
  | "game.settled"
  | "agent.assignment_started"
  | "agent.suggestion_received"
  | "agent.suggestion_executed"
  | "agent.suggestion_rejected";

export type GameEvent = {
  id: string;
  sequence: number;
  sessionId: string;
  roomId: string;
  type: GameEventType;
  actorSessionPlayerId?: string;
  actorLobbyPlayerId?: string;
  roundIndex?: number;
  phase?: GamePhase;
  payload: unknown;
  createdAt: string;
};

export type GameState = {
  roomId: string;
  roomCode: string;
  status: RoomStatus;
  phase: GamePhase;
  phaseVersion: number;
  roundIndex: number;
  phaseEndsAt: number;
  config: GameConfig;
  lobbyPlayers: LobbyPlayer[];
  sessionId: string;
  sessionPlayers: SessionPlayer[];
  rounds: Round[];
  questions: Question[];
  answers: Answer[];
  messages: ChatMessage[];
  ballots: Ballot[];
  events: GameEvent[];
  result?: GameResult;
  nextEventSequence: number;
};

export type GameErrorCode =
  | "not_joined"
  | "not_host"
  | "room_not_lobby"
  | "room_not_playing"
  | "not_enough_players"
  | "players_not_ready"
  | "room_full"
  | "invalid_debug_player_count"
  | "invalid_phase"
  | "invalid_content"
  | "duplicate_answer"
  | "answer_not_submitted"
  | "invalid_ballot_type"
  | "decision_ballot_requires_target"
  | "invalid_target"
  | "forbidden_self_vote"
  | "duplicate_ballot";

export type ReadyIntent = {
  type: "ready";
  actorLobbyPlayerId: string;
  requestId?: string;
  isReady: boolean;
};

export type StartGameIntent = {
  type: "start_game";
  actorLobbyPlayerId: string;
  requestId?: string;
};

export type AddDebugPlayersIntent = {
  type: "add_debug_players";
  actorLobbyPlayerId: string;
  requestId?: string;
  count: number;
};

export type SubmitAnswerIntent = {
  type: "submit_answer";
  actorSessionPlayerId: string;
  requestId?: string;
  content: string;
};

export type CancelSubmitAnswerIntent = {
  type: "cancel_submit_answer";
  actorSessionPlayerId: string;
  requestId?: string;
};

export type SendChatIntent = {
  type: "send_chat";
  actorSessionPlayerId: string;
  requestId?: string;
  content: string;
};

export type SubmitBallotIntent = {
  type: "submit_ballot";
  actorSessionPlayerId: string;
  requestId?: string;
  ballotType: BallotType;
  targetGameNumber?: number;
  abstain: boolean;
};

export type DomainCommand =
  | ReadyIntent
  | StartGameIntent
  | AddDebugPlayersIntent
  | SubmitAnswerIntent
  | CancelSubmitAnswerIntent
  | SendChatIntent
  | SubmitBallotIntent;
