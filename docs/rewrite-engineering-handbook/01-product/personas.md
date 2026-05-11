# Personas

## 1. Casual Host

As a casual host, I want to create a room quickly and invite friends with a code so that we can start a game without account setup.

Needs:

- Room creation in one screen.
- Copyable room code.
- Clear start conditions.
- Obvious player readiness.

Risks:

- Host does not understand why start is disabled.
- Room code sharing is hidden or too slow.

## 2. Human Player

As a human player, I want to answer, read others, discuss, and vote with minimal friction so that the game feels social rather than administrative.

Needs:

- Clear current phase.
- Countdown.
- Allowed actions only.
- Easy answer and chat input.
- Vote options that exclude self.

Risks:

- UI lets player attempt invalid actions.
- Phase changes feel abrupt or confusing.

## 3. Hidden AI Player

As an AI player, I need a valid visible context and a narrow action interface so that I can participate without privileged access.

Needs:

- Own role and game number.
- Public answers and discussion history.
- Allowed actions.
- Phase constraints.

Risks:

- Agent sees hidden human roles too early.
- Agent bypasses game validation.

## 4. Agent Developer

As an Agent developer, I want predictable protocol and audit records so that I can test AI behavior and debug failed suggestions.

Needs:

- Stable visible context schema.
- Stable suggestion schema.
- Rejection reasons.
- Action audit log.

Risks:

- Protocol changes without documentation.
- Server accepts ambiguous suggestions.

## 5. Future Operator

As an operator, I want durable sessions and events so that I can inspect games, tune rules, and diagnose player or Agent issues.

Needs:

- Event log.
- Snapshots.
- Result records.
- Room/session identifiers in logs.

