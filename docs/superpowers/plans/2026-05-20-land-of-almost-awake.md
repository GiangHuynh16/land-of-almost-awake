# Land-of-Almost-Awake Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a shared achievement tracker for 2 friends set in the fantasy world of "Bà ngoại tôi gửi lời xin lỗi" — a world map of 6 kingdoms that unlock progressively as achievements are completed.

**Architecture:** Express backend with Supabase (PostgreSQL + Realtime + Broadcast), Vite React frontend with Zustand store. The old codebase at `land-of-almost-awake/` is replaced entirely — same folder, new concept. All old source files are deleted and rewritten from scratch.

**Tech Stack:** Node.js ESM + Express 5, Supabase JS v2, Vite + React 19, Zustand 5, React Router 7, Tailwind CSS 3

---

## File Map

### Backend (`land-of-almost-awake/backend/src/`)

| File | Responsibility |
|------|---------------|
| `index.js` | Express app setup, CORS, routes mount |
| `db/supabase.js` | Supabase client (service role) |
| `middleware/auth.js` | JWT verify middleware |
| `routes/auth.js` | signup, join, login |
| `routes/kingdoms.js` | list kingdoms with progress |
| `routes/achievements.js` | CRUD + complete + delete |
| `seeds/kingdoms.js` | Insert 6 kingdoms seed data |

### Frontend (`land-of-almost-awake/frontend/src/`)

| File | Responsibility |
|------|---------------|
| `main.jsx` | React root, Router |
| `App.jsx` | Routes, root-level Broadcast listener |
| `lib/supabase.js` | Supabase client (anon key) |
| `lib/api.js` | fetch wrapper with JWT |
| `lib/constants.js` | Kingdom colors, route paths |
| `store/useAppStore.js` | Zustand store: kingdoms, achievements, auth, unlock flags |
| `hooks/useRealtimeSync.js` | Supabase Realtime table subscriptions |
| `pages/WorldMap.jsx` | Full-screen SVG map, kingdom state rendering |
| `pages/KingdomDetail.jsx` | Achievement list, progress dots, FAB |
| `pages/auth/Signup.jsx` | Signup form with threshold input |
| `pages/auth/Join.jsx` | Invite code form |
| `pages/auth/Login.jsx` | Login form |
| `components/AddAchievementModal.jsx` | Modal: title input + optional note |
| `components/CinematicUnlock.jsx` | Full-screen kingdom unlock animation |
| `components/FinalCompletion.jsx` | End-of-journey ceremony animation |
| `components/WorldMapSVG.jsx` | SVG map with 6 kingdom regions |

### Database

| File | Responsibility |
|------|---------------|
| `land-of-almost-awake/backend/supabase_schema.sql` | Full schema (replaces old one) |

---

## Task 1: Clean Slate — Delete Old Source Files

**Files:**
- Delete all files in `land-of-almost-awake/backend/src/`
- Delete all files in `land-of-almost-awake/frontend/src/`
- Keep: `package.json`, `.env.example`, config files, `node_modules/`

- [ ] **Step 1: Delete old backend source**

```bash
rm -rf land-of-almost-awake/backend/src/*
mkdir -p land-of-almost-awake/backend/src/db land-of-almost-awake/backend/src/middleware land-of-almost-awake/backend/src/routes land-of-almost-awake/backend/src/seeds
```

- [ ] **Step 2: Delete old frontend source**

```bash
rm -rf land-of-almost-awake/frontend/src/*
mkdir -p land-of-almost-awake/frontend/src/components land-of-almost-awake/frontend/src/pages/auth land-of-almost-awake/frontend/src/lib land-of-almost-awake/frontend/src/store land-of-almost-awake/frontend/src/hooks land-of-almost-awake/frontend/src/assets
```

- [ ] **Step 3: Commit**

```bash
cd adventure-passport
git add -A
git commit -m "chore: remove old adventure-passport source, rebuild as Land-of-Almost-Awake"
```

---

## Task 2: Database Schema

**Files:**
- Create: `land-of-almost-awake/backend/supabase_schema.sql`

- [ ] **Step 1: Write schema file**

```sql
-- Run this in Supabase SQL Editor

-- Drop old tables if they exist
drop table if exists achievements cascade;
drop table if exists kingdoms cascade;
drop table if exists users cascade;
drop table if exists workspaces cascade;

-- Workspaces
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null,
  invite_used boolean not null default false,
  achievement_threshold integer not null default 10 check (achievement_threshold between 1 and 50),
  created_at timestamptz not null default now()
);

-- Users
create table users (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  display_name text not null,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- Kingdoms (seed data inserted separately)
create table kingdoms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  meaning text not null,
  "order" integer not null unique check ("order" between 1 and 6),
  accent_color text not null,
  lore_quote text not null,
  unlocked_at timestamptz
);

-- Achievements
create table achievements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  kingdom_id uuid not null references kingdoms(id),
  title text not null,
  note text,
  created_by uuid not null references users(id),
  completed_by uuid references users(id),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Index for progression queries
create index achievements_progression_idx
  on achievements(workspace_id, kingdom_id, completed_at);

-- Enable Realtime on achievements
alter publication supabase_realtime add table achievements;
```

- [ ] **Step 2: Run schema in Supabase SQL Editor**

Open your Supabase project → SQL Editor → paste the file contents → Run.
Expected: all 4 tables created, index created, no errors.

- [ ] **Step 3: Commit**

```bash
git add land-of-almost-awake/backend/supabase_schema.sql
git commit -m "feat: new schema for Land-of-Almost-Awake"
```

---

## Task 3: Backend Foundation

**Files:**
- Create: `land-of-almost-awake/backend/src/db/supabase.js`
- Create: `land-of-almost-awake/backend/src/index.js`
- Create: `land-of-almost-awake/backend/src/middleware/auth.js`

- [ ] **Step 1: Install bcrypt and jsonwebtoken**

```bash
cd land-of-almost-awake/backend
npm install bcryptjs jsonwebtoken
```

Expected: packages added to `node_modules/`, `package.json` updated.

- [ ] **Step 2: Update `.env.example`**

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-random-secret-min-32-chars
PORT=3000
```

Copy to `.env` and fill in real values from your Supabase project settings.

- [ ] **Step 3: Create `src/db/supabase.js`**

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

- [ ] **Step 4: Create `src/middleware/auth.js`**

```js
import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' })
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

- [ ] **Step 5: Create `src/index.js`**

