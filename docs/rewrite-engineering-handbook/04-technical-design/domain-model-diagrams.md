# Domain Model Diagrams

## Pure Domain Aggregate Model

This diagram describes `@wiai/game` domain objects. These are not Colyseus Schema classes, Zod DTOs, or Drizzle table classes.

```mermaid
classDiagram
  direction LR

  class GameSession {
    +string roomId
    +string sessionId
    +GamePhase phase
    +number phaseVersion
    +number roundIndex
    +RoomConfig config
    +GameResult result
    +apply(event)
    +record(event)
  }

  class RoomConfig {
    +number minPlayers
    +number maxPlayers
    +PhaseDurations phaseDurations
    +boolean passwordRequired
  }

  class LobbyPlayer {
    +string id
    +string nickname
    +boolean isHost
    +boolean isReady
    +ConnectionStatus status
  }

  class SessionPlayer {
    +string id
    +number gameNumber
    +PlayerType playerType
    +PlayerRole role
    +ControlMode controlMode
    +boolean isActive
  }

  class Round {
    +string id
    +number roundIndex
    +QuestionKind questionKind
    +string prompt
  }

  class Answer {
    +string id
    +string roundId
    +string sessionPlayerId
    +string content
    +Date submittedAt
  }

  class ChatMessage {
    +string id
    +string roundId
    +string sessionPlayerId
    +string content
    +Date createdAt
  }

  class Ballot {
    +string id
    +string roundId
    +string actorSessionPlayerId
    +string targetSessionPlayerId
    +BallotType ballotType
    +boolean abstain
  }

  class GameResult {
    +WinnerSide winnerSide
    +string frozenSessionPlayerId
    +string reason
  }

  GameSession "1" *-- "1" RoomConfig
  GameSession "1" *-- "0..*" LobbyPlayer
  GameSession "1" *-- "0..*" SessionPlayer
  GameSession "1" *-- "0..3" Round
  Round "1" *-- "0..*" Answer
  Round "1" *-- "0..*" ChatMessage
  Round "1" *-- "0..*" Ballot
  GameSession "1" *-- "0..1" GameResult
```

## Value Objects And Shared Kernel

`@wiai/kernel` exists to prevent primitive obsession without making the domain depend on protocol or database code.

```mermaid
classDiagram
  class RoomId
  class RoomCode
  class LobbyPlayerId
  class SessionId
  class SessionPlayerId
  class RoundIndex
  class PhaseVersion
  class GameNumber
  class NonEmptyText
  class CommandRequestId
  class Result {
    +boolean ok
    +value
    +DomainError error
  }

  GameSession --> RoomId
  GameSession --> SessionId
  SessionPlayer --> SessionPlayerId
  SessionPlayer --> GameNumber
  Round --> RoundIndex
  Answer --> NonEmptyText
  ChatMessage --> NonEmptyText
  Ballot --> CommandRequestId
```

## Command Pattern And Domain Policies

```mermaid
classDiagram
  direction TB

  class CommandBus {
    +dispatch(session, actor, command)
  }

  class CommandHandler {
    +supports(commandType)
    +handle(session, actor, command)
  }

  class PhasePolicy {
    +phase
    +allowedActions(session, actor)
    +onCommandAccepted(session, event)
    +onTimeout(session, expectedVersion)
  }

  class SettlementPolicy {
    +resolve(session)
  }

  class VisibilityPolicy {
    +forHuman(session, viewer)
    +forAgent(session, aiPlayer)
    +forSpectator(session)
  }

  class RoleAssignmentStrategy {
    +assign(players, rng)
  }

  class RuleSpecification {
    +assertPhase(state, phase)
    +assertActivePlayer(state, actor)
    +assertNoDuplicateAnswer(state, actor)
    +assertValidBallotTarget(state, actor, target)
  }

  class DomainEventFactory {
    +answerSubmitted()
    +messagePosted()
    +ballotSubmitted()
    +phaseStarted()
    +gameSettled()
  }

  CommandBus --> CommandHandler
  CommandHandler --> RuleSpecification
  CommandHandler --> PhasePolicy
  CommandHandler --> DomainEventFactory
  PhasePolicy --> SettlementPolicy
  PhasePolicy --> DomainEventFactory
  CommandHandler --> RoleAssignmentStrategy
```

## Domain Event Model

```mermaid
classDiagram
  class GameEvent {
    +string id
    +string roomId
    +string sessionId
    +GameEventType type
    +string actorSessionPlayerId
    +number roundIndex
    +GamePhase phase
    +DomainEventPayload payload
    +Date createdAt
  }

  class CommandResult {
    +GameSession session
    +GameEvent[] events
    +DomainError error
  }

  class DomainError {
    +ErrorCode code
    +string message
    +DomainErrorDetails details
  }

  CommandResult "1" o-- "0..*" GameEvent
  CommandResult "1" o-- "0..1" DomainError
```
