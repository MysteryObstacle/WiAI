import { z } from "zod";

export const errorCodes = [
  "not_joined",
  "not_host",
  "room_not_lobby",
  "room_not_playing",
  "not_enough_players",
  "players_not_ready",
  "room_full",
  "invalid_debug_player_count",
  "invalid_phase",
  "invalid_content",
  "duplicate_answer",
  "answer_not_submitted",
  "invalid_ballot_type",
  "decision_ballot_requires_target",
  "invalid_target",
  "forbidden_self_vote",
  "duplicate_ballot",
  "agent_assignment_inactive",
  "agent_suggestion_rejected"
] as const;

export const errorCodeSchema = z.enum(errorCodes);
export type ErrorCode = (typeof errorCodes)[number];
