# API Spec Documents

## Purpose

This directory defines the contracts between browser, Colyseus server, persistence, and Agent integration.

## Read First

1. [colyseus-room-protocol.md](./colyseus-room-protocol.md)
2. [agent-protocol.md](./agent-protocol.md)
3. [http-routes.md](./http-routes.md)
4. [error-codes.md](./error-codes.md)
5. [protocol-sequence-diagrams.md](./protocol-sequence-diagrams.md)

## Files

| File | Purpose |
|---|---|
| [colyseus-room-protocol.md](./colyseus-room-protocol.md) | Realtime room commands and state sync contract |
| [agent-protocol.md](./agent-protocol.md) | Agent request and action suggestion contract |
| [http-routes.md](./http-routes.md) | Non-realtime HTTP route expectations |
| [error-codes.md](./error-codes.md) | Stable error codes and semantics |
| [protocol-sequence-diagrams.md](./protocol-sequence-diagrams.md) | Mermaid sequence diagrams for protocol flows |

## Update Rules

- Protocol changes must update Zod schemas during implementation.
- New commands need validation rules, error codes, and at least one sequence diagram when the flow is non-trivial.
- Agent protocol changes must preserve the rule that Agents suggest actions but never mutate authoritative state.
