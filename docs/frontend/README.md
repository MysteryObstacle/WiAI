# Frontend Constraints

This directory defines the frontend rules that must be read before changing the WiAI web UI.

## Read Order

1. [UI constraints](./ui-constraints.md)
2. [i18n constraints](./i18n-constraints.md)
3. Existing UI/UX handbook files under [`docs/rewrite-engineering-handbook/07-ui-ux`](../rewrite-engineering-handbook/07-ui-ux/README.md)

## Scope

These constraints apply to `apps/web` and any shared frontend-facing package code introduced later.

Current frontend work is documentation-only. Implementation must not begin until the relevant constraints are reviewed and an implementation plan is approved.

## Non-Negotiables

- Use shadcn/ui as the base UI system.
- Prefer project components with explicit variants over page-level styling.
- Keep the visual direction restrained, readable, and investigation-room-like.
- Support only Simplified Chinese (`zh-CN`) and English (`en-US`) for now.
- Use `next-intl` for translation loading and locale-aware rendering.
- Do not hard-code user-facing strings in React components.

## Relationship To Existing Docs

The existing handbook remains the product and architecture source of truth. This directory adds stricter implementation constraints for the frontend rewrite so future UI changes do not drift back into ad hoc CSS, unclear information hierarchy, or single-language text.
