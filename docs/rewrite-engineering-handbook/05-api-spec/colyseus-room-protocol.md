# Colyseus Room Protocol

## Room Name

```text
wiai
```

## Client Join Options

```json
{
  "nickname": "Ada",
  "roomCode": "ABC123",
  "password": "optional",
  "reconnectToken": "optional"
}
```

## Server Join Response State

Colyseus state sync provides:

- room id
- room code
- lobby players
- current phase
- round index
- phase ends at
- session players
- current round public data
- result after settlement

## Message Types

Client sends:

```text
ready
start_game
submit_answer
cancel_submit_answer
send_chat
submit_ballot
request_state
```

Server returns errors through:

```json
{
  "type": "error",
  "payload": {
    "code": "invalid_phase",
    "message": "Action is not allowed in current phase",
    "requestId": "optional"
  }
}
```

## Command Example

```json
{
  "type": "submit_answer",
  "payload": {
    "content": "I would delete short video apps first."
  },
  "requestId": "client-generated-id"
}
```

## Protocol Rules

- Every message is Zod parsed by `packages/schema`.
- Unknown message type is rejected.
- Actor is resolved from Colyseus client session, not from payload.
- Client cannot provide `sessionPlayerId` as authority.
- Server state sync is authoritative.
- Parsed DTOs are mapped to domain command intents before entering `CommandBus`.
- `packages/game` never imports Zod schemas or wire DTO types.
- Duplicate `requestId` values should be handled idempotently when the previous command result is known.

## Mapping Boundary

```text
wire payload
  -> Zod DTO
  -> command intent
  -> RoomApplicationService
  -> CommandBus
```

The command intent is the first object the domain is allowed to understand. It should contain resolved actor identity from the server, not authority fields supplied by the browser.
