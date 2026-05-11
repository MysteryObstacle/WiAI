import { MockAgentProvider, type AgentProvider } from "@wiai/agent";
import { err, ok, type Result } from "@wiai/kernel";
import { agentSuggestionSchema } from "@wiai/schema";
import {
  buildAgentVisibleContext,
  type DomainCommand,
  type GameErrorCode,
  type GameEvent
} from "@wiai/game";
import type { RoomApplicationService } from "./RoomApplicationService";

export class AgentOrchestrator {
  constructor(
    private readonly service: RoomApplicationService,
    private readonly provider: AgentProvider = new MockAgentProvider()
  ) {}

  async runOnce(): Promise<Result<GameEvent[], GameErrorCode | "agent_suggestion_rejected">> {
    const aiPlayer = this.service.state.sessionPlayers.find(
      (player) => player.playerType === "ai" && player.controlMode === "agent" && player.isActive
    );
    if (!aiPlayer || this.service.state.status !== "playing") {
      return ok([]);
    }

    const context = buildAgentVisibleContext(this.service.state, aiPlayer.id);
    const suggestion = await this.provider.suggest(context);
    this.service.recordAgentEvent("agent.suggestion_received", {
      actorSessionPlayerId: aiPlayer.id,
      payload: suggestion
    });

    const parsed = agentSuggestionSchema.safeParse(suggestion);
    if (!parsed.success) {
      return this.service.rejectAgentSuggestion(aiPlayer.id, parsed.error.flatten());
    }

    const payload = parsed.data.payload;
    if (payload.type === "noop") {
      return ok([]);
    }

    const command: DomainCommand =
      payload.type === "submit_answer"
        ? {
            type: "submit_answer",
            actorSessionPlayerId: aiPlayer.id,
            requestId: payload.requestId,
            content: payload.payload.content
          }
        : payload.type === "send_chat"
          ? {
              type: "send_chat",
              actorSessionPlayerId: aiPlayer.id,
              requestId: payload.requestId,
              content: payload.payload.content
            }
          : {
              type: "submit_ballot",
              actorSessionPlayerId: aiPlayer.id,
              requestId: payload.requestId,
              ballotType: payload.payload.ballotType,
              abstain: payload.payload.abstain,
              ...(payload.payload.targetGameNumber === undefined
                ? {}
                : { targetGameNumber: payload.payload.targetGameNumber })
            };

    const result = this.service.execute(command);
    if (!result.ok) {
      this.service.recordAgentEvent("agent.suggestion_rejected", {
        actorSessionPlayerId: aiPlayer.id,
        payload: { suggestion, error: result.error }
      });
      return err("agent_suggestion_rejected", result.error.message, result.error);
    }

    this.service.recordAgentEvent("agent.suggestion_executed", {
      actorSessionPlayerId: aiPlayer.id,
      payload: { suggestion, eventIds: result.value.map((event) => event.id) }
    });
    return result;
  }
}
