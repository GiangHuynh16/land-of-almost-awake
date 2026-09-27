# Land-of-Almost-Awake

A two-user achievement tracker inspired by *My Grandmother Sends Her Regards and Apologises* (Fredrik Backman). Two close friends explore a shared fantasy world — 6 personal kingdoms unlocked by completing achievements, plus a 7th shared kingdom (Miveritas) at the center.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 (Vite) + Tailwind CSS 3 + Zustand 5 + React Router 7 |
| Backend | Node.js 20 (ESM) + Express 5 |
| Database & Realtime | Supabase (PostgreSQL + Realtime Broadcast) |

## How it works

- Each user has their **own 6 kingdoms** with independent progression
- Complete achievements to unlock kingdoms one by one (threshold configurable, default 10)
- Both users can **view each other's map** — partner's kingdoms are read-only
- **Miveritas** (7th kingdom, center of map) is always active and fully shared — both users can add/complete/delete freely
- Cinematic animation plays when a kingdom is unlocked

## Project structure

```
land-of-almost-awake/
├── frontend/               # Vite React app
│   └── src/
│       ├── components/     # WorldMapSVG, CinematicUnlock, FinalCompletion, AddAchievementModal
│       ├── hooks/          # useRealtimeSync
│       ├── lib/            # api.js, constants.js, supabase.js
│       ├── pages/          # WorldMap, PartnerMap, SharedKingdom, KingdomDetail, auth/
│       └── store/          # useAppStore (Zustand)
└── backend/                # Express API
    └── src/
        ├── routes/         # auth.js, kingdoms.js, achievements.js, users.js
        ├── middleware/     # auth.js (JWT)
        ├── seeds/          # kingdoms.js
        └── db/             # supabase.js
```

## Getting started

### 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `backend/supabase_schema.sql` in the SQL Editor
3. Copy your **Project URL**, **anon key** (frontend), and **service role key** (backend)

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
npm install
source ~/.nvm/nvm.sh && nvm use 20
node src/seeds/kingdoms.js   # seed 7 kingdoms
npm start                    # runs on :3000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm install
npm run dev                  # runs on :5173
```

## Two-user flow

1. **User A** signs up → receives an **invite code**
2. User A shares the invite code with User B (out of band)
3. **User B** goes to `/auth/join`, enters the invite code → both users now share the same workspace
4. Both users see each other's maps and Miveritas in real time (Supabase Realtime)

## Routes

| Path | Description |
|------|-------------|
| `/` | My world map — 6 personal kingdoms + Miveritas center |
| `/partner` | Partner's map — read-only view |
| `/kingdom/:id` | Personal kingdom detail (my achievements) |
| `/kingdom/:id?scope=partner` | Partner's kingdom — read-only |
| `/shared` | Miveritas — shared kingdom, full access for both |
| `/auth/signup` | Create workspace + account |
| `/auth/join` | Join with invite code |
| `/auth/login` | Login |
