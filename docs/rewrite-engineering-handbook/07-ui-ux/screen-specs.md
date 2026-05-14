# Screen Specs

## Create/Join Screen

Required controls:

- nickname input
- create room button
- room code input
- join room button

States:

- idle
- connecting
- invalid room code
- room full

## Lobby Screen

Required elements:

- room code
- copy button
- player roster
- ready toggle
- host start button
- host kick controls

Start button explains disabled reason.

## Game Screen

Required regions:

- top status bar with product identity, room code, round, phase, countdown, current player number, and known identity
- left and right player status columns for the 6-8 player target layout
- central command console for the active phase's primary task
- bottom action bar with current focus and phase-specific commands
- investigation sheet/drawer for player dossier, answer history, discussion evidence, and vote context
- revealed answers, discussion messages, and vote state surfaced through the active command console or dossier, not as always-on competing panels

Action panel changes by phase.

Preferred desktop structure:

```text
top status bar
left player column | central command console | right player column
bottom focus/action bar
secondary dossier in Sheet/Drawer
```

Preferred phase behavior:

- Answer prep: central console shows the question, answer guidance, answer input, and submit/cancel state. Player columns show submitted/waiting only.
- Answer reveal: central console shows the selected player's full answer. Player columns show public answer availability and suspicion markers.
- Discussion: central console organizes messages around the current focus player and relevant answer context. It should not become a generic full-screen chat.
- Voting: player cards act as candidate selectors. The central console shows selected target, reasoning context, and confirmation.

Do not expose AI identity in player cards during normal play. Debug-only identity labels must stay out of the production game surface.

## Settlement Screen

Required elements:

- winner side
- frozen player
- all roles
- final decision vote table
- return to lobby/new game action can be P1
