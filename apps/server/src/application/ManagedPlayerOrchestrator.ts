import { ok, type Result } from "@wiai/kernel";
import {
  expectedBallotType,
  getActiveSessionPlayers,
  getCurrentQuestion,
  type DomainCommand,
  type GameErrorCode,
  type GameEvent,
  type GameState,
  type SessionPlayer
} from "@wiai/game";
import type { RoomApplicationService } from "./RoomApplicationService";

type ManagedPlayerOptions = {
  shouldSendDiscussionMessage?: (player: SessionPlayer, state: GameState) => boolean;
  chooseVoteTarget?: (
    player: SessionPlayer,
    candidates: SessionPlayer[],
    state: GameState
  ) => SessionPlayer;
};

export class ManagedPlayerOrchestrator {
  private readonly shouldSendDiscussionMessage: NonNullable<
    ManagedPlayerOptions["shouldSendDiscussionMessage"]
  >;
  private readonly chooseVoteTarget: NonNullable<ManagedPlayerOptions["chooseVoteTarget"]>;

  constructor(
    private readonly service: RoomApplicationService,
    options: ManagedPlayerOptions = {}
  ) {
    this.shouldSendDiscussionMessage =
      options.shouldSendDiscussionMessage ?? (() => Math.random() >= 0.35);
    this.chooseVoteTarget =
      options.chooseVoteTarget ??
      ((_player, candidates) => candidates[Math.floor(Math.random() * candidates.length)]!);
  }

  runOnce(): Result<GameEvent[], GameErrorCode> {
    const state = this.service.state;
    if (state.status !== "playing") {
      return ok([]);
    }

    const commands = this.buildCommands(state);
    const events: GameEvent[] = [];
    for (const command of commands) {
      const result = this.service.execute(command);
      if (!result.ok) {
        return result;
      }
      events.push(...result.value);
    }

    return ok(events);
  }

  private buildCommands(state: GameState): DomainCommand[] {
    const players = getActiveSessionPlayers(state).filter(
      (player) => player.playerType === "human" && player.controlMode === "managed"
    );
    return players.flatMap((player) => {
      const command = this.buildCommandForPlayer(state, player);
      return command ? [command] : [];
    });
  }

  private buildCommandForPlayer(
    state: GameState,
    player: SessionPlayer
  ): DomainCommand | undefined {
    if (state.phase === "answer_prep") {
      return this.buildAnswerCommand(state, player);
    }
    if (state.phase === "discussion") {
      return this.buildChatCommand(state, player);
    }
    if (state.phase === "voting") {
      return this.buildBallotCommand(state, player);
    }
    return undefined;
  }

  private buildAnswerCommand(state: GameState, player: SessionPlayer): DomainCommand | undefined {
    const alreadyAnswered = state.answers.some(
      (answer) => answer.roundIndex === state.roundIndex && answer.sessionPlayerId === player.id
    );
    if (alreadyAnswered) {
      return undefined;
    }

    return {
      type: "submit_answer",
      actorSessionPlayerId: player.id,
      requestId: `managed_answer_${state.roundIndex}_${player.id}`,
      content: `Player ${player.gameNumber} debug answer: ${getCurrentQuestion(state).prompt}`
    };
  }

  private buildChatCommand(state: GameState, player: SessionPlayer): DomainCommand | undefined {
    const alreadySpoke = state.messages.some(
      (message) => message.roundIndex === state.roundIndex && message.sessionPlayerId === player.id
    );
    if (alreadySpoke || !this.shouldSendDiscussionMessage(player, state)) {
      return undefined;
    }

    return {
      type: "send_chat",
      actorSessionPlayerId: player.id,
      requestId: `managed_chat_${state.roundIndex}_${player.id}`,
      content: `Player ${player.gameNumber}: I am comparing concrete details before voting.`
    };
  }

  private buildBallotCommand(state: GameState, player: SessionPlayer): DomainCommand | undefined {
    const ballotType = expectedBallotType(state.roundIndex);
    const alreadyVoted = state.ballots.some(
      (ballot) =>
        ballot.roundIndex === state.roundIndex &&
        ballot.actorSessionPlayerId === player.id &&
        ballot.ballotType === ballotType
    );
    if (alreadyVoted) {
      return undefined;
    }

    const candidates = getActiveSessionPlayers(state).filter((candidate) => candidate.id !== player.id);
    if (candidates.length < 1) {
      if (ballotType === "decision") {
        return undefined;
      }
      return {
        type: "submit_ballot",
        actorSessionPlayerId: player.id,
        requestId: `managed_ballot_${state.roundIndex}_${player.id}`,
        ballotType,
        abstain: true
      };
    }

    const target = this.chooseVoteTarget(player, candidates, state);
    return {
      type: "submit_ballot",
      actorSessionPlayerId: player.id,
      requestId: `managed_ballot_${state.roundIndex}_${player.id}`,
      ballotType,
      targetGameNumber: target.gameNumber,
      abstain: false
    };
  }
}
