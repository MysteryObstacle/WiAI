# Domain And Protocol

## 1. 命名约定

使用统一英文标识，避免前端、服务端、Agent 各写一套对象名。

| Concept | Name |
|---|---|
| 房间 | `Room` |
| 大厅玩家 | `LobbyPlayer` |
| 对局 | `GameSession` |
| 局内玩家 | `SessionPlayer` |
| 回合 | `Round` |
| 阶段 | `GamePhase` |
| 回答 | `Answer` |
| 聊天消息 | `ChatMessage` |
| 投票 | `Ballot` |
| 裁判事件 | `GameEvent` |
| Agent 分配 | `AgentAssignment` |
| Agent 建议 | `ActionSuggestion` |

## 2. 枚举

```ts
export const gamePhases = [
  "lobby",
  "answer_prep",
  "answer_reveal",
  "discussion",
  "voting",
  "settlement",
] as const;

export const playerTypes = ["human", "ai"] as const;
export const playerRoles = ["citizen", "shelterer", "ai"] as const;
export const playerControlModes = ["player", "agent", "managed"] as const;
export const ballotTypes = ["suspicion", "decision"] as const;
export const winnerSides = ["citizen", "ai", "shelterer"] as const;
```

## 3. Colyseus Live State

Colyseus state 使用 Schema class。它负责同步 live state，不负责校验外部 payload。

建议 shape：

```ts
class WiaiState extends Schema {
  @type("string") roomId = "";
  @type("string") roomCode = "";
  @type("string") status: "lobby" | "playing" | "ended" = "lobby";
  @type("string") phase: GamePhase = "lobby";
  @type("number") phaseVersion = 0;
  @type("number") roundIndex = -1;
  @type("number") phaseEndsAt = 0;

  @type({ map: LobbyPlayerState }) lobbyPlayers = new MapSchema<LobbyPlayerState>();
  @type({ map: SessionPlayerState }) sessionPlayers = new MapSchema<SessionPlayerState>();
  @type({ map: AnswerState }) answers = new MapSchema<AnswerState>();
  @type({ map: ChatMessageState }) messages = new MapSchema<ChatMessageState>();
  @type({ map: BallotState }) ballots = new MapSchema<BallotState>();

  @type(ResultState) result = new ResultState();
}
```

Implementation rule:

- Keep Colyseus state serializable and small.
- Avoid storing huge logs in live state.
- Store current round live data in state.
- Persist full event history in database.

## 4. Command Protocol

All browser commands go through Zod.

### `ready`

```json
{
  "type": "ready",
  "payload": {
    "isReady": true
  }
}
```

### `start_game`

```json
{
  "type": "start_game",
  "payload": {}
}
```

Rules:

- actor must be host
- room status must be `lobby`
- online count >= minPlayers
- all non-host online players ready

### `submit_answer`

```json
{
  "type": "submit_answer",
  "payload": {
    "content": "我的回答"
  }
}
```

Rules:

- phase must be `answer_prep`
- actor must be active session player
- content trimmed length > 0
- no existing answer for same player and round

### `cancel_submit_answer`

```json
{
  "type": "cancel_submit_answer",
  "payload": {}
}
```

Rules:

- phase must be `answer_prep`
- existing answer must belong to actor in current round

### `send_chat`

```json
{
  "type": "send_chat",
  "payload": {
    "content": "我觉得 3 号回答太泛了"
  }
}
```

Rules:

- phase must be `discussion`
- actor must be active session player
- content trimmed length > 0

### `submit_ballot`

```json
{
  "type": "submit_ballot",
  "payload": {
    "ballotType": "suspicion",
    "targetGameNumber": 3,
    "abstain": false
  }
}
```

Rules:

- phase must be `voting`
- round 0/1 expects `suspicion`
- round 2 expects `decision`
- `decision` cannot abstain
- non-abstain ballot requires valid target
- target must be active
- actor cannot vote for self
- no duplicate ballot for same actor, round, and ballot type

## 5. Error Codes

Stable error codes:

