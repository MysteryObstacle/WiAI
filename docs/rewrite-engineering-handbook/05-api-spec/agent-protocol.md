# Agent Protocol

## Assignment Started

Server creates an assignment for the AI session player:

```json
{
  "assignmentId": "assign_123",
  "sessionPlayerId": "sp_ai",
  "agentService": "local-mock",
  "status": "active"
}
```

## Visible Context

```json
{
  "session": {
    "sessionId": "session_123",
    "phase": "discussion",
    "roundIndex": 1,
    "phaseEndsAt": 1760000000000
  },
  "self": {
    "sessionPlayerId": "sp_ai",
    "gameNumber": 4,
    "playerType": "ai",
    "role": "ai",
    "controlMode": "agent"
  },
  "visiblePlayers": [],
  "currentQuestion": {
    "kind": "value_judgment",
    "prompt": "..."
  },
  "revealedAnswers": [],
  "discussionMessages": [],
  "allowedActions": ["send_chat"]
}
```

## Suggestion

```json
{
  "type": "action_suggestion",
  "payload": {
    "type": "send_chat",
    "payload": {
      "content": "I think player 2 is being too generic."
    },
    "requestId": "agent-req-1"
  }
}
```

## Accepted Types

- `submit_answer`
- `send_chat`
- `submit_ballot`
- `noop`

## Rejection Reasons

- invalid schema
- inactive assignment
- invalid phase
- invalid content
- invalid target
- duplicate action
- forbidden self vote

## Execution Boundary

Agent providers do not execute suggestions. The server application layer maps an accepted suggestion to the same command intent shape used by browser commands.

```text
AgentProvider
  -> action_suggestion
  -> Zod validation
  -> AgentOrchestrator
  -> CommandBus
  -> Unit of Work persistence
```

The Agent package must not import `@wiai/game`, read database tables, or receive full game state.
