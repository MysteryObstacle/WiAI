# i18n Constraints

## Goal

WiAI must support Simplified Chinese and English without scattering text across components. Locale support should be simple now and compatible with broader Next.js routing later.

## Supported Locales

Only these locales are in scope:

- `zh-CN`: default locale.
- `en-US`: complete English fallback.

Do not add partial locales. A locale is supported only when every user-facing message needed by the current UI exists.

## Library

Use `next-intl` for frontend translations.

The frontend should use `next-intl` for:

- Loading locale messages.
- Reading translated strings in React components.
- Formatting UI labels that depend on business state.
- Implementing the language switch.

Do not introduce a second i18n library without replacing this constraint document.

## Locale Selection

The app should default to `zh-CN`.

Users must be able to switch between `zh-CN` and `en-US`. The selected locale should persist across sessions. The exact persistence mechanism can be chosen during implementation, but it must not require server persistence for the local-first prototype.

## Message Organization

Messages should be grouped by product area and component responsibility, not by visual page only.

Recommended namespaces:

- `app`: product name, app shell, shared metadata.
- `nav`: navigation, language switch, room context.
- `lobby`: create room, join room, room code, roster, ready/start states.
- `game.phase`: phase names, round labels, countdown labels.
- `game.answer`: answer input, submitted state, reveal copy.
- `game.discussion`: chat, empty states, composer labels.
- `game.vote`: vote options, abstain, submitted state, disabled reasons.
- `game.settlement`: winner, frozen player, role reveal, final votes.
- `status`: online, disconnected, host, ready, waiting, current player.
- `errors`: connection, validation, room, and command errors.
- `a11y`: ARIA labels and screen-reader-only text.

Keys should describe meaning, not visual placement. Prefer `lobby.create.submit` over `leftCard.button`.

## Hard-Coded Text Rule

React components must not hard-code user-facing strings.

This includes:

- Headings.
- Paragraphs.
- Button labels.
- Input placeholders.
- Empty states.
- Error messages.
- Disabled reasons.
- Tooltip content.
- ARIA labels and titles.
- Phase, role, player type, and status labels.

Acceptable hard-coded values:

- Stable IDs and test IDs.
- Internal enum values.
- Non-user-visible analytics or command names.
- Product constants that are intentionally not translated, if documented.

## Business State Display

Business enums must be translated through message maps.

Examples:

- `answer_prep` should render through a phase label translation.
- `human` and `ai` should render through player type translations.
- `ready`, `waiting`, and `disconnected` should render through status translations.
- Role names should render through role translations when revealed.

Components may receive enum values from state, but they must convert them to display text at the UI boundary.

## Copy Quality

Chinese copy should be the primary product voice. English copy should be complete and natural, not a literal machine translation.

Tone:

- Concise.
- Direct.
- Playable.
- Suspicious but not melodramatic.
- Clear about what the player can do next.

Avoid long explanatory text inside high-pressure game phases. Prefer short labels and one-sentence guidance.

## Errors And Disabled States

Errors and disabled reasons must be localizable.

Do not show raw server error codes directly to users. Map them to translated messages. If the code is unknown, show a generic localized fallback and keep technical detail out of the primary UI.

Disabled controls should expose the reason in nearby text or a tooltip. The reason must come from translation messages.

## Accessibility Text

ARIA labels, icon-only button labels, screen-reader-only descriptions, and document metadata must be translated.

The visible label and accessibility label should stay semantically aligned. Do not translate one without the other.

## Testing Expectations

When i18n is implemented, verification should cover:

- `zh-CN` renders without missing keys.
- `en-US` renders without missing keys.
- Language switching updates visible UI text.
- Selected locale persists after refresh.
- Phase, status, player type, and error messages use translated labels.
- No major React component keeps hard-coded user-facing strings.
