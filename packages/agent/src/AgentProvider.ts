import type {
  ControlMode,
  GamePhase,
  PlayerRole,
  PlayerType
} from "@wiai/kernel";

export type AgentVisibleContext = {
  session: {
    sessionId: string;
    roomCode: string;
    phase: GamePhase;
    roundIndex: number;
    phaseEndsAt: number;
  };
  self: {
    sessionPlayerId: string;
    gameNumber: number;
    playerType: PlayerType;
    role: PlayerRole;
    controlMode: ControlMode;
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
  allowedActions: Array<"submit_answer" | "send_chat" | "submit_ballot" | "noop">;
  allRoles?: Array<{
    sessionPlayerId: string;
    gameNumber: number;
    role: PlayerRole;
  }>;
};

export type AgentSuggestion =
  | {
      type: "action_suggestion";
      payload: {
        type: "submit_answer";
        payload: { content: string };
        requestId: string;
      };
    }
  | {
      type: "action_suggestion";
      payload: {
        type: "send_chat";
        payload: { content: string };
        requestId: string;
      };
    }
  | {
      type: "action_suggestion";
      payload: {
        type: "submit_ballot";
        payload: {
          ballotType: "suspicion" | "decision";
          targetGameNumber?: number;
          abstain: boolean;
        };
        requestId: string;
      };
    }
  | {
      type: "action_suggestion";
      payload: {
        type: "noop";
        payload: Record<string, never>;
        requestId: string;
      };
    };

export interface AgentProvider {
  suggest(context: AgentVisibleContext): Promise<AgentSuggestion>;
}
