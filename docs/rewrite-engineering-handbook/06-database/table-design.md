# Table Design

## `rooms`

| Column | Type | Notes |
|---|---|---|
| `id` | text | primary id |
| `room_code` | text | unique public code |
| `status` | text | lobby, playing, ended |
| `host_player_id` | text | lobby player id |
| `config_json` | text/json | min/max players, durations |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

## `lobby_players`

| Column | Type | Notes |
|---|---|---|
| `id` | text | primary id |
| `room_id` | text | FK rooms |
| `nickname` | text | display name |
| `reconnect_token_hash` | text | never store raw token |
| `is_host` | boolean | |
| `is_ready` | boolean | |
| `status` | text | online, disconnected, left |

## `game_sessions`

| Column | Type | Notes |
|---|---|---|
| `id` | text | primary id |
| `room_id` | text | FK rooms |
| `status` | text | playing, ended |
| `phase` | text | current phase |
| `round_index` | integer | -1 before game |
| `phase_version` | integer | stale timer guard |
| `winner_side` | text nullable | |
| `frozen_session_player_id` | text nullable | |

## Core Child Tables

- `session_players`: game number, player type, role, control mode, active flag.
- `rounds`: round index, question kind, prompt.
- `answers`: round id, session player id, content, submitted at.
- `chat_messages`: round id, session player id, content, created at.
- `ballots`: round id, actor id, target id, ballot type, abstain.
- `game_events`: append-only event records.
- `game_snapshots`: phase transition state snapshots.
- `agent_assignments`: AI player to Agent binding.
- `agent_action_audits`: suggestion input, decision, result.

## Indexes

Required indexes:

- `rooms.room_code`
- `lobby_players.room_id`
- `game_sessions.room_id`
- `session_players.session_id`
- `rounds.session_id`
- `answers.round_id`
- `chat_messages.round_id`
- `ballots.round_id`
- `game_events.session_id`
- `game_snapshots.session_id`

## Uniqueness And Integrity Constraints

Required unique constraints:

- `rooms.room_code`
- `session_players.session_id + game_number`
- `answers.round_id + session_player_id`
- `ballots.round_id + actor_session_player_id + ballot_type`
- `game_events.session_id + sequence`
- `agent_action_audits.assignment_id + request_id` when a request id exists

Required foreign keys:

- Child records reference their owning room, session, round, or player.
- `game_sessions.frozen_session_player_id` references `session_players.id` when present.
- `ballots.target_session_player_id` references `session_players.id` when present.

## Transaction Rules

Every accepted command must be persisted atomically:

1. Append domain events.
2. Write affected child rows when needed.
3. Save snapshot on phase transition or settlement.
4. Update session phase/result fields.
5. Write Agent audit result when the command originated from Agent.

SQLite and PostgreSQL must share the same logical constraints. PostgreSQL may use stronger native JSON/index features later, but P0 logic must not depend on those features.
