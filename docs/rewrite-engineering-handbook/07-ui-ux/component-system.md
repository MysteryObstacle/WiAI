# Component System

## shadcn/ui Primitives

Use:

- Button
- Input
- Textarea
- Card where framing is useful
- Dialog or Sheet for mobile panels
- Badge for status
- Separator
- ScrollArea
- Tooltip

Avoid nested cards.

## Domain Components

Lobby:

- `CreateRoomPanel`
- `JoinRoomPanel`
- `LobbyRoom`
- `PlayerRoster`
- `ReadyControl`

Game:

- `GameClient`
- `GameLayout`
- `PhaseHeader`
- `AnswerPanel`
- `RevealPanel`
- `DiscussionPanel`
- `VotePanel`
- `SettlementPanel`

## State Display

Player status badges:

- host
- ready
- disconnected
- AI, only after settlement unless viewer is that AI in debug context

