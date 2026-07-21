# Talko

Practice English in live 1-on-1 audio calls. Find a partner or call someone online.

**Stack:** Next.js (App Router) · Supabase Realtime (presence + signaling) · WebRTC P2P audio · Vercel-ready

## Setup

### 1. Supabase project

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **Project Settings → API**
3. Copy **Project URL** and **anon public** key

No database tables are required. Talko uses Realtime **Presence** + **Broadcast** only.

If calls never connect, confirm Realtime is enabled for your project (default on new projects).

### 2. Environment

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Start practicing**. Test with two browser tabs (different names).

## Deploy on Vercel

1. Push the repo to GitHub
2. Import in Vercel
3. Add the same two `NEXT_PUBLIC_SUPABASE_*` env vars
4. Deploy

No separate signaling server is needed.

## Flow

1. Landing → practice
2. Lightweight profile (name + English level) stored in `localStorage`
3. Join live lobby via Supabase Presence
4. **Find a partner** (random match) or **Call** someone from the list
5. Accept → WebRTC offer/answer/ICE over Broadcast → audio call

## Project layout

```
src/app/page.tsx              Landing
src/app/practice/page.tsx     Practice room
src/hooks/useLobby.ts         Presence + call signaling
src/hooks/useWebRTC.ts        RTCPeerConnection + mic cleanup
src/components/PracticeApp.tsx  Call / match orchestration
```
