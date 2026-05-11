export const gamePhases = [
  "lobby",
  "answer_prep",
  "answer_reveal",
  "discussion",
  "voting",
  "settlement"
] as const;

export const playerTypes = ["human", "ai"] as const;
export const playerRoles = ["citizen", "shelterer", "ai"] as const;
export const playerControlModes = ["player", "agent", "managed"] as const;
export const ballotTypes = ["suspicion", "decision"] as const;
export const winnerSides = ["citizen", "ai", "shelterer"] as const;

export type GamePhase = (typeof gamePhases)[number];
export type PlayerType = (typeof playerTypes)[number];
export type PlayerRole = (typeof playerRoles)[number];
export type ControlMode = (typeof playerControlModes)[number];
export type BallotType = (typeof ballotTypes)[number];
export type WinnerSide = (typeof winnerSides)[number];
