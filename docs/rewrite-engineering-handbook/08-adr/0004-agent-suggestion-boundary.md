# ADR 0004: Agent Suggestion Boundary

## Context

AI is a hidden player but must not bypass game rules.

## Decision

Agent returns action suggestions only. Server validates suggestions and executes them through the same command path used by human players.

## Consequences

- Agent cannot directly mutate Colyseus state.
- Agent cannot directly write database records.
- Agent cannot advance phase.
- Rejections can be audited.

## Alternatives Considered

- Direct Agent command execution: too much privilege.
- Treat AI as frontend bot: breaks server authority and hidden-player model.

