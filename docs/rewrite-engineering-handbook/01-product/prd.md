# PRD: WiAI P0

## 1. Product Goal

Build a playable web social deduction game where human players and one hidden AI player complete three rounds of text-based verification. Players use answers, discussion, and votes to identify the AI.

The P0 release must prove the core product loop:

```text
create room -> invite players -> start game -> three rounds -> final vote -> settlement
```

## 2. Target Users

- Friends who want a quick browser-based social deduction game.
- Players curious about AI imitation and human expression.
- Agent developers who need a controlled game environment to test personas and reasoning strategies.
- Future operators who need replay, debugging, and Agent evaluation surfaces.

## 3. Core Value

WiAI is not a chatbot demo. The value is a structured multiplayer game where AI is a real participant constrained by the same rules as humans.

The system must make players feel:

- The AI is hidden but present.
- Every public answer changes suspicion.
- Discussion matters.
- The final vote has consequence.

## 4. P0 Functional Scope

### Lobby

- Create room.
- Generate room code.
- Join room by code.
- Optional room password.
- Ready and cancel ready.
- Host starts game.
- Host kicks player before start.
- Player leaves before start.
- Reconnect restores identity.

### Game

- Three fixed rounds.
- Each round has `answer_prep`, `answer_reveal`, `discussion`, `voting`.
- Round 1 and 2 voting type is `suspicion`.
- Round 3 voting type is `decision`.
- Settlement reveals roles and winner.

### Agent

- Server creates one AI session player.
- In-process mock Agent returns suggestions.
- Agent suggestions are validated and executed through normal commands.
- Agent cannot mutate state directly.

### Persistence

- SQLite stores room, session, players, rounds, answers, messages, ballots, events, snapshots, and result.

## 5. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Local setup | `npm install` and `npm run dev` are enough |
| Authority | Server owns game state, phase, and outcome |
| Testability | Game rules test without Colyseus, React, or DB |
| Portability | SQLite local, PostgreSQL production-ready schema design |
| Observability | Events include room id, session id, actor, phase, and timestamp |
| Security | Client cannot claim another player id or hidden role |
| Accessibility | Core UI is keyboard usable and readable on mobile |

## 6. P0 Acceptance

P0 is accepted when three browser contexts can complete a full game with one mock AI and reach settlement without Redis, Python, Django, Docker, or PostgreSQL.

