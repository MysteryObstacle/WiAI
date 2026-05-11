import type { WinnerSide } from "@wiai/kernel";
import { getActiveSessionPlayers } from "../state";
import type { GameResult, GameState, SessionPlayer } from "../types";

export interface SettlementPolicy {
  resolve(state: GameState): GameResult;
}

export class FinalDecisionSettlementPolicy implements SettlementPolicy {
  resolve(state: GameState): GameResult {
    const activePlayers = getActiveSessionPlayers(state);
    const finalBallots = state.ballots.filter(
      (ballot) =>
        ballot.roundIndex === 2 &&
        ballot.ballotType === "decision" &&
        !ballot.abstain &&
        ballot.targetSessionPlayerId
    );

    const counts = new Map<string, number>();
    for (const ballot of finalBallots) {
      counts.set(ballot.targetSessionPlayerId!, (counts.get(ballot.targetSessionPlayerId!) ?? 0) + 1);
    }

    const frozen =
      activePlayers
        .filter((player) => counts.has(player.id))
        .sort((left, right) => {
          const voteDelta = (counts.get(right.id) ?? 0) - (counts.get(left.id) ?? 0);
          return voteDelta !== 0 ? voteDelta : left.gameNumber - right.gameNumber;
        })[0] ?? activePlayers.sort((left, right) => left.gameNumber - right.gameNumber)[0];

    if (!frozen) {
      throw new Error("settlement_requires_active_player");
    }

    return {
      winnerSide: winnerForFrozenPlayer(frozen),
      frozenSessionPlayerId: frozen.id
    };
  }
}

export function resolveSettlement(state: GameState): GameResult {
  return new FinalDecisionSettlementPolicy().resolve(state);
}

function winnerForFrozenPlayer(player: SessionPlayer): WinnerSide {
  if (player.role === "ai") {
    return "citizen";
  }

  if (player.role === "shelterer") {
    return "shelterer";
  }

  return "ai";
}
