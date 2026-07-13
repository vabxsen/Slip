# Slip

The easiest way to transfer files between any device — Windows, macOS, Linux, Android, and iPhone.

Files move **peer-to-peer** over encrypted WebRTC data channels. The server only handles pairing
and signaling; file bytes never touch it and are never persisted anywhere.

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
- `client/.env.example` → `client/.env` (`VITE_SERVER_URL`)

## Client structure

```
client/src/
├── app/          # App root, providers, router config
├── pages/        # Route-level pages (thin — compose features)
├── layouts/      # App shell (responsive navigation)
├── features/     # devices/, pairing/, transfer/, history/, settings/
├── components/   # Shared UI kit
├── hooks/        # Cross-cutting hooks
├── services/     # socket client, webrtc engine, storage (IndexedDB), api
├── store/        # Zustand stores
├── theme/        # Material Design 3 tokens & MUI themes
├── utils/ types/ assets/
```

## Security model

- WebRTC data channels are encrypted end-to-end (DTLS) by the platform.
- Transferred files exist only in memory (or stream straight to disk on supporting browsers)
  during a transfer — they are never uploaded to or stored on any server.
- Only transfer *metadata* (name, size, status) is kept locally for the History page.
