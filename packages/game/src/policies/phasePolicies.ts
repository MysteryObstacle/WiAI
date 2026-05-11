import type { BallotType, GamePhase } from "@wiai/kernel";
import {
  appendEvent,
  beginPhase,
  beginRound,
  getActiveSessionPlayers,
  getCurrentRoundAnswers,
  getCurrentRoundBallots
} from "../state";
import type { GameState } from "../types";
import { resolveSettlement } from "./settlementPolicy";

export function expectedBallotType(roundIndex: number): BallotType {
  return roundIndex === 2 ? "decision" : "suspicion";
}

export function maybeAdvanceAfterAnswer(state: GameState): void {
  if (state.phase !== "answer_prep") {
    return;
  }

  const activeIds = new Set(getActiveSessionPlayers(state).map((player) => player.id));
  const answeredIds = new Set(
    getCurrentRoundAnswers(state)
      .filter((answer) => activeIds.has(answer.sessionPlayerId))
      .map((answer) => answer.sessionPlayerId)
  );

  if (activeIds.size > 0 && answeredIds.size === activeIds.size) {
    beginPhase(state, "answer_reveal");
  }
}

export function maybeAdvanceAfterBallot(state: GameState): void {
  if (state.phase !== "voting") {
    return;
  }

  const ballotType = expectedBallotType(state.roundIndex);
  const activeIds = new Set(getActiveSessionPlayers(state).map((player) => player.id));
  const ballotActorIds = new Set(
    getCurrentRoundBallots(state, ballotType)
      .filter((ballot) => activeIds.has(ballot.actorSessionPlayerId))
      .map((ballot) => ballot.actorSessionPlayerId)
  );

  if (activeIds.size > 0 && ballotActorIds.size === activeIds.size) {
    advanceFromVoting(state);
  }
}

export function advanceOnTimeout(state: GameState, expectedPhaseVersion: number): void {
  if (state.phaseVersion !== expectedPhaseVersion || state.phase === "settlement") {
    return;
  }

  switch (state.phase) {
    case "answer_prep":
      beginPhase(state, "answer_reveal");
      break;
    case "answer_reveal":
      beginPhase(state, "discussion");
      break;
    case "discussion":
      beginPhase(state, "voting");
      break;
    case "voting":
      advanceFromVoting(state);
      break;
    case "lobby":
      break;
  }
}

export function forcePhase(state: GameState, phase: GamePhase): void {
  beginPhase(state, phase);
}

function advanceFromVoting(state: GameState): void {
  appendEvent(state, "round.completed", {
    roundIndex: state.roundIndex,
    payload: { roundIndex: state.roundIndex }
  });

  if (state.roundIndex < 2) {
    beginRound(state, state.roundIndex + 1);
    beginPhase(state, "answer_prep");
    return;
  }

  state.result = resolveSettlement(state);
  state.status = "ended";
  beginPhase(state, "settlement");
  appendEvent(state, "game.settled", {
    roundIndex: state.roundIndex,
    phase: "settlement",
    payload: state.result
  });
}