```js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { kingdomsRouter } from './routes/kingdoms.js'
import { achievementsRouter } from './routes/achievements.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/auth', authRouter)
app.use('/kingdoms', kingdomsRouter)
app.use('/achievements', achievementsRouter)

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`)
})
```

- [ ] **Step 6: Commit**

```bash
git add land-of-almost-awake/backend/src/
git commit -m "feat: backend foundation — supabase client, auth middleware, express setup"
```

---

## Task 4: Kingdom Seed Data

**Files:**
- Create: `land-of-almost-awake/backend/src/seeds/kingdoms.js`

- [ ] **Step 1: Create seed script**

```js
import 'dotenv/config'
import { supabase } from '../db/supabase.js'

const KINGDOMS = [
  {
    name: 'Miamas',
    meaning: 'I love',
    order: 1,
    accent_color: '#D4860B',
    lore_quote: 'In Miamas, the most noble profession is to tell stories.',
    unlocked_at: new Date().toISOString(),
  },
  {
    name: 'Miploris',
    meaning: 'I mourn',
    order: 2,
    accent_color: '#C08080',
    lore_quote: 'In Miploris, all the sorrow in the world is kept safe.',
    unlocked_at: null,
  },
  {
    name: 'Mirevas',
    meaning: 'I dream',
    order: 3,
    accent_color: '#2B5BA8',
    lore_quote: 'In Mirevas, dreams are guarded like the most precious treasure.',
    unlocked_at: null,
  },
  {
    name: 'Miaudacas',
    meaning: 'I dare',
    order: 4,
    accent_color: '#C45C1A',
    lore_quote: 'In Miaudacas, courage is the only currency that matters.',
    unlocked_at: null,
  },
  {
    name: 'Mimovas',
    meaning: 'I dance',
    order: 5,
    accent_color: '#5A8A6A',
    lore_quote: 'In Mimovas, music never stops and joy never ends.',
    unlocked_at: null,
  },
  {
    name: 'Mibatolos',
    meaning: 'I fight',
    order: 6,
    accent_color: '#5A2D7A',
    lore_quote: 'In Mibatolos, the bravest warriors were raised.',
    unlocked_at: null,
  },
]

const { error } = await supabase.from('kingdoms').insert(KINGDOMS)
if (error) {
  console.error('Seed failed:', error.message)
  process.exit(1)
}
console.log('Kingdoms seeded successfully.')
```

- [ ] **Step 2: Add seed script to package.json**

In `land-of-almost-awake/backend/package.json`, add to `scripts`:
```json
"seed": "node src/seeds/kingdoms.js"
```

- [ ] **Step 3: Run seed**

```bash
cd land-of-almost-awake/backend
npm run seed
```

Expected: `Kingdoms seeded successfully.`
Verify in Supabase Table Editor: 6 rows in `kingdoms`, only Miamas has `unlocked_at` set.

- [ ] **Step 4: Commit**

```bash
git add land-of-almost-awake/backend/src/seeds/ land-of-almost-awake/backend/package.json
git commit -m "feat: seed 6 kingdoms — Miamas starts unlocked"
```

---

## Task 5: Auth Routes

**Files:**
- Create: `land-of-almost-awake/backend/src/routes/auth.js`

- [ ] **Step 1: Create `src/routes/auth.js`**

```js
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../db/supabase.js'

export const authRouter = Router()

