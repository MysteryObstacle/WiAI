# Story Map

## Backbone

```text
Enter app -> Create/join room -> Prepare lobby -> Start game -> Play rounds -> Vote -> Settlement -> Review result
```

## Release Slice P0

| Step | P0 Stories |
|---|---|
| Enter app | create/join screen |
| Create/join room | US-001, US-002 |
| Prepare lobby | US-003 |
| Start game | host start, role assignment, AI creation |
| Play rounds | US-010, US-011, US-012 |
| Vote | US-013 |
| Settlement | US-014 |
| Agent | US-020, US-021 |

## Later Slices

### P1

- External Agent gateway.
- Replay viewer.
- Agent debug panel.
- PostgreSQL test profile.

### P2

- Multiple AI support.
- Role configuration.
- Distributed Colyseus presence.
- Admin moderation surfaces.

