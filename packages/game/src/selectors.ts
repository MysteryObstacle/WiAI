import {
  getActiveSessionPlayers,
  getCurrentQuestion,
  getCurrentRoundAnswers,
  getCurrentRoundBallots
} from "./state";
import type { GameState } from "./types";

export function selectPublicRoomState(state: GameState) {
  return {
    roomId: state.roomId,
    roomCode: state.roomCode,
    status: state.status,
    phase: state.phase,
    phaseVersion: state.phaseVersion,
    roundIndex: state.roundIndex,
    phaseEndsAt: state.phaseEndsAt,
    lobbyPlayers: state.lobbyPlayers,
    sessionPlayers: state.sessionPlayers.map((player) => ({
      id: player.id,
      lobbyPlayerId: player.lobbyPlayerId,
      gameNumber: player.gameNumber,
      displayName: player.displayName,
      playerType: player.playerType,
      controlMode: player.controlMode,
      isActive: player.isActive,
      role: state.phase === "settlement" ? player.role : undefined
    })),
    currentQuestion: state.roundIndex >= 0 ? getCurrentQuestion(state) : undefined,
    answers:
      state.phase === "answer_reveal" ||
      state.phase === "discussion" ||
      state.phase === "voting" ||
      state.phase === "settlement"
        ? getCurrentRoundAnswers(state)
        : [],
    messages: state.messages.filter((message) => message.roundIndex === state.roundIndex),
    ballots:
      state.phase === "settlement"
        ? state.ballots
        : getCurrentRoundBallots(state).map((ballot) => ({
            ...ballot,
            targetSessionPlayerId: undefined
          })),
    result: state.result
  };
}

export function selectPlayerByGameNumber(state: GameState, gameNumber: number) {
  return getActiveSessionPlayers(state).find((player) => player.gameNumber === gameNumber);
}