// POST /auth/signup
authRouter.post('/signup', async (req, res) => {
  const { display_name, email, password, achievement_threshold = 10 } = req.body
  if (!display_name || !email || !password) {
    return res.status(400).json({ error: 'display_name, email, password required' })
  }
  const threshold = Math.max(1, Math.min(50, parseInt(achievement_threshold) || 10))
  const invite_code = uuidv4().slice(0, 8).toUpperCase()
  const password_hash = await bcrypt.hash(password, 10)

  const { data: workspace, error: wsErr } = await supabase
    .from('workspaces')
    .insert({ invite_code, achievement_threshold: threshold })
    .select()
    .single()
  if (wsErr) return res.status(500).json({ error: wsErr.message })

  const { data: user, error: userErr } = await supabase
    .from('users')
    .insert({ workspace_id: workspace.id, display_name, email, password_hash })
    .select('id, display_name, email, workspace_id')
    .single()
  if (userErr) return res.status(500).json({ error: userErr.message })

  const token = jwt.sign(
    { userId: user.id, workspaceId: workspace.id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
  res.json({ token, user, invite_code })
})

// POST /auth/join
authRouter.post('/join', async (req, res) => {
  const { display_name, email, password, invite_code } = req.body
  if (!display_name || !email || !password || !invite_code) {
    return res.status(400).json({ error: 'display_name, email, password, invite_code required' })
  }

  const { data: workspace, error: wsErr } = await supabase
    .from('workspaces')
    .select('*')
    .eq('invite_code', invite_code.toUpperCase())
    .single()
  if (wsErr || !workspace) return res.status(404).json({ error: 'Invite code not found' })
  if (workspace.invite_used) return res.status(400).json({ error: 'Invite code already used' })

  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspace.id)
  if (count >= 2) return res.status(400).json({ error: 'Workspace is full' })

  const password_hash = await bcrypt.hash(password, 10)
  const { data: user, error: userErr } = await supabase
    .from('users')
    .insert({ workspace_id: workspace.id, display_name, email, password_hash })
    .select('id, display_name, email, workspace_id')
    .single()
  if (userErr) return res.status(500).json({ error: userErr.message })

  await supabase.from('workspaces').update({ invite_used: true }).eq('id', workspace.id)

  const token = jwt.sign(
    { userId: user.id, workspaceId: workspace.id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
  res.json({ token, user })
})

// POST /auth/login
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email, password required' })

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  if (error || !user) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign(
    { userId: user.id, workspaceId: user.workspace_id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
  const { password_hash, ...safeUser } = user
  res.json({ token, user: safeUser })
})
```

- [ ] **Step 2: Start backend and test signup**

```bash
cd land-of-almost-awake/backend && npm run dev
```

In another terminal:
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"display_name":"Alice","email":"alice@test.com","password":"pass123"}'
```

Expected: `{ token: "...", user: {...}, invite_code: "XXXXXXXX" }`

- [ ] **Step 3: Test join with invite code**

```bash
curl -X POST http://localhost:3000/auth/join \
  -H "Content-Type: application/json" \
  -d '{"display_name":"Bob","email":"bob@test.com","password":"pass123","invite_code":"XXXXXXXX"}'
```

Expected: `{ token: "...", user: {...} }`. Second join attempt should return `400 Invite code already used`.

- [ ] **Step 4: Commit**

```bash
git add land-of-almost-awake/backend/src/routes/auth.js
git commit -m "feat: auth routes — signup, join (single-use invite), login"
```

---

## Task 6: Kingdoms Route

**Files:**
- Create: `land-of-almost-awake/backend/src/routes/kingdoms.js`

- [ ] **Step 1: Create `src/routes/kingdoms.js`**

```js
import { Router } from 'express'
import { supabase } from '../db/supabase.js'
import { requireAuth } from '../middleware/auth.js'

export const kingdomsRouter = Router()

// GET /kingdoms — returns all 6 kingdoms with progress for current workspace
kingdomsRouter.get('/', requireAuth, async (req, res) => {
  const { workspaceId } = req.user

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('achievement_threshold')
    .eq('id', workspaceId)
    .single()

  const { data: kingdoms } = await supabase
    .from('kingdoms')
    .select('*')
    .order('order')

  const { data: completedCounts } = await supabase
    .from('achievements')
    .select('kingdom_id')
    .eq('workspace_id', workspaceId)
    .not('completed_at', 'is', null)

  const countByKingdom = {}
  for (const row of completedCounts || []) {
    countByKingdom[row.kingdom_id] = (countByKingdom[row.kingdom_id] || 0) + 1
  }

  const threshold = workspace?.achievement_threshold || 10
  let activeFound = false

  const result = kingdoms.map((k) => {
    const completed = countByKingdom[k.id] || 0
    const isDone = completed >= threshold && k.unlocked_at !== null

    let status
    if (k.unlocked_at && isDone) {
      // Check if this is the last kingdom or if next is also unlocked
      status = 'completed'
    } else if (k.unlocked_at && !activeFound) {
      status = 'active'
      activeFound = true
    } else {
      status = 'locked'
    }

    return { ...k, completed_count: completed, threshold, status }
  })

  // Re-derive: active = first kingdom that is unlocked but not yet completed
  const final = result.map((k) => {
    const completed = countByKingdom[k.id] || 0
    const isUnlocked = !!k.unlocked_at
    const isDone = completed >= threshold

    let status
    if (!isUnlocked) {
      status = 'locked'
    } else if (isDone) {
      status = 'completed'
    } else {
      status = 'active'
    }
    return { ...k, status }
  })

  res.json(final)
})
```

- [ ] **Step 2: Test kingdoms endpoint**

```bash
TOKEN="<token from signup>"
curl http://localhost:3000/kingdoms \
  -H "Authorization: Bearer $TOKEN"
```

Expected: array of 6 kingdoms. Miamas has `status: "active"`, others `status: "locked"`.

- [ ] **Step 3: Commit**

```bash
git add land-of-almost-awake/backend/src/routes/kingdoms.js
git commit -m "feat: kingdoms route with per-workspace progress"
```

---

## Task 7: Achievements Routes

**Files:**
- Create: `land-of-almost-awake/backend/src/routes/achievements.js`

- [ ] **Step 1: Create `src/routes/achievements.js`**

```js
import { Router } from 'express'
import { supabase } from '../db/supabase.js'
import { requireAuth } from '../middleware/auth.js'

export const achievementsRouter = Router()

// GET /achievements?kingdom_id=
achievementsRouter.get('/', requireAuth, async (req, res) => {
  const { workspaceId } = req.user
  const { kingdom_id } = req.query

  let query = supabase
    .from('achievements')
    .select('*, creator:created_by(id,display_name), completer:completed_by(id,display_name)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (kingdom_id) query = query.eq('kingdom_id', kingdom_id)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /achievements
achievementsRouter.post('/', requireAuth, async (req, res) => {
  const { workspaceId, userId } = req.user
  const { kingdom_id, title, note } = req.body
  if (!kingdom_id || !title?.trim()) {
    return res.status(400).json({ error: 'kingdom_id and title required' })
  }

  const { data, error } = await supabase
    .from('achievements')
    .insert({ workspace_id: workspaceId, kingdom_id, title: title.trim(), note: note || null, created_by: userId })
    .select('*, creator:created_by(id,display_name)')
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// PATCH /achievements/:id/complete
achievementsRouter.patch('/:id/complete', requireAuth, async (req, res) => {
  const { workspaceId, userId } = req.user
  const { id } = req.params

  // Guard: only update if not already completed
  const { data, error } = await supabase.rpc('complete_achievement', {
    p_id: id,
    p_user_id: userId,
    p_workspace_id: workspaceId,
  })

  if (error) return res.status(500).json({ error: error.message })
  if (!data || data.length === 0) {
    // 0 rows affected — already completed
    const { data: existing } = await supabase
      .from('achievements')
      .select('*, completer:completed_by(id,display_name)')
      .eq('id', id)
      .single()
    return res.status(409).json({ error: 'Already completed', achievement: existing })
  }

  const achievement = data[0]

  // Check if kingdom threshold crossed
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('achievement_threshold')
    .eq('id', workspaceId)
    .single()

  const { count } = await supabase
    .from('achievements')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('kingdom_id', achievement.kingdom_id)
    .not('completed_at', 'is', null)

  const threshold = workspace.achievement_threshold
  let newKingdomUnlocked = false
  let journeyComplete = false
  let unlockedKingdom = null

  if (count >= threshold) {
    // Find next kingdom to unlock
    const { data: currentKingdom } = await supabase
      .from('kingdoms')
      .select('order')
      .eq('id', achievement.kingdom_id)
      .single()

    const { data: nextKingdom } = await supabase
      .from('kingdoms')
      .select('*')
      .eq('order', currentKingdom.order + 1)
      .is('unlocked_at', null)
      .single()

    if (nextKingdom) {
      const now = new Date().toISOString()
      await supabase.from('kingdoms').update({ unlocked_at: now }).eq('id', nextKingdom.id)
      newKingdomUnlocked = true
      unlockedKingdom = { ...nextKingdom, unlocked_at: now }

      // Broadcast to workspace channel
      await supabase.channel(`workspace:${workspaceId}`).send({
        type: 'broadcast',
        event: 'kingdom_unlocked',
        payload: { kingdom: unlockedKingdom },
      })
    } else if (currentKingdom.order === 6) {
      journeyComplete = true
      await supabase.channel(`workspace:${workspaceId}`).send({
        type: 'broadcast',
        event: 'kingdom_unlocked',
        payload: { kingdom: null, journeyComplete: true },
      })
    }
  }

  res.json({ achievement, newKingdomUnlocked, journeyComplete, kingdom: unlockedKingdom })
})

// DELETE /achievements/:id
achievementsRouter.delete('/:id', requireAuth, async (req, res) => {
  const { userId } = req.user
  const { id } = req.params

  const { data: existing } = await supabase
    .from('achievements')
    .select('created_by, completed_at')
    .eq('id', id)
    .single()

  if (!existing) return res.status(404).json({ error: 'Not found' })
  if (existing.created_by !== userId) return res.status(403).json({ error: 'Not your achievement' })
  if (existing.completed_at) return res.status(400).json({ error: 'Cannot delete completed achievement' })

  const { error } = await supabase.from('achievements').delete().eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).end()
})
```

- [ ] **Step 2: Create Supabase RPC for atomic completion**

Run this in Supabase SQL Editor:

```sql
create or replace function complete_achievement(
  p_id uuid,
  p_user_id uuid,
  p_workspace_id uuid
)
returns setof achievements
language sql
as $$
  update achievements
  set completed_by = p_user_id, completed_at = now()
  where id = p_id
    and workspace_id = p_workspace_id
    and completed_by is null
  returning *;
$$;
```

- [ ] **Step 3: Test achievements**

```bash
TOKEN="<alice's token>"

# Create achievement
curl -X POST http://localhost:3000/achievements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"kingdom_id":"<miamas-id>","title":"Watch a movie together"}'

# Complete it
curl -X PATCH http://localhost:3000/achievements/<id>/complete \
  -H "Authorization: Bearer $TOKEN"
```

Expected: achievement created, then completed with `newKingdomUnlocked: false` (need 10 to unlock next).

- [ ] **Step 4: Commit**

```bash
git add land-of-almost-awake/backend/src/routes/achievements.js
git commit -m "feat: achievements routes — create, complete (atomic guard), delete"
```

---

## Task 8: Frontend Foundation

**Files:**
- Create: `land-of-almost-awake/frontend/src/lib/supabase.js`
- Create: `land-of-almost-awake/frontend/src/lib/api.js`
- Create: `land-of-almost-awake/frontend/src/lib/constants.js`
- Create: `land-of-almost-awake/frontend/src/main.jsx`
- Modify: `land-of-almost-awake/frontend/src/index.css`

- [ ] **Step 1: Update `.env.example`**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3000
```

Copy to `.env` and fill values from Supabase project settings → API.

- [ ] **Step 2: Create `src/lib/supabase.js`**

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

- [ ] **Step 3: Create `src/lib/api.js`**

```js
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  signup: (body) => request('/auth/signup', { method: 'POST', body }),
  join: (body) => request('/auth/join', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  getKingdoms: () => request('/kingdoms'),
  getAchievements: (kingdomId) =>
    request(`/achievements${kingdomId ? `?kingdom_id=${kingdomId}` : ''}`),
  createAchievement: (body) => request('/achievements', { method: 'POST', body }),
  completeAchievement: (id) => request(`/achievements/${id}/complete`, { method: 'PATCH' }),
  deleteAchievement: (id) => request(`/achievements/${id}`, { method: 'DELETE' }),
}
```

- [ ] **Step 4: Create `src/lib/constants.js`**

```js
export const KINGDOM_COLORS = {
  Miamas: { accent: '#D4860B', glow: '#F5C04A' },
  Miploris: { accent: '#C08080', glow: '#E8B0B0' },
  Mirevas: { accent: '#2B5BA8', glow: '#6A9FE8' },
  Miaudacas: { accent: '#C45C1A', glow: '#F0904A' },
  Mimovas: { accent: '#5A8A6A', glow: '#8AC49A' },
  Mibatolos: { accent: '#5A2D7A', glow: '#9A6DB8' },
}

export const ROUTES = {
  MAP: '/',
  KINGDOM: '/kingdom/:id',
  SIGNUP: '/auth/signup',
  JOIN: '/auth/join',
  LOGIN: '/auth/login',
}
```

- [ ] **Step 5: Create `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
```

- [ ] **Step 6: Replace `src/index.css` with base styles**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #1a1208;
  color: #f0e8d0;
  font-family: 'Georgia', serif;
  min-height: 100vh;
  overflow: hidden;
}

#root {
  height: 100vh;
  width: 100vw;
}
```

- [ ] **Step 7: Commit**

```bash
git add land-of-almost-awake/frontend/src/
git commit -m "feat: frontend foundation — supabase client, api wrapper, constants"
```

---

## Task 9: Zustand Store

**Files:**
- Create: `land-of-almost-awake/frontend/src/store/useAppStore.js`

- [ ] **Step 1: Create `src/store/useAppStore.js`**

```js
import { create } from 'zustand'
import { api } from '../lib/api.js'

export const useAppStore = create((set, get) => ({
  // Auth
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,

  // Data
  kingdoms: [],
  achievements: [],
  activeKingdomId: null,

  // Unlock state
  pendingUnlock: null,   // { kingdom } — triggers CinematicUnlock
  journeyComplete: false, // triggers FinalCompletion

  // Last seen timestamps for offline catch-up (kingdomId -> ISO string)
  lastSeenUnlocks: JSON.parse(localStorage.getItem('lastSeenUnlocks') || '{}'),

  setAuth(token, user) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user })
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, kingdoms: [], achievements: [] })
  },

  async loadKingdoms() {
    const kingdoms = await api.getKingdoms()
    const lastSeen = get().lastSeenUnlocks

    // Detect missed unlocks (offline catch-up)
    const missed = kingdoms.filter(
      (k) => k.unlocked_at && k.status !== 'locked' && !lastSeen[k.id]
    )
    if (missed.length > 0 && get().kingdoms.length > 0) {
      // Only trigger catch-up if we had previous data (not first load)
      const latest = missed[missed.length - 1]
      set({ pendingUnlock: { kingdom: latest, catchUp: true } })
    }

    set({ kingdoms })
    return kingdoms
  },

  async loadAchievements(kingdomId) {
    const achievements = await api.getAchievements(kingdomId)
    set({ achievements, activeKingdomId: kingdomId })
    return achievements
  },

  addAchievement(achievement) {
    set((s) => ({ achievements: [achievement, ...s.achievements] }))
  },

  updateAchievement(updated) {
    set((s) => ({
      achievements: s.achievements.map((a) => (a.id === updated.id ? updated : a)),
    }))
  },

  removeAchievement(id) {
    set((s) => ({ achievements: s.achievements.filter((a) => a.id !== id) }))
  },

  triggerUnlock(kingdom, journeyComplete = false) {
    if (journeyComplete) {
      set({ journeyComplete: true })
    } else {
      set({ pendingUnlock: { kingdom } })
    }
  },

  clearUnlock() {
    const { pendingUnlock, kingdoms, lastSeenUnlocks } = get()
    if (pendingUnlock?.kingdom) {
      const updated = { ...lastSeenUnlocks, [pendingUnlock.kingdom.id]: new Date().toISOString() }
      localStorage.setItem('lastSeenUnlocks', JSON.stringify(updated))
      set({ lastSeenUnlocks: updated })
    }
    set({ pendingUnlock: null })
    // Reload kingdoms to get updated statuses
    get().loadKingdoms()
  },

  clearJourneyComplete() {
    set({ journeyComplete: false })
  },
}))
```

- [ ] **Step 2: Commit**

```bash
git add land-of-almost-awake/frontend/src/store/
git commit -m "feat: zustand store — auth, kingdoms, achievements, unlock state"
```

---

## Task 10: Realtime Hook

**Files:**
- Create: `land-of-almost-awake/frontend/src/hooks/useRealtimeSync.js`

- [ ] **Step 1: Create `src/hooks/useRealtimeSync.js`**

```js
import { useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAppStore } from '../store/useAppStore.js'

export function useRealtimeSync(workspaceId) {
  const { addAchievement, updateAchievement, removeAchievement, triggerUnlock } = useAppStore()

  useEffect(() => {
    if (!workspaceId) return

    // Table subscription — achievements changes
    const tableChannel = supabase
      .channel(`achievements:${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'achievements',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => addAchievement(payload.new)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'achievements',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => updateAchievement(payload.new)
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'achievements',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => removeAchievement(payload.old.id)
      )
      .subscribe()

    // Broadcast channel — kingdom unlock events
    const broadcastChannel = supabase
      .channel(`workspace:${workspaceId}`)
      .on('broadcast', { event: 'kingdom_unlocked' }, ({ payload }) => {
        triggerUnlock(payload.kingdom, payload.journeyComplete || false)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(tableChannel)
      supabase.removeChannel(broadcastChannel)
    }
  }, [workspaceId])
}
```

- [ ] **Step 2: Commit**

```bash
git add land-of-almost-awake/frontend/src/hooks/
git commit -m "feat: realtime hook — achievements table + kingdom_unlocked broadcast"
```

---

## Task 11: App Shell & Auth Pages

**Files:**
- Create: `land-of-almost-awake/frontend/src/App.jsx`
- Create: `land-of-almost-awake/frontend/src/pages/auth/Signup.jsx`
- Create: `land-of-almost-awake/frontend/src/pages/auth/Join.jsx`
- Create: `land-of-almost-awake/frontend/src/pages/auth/Login.jsx`

- [ ] **Step 1: Create `src/App.jsx`**

```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/useAppStore.js'
import { useRealtimeSync } from './hooks/useRealtimeSync.js'
import { CinematicUnlock } from './components/CinematicUnlock.jsx'
import { FinalCompletion } from './components/FinalCompletion.jsx'
import WorldMap from './pages/WorldMap.jsx'
import KingdomDetail from './pages/KingdomDetail.jsx'
import Signup from './pages/auth/Signup.jsx'
import Join from './pages/auth/Join.jsx'
import Login from './pages/auth/Login.jsx'

function AuthGuard({ children }) {
  const token = useAppStore((s) => s.token)
  return token ? children : <Navigate to="/auth/login" replace />
}

export default function App() {
  const user = useAppStore((s) => s.user)
  const pendingUnlock = useAppStore((s) => s.pendingUnlock)
  const journeyComplete = useAppStore((s) => s.journeyComplete)

  useRealtimeSync(user?.workspace_id)

  return (
    <>
      <Routes>
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/join" element={<Join />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/" element={<AuthGuard><WorldMap /></AuthGuard>} />
        <Route path="/kingdom/:id" element={<AuthGuard><KingdomDetail /></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {pendingUnlock && <CinematicUnlock kingdom={pendingUnlock.kingdom} catchUp={pendingUnlock.catchUp} />}
      {journeyComplete && <FinalCompletion />}
    </>
  )
}
```

- [ ] **Step 2: Create `src/pages/auth/Signup.jsx`**

```jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAppStore } from '../../store/useAppStore.js'

export default function Signup() {
  const [form, setForm] = useState({ display_name: '', email: '', password: '', achievement_threshold: 10 })
  const [error, setError] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const setAuth = useAppStore((s) => s.setAuth)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await api.signup(form)
      setAuth(data.token, data.user)
      setInviteCode(data.invite_code)
    } catch (err) {
      setError(err.message)
    }
  }

  if (inviteCode) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
        <h1 className="text-2xl font-bold">Your journey begins</h1>
        <p className="text-amber-200">Share this code with your companion:</p>
        <div className="text-4xl font-mono tracking-widest bg-amber-900/40 px-8 py-4 rounded-lg border border-amber-700">
          {inviteCode}
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 bg-amber-700 hover:bg-amber-600 rounded-lg transition-colors"
        >
          Enter the world
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <h1 className="text-2xl font-bold">Begin your journey</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <input
          className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100 placeholder-stone-500"
          placeholder="Your name"
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          required
        />
        <input
          type="email"
          className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100 placeholder-stone-500"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100 placeholder-stone-500"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm text-stone-400">Achievements to unlock each kingdom (1–50)</label>
          <input
            type="number"
            min="1"
            max="50"
            className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100"
            value={form.achievement_threshold}
            onChange={(e) => setForm({ ...form, achievement_threshold: parseInt(e.target.value) || 10 })}
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="bg-amber-700 hover:bg-amber-600 rounded py-2 transition-colors">
          Create workspace
        </button>
      </form>
      <p className="text-stone-400 text-sm">
        Have an invite code? <Link to="/auth/join" className="text-amber-400 hover:underline">Join here</Link>
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/pages/auth/Join.jsx`**

```jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAppStore } from '../../store/useAppStore.js'

