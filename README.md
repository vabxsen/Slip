<div align="center">
  <img src="client/public/icons/icon-512.png" width="120" height="120" alt="Slip logo" />

  # slip

  **The easiest way to transfer files between any device.**

  No accounts required. No file size limits. No uploads to a server.
  Just pair two devices and send — directly, peer-to-peer, encrypted.

  **🌐 Live app → [slip6.web.app](https://slip6.web.app)**

  [![Live App](https://img.shields.io/badge/live-slip6.web.app-0b57d0?style=flat-square)](https://slip6.web.app)
  [![License: MIT](https://img.shields.io/badge/license-MIT-black?style=flat-square)](LICENSE)
  [![Built with React 19](https://img.shields.io/badge/react-19-149ECA?style=flat-square&logo=react)](client/package.json)
  [![TypeScript](https://img.shields.io/badge/typescript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](tsconfig.base.json)

</div>

---

## 📖 Table of contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Getting started](#-getting-started)
- [⚙️ Environment variables](#️-environment-variables)
- [📁 Client structure](#-client-structure)
- [🔒 Security model](#-security-model)
- [☁️ Deployment](#️-deployment)
- [📄 License](#-license)

---

## ✨ Features

### 📡 Transfer & pairing

- **🔗 Peer-to-peer transfer** — files move over an encrypted WebRTC data channel, straight from one device to the other. They never pass through, or get stored on, any server.
- **📷 QR code pairing** — one device shows a QR code, the other scans it with an in-app camera scanner and connects instantly.
- **🔢 6-digit code pairing** — no camera? Just type the code shown on the other device.
- **🖱️ Drag & drop** — drop one file, a folder, or a whole batch straight onto the Home screen.
- **📂 Folder picker** — or just click to browse and pick files/folders the traditional way.
- **📊 Live progress** — real-time transfer speed, percentage, and ETA for every file, with cancel support.
- **💾 Smart saving** — streams straight to a folder you choose (on browsers that support the File System Access API), or falls back to a normal browser download — configurable in Settings.
- **✅ Trusted devices** — mark a device as trusted once, and future transfers from it skip the confirmation prompt entirely.

### 👤 Accounts & cloud sync

- **🔑 Sign in with Google** — fully optional; Slip works completely anonymously without it.
- **🔄 Cross-device sync** — once signed in, your personal info, trusted devices, and transfer history follow you to every device you sign into.
- **🏷️ Permanent usernames** — claim a unique, permanent username tied to your account (enforced atomically — no two accounts can ever share one).
- **📇 Public profile lookup** — other signed-in users can look you up by username to see your name and photo — never your email.

### 💬 Send to username & messaging

- **🎯 Send to username** — connect directly to another Slip user by typing their username, no code or QR needed, as long as they're online right now.
- **📨 Incoming request prompts** — the recipient gets an Accept/Decline prompt showing exactly who's asking to connect.
- **💭 Lightweight messaging** — send quick online-only text messages to another user, peer-relayed through the signaling server. Nothing is ever stored — close the dialog and it's gone.

### 🕘 Transfer history

- **📜 Full history** — every send and receive is logged locally (IndexedDB) and synced to the cloud when you're signed in.
- **🔍 Search & filter** — filter by direction (sent/received) and status (completed/cancelled/failed), or search by filename.
- **🧹 One-tap clear** — wipes both local and cloud history together, with a confirmation prompt first.

### 🎨 Appearance

- **🌗 Light, dark, or system** — follows your OS by default, or pick a mode explicitly.
- **🎨 Material You color picker** — the entire UI is dynamically re-themed (Material Design 3 color science) around any accent color you pick — 8 presets or a full custom color wheel.
- **⚫ High contrast mode** — forces dark mode's background to true pitch black instead of a soft gray tone, for maximum contrast and OLED-friendly battery savings.
- **✨ Animated navigation** — every tab gets a satisfying spring "pop" animation on tap and on becoming active.

### 📱 Progressive Web App

- **⬇️ Installable** — add Slip to your home screen or desktop from the browser, or tap "Install app" right in Settings.
- **🌑 Seamless launch** — a custom black boot screen and matching native splash background mean no jarring white flash when the app opens.
- **📶 Works offline** — the app shell is fully cached and loads instantly, even with no connection (pairing/transfer still needs the internet, naturally).

### 🔔 Notifications & feedback

- **🔔 System notifications** — get notified when a device connects or a transfer finishes, even from a background tab.
- **🔊 Sound effects** — a short, pleasant synthesized chime plays when a file finishes sending or downloading (fully toggleable).
- **🖥️ Multi-device management** — a dedicated Devices tab shows every device currently connected to you.

### ℹ️ Settings & about

- **📝 Personal info** — edit your display name; email is read-only, pulled straight from your Google account.
- **💻 Device identity** — your device gets a sensible default name based on what it actually is (`Windows PC`, `Mac`, `iPhone`, `Android Phone`, …), fully renameable.
- **❤️ Credits** — a dedicated Credits screen crediting the maker, with contact info and a link to this very repo.

---

## 🏗️ Architecture

An npm-workspaces monorepo with three packages:

| Workspace | Package | Purpose |
| --- | --- | --- |
| `client/` | `@slip/client` | React 19 PWA — Vite, MUI (Material Design 3), React Router, React Query, Zustand, Motion |
| `server/` | `@slip/server` | Signaling server — Express 5 + Socket.IO. Handles pairing rooms, WebRTC handshake relay, presence, and username-based connect requests. **Never touches file bytes.** |
| `shared/` | `@slip/shared` | Protocol & domain types shared by both sides |

`@slip/shared` ships TypeScript source directly (an internal-package pattern) — Vite and `tsx`
compile it on the fly in dev, and `tsup` bundles it into the server build.

**Cloud infrastructure:**

- 🔥 **Firebase Hosting** — serves the static client PWA
- 🔥 **Firebase Auth** — Google Sign-In
- 🔥 **Firestore** — personal info, trusted devices, history, usernames, public profiles — all gated by strict per-owner security rules
- ☁️ **Google Cloud Run** — hosts the signaling server (Docker container, auto-scaling)

---

## 🚀 Getting started

```bash
npm install
npm run dev        # signaling server on :3001 + client on :5173
```

### Scripts (run from the repo root)

| Script | What it does |
| --- | --- |
| `npm run dev` | Runs server (`tsx watch`) and client (Vite) concurrently |
| `npm run build` | Production build of server (`tsup`) then client (`vite build`) |
| `npm run typecheck` | Strict TypeScript check across all workspaces |
| `npm run lint` / `lint:fix` | ESLint (flat config) across the repo |
| `npm run format` / `format:check` | Prettier |

---

## ⚙️ Environment variables

Copy the examples and adjust as needed:

- `server/.env.example` → `server/.env` — `PORT`, `CORS_ORIGINS`
- `client/.env.example` → `client/.env` — `VITE_SERVER_URL`, optional `VITE_FIREBASE_*`

Every Firebase-backed feature (sign-in, cloud sync, usernames, messaging, analytics) is entirely
optional at the code level — leave the `VITE_FIREBASE_*` variables unset and the app runs fully
in anonymous, device-only mode with those features gracefully hidden.

---

## 📁 Client structure

```
client/src/
├── app/          # App root, providers, router config, shared QueryClient
├── pages/        # Route-level pages (thin — compose features)
├── layouts/      # App shell (responsive navigation, animated nav rail/bottom bar)
├── features/     # devices/, pairing/, transfer/, history/, settings/, messaging/, sync/, auth/
├── components/   # Shared UI kit
├── hooks/        # Cross-cutting hooks
├── services/     # socket client, WebRTC engine, storage (IndexedDB), Firestore, notifications, sound, analytics
├── store/        # Zustand stores
├── theme/        # Material Design 3 tokens & MUI theme (dynamic color engine)
└── utils/ types/ assets/
```

---

## 🔒 Security model

- 🔐 **End-to-end encrypted transport** — WebRTC data channels are encrypted (DTLS) by the platform itself.
- 🚫 **Zero server-side file storage** — files exist only in memory (or stream straight to disk on supporting browsers) during a transfer; only transfer *metadata* (name, size, status) is ever persisted, and only for your own History page.
- 🛡️ **Locked-down Firestore rules** — every document is scoped to its owner; usernames are claimed through an atomic transaction so two accounts can never collide; public profiles expose only username, display name, and photo — never email.
- 🎫 **Verified identity, not just claimed** — the signaling server verifies your Firebase ID token *and* cross-checks it against Firestore before letting a socket represent a username, closing off impersonation.
- 🚦 **Rate limiting** — pairing, connection requests, and messages are all rate-limited per socket to blunt spam and brute-force attempts against the 6-digit pairing codes.
- 🧱 **Hardened Hosting headers** — `X-Frame-Options`, `X-Content-Type-Options`, and a strict `Referrer-Policy` guard against clickjacking and MIME-sniffing.

---

## ☁️ Deployment

The client deploys to **Firebase Hosting**; the signaling server deploys to **Google Cloud Run**
(via the repo-root `Dockerfile`), since Firebase Hosting only serves static files.

**Live deployment:**

- 🌐 Client: https://slip6.web.app
- 📡 Signaling server: https://slip-signaling-773005648986.us-central1.run.app

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

---

## 📄 License

MIT — see [LICENSE](LICENSE).

<div align="center">
  <sub>Made with ❤️ by <a href="https://github.com/vabxsen">Vaibhav Sen</a></sub>
</div>
