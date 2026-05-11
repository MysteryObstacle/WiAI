# Glossary

## Product Terms

| Term | Meaning |
|---|---|
| WiAI | Engineering shorthand for `Who is AI` |
| Lobby | Room state before a game starts |
| Host | Player who created the room and can start the game |
| Session | One started game inside a room |
| Round | One question cycle in a session |
| Phase | A timed step inside a round |
| AI Player | Hidden game participant controlled by Agent suggestions |
| Shelterer | Human-side special role that wins if frozen |
| Frozen Player | Final decision vote target |

## Engineering Terms

| Term | Meaning |
|---|---|
| Colyseus Room | Runtime object that owns live connections, state sync, and room clock |
| WiaiRoom | TypeScript class implementing the WiAI Colyseus room |
| WiaiState | Colyseus Schema class for synchronized live state |
| CommandBus | Domain command dispatcher used by human and Agent actions |
| CommandHandler | Focused domain handler for one command type |
| PhasePolicy | Phase-specific domain policy that controls allowed actions, timeout behavior, and early advance |
| SettlementPolicy | Domain strategy that resolves frozen player and winner side |
| VisibilityPolicy | Domain policy that filters hidden information for humans, Agents, and future spectators |
| Shared Kernel | Small package for ids, value objects, stable enum values, and Result primitives |
| Zod Schema | Runtime validator for commands, Agent payloads, and HTTP payloads |
| Drizzle Repository | Persistence boundary around database tables |
| Unit of Work | Transaction boundary that persists accepted command events, snapshots, results, and Agent audits atomically |
| Event Log | Append-only durable record of gameplay and system events |
| Snapshot | Plain JSON copy of important state at phase transitions |
