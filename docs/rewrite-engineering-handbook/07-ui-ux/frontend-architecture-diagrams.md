# Frontend Architecture Diagrams

## Next.js Server And Client Component Boundary

```mermaid
flowchart TD
  subgraph ServerComponents["Server Components"]
    Layout["src/app/layout.tsx"]
    HomePage["src/app/page.tsx"]
    RulesPage["src/app/rules/page.tsx"]
    RoomPage["src/app/room/[roomCode]/page.tsx"]
    GamePage["src/app/game/[roomId]/page.tsx"]
  end

  subgraph ClientComponents["Client Components"]
    LobbyClient["LobbyClient\n'use client'"]
    GameClient["GameClient\n'use client'"]
    PhaseHeader["PhaseHeader"]
    AnswerPanel["AnswerPanel"]
    DiscussionPanel["DiscussionPanel"]
    VotePanel["VotePanel"]
    SettlementPanel["SettlementPanel"]
  end

  subgraph BrowserOnly["Browser Only APIs"]
    ColyseusClient["Colyseus Client"]
    LocalStorage["localStorage"]
    GSAP["GSAP Timelines"]
    Countdown["Countdown Effects"]
  end

  Layout --> HomePage
  RoomPage --> LobbyClient
  GamePage --> GameClient
  GameClient --> PhaseHeader
  GameClient --> AnswerPanel
  GameClient --> DiscussionPanel
  GameClient --> VotePanel
  GameClient --> SettlementPanel

  LobbyClient --> ColyseusClient
  LobbyClient --> LocalStorage
  GameClient --> ColyseusClient
  GameClient --> LocalStorage
  GameClient --> GSAP
  PhaseHeader --> Countdown
```

## Frontend State Ownership

```mermaid
flowchart LR
  ServerState["Colyseus Room State\nsource of live truth"] --> Hook["useRoomConnection"]
  Hook --> ViewModels["Derived View Models"]
  ViewModels --> Components["React Components"]

  LocalUI["React Local State\nforms, drawers, selected target"] --> Components
  Components --> Commands["Command DTO Builders"]
  Commands --> RoomSend["room.send(type, payload)"]
  RoomSend --> ServerPatch["Server validates and returns state patch"]
  ServerPatch --> ServerState

  AnimState["Animation State\nGSAP refs and timelines"] --> Components
  ServerState --> AnimState
```

## Presenter And Rule Boundary

```mermaid
flowchart TB
  SchemaState["Synced WiaiState"] --> Selectors["Client Selectors"]
  Selectors --> ViewModel["View Models"]
  ViewModel --> Component["Presentational Components"]
  Component --> FormState["Local Form State"]
  FormState --> CommandDto["Command DTO"]
  CommandDto --> Server["Authoritative Server"]

  Component -. forbidden .-> Winner["Winner Calculation"]
  Component -. forbidden .-> PhaseAdvance["Next Phase Decision"]
  Component -. forbidden .-> HiddenRoles["Hidden Role Inference"]
```

## Responsive Layout Decision Tree

```mermaid
flowchart TD
  A{Viewport width}
  A -->|desktop| B[Three-region layout]
  B --> B1[Left roster]
  B --> B2[Center phase action]
  B --> B3[Right chat/context]

  A -->|tablet| C[Two-region layout]
  C --> C1[Main action]
  C --> C2[Tabbed context]

  A -->|mobile| D[Single-column layout]
  D --> D1[Top phase header]
  D --> D2[Primary action]
  D --> D3[Sheet for roster/chat/votes]
```

## Visual Design Gate

```mermaid
flowchart LR
  IA[Information Architecture] --> Concept[Generate/approve visual concepts]
  Concept --> Tokens[Extract design tokens]
  Tokens --> Components[Implement shadcn component variants]
  Components --> Browser[Browser screenshot verification]
  Browser --> Fix{Agency signoff?}
  Fix -->|No| Components
  Fix -->|Yes| Done[Frontend UI accepted]
```
