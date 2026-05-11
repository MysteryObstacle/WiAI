# WiAI

WiAI is the TypeScript rewrite of **Who is AI**, a local-first social deduction game prototype using Next.js, Colyseus, SQLite-style persistence, and a mock Agent player.

## Local Development

```bash
npm install
npm run dev
```

The web app runs on `http://localhost:3000` and the Colyseus server runs on `ws://127.0.0.1:2567`.

The local SQLite file is created under `apps/server/.data/wiai.sqlite` when the server runs through the workspace script.

## Verification

```bash
npm run typecheck
npm run lint
npm run test:architecture
npm run test
npm run build
npm run test:e2e
```

See `docs/engineering/local-development.md` and `docs/engineering/deployment.md` for local and deployment notes.
