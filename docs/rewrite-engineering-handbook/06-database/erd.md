# Database ERD

```mermaid
erDiagram
  rooms ||--o{ lobby_players : has
  rooms ||--o{ game_sessions : starts
  game_sessions ||--o{ session_players : has
  game_sessions ||--o{ rounds : has
  game_sessions ||--o{ game_events : logs
  game_sessions ||--o{ game_snapshots : saves
  rounds ||--o{ answers : contains
  rounds ||--o{ chat_messages : contains
  rounds ||--o{ ballots : contains
  session_players ||--o{ answers : writes
  session_players ||--o{ chat_messages : sends
  session_players ||--o{ ballots : casts
  session_players ||--o{ agent_assignments : controls
  agent_assignments ||--o{ agent_action_audits : audits
```

## Persistence Philosophy

- Live game state is in Colyseus while room is active.
- Database stores durable audit and recovery data.
- Events are append-only.
- Snapshots are plain JSON.
- Final result is stored on `game_sessions`.

