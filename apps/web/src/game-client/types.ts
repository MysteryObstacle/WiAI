export type LobbyPlayerSnapshot = {
  id: string;
  nickname: string;
  isHost: boolean;
  isReady: boolean;
  status: string;
};

export type SessionPlayerSnapshot = {
  id: string;
  lobbyPlayerId: string;
  gameNumber: number;
  displayName: string;
  playerType: "human" | "ai";
  role: "" | "citizen" | "shelterer" | "ai";
  controlMode: string;
  isActive: boolean;
};

export type AnswerSnapshot = {
  id: string;
  roundIndex: number;
  sessionPlayerId: string;
  content: string;
  submittedAt: string;
};

export type MessageSnapshot = {
  id: string;
  roundIndex: number;
  sessionPlayerId: string;
  content: string;
  createdAt: string;
};

export type BallotSnapshot = {
  id: string;
  roundIndex: number;
  actorSessionPlayerId: string;
  ballotType: string;
  targetSessionPlayerId: string;
  abstain: boolean;
};

export type QuestionSnapshot = {
  roundIndex: number;
  kind: string;
  prompt: string;
};

export type WiaiSnapshot = {
  roomId: string;
  roomCode: string;
  status: "lobby" | "playing" | "ended";
  phase:
    | "lobby"
    | "answer_prep"
    | "answer_reveal"
    | "discussion"
    | "voting"
    | "settlement";
  phaseVersion: number;
  roundIndex: number;
  phaseEndsAt: number;
  lobbyPlayers: LobbyPlayerSnapshot[];
  sessionPlayers: SessionPlayerSnapshot[];
  answers: AnswerSnapshot[];
  messages: MessageSnapshot[];
  ballots: BallotSnapshot[];
  questions: QuestionSnapshot[];
  result: {
    winnerSide: "" | "citizen" | "ai" | "shelterer";
    frozenSessionPlayerId: string;
  };
};
