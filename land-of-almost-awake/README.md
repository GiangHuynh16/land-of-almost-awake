# Adventure Passport

A cozy two-user gamified web app for tracking shared weekly achievements. Claim stamps, fill your passport, unlock milestone cinematics.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React (Vite) + Tailwind CSS + Zustand |
| Backend | Node.js + Express |
| Database & Realtime | Supabase (PostgreSQL + Realtime) |
| Deploy | Vercel (frontend) + Railway/Render (backend) |

## Project structure

```
adventure-passport/
├── frontend/               # Vite React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/         # Avatar, Icons
│   │   │   ├── layout/     # TopBar
│   │   │   ├── journey/    # JourneyMap, JourneyDetail, JourneyNode, ItemCard, ActivityFeed
│   │   │   ├── passport/   # PassportBook
│   │   │   ├── claim/      # ClaimOverlay
│   │   │   ├── milestone/  # MilestoneCinematic
│   │   │   ├── modal/      # CreateItemModal
│   │   │   └── profile/    # ProfileModal
│   │   ├── hooks/          # useRealtimeSync
│   │   ├── lib/            # supabase, sound, utils, constants
│   │   ├── pages/          # (future: auth pages)
│   │   └── store/          # useAppStore (Zustand)
│   └── .env.example
├── backend/                # Express API
│   ├── src/
│   │   ├── routes/         # auth, workspace, journeys, items, stamps, users
│   │   ├── middleware/     # auth.js
│   │   ├── services/       # weekService.js
│   │   └── db/             # supabase.js
│   ├── supabase_schema.sql
│   └── .env.example
└── README.md
```

## Getting started

### 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `backend/supabase_schema.sql` in the SQL editor
3. Copy your **Project URL** and **anon key** (frontend) + **service role key** (backend)

### 2. Backend

```bash
cd backend
cp .env.example .env
# fill in SUPABASE_URL, SUPABASE_SERVICE_KEY
npm install
npm run dev      # runs on :3001
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm install
npm run dev      # runs on :5173
```

> **Dev mode (no Supabase):** Both servers work without a Supabase connection — the backend uses offline stubs and the frontend uses seeded data.

## Two-user flow

1. **User 1** signs up → receives an **invite code**
2. User 1 shares the link: `https://your-app.vercel.app/join?code=XXXXXX`
3. **User 2** opens the link, creates their account → both land in the same shared workspace
4. Both users see the same journeys, passport, and activity in real time (Supabase Realtime)

## Design system

Design tokens from `frontend/src/index.css` + `tailwind.config.js`:
- **Colors:** rose palette (`#EFB0C9 / #F4C2D7 / #F8DAE9`), blue palette (`#B9D6F3 / #A1C9F1`), cream (`#F1E8D9`), ink (`#4a3142`)
- **Fonts:** Fraunces (serif italic), Nunito (body), Caveat (handwritten)
- **Animations:** stampDrop, inkSplash, orbPulse, glow, raySpin, fall (confetti), fadeUp, rise

## Sound

All sounds are synthesized via Web Audio API (`frontend/src/lib/sound.js`) — no audio files needed.

- `sounds.stamp()` — stamp drop
- `sounds.milestone()` — 4-note fanfare + sparkle
- `sounds.click()` — soft click
- `sounds.success()` — item added
