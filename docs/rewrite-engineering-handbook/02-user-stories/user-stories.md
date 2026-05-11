# User Stories

## Lobby Stories

### US-001 Create Room

As a host, I want to create a room with a nickname and settings so that I can invite others to play.

Acceptance:

- Host receives room code.
- Host appears in roster.
- Host is marked as host.
- Room is persisted.

### US-002 Join Room

As a player, I want to join by room code so that I can enter my friend's game.

Acceptance:

- Valid room code joins lobby.
- Invalid room code returns stable error.
- Duplicate reconnect uses existing identity when token is valid.

### US-003 Ready For Game

As a non-host player, I want to mark myself ready so that host knows we can start.

Acceptance:

- Ready state syncs to all clients.
- Host does not need ready.
- Start is disabled until conditions pass.

## Game Stories

### US-010 Submit Answer

As a player, I want to submit an answer during answer prep so that others can evaluate me later.

Acceptance:

- Empty answer is rejected.
- Duplicate answer is rejected.
- All players answering advances phase.

### US-011 Read Revealed Answers

As a player, I want to see all answers at once so that I can compare them fairly.

Acceptance:

- Answers are hidden before reveal.
- Revealed answer includes game number and display name.
- No chat or vote input appears during reveal.

### US-012 Discuss

As a player, I want to send discussion messages so that I can question others and defend myself.

Acceptance:

- Message requires non-empty content.
- Message shows author and timestamp.
- Chat input is disabled outside discussion.

### US-013 Vote

As a player, I want to vote during voting so that I can express suspicion or final decision.

Acceptance:

- Self is not a valid target.
- Suspicion vote can abstain.
- Decision vote cannot abstain.
- Duplicate vote is rejected.

### US-014 Settlement

As a player, I want to see the final outcome and all roles so that I understand why the game ended.

Acceptance:

- Frozen player is shown.
- Winner side is shown.
- All roles are revealed.
- Final ballots are visible.

## Agent Stories

### US-020 Mock AI Acts

As a host, I want the built-in mock AI to act automatically so that local games are playable without an external Agent.

Acceptance:

- AI submits answer.
- AI may chat during discussion.
- AI votes during voting.
- AI actions are audited.

### US-021 Agent Safety

As an operator, I want Agent actions to go through the same validation as humans so that AI cannot cheat.

Acceptance:

- Invalid suggestions are rejected.
- Rejection reason is logged.
- Agent cannot see hidden roles before settlement.