| Code | Meaning |
|---|---|
| `not_joined` | client has no bound player |
| `not_host` | actor is not room host |
| `room_not_lobby` | command requires lobby status |
| `room_not_playing` | command requires active game |
| `not_enough_players` | online count below minimum |
| `players_not_ready` | non-host players are not all ready |
| `invalid_phase` | command is not allowed in current phase |
| `invalid_content` | text content is empty or invalid |
| `duplicate_answer` | actor already submitted answer |
| `answer_not_submitted` | actor has no answer to cancel |
| `invalid_ballot_type` | ballot type does not match round |
| `decision_ballot_requires_target` | decision ballot cannot abstain |
| `invalid_target` | target does not exist or inactive |
| `forbidden_self_vote` | actor voted for self |
| `duplicate_ballot` | actor already voted |
| `agent_assignment_inactive` | Agent assignment is not active |
| `agent_suggestion_rejected` | suggestion failed validation |

Frontend maps these codes to localized text.

## 6. Referee Events

Every successful command and phase transition emits events.

Recommended event types:

```ts
type GameEventType =
  | "room.created"
  | "player.joined"
  | "player.left"
  | "player.ready_changed"
  | "game.started"
  | "phase.started"
  | "answer.submitted"
  | "answer.cancelled"
  | "answer.revealed"
  | "message.posted"
  | "ballot.submitted"
  | "round.completed"
  | "game.settled"
  | "agent.assignment_started"
  | "agent.suggestion_received"
  | "agent.suggestion_executed"
  | "agent.suggestion_rejected";
```

Event record:

```ts
type GameEvent = {
  id: string;
  sessionId: string;
  roomId: string;
  type: GameEventType;
  actorSessionPlayerId?: string;
  roundIndex?: number;
  phase?: GamePhase;
  payload: unknown;
  createdAt: string;
};
```

## 7. Database Tables

P0 tables:

```text
rooms
lobby_players
game_sessions
session_players
rounds
answers
chat_messages
ballots
game_events
game_snapshots
agent_assignments
agent_action_audits
```

Persistence rules:

- Do not store Colyseus Schema instances directly.
- Convert live state to plain objects before persistence.
- Store events append-only.
- Store snapshots on phase transition and settlement.
- Store final result in `game_sessions`.

## 8. Agent Visible Context

Agent visible context must not leak hidden roles before settlement.

Shape:

```json
{
  "session": {
    "sessionId": "session-id",
    "roomCode": "ABC123",
    "phase": "discussion",
    "roundIndex": 1,
    "phaseEndsAt": 1760000000000
  },
  "self": {
    "sessionPlayerId": "sp-ai",
    "gameNumber": 5,
    "playerType": "ai",
    "role": "ai",
    "controlMode": "agent"
  },
  "visiblePlayers": [
    {
      "sessionPlayerId": "sp-1",
      "gameNumber": 1,
      "displayName": "Player 1",
      "isSelf": false,
      "isActive": true
    }
  ],
  "currentQuestion": {
    "roundIndex": 1,
    "kind": "value_judgment",
    "prompt": "..."
  },
  "revealedAnswers": [],
  "discussionMessages": [],
  "allowedActions": ["send_chat"]
}
```

Before settlement:

- Agent knows its own role.
- Agent does not know other hidden roles.
- Agent sees only public answers and discussion messages.

After settlement:

- `allRoles` may be included for replay/debug.

## 9. Agent Suggestion

```json
{
  "type": "action_suggestion",
  "payload": {
    "type": "submit_answer",
    "payload": {
      "content": "如果今天必须删除一个常用 App，我会删短视频。"
    },
    "requestId": "request-id"
  }
}
```

Allowed P0 suggestion types:

```text
submit_answer
send_chat
submit_ballot
noop
```

Execution rule:

```text
visible context -> AgentProvider suggestion -> Zod validation -> Agent assignment validation -> command mapping -> CommandBus -> PhasePolicy -> state mutation -> Unit of Work persistence
```

No direct mutation is allowed from Agent code.
