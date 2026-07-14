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

The client deploys to **Firebase Hosting**; the signaling server deploys separately to any Node
host (Cloud Run, Render, etc.) since Firebase Hosting only serves static files.

```bash
npm run build -w @slip/client
firebase deploy --only hosting   # requires `firebase init hosting` with your project first
```

`firebase.json` at the repo root points hosting at `client/dist` with SPA rewrites and long-term
caching for hashed assets. Set `client/.env`'s `VITE_SERVER_URL` to your deployed signaling
server's URL before building.
