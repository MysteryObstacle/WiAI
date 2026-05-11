# Information Architecture

## Routes

```text
/                    create or join
/room/[roomCode]     lobby
/game/[roomId]       live game
/rules               static rules page
/replay/[sessionId]  future replay
/dev/agent           future Agent debug
```

## App Shell

P0 shell:

- Product mark: WiAI.
- Connection status.
- Room code when applicable.
- Settings entry can be hidden until P1.

## Live Game Layout

Desktop:

```text
left: player roster
center: phase content
right: chat/vote/context panel
top: phase header and timer
```

Mobile:

```text
top: phase header and timer
main: current action
drawer/tabs: players, chat, answers
```

