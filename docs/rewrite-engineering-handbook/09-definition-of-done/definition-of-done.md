# Definition Of Done

A story is Done only when all applicable items are true:

- Acceptance criteria pass.
- Unit tests are added or updated.
- Integration tests are added when module boundaries are touched.
- E2E test is added or updated for user-visible flow changes.
- Typecheck passes.
- Lint passes.
- Architecture boundary tests pass.
- Build passes.
- Documentation is updated.
- Error states are handled with stable codes.
- No hidden role leakage is introduced.
- Agent path uses suggestion boundary.
- Accepted commands persist through Unit of Work.
- Domain code keeps clean imports: no Zod, Colyseus, Drizzle, React, browser API, DB, or Agent dependencies.
- No browser code advances authoritative game state.

P0 is Done only when `npm run dev` supports a full local game from create room to settlement.
