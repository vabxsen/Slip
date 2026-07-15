# Slip

The easiest way to transfer files between any device — Windows, macOS, Linux, Android, and iPhone.

Files move **peer-to-peer** over encrypted WebRTC data channels. The server only handles pairing
and signaling; file bytes never touch it and are never persisted anywhere.

## Features

- **Pairing** — QR code or 6-digit code, live device presence and connection quality
- **Transfers** — multi-file and folder uploads (drag-and-drop or picker), chunked send with
  backpressure, real-time progress/speed/ETA, cancel and retry in both directions
- **Saving files** — streams straight to a chosen folder via the File System Access API where
  supported, otherwise downloads normally; configurable in Settings
- **History** — every transfer persisted to IndexedDB (search, filter by direction/status),
  survives reloads
- **Settings** — theme, device name, download location, notifications, trusted devices with
  auto-accept, About
- **PWA** — installable, offline-capable app shell, maskable icons, iOS home-screen support

## Architecture

npm-workspaces monorepo:

| Workspace | Package | Purpose |
| --- | --- | --- |
| `client/` | `@slip/client` | React 19 PWA (Vite, MUI, React Router, React Query, Zustand, Motion) |
| `server/` | `@slip/server` | Signaling server (Express 5 + Socket.IO) — pairing rooms & WebRTC handshake relay |
| `shared/` | `@slip/shared` | Protocol & domain types shared by both sides |

`@slip/shared` ships TypeScript source directly (internal-package pattern): Vite and `tsx`
compile it on the fly in dev, and `tsup` bundles it into the server build.

## Getting started

```bash
npm install
npm run dev        # signaling server on :3001 + client on :5173
```

## Scripts (run from the repo root)

| Script | What it does |
| --- | --- |
| `npm run dev` | Runs server (tsx watch) and client (Vite) concurrently |
| `npm run build` | Production build of server (`tsup`) then client (`vite build`) |
| `npm run typecheck` | Strict TypeScript check across all workspaces |
| `npm run lint` / `lint:fix` | ESLint (flat config) across the repo |
| `npm run format` / `format:check` | Prettier |

## Environment

Copy the examples and adjust as needed:

- `server/.env.example` → `server/.env` (`PORT`, `CORS_ORIGINS`)
- `client/.env.example` → `client/.env` (`VITE_SERVER_URL`, optional `VITE_FIREBASE_*`)

Firebase Analytics is entirely optional — leave the `VITE_FIREBASE_*` variables unset and the app
runs normally with analytics disabled (the SDK isn't even downloaded). Fill them in from your
Firebase project's web app config to enable it.

## Client structure

```
client/src/
├── app/          # App root, providers, router config, shared QueryClient
├── pages/        # Route-level pages (thin — compose features)
├── layouts/      # App shell (responsive navigation)
├── features/     # devices/, pairing/, transfer/, history/, settings/
├── components/   # Shared UI kit
├── hooks/        # Cross-cutting hooks
├── services/     # socket client, webrtc engine, storage (IndexedDB), notifications, analytics
├── store/        # Zustand stores
├── theme/        # Material Design 3 tokens & MUI themes
├── utils/ types/ assets/
```

## Security model

- WebRTC data channels are encrypted end-to-end (DTLS) by the platform.
- Transferred files exist only in memory (or stream straight to disk on supporting browsers)
  during a transfer — they are never uploaded to or stored on any server.
- Only transfer *metadata* (name, size, status) is kept locally for the History page.

## Deploying

The client deploys to **Firebase Hosting**; the signaling server deploys to **Google Cloud Run**
(via the repo-root `Dockerfile`) since Firebase Hosting only serves static files.

**Live deployment:**

- Client: https://slip6.web.app
- Signaling server: https://slip-signaling-773005648986.us-central1.run.app

```bash
# Server (from repo root — Dockerfile needs the monorepo context)
gcloud run deploy slip-signaling --source . --region us-central1 \
  --allow-unauthenticated --set-env-vars CORS_ORIGINS=https://slip6.web.app

# Client
echo "VITE_SERVER_URL=<your Cloud Run URL>" > client/.env.production.local
npm run build -w @slip/client
firebase deploy --only hosting
```

`firebase.json` points Hosting at `client/dist` with SPA rewrites and long-term caching for
hashed assets. The `Dockerfile` builds `@slip/server` in a workspace-aware stage (so
`@slip/shared` resolves), bundles it with `tsup`, then strips the workspace-only dependency
entry before the production `npm install` in the runtime stage.

## License

MIT — see [LICENSE](LICENSE).
