import {
  getActiveSessionPlayers,
  getCurrentQuestion,
  getCurrentRoundAnswers
} from "../state";
import type { GameState, SessionPlayer } from "../types";

export type VisibleAction = "submit_answer" | "send_chat" | "submit_ballot" | "noop";

export type AgentVisibleContext = {
  session: {
    sessionId: string;
    roomCode: string;
    phase: GameState["phase"];
    roundIndex: number;
    phaseEndsAt: number;
  };
  self: {
    sessionPlayerId: string;
    gameNumber: number;
    playerType: SessionPlayer["playerType"];
    role: SessionPlayer["role"];
    controlMode: SessionPlayer["controlMode"];
  };
  visiblePlayers: Array<{
    sessionPlayerId: string;
    gameNumber: number;
    displayName: string;
    isSelf: boolean;
    isActive: boolean;
  }>;
  currentQuestion: {
    roundIndex: number;
    kind: string;
    prompt: string;
  };
  revealedAnswers: Array<{
    sessionPlayerId: string;
    gameNumber: number;
    displayName: string;
    content: string;
  }>;
  discussionMessages: Array<{
    id: string;
    sessionPlayerId: string;
    gameNumber: number;
    displayName: string;
    content: string;
    createdAt: string;
  }>;
  allowedActions: VisibleAction[];
  allRoles?: Array<{
    sessionPlayerId: string;
    gameNumber: number;
    role: SessionPlayer["role"];
  }>;
};

export function buildAgentVisibleContext(
  state: GameState,
  selfPlayerId: string
): AgentVisibleContext {
  const self = state.sessionPlayers.find((player) => player.id === selfPlayerId);
  if (!self) {
    throw new Error("agent_assignment_inactive");
  }

  const players = getActiveSessionPlayers(state);
  const context: AgentVisibleContext = {
    session: {
      sessionId: state.sessionId,
      roomCode: state.roomCode,
      phase: state.phase,
      roundIndex: state.roundIndex,
      phaseEndsAt: state.phaseEndsAt
    },
    self: {
      sessionPlayerId: self.id,
      gameNumber: self.gameNumber,
      playerType: self.playerType,
      role: self.role,
      controlMode: self.controlMode
    },
    visiblePlayers: players.map((player) => ({
      sessionPlayerId: player.id,
      gameNumber: player.gameNumber,
      displayName: player.displayName,
      isSelf: player.id === self.id,
      isActive: player.isActive
    })),
    currentQuestion: getCurrentQuestion(state),
    revealedAnswers: getCurrentRoundAnswers(state).map((answer) => {
      const player = state.sessionPlayers.find((item) => item.id === answer.sessionPlayerId)!;
      return {
        sessionPlayerId: answer.sessionPlayerId,
        gameNumber: player.gameNumber,
        displayName: player.displayName,
        content: answer.content
      };
    }),
    discussionMessages: state.messages
      .filter((message) => message.roundIndex === state.roundIndex)
      .map((message) => {
        const player = state.sessionPlayers.find((item) => item.id === message.sessionPlayerId)!;
        return {
          id: message.id,
          sessionPlayerId: message.sessionPlayerId,
          gameNumber: player.gameNumber,
          displayName: player.displayName,
          content: message.content,
          createdAt: message.createdAt
        };
      }),
    allowedActions: allowedActionsForPhase(state.phase)
  };

  if (state.phase === "settlement") {
    context.allRoles = players.map((player) => ({
      sessionPlayerId: player.id,
      gameNumber: player.gameNumber,
      role: player.role
    }));
  }

  return context;
}

function allowedActionsForPhase(phase: GameState["phase"]): VisibleAction[] {
  switch (phase) {
    case "answer_prep":
      return ["submit_answer"];
    case "discussion":
      return ["send_chat"];
    case "voting":
      return ["submit_ballot"];
    case "answer_reveal":
    case "settlement":
    case "lobby":
      return ["noop"];
  }
}
