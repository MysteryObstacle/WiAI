import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const rooms = sqliteTable(
  "rooms",
  {
    id: text("id").primaryKey(),
    roomCode: text("room_code").notNull(),
    status: text("status").notNull(),
    hostPlayerId: text("host_player_id").notNull(),
    configJson: text("config_json").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull()
  },
  (table) => [uniqueIndex("rooms_room_code_idx").on(table.roomCode)]
);

export const lobbyPlayers = sqliteTable("lobby_players", {
  id: text("id").primaryKey(),
  roomId: text("room_id").notNull(),
  nickname: text("nickname").notNull(),
  reconnectTokenHash: text("reconnect_token_hash"),
  isHost: integer("is_host", { mode: "boolean" }).notNull(),
  isReady: integer("is_ready", { mode: "boolean" }).notNull(),
  status: text("status").notNull()
});

export const gameSessions = sqliteTable("game_sessions", {
  id: text("id").primaryKey(),
  roomId: text("room_id").notNull(),
  status: text("status").notNull(),
  phase: text("phase").notNull(),
  roundIndex: integer("round_index").notNull(),
  phaseVersion: integer("phase_version").notNull(),
  winnerSide: text("winner_side"),
  frozenSessionPlayerId: text("frozen_session_player_id")
});

export const sessionPlayers = sqliteTable("session_players", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  gameNumber: integer("game_number").notNull(),
  playerType: text("player_type").notNull(),
  role: text("role").notNull(),
  controlMode: text("control_mode").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull()
});

export const rounds = sqliteTable("rounds", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  roundIndex: integer("round_index").notNull(),
  questionKind: text("question_kind").notNull(),
  prompt: text("prompt").notNull()
});

export const answers = sqliteTable("answers", {
  id: text("id").primaryKey(),
  roundId: text("round_id").notNull(),
  sessionPlayerId: text("session_player_id").notNull(),
  content: text("content").notNull(),
  submittedAt: text("submitted_at").notNull()
});

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  roundId: text("round_id").notNull(),
  sessionPlayerId: text("session_player_id").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull()
});

export const ballots = sqliteTable("ballots", {
  id: text("id").primaryKey(),
  roundId: text("round_id").notNull(),
  actorSessionPlayerId: text("actor_session_player_id").notNull(),
  targetSessionPlayerId: text("target_session_player_id"),
  ballotType: text("ballot_type").notNull(),
  abstain: integer("abstain", { mode: "boolean" }).notNull()
});

export const gameEvents = sqliteTable(
  "game_events",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    roomId: text("room_id").notNull(),
    sequence: integer("sequence").notNull(),
    type: text("type").notNull(),
    actorSessionPlayerId: text("actor_session_player_id"),
    roundIndex: integer("round_index"),
    phase: text("phase"),
    payloadJson: text("payload_json").notNull(),
    createdAt: text("created_at").notNull()
  },
  (table) => [uniqueIndex("game_events_session_sequence_idx").on(table.sessionId, table.sequence)]
);

export const gameSnapshots = sqliteTable("game_snapshots", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  roomId: text("room_id").notNull(),
  phase: text("phase").notNull(),
  phaseVersion: integer("phase_version").notNull(),
  stateJson: text("state_json").notNull(),
  createdAt: text("created_at").notNull()
});

export const agentAssignments = sqliteTable("agent_assignments", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  sessionPlayerId: text("session_player_id").notNull(),
  agentService: text("agent_service").notNull(),
  status: text("status").notNull()
});

export const agentActionAudits = sqliteTable("agent_action_audits", {
  id: text("id").primaryKey(),
  assignmentId: text("assignment_id").notNull(),
  requestId: text("request_id"),
  suggestionType: text("suggestion_type").notNull(),
  accepted: integer("accepted", { mode: "boolean" }).notNull(),
  rejectionCode: text("rejection_code"),
  resultingEventId: text("resulting_event_id"),
  inputJson: text("input_json").notNull(),
  createdAt: text("created_at").notNull()
});
