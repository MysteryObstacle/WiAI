import { describe, expect, it } from "vitest";
import { MockAgentProvider } from "./mockAgent";
import type { AgentVisibleContext } from "./AgentProvider";

function makeContext(phase: AgentVisibleContext["session"]["phase"]): AgentVisibleContext {
  return {
    session: {
      sessionId: "session_1",
      roomCode: "ABC123",
      phase,
      roundIndex: phase === "voting" ? 2 : 0,
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
      },
      {
        sessionPlayerId: "sp_ai",
        gameNumber: 4,
        displayName: "Mock AI",
        isSelf: true,
        isActive: true
      }
    ],
    currentQuestion: {
      roundIndex: 0,
      kind: "value_judgment",
      prompt: "Which app would you delete?"
    },
    revealedAnswers: [],
    discussionMessages: [],
    allowedActions:
      phase === "answer_prep"
        ? ["submit_answer"]
        : phase === "discussion"
          ? ["send_chat"]
          : phase === "voting"
            ? ["submit_ballot"]
            : ["noop"]
  };
}

describe("MockAgentProvider", () => {
  it("suggests an answer during answer_prep", async () => {
    await expect(new MockAgentProvider().suggest(makeContext("answer_prep"))).resolves.toMatchObject({
      type: "action_suggestion",
      payload: {
        type: "submit_answer"
      }
    });
  });

  it("suggests chat during discussion", async () => {
    await expect(new MockAgentProvider().suggest(makeContext("discussion"))).resolves.toMatchObject({
      payload: {
        type: "send_chat"
      }
    });
  });

  it("suggests a final decision ballot against another active player during voting", async () => {
    const suggestion = await new MockAgentProvider().suggest(makeContext("voting"));

    expect(suggestion).toMatchObject({
      payload: {
        type: "submit_ballot",
        payload: {
          ballotType: "decision",
          targetGameNumber: 1,
          abstain: false
        }
      }
    });
  });

  it("returns noop for reveal and settlement phases", async () => {
    await expect(new MockAgentProvider().suggest(makeContext("answer_reveal"))).resolves.toMatchObject({
      payload: { type: "noop" }
    });
    await expect(new MockAgentProvider().suggest(makeContext("settlement"))).resolves.toMatchObject({
      payload: { type: "noop" }
    });
  });
});
