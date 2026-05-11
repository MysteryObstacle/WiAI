import { describe, expect, it } from "vitest";
import { agentSuggestionSchema, agentVisibleContextSchema } from "./agent";

describe("agent protocol schemas", () => {
  it("rejects unknown suggestion types", () => {
    const parsed = agentSuggestionSchema.safeParse({
      type: "action_suggestion",
      payload: {
        type: "teleport",
        payload: {},
        requestId: "agent_req_1"
      }
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts visible context without hidden roles for other players", () => {
    const context = agentVisibleContextSchema.parse({
      session: {
        sessionId: "session_1",
        roomCode: "ABC123",
        phase: "discussion",
        roundIndex: 1,
        phaseEndsAt: 1760000000000
      },
      self: {
        sessionPlayerId: "sp_ai",
        gameNumber: 4,
        playerType: "ai",
        role: "ai",
        controlMode: "agent"
      },
      visiblePlayers: [
        {
          sessionPlayerId: "sp_1",
          gameNumber: 1,
          displayName: "Ada",
          isSelf: false,
          isActive: true
        }
      ],
      currentQuestion: {
        roundIndex: 1,
        kind: "value_judgment",
        prompt: "Which app would you delete?"
      },
      revealedAnswers: [],
      discussionMessages: [],
      allowedActions: ["send_chat"]
    });

    expect(context.visiblePlayers[0]).not.toHaveProperty("role");
  });
});
