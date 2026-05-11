# Product Acceptance Criteria

## P0 Demo Acceptance

Given a clean machine with Node.js and npm:

1. Run `npm install`.
2. Run `npm run dev`.
3. Open three browser contexts.
4. Create one room.
5. Join the room from two other contexts.
6. Ready non-host players.
7. Start game.
8. Complete three rounds.
9. Let mock AI act automatically.
10. Reach settlement.

The demo passes if:

- No external service is required.
- The UI shows all phases.
- The server advances phases.
- The final result appears.
- SQLite contains durable records.

## Gameplay Acceptance

- Answers can only be submitted in `answer_prep`.
- Discussion can only happen in `discussion`.
- Voting can only happen in `voting`.
- Decision vote cannot abstain.
- Player cannot vote for self.
- Duplicate answer and duplicate ballot are rejected.
- All-answer and all-vote completion can advance early.
- Timeout can advance when not all players act.

## Agent Acceptance

- AI is represented as a session player.
- Mock Agent receives visible context.
- Mock Agent does not know hidden human roles before settlement.
- Mock Agent suggestion is validated.
- Rejected suggestion is auditable.
- Accepted suggestion produces normal answer, message, or ballot.

