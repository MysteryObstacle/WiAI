# Observability And Debugging

## Required Log Fields

Server logs should include:

- room id
- room code
- session id
- phase
- phase version
- actor session player id
- event id
- command type

## Debug Events

Persist useful debug events:

- rejected command
- rejected Agent suggestion
- phase timeout ignored due to stale version
- reconnect success
- reconnect failure

## Local Debug Surfaces

P0 can rely on logs and SQLite inspection.

P1 should add:

- session event viewer
- Agent action audit viewer
- replay timeline

