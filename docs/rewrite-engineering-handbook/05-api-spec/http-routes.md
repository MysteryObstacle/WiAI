# HTTP Routes

P0 keeps HTTP minimal. Live gameplay uses Colyseus messages.

## Health

```http
GET /healthz
```

Response:

```json
{
  "ok": true,
  "service": "wiai-server"
}
```

## Room Code Resolve

Optional helper route if the client needs to resolve a room code before Colyseus join:

```http
GET /api/rooms/:roomCode
```

Success:

```json
{
  "roomCode": "ABC123",
  "status": "lobby",
  "requiresPassword": false
}
```

Failure:

```json
{
  "code": "room_not_found"
}
```

## Replay Data

P0 can expose replay data only for local debugging:

```http
GET /api/sessions/:sessionId/events
```

This route is not required for the first playable loop UI.

## Auth

P0 does not implement account auth. Room identity uses room-specific reconnect tokens.

