# Talko

Practice **any language** with real people — live **1-on-1 audio calls** or **text chat**. No accounts, no bots, no recordings.

**Live:** [https://talkos.vercel.app/](https://talkos.vercel.app/)

**Stack:** Next.js 15 · React 19 · Supabase Realtime (presence + signaling) · WebRTC P2P audio · Tailwind CSS 4 · Vercel

---

## Features

- **No account** — display name, language, and CEFR level (A1–C2) saved on this device
- **Call or chat** — choose a mode at `/practice`, then join a topic room
- **Topic rooms** — Open chat, Daily life, Travel, Work, Opinions, Hobbies, Culture, Tech (scoped per language)
- **Find a partner** — call mode only; prefers people who are Looking and nearby in level
- **Direct invite** — call or message someone already online in the lobby
- **WebRTC audio** — mute, timer, connection status; peer-to-peer with optional TURN
- **Conversation prompts** — optional icebreakers filtered by the room you joined
- **Chat threads** — Messenger-style inbox with local history; typing indicators
- **Call history & ratings** — after longer calls: helpful / clear / kind + note (local only)
- **Settings** — light/dark theme; optional ringtone, vibration, and notification for incoming invites
- **Guide** — interactive walkthrough at [`/guide`](./src/app/guide/page.tsx)

Nothing is stored on a server except ephemeral Realtime presence and signaling. Profile, room, history, chat threads, and settings live in `localStorage`.

---

## How it works

```
Landing → Practice (Call | Chat) → Profile (if needed) → Room lobby → Invite / Match → Speak or type
```

1. Open **Practice** and pick **Call** or **Chat**.
2. Set a name, language, and level (once per device).
3. Join a **room**. Each room × language is its own Supabase Realtime channel.
4. **Call mode:** tap **Call** on someone, or **Find a partner**. Audio connects over WebRTC after they accept.
5. **Chat mode:** message someone from the list (or an existing thread). No auto-match.
6. Prompts, mute (calls), and end session work in-session. Ratings save locally after connected calls (~20s+).

Cross-mode invites (e.g. a call while you’re in chat) are auto-declined.

No database tables are required. Talko uses Realtime **Presence** + **Broadcast** only.

```
┌─────────┐   Presence + signals   ┌──────────┐
│ Browser │ ←────────────────────→ │ Supabase │
│  A      │                        │ Realtime │
└────┬────┘                        └────┬─────┘
     │                                  │
     │         WebRTC audio (P2P)       │
     └──────────────────────────────────┘
              (+ TURN if needed)
```

---

## Setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **Project Settings → API**
3. Copy **Project URL** and **anon public** key

Confirm Realtime is enabled (default on new projects). If lobbies stay empty or calls never connect, check that first.

### 2. TURN (recommended for audio)

STUN alone often fails across different Wi‑Fi networks or cities. Talko expects a [Metered](https://www.metered.ca/tools/openrelay/) (or compatible) TURN credential so peers can relay when direct P2P is blocked.

From Metered → your credential → **Instructions**, copy either:

- the full `iceServers` JSON array, or
- username + credential (the app can build common Metered URLs)

### 3. Environment

```bash
cp .env.example .env.local
```

Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# TURN — paste iceServers JSON (one line) and/or username + credential
NEXT_PUBLIC_TURN_USERNAME=...
NEXT_PUBLIC_TURN_CREDENTIAL=...
NEXT_PUBLIC_TURN_ICE_SERVERS=[{"urls":"stun:..."},{"urls":"turn:...","username":"...","credential":"..."}]

# Optional — canonical site URL for metadata (defaults work on Vercel)
# NEXT_PUBLIC_SITE_URL=https://talkos.vercel.app
```

See [`.env.example`](./.env.example) for optional Metered API-key fetch.

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Start practicing**.

Test with **two browser tabs** (or two devices) and different display names. Allow microphone access when prompted for calls.

| Script          | Purpose                |
|-----------------|------------------------|
| `npm run dev`   | Local development      |
| `npm run build` | Production build       |
| `npm run start` | Serve production build |
| `npm run lint`  | ESLint                 |

---

## Deploy on Vercel

**Production:** [https://talkos.vercel.app/](https://talkos.vercel.app/)

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add the same `NEXT_PUBLIC_SUPABASE_*` and TURN env vars
4. Deploy

No separate signaling server is needed — Supabase Realtime handles presence and WebRTC handshake traffic.

---

## Project layout

```
src/
  app/
    page.tsx                     Landing
    guide/page.tsx               How-it-works walkthrough
    settings/page.tsx            Theme + incoming alerts
    practice/page.tsx            Mode picker (Call | Chat)
    practice/call/page.tsx       Audio practice
    practice/chat/page.tsx       Text practice
  components/
    LandingPage.tsx              Marketing home
    GuidePage.tsx                Interactive guide
    SettingsPage.tsx             Preferences
    practice/ModePicker.tsx      Call vs Chat
    practice/PracticeGate.tsx    Config + profile gate
    CallApp.tsx / ChatApp.tsx    Mode orchestration
    PracticeLobby.tsx            Rooms + online list
    ActiveCall.tsx / ActiveChat.tsx
    IncomingCall.tsx / OutgoingInvite.tsx
    ChatInbox.tsx                Local chat threads
    CallHistory.tsx / CallFeedback.tsx
    RoomPicker.tsx / OnlineList.tsx
    SiteHeader.tsx / SiteFooter.tsx
    ThemeProvider.tsx
  hooks/
    useLobby.ts                  Presence + invite signaling
    useWebRTC.ts                 RTCPeerConnection + mic
    useProfile.ts                localStorage profile
    useSettings.ts               Theme + notifications
    useIncomingRing.ts           Ringtone / vibrate / notify
  lib/
    rooms.ts                     Rooms + language-scoped channels
    languages.ts / levels.ts / prompts.ts
    history.ts / chatHistory.ts  Local persistence
    iceServers.ts / supabase.ts / settings.ts / profile.ts
  types/index.ts
```

---

## Privacy & limits

- **No accounts** — identity is a random id + display name on the device
- **No call recordings** — audio is peer-to-peer; Talko does not store media
- **Ephemeral lobby** — when you leave, you disappear from presence
- **Local data** — call history, chat threads, theme, and alerts stay in the browser
- **Browser support** — needs a modern browser; calls need WebRTC and mic permission
- **NAT / firewalls** — without TURN, some cross-network calls will fail to connect

---

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| “Config missing” screen | Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, restart `npm run dev` |
| Empty lobby / never see others | Same room **and** same mode URL; Realtime enabled; both on the same deployed host or `localhost` |
| Call rings but no audio | Mic permission; check TURN env vars for cross-network calls |
| `NEXT_PUBLIC_TURN_ICE_SERVERS` ignored | Must be **one-line valid JSON** with quoted keys |
| Match finds nobody | Call mode only; need at least one other person Online/Looking in the same room |
| No ringtone / notification | Enable alerts in **Settings** (off by default) |

---

## License

Private / learning project unless otherwise stated.
