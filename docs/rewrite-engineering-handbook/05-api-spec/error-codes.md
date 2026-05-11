# Error Codes

## Room Errors

| Code | Meaning |
|---|---|
| `room_not_found` | Room code cannot be resolved |
| `room_full` | Room is at max players |
| `room_password_required` | Room requires password |
| `invalid_room_password` | Password is wrong |
| `room_not_lobby` | Action requires lobby |
| `room_not_playing` | Action requires active game |

## Actor Errors

| Code | Meaning |
|---|---|
| `not_joined` | Client has no bound player |
| `not_host` | Actor is not host |
| `player_not_active` | Actor cannot act in current session |
| `invalid_reconnect_token` | Token cannot restore identity |

## Command Errors

| Code | Meaning |
|---|---|
| `invalid_phase` | Command not allowed in phase |
| `invalid_content` | Text content is empty or invalid |
| `duplicate_answer` | Existing answer for round |
| `answer_not_submitted` | No answer to cancel |
| `invalid_ballot_type` | Ballot type does not match round |
| `decision_ballot_requires_target` | Decision ballot cannot abstain |
| `invalid_target` | Vote target invalid |
| `forbidden_self_vote` | Actor voted for self |
| `duplicate_ballot` | Existing ballot for round/type |

## Agent Errors

| Code | Meaning |
|---|---|
| `agent_assignment_inactive` | Assignment is not active |
| `agent_suggestion_rejected` | Suggestion failed validation |
| `agent_context_visibility_violation` | Context would leak hidden data |

