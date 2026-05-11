import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createRequire } from "node:module";
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";

export type CreateDatabaseOptions = {
  filename?: string;
};

export type SqlStatementParams = Array<string | number | null>;

export type WiaiDatabaseClient = {
  db: Database;
  filename?: string;
  persist: () => void;
  close: () => void;
};

let sqlJsPromise: Promise<SqlJsStatic> | undefined;

export async function createWiaiDatabaseClient(
  options: CreateDatabaseOptions = {}
): Promise<WiaiDatabaseClient> {
  const SQL = await loadSqlJs();
  const db =
    options.filename && existsSync(options.filename)
      ? new SQL.Database(readFileSync(options.filename))
      : new SQL.Database();

  migrate(db);

  const client = {
    db,
    persist() {
      if (!options.filename) {
        return;
      }
      mkdirSync(dirname(options.filename), { recursive: true });
      writeFileSync(options.filename, Buffer.from(db.export()));
    },
    close() {
      db.close();
    }
  };

  return options.filename ? { ...client, filename: options.filename } : client;
}

export function execute(db: Database, sql: string, params: SqlStatementParams = []): void {
  db.run(sql, params);
}

export function queryOne<T>(
  db: Database,
  sql: string,
  params: SqlStatementParams,
  mapper: (row: Record<string, unknown>) => T
): T | undefined {
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params);
    if (!stmt.step()) {
      return undefined;
    }

    return mapper(stmt.getAsObject());
  } finally {
    stmt.free();
  }
}

export function queryAll<T>(
  db: Database,
  sql: string,
  params: SqlStatementParams,
  mapper: (row: Record<string, unknown>) => T
): T[] {
  const stmt = db.prepare(sql);
  const rows: T[] = [];
  try {
    stmt.bind(params);
    while (stmt.step()) {
      rows.push(mapper(stmt.getAsObject()));
    }

    return rows;
  } finally {
    stmt.free();
  }
}

function loadSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    const require = createRequire(import.meta.url);
    const wasmPath = require.resolve("sql.js/dist/sql-wasm.wasm").replace(/\\/g, "/");
    sqlJsPromise = initSqlJs({
      locateFile: () => wasmPath
    });
  }

  return sqlJsPromise;
}

function migrate(db: Database): void {
  db.run(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      room_code TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      host_player_id TEXT NOT NULL,
      config_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lobby_players (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      nickname TEXT NOT NULL,
      reconnect_token_hash TEXT,
      is_host INTEGER NOT NULL,
      is_ready INTEGER NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      status TEXT NOT NULL,
      phase TEXT NOT NULL,
      round_index INTEGER NOT NULL,
      phase_version INTEGER NOT NULL,
      winner_side TEXT,
      frozen_session_player_id TEXT
    );

    CREATE TABLE IF NOT EXISTS session_players (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      game_number INTEGER NOT NULL,
      player_type TEXT NOT NULL,
      role TEXT NOT NULL,
      control_mode TEXT NOT NULL,
      is_active INTEGER NOT NULL,
      UNIQUE(session_id, game_number)
    );

    CREATE TABLE IF NOT EXISTS rounds (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      round_index INTEGER NOT NULL,
      question_kind TEXT NOT NULL,
      prompt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS answers (
      id TEXT PRIMARY KEY,
      round_id TEXT NOT NULL,
      session_player_id TEXT NOT NULL,
      content TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      UNIQUE(round_id, session_player_id)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      round_id TEXT NOT NULL,
      session_player_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ballots (
      id TEXT PRIMARY KEY,
      round_id TEXT NOT NULL,
      actor_session_player_id TEXT NOT NULL,
      target_session_player_id TEXT,
      ballot_type TEXT NOT NULL,
      abstain INTEGER NOT NULL,
      UNIQUE(round_id, actor_session_player_id, ballot_type)
    );

    CREATE TABLE IF NOT EXISTS game_events (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      room_id TEXT NOT NULL,
      sequence INTEGER NOT NULL,
      type TEXT NOT NULL,
      actor_session_player_id TEXT,
      round_index INTEGER,
      phase TEXT,
      payload_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(session_id, sequence)
    );

    CREATE TABLE IF NOT EXISTS game_snapshots (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      room_id TEXT NOT NULL,
      phase TEXT NOT NULL,
      phase_version INTEGER NOT NULL,
      state_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agent_assignments (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      session_player_id TEXT NOT NULL,
      agent_service TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agent_action_audits (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL,
      request_id TEXT,
      suggestion_type TEXT NOT NULL,
      accepted INTEGER NOT NULL,
      rejection_code TEXT,
      resulting_event_id TEXT,
      input_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS lobby_players_room_id_idx ON lobby_players(room_id);
    CREATE INDEX IF NOT EXISTS game_sessions_room_id_idx ON game_sessions(room_id);
    CREATE INDEX IF NOT EXISTS session_players_session_id_idx ON session_players(session_id);
    CREATE INDEX IF NOT EXISTS rounds_session_id_idx ON rounds(session_id);
    CREATE INDEX IF NOT EXISTS answers_round_id_idx ON answers(round_id);
    CREATE INDEX IF NOT EXISTS chat_messages_round_id_idx ON chat_messages(round_id);
    CREATE INDEX IF NOT EXISTS ballots_round_id_idx ON ballots(round_id);
    CREATE INDEX IF NOT EXISTS game_events_session_id_idx ON game_events(session_id);
    CREATE INDEX IF NOT EXISTS game_snapshots_session_id_idx ON game_snapshots(session_id);
  `);
}
