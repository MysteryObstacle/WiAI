# User Journeys

## Journey 1: Host Creates A Game

1. Host opens web app.
2. Host enters nickname and room settings.
3. Host clicks create room.
4. Server creates Colyseus room and database room record.
5. UI shows room code and roster.
6. Host shares room code.
7. Other players join and ready.
8. Host starts game.

Acceptance:

- Host can start only when rules are satisfied.
- Host sees why start is disabled.
- Room code remains visible before game start.

## Journey 2: Player Joins And Plays

1. Player opens web app.
2. Player enters room code and nickname.
3. Player joins lobby.
4. Player toggles ready.
5. Game starts.
6. Player submits answer during `answer_prep`.
7. Player reads revealed answers.
8. Player sends discussion message.
9. Player votes.
10. Player repeats through three rounds.
11. Player sees settlement.

Acceptance:

- UI never exposes forbidden actions as primary controls.
- Invalid server responses render understandable feedback.
- Reconnect token restores the same player.

## Journey 3: Mock AI Acts

1. Server starts game.
2. Server creates AI session player.
3. Phase starts.
4. Server builds visible context.
5. Mock Agent returns suggestion.
6. Server validates suggestion.
7. Server maps suggestion to command.
8. Command mutates state and persists event.

Acceptance:

- Mock AI can complete answer, discussion, and vote.
- Agent action appears like a normal game action in state.
- Audit log records source as Agent.

## Journey 4: Final Settlement

1. Round 3 voting ends by all votes or timeout.
2. Referee counts decision ballots.
3. Referee freezes target.
4. Referee resolves winner.
5. Server persists result and snapshot.
6. UI reveals all roles and outcome.

Acceptance:

- Tie break is deterministic.
- All identities are visible after settlement.
- Result is persisted.

