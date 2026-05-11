# Local Development

## Prerequisites

- Node.js 22+
- npm 7 or newer (workspaces). If `npm install` fails with `Unsupported URL Type "workspace:"`, upgrade npm: `npm install -g npm@latest`

Internal packages use pinned `0.0.0` versions so npm can link workspace members without the `workspace:` protocol.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

- Web app: `http://localhost:3000`
- Colyseus server: `ws://127.0.0.1:2567`
- Local SQLite file: `apps/server/.data/wiai.sqlite` when running the server workspace

## Quality Gates

```bash
npm run typecheck
npm run lint
npm run test
npm run test:architecture
npm run build
npm run test:e2e
```

## Environment

Copy `.env.example` when you need custom local values.

```text
NEXT_PUBLIC_WIAI_SERVER_URL=ws://127.0.0.1:2567
WIAI_DATABASE_URL=file:./.data/wiai.sqlite
PORT=2567
```

The browser never advances authoritative game state. It renders server snapshots and sends commands to the Colyseus room.
