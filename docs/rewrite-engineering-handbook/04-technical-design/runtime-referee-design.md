# Runtime And Referee Design

## Where The Referee Lives

The referee runs inside the Colyseus server process, but game behavior lives in `packages/game`.

```text
WiaiRoom = Colyseus runtime adapter
RoomApplicationService = orchestration boundary
CommandBus + CommandHandlers = command execution
PhasePolicy = phase-specific referee behavior
SettlementPolicy = winner resolution
```

There must not be one large `GameReferee` class full of phase switches. The word "referee" describes the domain responsibility, not a required god object.

## Runtime Flow

```text
WiaiRoom
  -> schema adapter validates DTO
  -> RoomApplicationService resolves actor and opens Unit of Work
  -> CommandBus dispatches command intent
  -> CommandHandler applies domain rules
  -> PhasePolicy decides early advance or timeout transition
  -> Unit of Work persists events, snapshots, and result rows
  -> WiaiRoom maps domain state to Colyseus Schema
```

## Phase Timer

When a phase starts:

1. The active `PhasePolicy` emits a `phase.started` domain event.
2. Applying the event increments `phaseVersion`.
3. `RoomApplicationService` persists event and snapshot inside a Unit of Work.
4. `WiaiRoom` maps domain state to `WiaiState`.
5. `WiaiRoom` clears previous timer.
6. `WiaiRoom` schedules a Colyseus clock timeout.
7. Timer callback calls `RoomApplicationService.handlePhaseTimeout(expectedPhaseVersion)`.

The `expectedPhaseVersion` prevents stale timers from double advancing.

## Early Advance

After `submit_answer`:

```text
SubmitAnswerHandler -> AnswerPrepPhasePolicy.onCommandAccepted
```

After `submit_ballot`:

```text
SubmitBallotHandler -> VotingPhasePolicy.onCommandAccepted
```

Phase policies may return no event when the phase should continue.

## Settlement

`SettlementPolicy.resolve`:

1. Reads final round decision ballots where `roundIndex == 2`.
2. Counts valid targets.
3. Chooses highest vote count.
4. Breaks ties by lowest `gameNumber`.
5. Falls back to lowest active `gameNumber` if no valid vote exists.
6. Sets frozen player and winner side.

The settlement algorithm must be a replaceable policy so future game modes can change resolution rules without changing command handlers.

## Persistence Points

Persist:

- Every accepted command as event.
- Every rejected command as error/audit event when useful.
- Every phase transition as event and snapshot.
- Settlement as event, snapshot, and session result.

## Transaction Boundary

Accepted commands must persist through one Unit of Work:

```text
append domain events
save snapshot when phase or settlement changes
write derived rows if needed
write Agent audit if command originated from Agent
commit
```

If commit fails, `WiaiRoom` must not publish a successful state transition to clients. P0 can keep in-memory state simple, but the document target is atomic command persistence.
