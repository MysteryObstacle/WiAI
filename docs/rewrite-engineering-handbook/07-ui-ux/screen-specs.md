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
- left player status panel with all active players, public player numbers, phase status, speech counts, current vote counts, answer status, vote status, and previous-round top-voted marker
- central stage main canvas for the active phase's primary task
- right persistent investigation panel for player statistics, answer records, discussion evidence, and vote context
- revealed answers, discussion messages, and vote state surfaced through the active command console or dossier, not as always-on competing panels

The three main columns share the page's remaining height. Each column scrolls internally instead of pushing the page taller.

Preferred desktop structure:

```text
top status bar
left player status panel | central stage main canvas | right investigation panel
```

Preferred phase behavior:

- Answer prep: `AnswerPrepCard` shows the question, answer guidance chips, answer-paper textarea, character count, submit/modify state, and submitted count. Left panel emphasizes submitted/waiting status. Right panel shows round task guidance if no evidence exists yet.
- Answer reveal: `AnswerRevealCard` shows an answer card wall plus selected answer detail and suspicion tags. Right panel follows the selected answer's player and highlights answer evidence.
- Discussion: `DiscussionCard` organizes messages around the current focus player, focus summary, and quick replies. It should not become a generic full-screen chat.
- Voting: `VotingDecisionCard` uses a planar voting relationship graph with player-number nodes connected as a regular N-sided polygon and arrows from voter to target. It must not repeat candidate cards from the left panel, draw a central VOTE/X table, or use checkmarks instead of vote arrows.

Do not expose AI identity or nicknames in player cards during normal play. Debug-only identity labels must stay out of the production game surface; in-game users are identified by public number.

Desktop sizing:

- left panel: 240-260px
- center canvas: minmax(0, 1fr)
- right panel: 320px

Tablet and mobile:

- tablet may keep a compressed left panel and collapse the dossier
- mobile uses top bar, horizontal player rail, single stage card, and dossier drawer

## Settlement Screen

Required elements:

- winner side
- frozen player
- all roles
- final decision vote table
- return to lobby/new game action can be P1
