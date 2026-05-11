# Agent Integration Design

## Principle

Agent is a controlled participant, not a privileged subsystem.

```text
visible context -> AgentProvider suggestion -> validation -> command path -> domain mutation
```

The Agent package is a strategy provider. It does not execute commands and does not import the game domain.

## P0 Mock Agent

P0 mock Agent runs in the server process:

- No external process.
- No websocket gateway.
- No API keys.
- Deterministic enough for tests.

Behavior:

| Phase | Suggestion |
|---|---|
| `answer_prep` | `submit_answer` |
| `answer_reveal` | `noop` |
| `discussion` | `send_chat` with budget/cooldown |
| `voting` | `submit_ballot` |
| `settlement` | `noop` |

## Provider Strategy

`packages/agent` exposes providers with this shape:

```ts
interface AgentProvider {
  suggest(context: AgentVisibleContext): Promise<AgentSuggestion>;
}
```

Planned implementations:

| Provider | Scope |
|---|---|
| `MockAgentProvider` | P0 deterministic local play and tests |
| `HttpAgentProvider` | Future external third-party Agent endpoint |
| `SdkAgentProvider` | Future in-process SDK integration |

The server application layer owns `AgentOrchestrator`:

1. Build visible context through domain `VisibilityPolicy`.
2. Call configured `AgentProvider`.
3. Validate suggestion through `packages/schema`.
4. Map suggestion to a domain command intent.
5. Dispatch through the normal command path.
6. Persist audit record.

## Visible Context

Visible context includes:

- session id
- phase
- round index
- phase ends at
- self player
- public player list
- current question
- revealed answers
- discussion messages
- allowed actions

Visible context excludes hidden roles before settlement except Agent's own role.

The visible context builder must live outside `packages/agent`. It may call domain `VisibilityPolicy`, but the provider receives only the already-filtered context.

## Audit

Every Agent suggestion creates an audit record:

- assignment id
- suggestion type
- accepted/rejected
- rejection code
- resulting game event id when accepted
- created at

## Forbidden Coupling

Agent provider implementations must not:

- Import `@wiai/game`.
- Read Colyseus state.
- Read database tables directly.
- Decide whether a suggestion is legal.
- Advance phases.
- Retry rejected suggestions in a tight loop.
