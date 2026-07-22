# Talko

Practice English in live **1-on-1 audio calls** with other learners. No accounts, no bots, no recordings — pick a room, find a partner, and speak.

**Stack:** Next.js 15 (App Router) · Supabase Realtime (presence + signaling) · WebRTC P2P audio · Tailwind CSS · Vercel-ready

---

## Features

- **Lightweight profile** — display name + CEFR level (A1–C2), saved on the device
- **Topic rooms** — Open chat, Daily life, Travel, Work, Opinions, Hobbies, Culture, Tech
- **Find a partner** — smart matching prefers people who are looking and nearby in level
- **Call anyone online** — or accept an incoming invite
- **Conversation prompts** — optional icebreakers filtered by the room you joined
- **Mute / end call** — peer-to-peer audio with connection status feedback
- **Call history & ratings** — local notes after longer calls (helpful / clear / kind)
- **Guide** — walkthrough of the flow at [`/guide`](./src/app/guide/page.tsx)

Nothing is stored on a server except ephemeral Realtime presence and call signaling. Profile, room choice, and history live in `localStorage`.

---

## How it works

```
Landing → Profile → Room lobby → Match or Call → Accept → WebRTC audio
```

1. You open **Practice** and set a name + English level.
2. You join a **room**. Each room is its own Supabase Realtime channel so you only see people in the same topic.
3. **Find a partner** picks someone (preferring `Looking` + similar CEFR), or you tap **Call** on a name in the list.
4. The other person accepts. WebRTC offer / answer / ICE candidates travel over Supabase **Broadcast**.
5. Audio streams peer-to-peer. After the call, optional feedback is saved locally.

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

Confirm Realtime is enabled (default on new projects). If calls never connect, that is the first thing to check.

### 2. TURN (recommended)

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
```

See [`.env.example`](./.env.example) for optional Metered API-key fetch.

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Start practicing**.

Test with **two browser tabs** (or two devices) and different display names. Allow microphone access when prompted.

| Script        | Purpose              |
|---------------|----------------------|
| `npm run dev` | Local development    |
| `npm run build` | Production build   |
| `npm run start` | Serve production build |
| `npm run lint`  | ESLint             |

---

## Deploy on Vercel

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
    page.tsx                 Landing
    practice/page.tsx        Practice room (client app)
    guide/page.tsx           How-it-works walkthrough
  components/
    PracticeApp.tsx          Call / match orchestration
    PracticeLobby.tsx        Online list + find partner
    ActiveCall.tsx           In-call UI, prompts, mute
    RoomPicker.tsx           Topic rooms
    CallHistory.tsx          Local history
    CallFeedback.tsx         Post-call ratings
    LandingPage.tsx          Marketing home
    GuidePage.tsx            Interactive guide
  hooks/
    useLobby.ts              Presence + call signaling
    useWebRTC.ts             RTCPeerConnection + mic
    useProfile.ts            localStorage profile
  lib/
    rooms.ts                 Room definitions + channels
    levels.ts                CEFR distance + match pick
    prompts.ts               Conversation icebreakers
    history.ts               Call history persistence
    iceServers.ts            STUN / TURN config
    supabase.ts              Client + config check
  types/index.ts             Shared types
```

---

## Privacy & limits

- **No accounts** — identity is a random id + display name on the device
- **No call recordings** — audio is peer-to-peer; Talko does not store media
- **Ephemeral lobby** — when you leave, you disappear from presence
- **Local history** — ratings and notes stay in the browser (`talko.history.v1`)
- **Browser support** — needs a modern browser with WebRTC and mic permission
- **NAT / firewalls** — without TURN, some cross-network calls will fail to connect

---

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| “Config missing” screen | Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, restart `npm run dev` |
| Empty lobby / never see others | Same room; Realtime enabled; both tabs on the same deployed URL or `localhost` |
| Call rings but no audio | Mic permission; check TURN env vars for cross-network calls |
| `NEXT_PUBLIC_TURN_ICE_SERVERS` ignored | Must be **one-line valid JSON** with quoted keys |
| Match finds nobody | Need at least one other person Online/Looking in the same room |

---

## License

Private / learning project unless otherwise stated.