export default function Join() {
  const [form, setForm] = useState({ display_name: '', email: '', password: '', invite_code: '' })
  const [error, setError] = useState('')
  const setAuth = useAppStore((s) => s.setAuth)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await api.join(form)
      setAuth(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <h1 className="text-2xl font-bold">Join the journey</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <input
          className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100 placeholder-stone-500"
          placeholder="Your name"
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          required
        />
        <input
          type="email"
          className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100 placeholder-stone-500"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100 placeholder-stone-500"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <input
          className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100 placeholder-stone-500 uppercase tracking-widest"
          placeholder="Invite code"
          value={form.invite_code}
          onChange={(e) => setForm({ ...form, invite_code: e.target.value.toUpperCase() })}
          required
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="bg-amber-700 hover:bg-amber-600 rounded py-2 transition-colors">
          Join workspace
        </button>
      </form>
      <p className="text-stone-400 text-sm">
        No code? <Link to="/auth/signup" className="text-amber-400 hover:underline">Create a new world</Link>
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/pages/auth/Login.jsx`**

```jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAppStore } from '../../store/useAppStore.js'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const setAuth = useAppStore((s) => s.setAuth)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await api.login(form)
      setAuth(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <h1 className="text-2xl font-bold">Return to the world</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="email"
          className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100 placeholder-stone-500"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100 placeholder-stone-500"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="bg-amber-700 hover:bg-amber-600 rounded py-2 transition-colors">
          Enter
        </button>
      </form>
      <p className="text-stone-400 text-sm">
        New here? <Link to="/auth/signup" className="text-amber-400 hover:underline">Begin your journey</Link>
      </p>
    </div>
  )
}
```

- [ ] **Step 5: Start frontend dev server and verify auth pages render**

```bash
cd land-of-almost-awake/frontend && npm run dev
```

Open http://localhost:5173/auth/signup — form should render. Try signing up, confirm invite code screen appears.

- [ ] **Step 6: Commit**

```bash
git add land-of-almost-awake/frontend/src/
git commit -m "feat: app shell, auth pages — signup with threshold, join, login"
```

---

## Task 12: World Map SVG Component

**Files:**
- Create: `land-of-almost-awake/frontend/src/components/WorldMapSVG.jsx`

- [ ] **Step 1: Create `src/components/WorldMapSVG.jsx`**

```jsx
import { KINGDOM_COLORS } from '../lib/constants.js'

