import type { AgentProvider, AgentSuggestion, AgentVisibleContext } from "./AgentProvider";

export class MockAgentProvider implements AgentProvider {
  async suggest(context: AgentVisibleContext): Promise<AgentSuggestion> {
    const requestId = [
      "agent",
      context.session.sessionId,
      context.session.phase,
      context.session.roundIndex
    ].join("_");

    switch (context.session.phase) {
      case "answer_prep":
        return {
          type: "action_suggestion",
          payload: {
            type: "submit_answer",
            payload: {
              content: buildAnswer(context)
            },
            requestId
          }
        };
      case "discussion":
        return {
          type: "action_suggestion",
          payload: {
            type: "send_chat",
            payload: {
              content: buildChat(context)
            },
            requestId
          }
        };
      case "voting":
        return buildBallot(context, requestId);
      case "lobby":
      case "answer_reveal":
      case "settlement":
        return noop(requestId);
    }
  }
}

function buildAnswer(context: AgentVisibleContext): string {
  return `I would choose the option that creates the clearest human tradeoff: ${context.currentQuestion.prompt}`;
}

function buildChat(context: AgentVisibleContext): string {
  const target = context.visiblePlayers.find((player) => !player.isSelf && player.isActive);
  if (!target) {
    return "I am comparing the answers by specificity and personal reasoning.";
  }

  return `Player ${target.gameNumber} is worth discussing because their answer leaves room for interpretation.`;
}

function buildBallot(context: AgentVisibleContext, requestId: string): AgentSuggestion {
  const target = context.visiblePlayers.find((player) => !player.isSelf && player.isActive);
  if (!target) {
    return context.session.roundIndex === 2
      ? noop(requestId)
      : {
          type: "action_suggestion",
          payload: {
            type: "submit_ballot",
            payload: {
              ballotType: "suspicion",
              abstain: true
            },
            requestId
          }
        };
  }

  return {
    type: "action_suggestion",
    payload: {
      type: "submit_ballot",
      payload: {
        ballotType: context.session.roundIndex === 2 ? "decision" : "suspicion",
        targetGameNumber: target.gameNumber,
        abstain: false
      },
      requestId
    }
  };
}

function noop(requestId: string): AgentSuggestion {
  return {
    type: "action_suggestion",
    payload: {
      type: "noop",
      payload: {},
      requestId
    }
  };
}
