# ADR 0002: Use Colyseus

## Context

The current project has Django Channels, Redis, a referee worker, an Agent worker, and duplicated object alignment across systems.

## Decision

Use Colyseus as the multiplayer runtime for rooms, connections, reconnection, room clock, and live state sync.

## Consequences

- Some coupling to Colyseus is accepted.
- Core rules stay in `packages/game`.
- Colyseus Schema is used for live state, not external validation.
- Scaling can later use Colyseus presence.

## Alternatives Considered

- Socket.IO: less opinionated but requires more custom multiplayer infrastructure.
- PartyKit: good room model but more platform-coupled.
- boardgame.io: useful concepts but less suitable for Agent timing and chat-heavy gameplay.