// Kingdom positions on the SVG viewport (1000x700)
const KINGDOM_POSITIONS = {
  Miamas:    { cx: 200, cy: 180 },
  Miploris:  { cx: 750, cy: 160 },
  Mirevas:   { cx: 120, cy: 480 },
  Miaudacas: { cx: 500, cy: 350 },
  Mimovas:   { cx: 830, cy: 450 },
  Mibatolos: { cx: 420, cy: 580 },
}

const RADIUS = 80

export function WorldMapSVG({ kingdoms, onKingdomClick }) {
  return (
    <svg
      viewBox="0 0 1000 700"
      className="w-full h-full"
      style={{ filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.8))' }}
    >
      {/* Parchment texture background */}
      <rect width="1000" height="700" fill="#1a1208" rx="0" />

      {/* Decorative paths between kingdoms */}
      <g stroke="#3a2a10" strokeWidth="2" strokeDasharray="8,6" fill="none" opacity="0.5">
        <line x1="200" y1="180" x2="500" y2="350" />
        <line x1="750" y1="160" x2="500" y2="350" />
        <line x1="500" y1="350" x2="120" y2="480" />
        <line x1="500" y1="350" x2="830" y2="450" />
        <line x1="500" y1="350" x2="420" y2="580" />
      </g>

      {/* Kingdoms */}
      {kingdoms.map((kingdom) => {
        const pos = KINGDOM_POSITIONS[kingdom.name]
        if (!pos) return null
        const colors = KINGDOM_COLORS[kingdom.name]
        const isLocked = kingdom.status === 'locked'
        const isActive = kingdom.status === 'active'
        const isCompleted = kingdom.status === 'completed'

        return (
          <g
            key={kingdom.id}
            transform={`translate(${pos.cx}, ${pos.cy})`}
            onClick={() => !isLocked && onKingdomClick(kingdom)}
            style={{ cursor: isLocked ? 'default' : 'pointer' }}
          >
            {/* Glow for active */}
            {isActive && (
              <circle
                r={RADIUS + 20}
                fill={colors.glow}
                opacity="0.15"
                className="animate-pulse"
              />
            )}

            {/* Main circle */}
            <circle
              r={RADIUS}
              fill={isLocked ? '#2a2018' : colors.accent}
              stroke={isLocked ? '#3a2a10' : colors.glow}
              strokeWidth={isActive ? 3 : 1.5}
              opacity={isLocked ? 0.4 : 1}
            />

            {/* Kingdom name */}
            <text
              textAnchor="middle"
              dy="0.35em"
              fill={isLocked ? '#5a4a30' : '#f0e8d0'}
              fontSize="14"
              fontFamily="Georgia, serif"
              fontWeight={isActive ? 'bold' : 'normal'}
            >
              {kingdom.name}
            </text>

            {/* Lock icon for locked */}
            {isLocked && (
              <text textAnchor="middle" dy="20" fontSize="18" fill="#5a4a30">
                🔒
              </text>
            )}

            {/* Seal for completed */}
            {isCompleted && (
              <text textAnchor="middle" dy="20" fontSize="18">
                ✦
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add land-of-almost-awake/frontend/src/components/WorldMapSVG.jsx
git commit -m "feat: world map SVG with 6 kingdom regions, state-based styling"
```

---

## Task 13: World Map Page

**Files:**
- Create: `land-of-almost-awake/frontend/src/pages/WorldMap.jsx`

- [ ] **Step 1: Create `src/pages/WorldMap.jsx`**

```jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.js'
import { WorldMapSVG } from '../components/WorldMapSVG.jsx'

export default function WorldMap() {
  const kingdoms = useAppStore((s) => s.kingdoms)
  const loadKingdoms = useAppStore((s) => s.loadKingdoms)
  const navigate = useNavigate()

  useEffect(() => {
    loadKingdoms()
  }, [])

  function handleKingdomClick(kingdom) {
    navigate(`/kingdom/${kingdom.id}`)
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-stone-950">
      <div className="w-full h-full max-w-5xl">
        <WorldMapSVG kingdoms={kingdoms} onKingdomClick={handleKingdomClick} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Open browser and verify map renders**

Navigate to http://localhost:5173 (after login). Should see 6 kingdom circles. Miamas should be amber/active, others locked/grey.

- [ ] **Step 3: Commit**

```bash
git add land-of-almost-awake/frontend/src/pages/WorldMap.jsx
git commit -m "feat: world map page — loads kingdoms, renders SVG"
```

---

## Task 14: Kingdom Detail Page

**Files:**
- Create: `land-of-almost-awake/frontend/src/pages/KingdomDetail.jsx`
- Create: `land-of-almost-awake/frontend/src/components/AddAchievementModal.jsx`

- [ ] **Step 1: Create `src/components/AddAchievementModal.jsx`**

```jsx
import { useState } from 'react'
import { api } from '../lib/api.js'

export function AddAchievementModal({ kingdomId, onClose, onAdded }) {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    try {
      const achievement = await api.createAchievement({
        kingdom_id: kingdomId,
        title: title.trim(),
        note: note.trim() || undefined,
      })
      onAdded(achievement)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-stone-900 border border-stone-700 rounded-xl w-full max-w-md p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-amber-100">New achievement</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            autoFocus
            className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100 placeholder-stone-500"
            placeholder="What did you do together?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          {showNote ? (
            <textarea
              className="bg-stone-800 border border-stone-600 rounded px-4 py-2 text-amber-100 placeholder-stone-500 resize-none h-20"
              placeholder="Add a note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNote(true)}
              className="text-stone-400 text-sm text-left hover:text-amber-300 transition-colors"
            >
              + add note
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="bg-amber-700 hover:bg-amber-600 disabled:opacity-40 rounded py-2 transition-colors"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/pages/KingdomDetail.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.js'
import { api } from '../lib/api.js'
import { AddAchievementModal } from '../components/AddAchievementModal.jsx'
import { KINGDOM_COLORS } from '../lib/constants.js'

export default function KingdomDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const kingdoms = useAppStore((s) => s.kingdoms)
  const achievements = useAppStore((s) => s.achievements)
  const activeKingdomId = useAppStore((s) => s.activeKingdomId)
  const loadAchievements = useAppStore((s) => s.loadAchievements)
  const addAchievement = useAppStore((s) => s.addAchievement)
  const updateAchievement = useAppStore((s) => s.updateAchievement)
  const removeAchievement = useAppStore((s) => s.removeAchievement)
  const user = useAppStore((s) => s.user)

  const [showModal, setShowModal] = useState(false)
  const [completing, setCompleting] = useState(null)
  const [expandedNote, setExpandedNote] = useState(null)

  const kingdom = kingdoms.find((k) => k.id === id)
  const isActive = kingdom?.status === 'active'
  const colors = kingdom ? KINGDOM_COLORS[kingdom.name] : null
  const threshold = kingdom?.threshold || 10
  const completedCount = kingdom?.completed_count || 0

  useEffect(() => {
    if (id !== activeKingdomId) {
      loadAchievements(id)
    }
  }, [id])

  async function handleComplete(achievement) {
    if (completing) return
    setCompleting(achievement.id)
    try {
      const result = await api.completeAchievement(achievement.id)
      updateAchievement(result.achievement)
      // Unlock handled by Broadcast in App.jsx
    } catch (err) {
      if (err.message !== 'Already completed') console.error(err)
    } finally {
      setCompleting(null)
    }
  }

  async function handleDelete(achievement) {
    try {
      await api.deleteAchievement(achievement.id)
      removeAchievement(achievement.id)
    } catch (err) {
      console.error(err)
    }
  }

  if (!kingdom) return null

  const dots = Array.from({ length: threshold }, (_, i) => i < completedCount)

  return (
    <div className="h-full flex flex-col max-w-xl mx-auto px-4 py-6 gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="text-stone-400 hover:text-amber-300 transition-colors text-xl"
        >
          ←
        </button>
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: colors?.accent || '#f0e8d0' }}
          >
            {kingdom.name}
          </h1>
          <p className="text-stone-400 text-sm italic">{kingdom.meaning}</p>
        </div>
      </div>

      {/* Achievements list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {achievements.length === 0 && (
          <p className="text-stone-500 text-sm text-center mt-8">
            {isActive ? 'No achievements yet. Add your first one!' : 'No achievements recorded.'}
          </p>
        )}
        {achievements.map((a) => {
          const isCompleted = !!a.completed_at
          const isOwn = a.created_by === user?.id
          const isExpanded = expandedNote === a.id

          return (
            <div
              key={a.id}
              className={`rounded-lg p-3 border transition-all ${
                isCompleted
                  ? 'bg-stone-800/60 border-stone-700'
                  : 'bg-stone-900 border-stone-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  {/* Complete button — only for active kingdom, uncompleted */}
                  {isActive && !isCompleted && (
                    <button
                      onClick={() => handleComplete(a)}
                      disabled={completing === a.id}
                      className="mt-0.5 w-5 h-5 rounded-full border-2 border-stone-500 hover:border-amber-400 flex-shrink-0 transition-colors disabled:opacity-40"
                    />
                  )}
                  {isCompleted && (
                    <span className="mt-0.5 text-amber-400 flex-shrink-0">✦</span>
                  )}
                  <div className="flex-1">
                    <p className={`text-sm ${isCompleted ? 'text-stone-400 line-through' : 'text-amber-100'}`}>
                      {a.title}
                    </p>
                    {a.note && (
                      <button
                        onClick={() => setExpandedNote(isExpanded ? null : a.id)}
                        className="text-xs text-stone-500 hover:text-stone-300 mt-0.5"
                      >
                        {isExpanded ? 'hide note ▲' : 'note ▼'}
                      </button>
                    )}
                    {isExpanded && a.note && (
                      <p className="text-xs text-stone-400 mt-1 italic">{a.note}</p>
                    )}
                    <p className="text-xs text-stone-600 mt-1">
                      by {a.creator?.display_name}
                      {isCompleted && a.completer && ` · done by ${a.completer.display_name}`}
                    </p>
                  </div>
                </div>

                {/* Delete — own pending only */}
                {isOwn && !isCompleted && isActive && (
                  <button
                    onClick={() => handleDelete(a)}
                    className="text-stone-600 hover:text-red-400 text-xs transition-colors flex-shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center flex-wrap py-2">
        {dots.map((filled, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: filled ? colors?.accent : '#2a2018',
              border: `1px solid ${filled ? colors?.accent : '#3a2a10'}`,
            }}
          />
        ))}
      </div>

      {/* FAB — add achievement, active kingdoms only */}
      {isActive && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-colors"
          style={{ backgroundColor: colors?.accent, color: '#1a1208' }}
        >
          +
        </button>
      )}

      {showModal && (
        <AddAchievementModal
          kingdomId={id}
          onClose={() => setShowModal(false)}
          onAdded={addAchievement}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Test kingdom detail in browser**

Navigate to http://localhost:5173, login, click Miamas → detail page should show with progress dots and + FAB. Add an achievement, verify it appears. Try completing it.

- [ ] **Step 4: Commit**

```bash
git add land-of-almost-awake/frontend/src/pages/KingdomDetail.jsx land-of-almost-awake/frontend/src/components/AddAchievementModal.jsx
git commit -m "feat: kingdom detail page — achievements list, progress dots, add/complete/delete"
```

---

## Task 15: Cinematic Unlock & Final Completion

**Files:**
- Create: `land-of-almost-awake/frontend/src/components/CinematicUnlock.jsx`
- Create: `land-of-almost-awake/frontend/src/components/FinalCompletion.jsx`

- [ ] **Step 1: Create `src/components/CinematicUnlock.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore.js'
import { KINGDOM_COLORS } from '../lib/constants.js'

export function CinematicUnlock({ kingdom, catchUp }) {
  const clearUnlock = useAppStore((s) => s.clearUnlock)
  const [phase, setPhase] = useState('fade-in') // fade-in → burst → name → fade-out

  const colors = kingdom ? KINGDOM_COLORS[kingdom.name] : null
  const duration = catchUp ? 2000 : 3500

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('burst'), duration * 0.3)
    const t2 = setTimeout(() => setPhase('name'), duration * 0.55)
    const t3 = setTimeout(() => setPhase('fade-out'), duration * 0.8)
    const t4 = setTimeout(() => clearUnlock(), duration)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700"
      style={{
        backgroundColor: '#0a0806',
        opacity: phase === 'fade-out' ? 0 : 1,
      }}
    >
      {/* Glow burst */}
      <div
        className="absolute rounded-full transition-all duration-700"
        style={{
          width: phase === 'burst' || phase === 'name' ? '600px' : '0px',
          height: phase === 'burst' || phase === 'name' ? '600px' : '0px',
          backgroundColor: colors?.glow || '#F5C04A',
          opacity: 0.12,
          filter: 'blur(80px)',
        }}
      />

      {/* Kingdom name */}
      <div
        className="text-center transition-all duration-500"
        style={{
          opacity: phase === 'name' || phase === 'fade-out' ? 1 : 0,
          transform: phase === 'name' || phase === 'fade-out' ? 'scale(1)' : 'scale(0.8)',
        }}
      >
        {kingdom && (
          <>
            <p className="text-stone-400 text-sm mb-2 uppercase tracking-widest">
              {catchUp ? 'Previously unlocked' : 'Kingdom unlocked'}
            </p>
            <h1
              className="text-6xl font-bold"
              style={{ color: colors?.accent }}
            >
              {kingdom.name}
            </h1>
            <p className="text-stone-300 text-lg mt-2 italic">{kingdom.meaning}</p>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/FinalCompletion.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.js'

export function FinalCompletion() {
  const clearJourneyComplete = useAppStore((s) => s.clearJourneyComplete)
  const loadKingdoms = useAppStore((s) => s.loadKingdoms)
  const navigate = useNavigate()
  const [phase, setPhase] = useState('dark') // dark → glow → text → done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('glow'), 800)
    const t2 = setTimeout(() => setPhase('text'), 2500)
    // Stay on text until user taps
  }, [])

  function handleDone() {
    clearJourneyComplete()
    loadKingdoms()
    navigate('/')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 cursor-pointer"
      style={{ backgroundColor: '#0a0806' }}
      onClick={handleDone}
    >
      {/* Radial glow */}
      <div
        className="absolute rounded-full transition-all duration-[2000ms]"
        style={{
          width: phase !== 'dark' ? '800px' : '0',
          height: phase !== 'dark' ? '800px' : '0',
          background: 'radial-gradient(circle, #D4860B22 0%, #5A2D7A11 50%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div
        className="text-center transition-all duration-700 flex flex-col gap-4"
        style={{ opacity: phase === 'text' ? 1 : 0, transform: phase === 'text' ? 'translateY(0)' : 'translateY(20px)' }}
      >
        <p className="text-stone-400 text-sm uppercase tracking-widest">The journey is complete</p>
        <h1 className="text-5xl font-bold text-amber-200">Land-of-Almost-Awake</h1>
        <p className="text-stone-300 italic text-lg max-w-sm mx-auto">
          All six kingdoms have been explored. Your story lives here forever.
        </p>
        <p className="text-stone-500 text-sm mt-4">Tap to return to the world</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Test cinematic (dev shortcut)**

Temporarily add this to WorldMap.jsx to test cinematic:
```jsx
// DEV ONLY — remove after testing
import { useAppStore } from '../store/useAppStore.js'
const triggerUnlock = useAppStore((s) => s.triggerUnlock)
// Add button: <button onClick={() => triggerUnlock({ name: 'Miploris', meaning: 'I mourn', accent_color: '#C08080' })}>Test</button>
```

Click the test button — cinematic should play for ~3.5 seconds then return to map. Remove the test code after verifying.

- [ ] **Step 4: Commit**

```bash
git add land-of-almost-awake/frontend/src/components/
git commit -m "feat: cinematic unlock and final completion animations"
```

---

## Task 16: End-to-End Verification

- [ ] **Step 1: Full flow test — User 1**

1. Open http://localhost:5173 in browser A
2. Sign up as Alice, threshold = 3 (for fast testing)
3. Note the invite code shown
4. Enter the world — Miamas should be active on the map
5. Click Miamas → add 3 achievements → complete all 3
6. After 3rd complete → cinematic should play → Miploris unlocks on map

- [ ] **Step 2: Full flow test — User 2 + Realtime**

1. Open http://localhost:5173 in browser B (incognito)
2. Join with Alice's invite code as Bob
3. In browser A: add achievement to Miamas and complete it
4. In browser B: achievement should appear in real-time without refresh

- [ ] **Step 3: Concurrent completion test**

1. Have both browsers open KingdomDetail for the same pending achievement
2. Tap complete in both browsers simultaneously
3. Expected: one succeeds (achievement shows as completed), one gets silently handled (409)

- [ ] **Step 4: Memorial state test**

1. Set threshold to 1 (temporary, for testing)
2. Complete all 6 kingdoms one by one
3. After Mibatolos: FinalCompletion animation plays
4. After dismissing: all 6 kingdoms show as completed/sealed on map, no FAB anywhere

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete Land-of-Almost-Awake v1"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Auth flow: signup (threshold), join (single-use invite), login
- ✅ 6 kingdoms with seed data, Miamas starts unlocked
- ✅ World map with 3 kingdom states (locked/active/completed)
- ✅ Kingdom detail: achievements list, progress dots, FAB active-only
- ✅ Add achievement modal with optional note
- ✅ Complete achievement with SQL atomic guard + 409 response
- ✅ Delete own pending achievement
- ✅ Realtime: table subscription (INSERT/UPDATE/DELETE) + Broadcast channel
- ✅ Cinematic unlock for both users via Broadcast
- ✅ Offline catch-up cinematic via lastSeenUnlocks comparison
- ✅ Final completion (Mibatolos) — distinct FinalCompletion component
- ✅ Memorial state — journey complete, no more FABs
- ✅ Configurable threshold (default 10, validated 1–50)
- ✅ 2-user hard limit on join
- ✅ Hybrid SVG map

**Placeholder scan:** None found.

**Type consistency:** `kingdom.status` ('locked'/'active'/'completed') used consistently across backend response, store, WorldMapSVG, and KingdomDetail. `KINGDOM_COLORS` keyed by `kingdom.name` matches seed data names exactly.
