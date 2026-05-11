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

## Troubleshooting

### `EADDRINUSE` on port 2567 or 3000

Another process is already bound to that port (often a previous `npm run dev` that did not exit, or a second terminal running the same stack).

1. Close other dev terminals, or stop the old Node processes.
2. On Windows, find and stop the process:

   ```powershell
   netstat -ano | findstr :2567
   netstat -ano | findstr :3000
   ```

   Then end the PID from Task Manager or `taskkill /PID <pid> /F`.

3. Or use different ports via environment variables before `npm run dev` (set `PORT` for the server and use `next dev -p` for the web app in a custom script if needed).

### `npm warn EBADENGINE` for `eslint-visitor-keys`

Your Node version is slightly below the range declared by that dependency (for example Node `22.12.0` vs required `^22.13.0`). Prefer upgrading Node to **22.13+** (or current LTS). The warning is usually non-fatal.

### `npm warn cleanup` / `EPERM` under `node_modules`

Usually antivirus, indexer, or another process is holding files under `node_modules`. Close editors pointing at those paths, retry `npm install`, or delete `node_modules` and reinstall after pausing aggressive real-time scanning for the project folder.

## Environment

Copy `.env.example` when you need custom local values.

```text
NEXT_PUBLIC_WIAI_SERVER_URL=ws://127.0.0.1:2567
WIAI_DATABASE_URL=file:./.data/wiai.sqlite
PORT=2567
```

The browser never advances authoritative game state. It renders server snapshots and sends commands to the Colyseus room.
