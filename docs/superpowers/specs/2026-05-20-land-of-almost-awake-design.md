# Land-of-Almost-Awake — Design Spec

**Date:** 2026-05-20  
**Inspired by:** "Bà ngoại tôi gửi lời xin lỗi" (Fredrik Backman)  
**Stack:** Vite React + Zustand + Express + Supabase  

---

## Overview

A shared achievement tracker for 2 close friends, wrapped in the fantasy world from Fredrik Backman's novel. The two users journey together through 6 kingdoms — each kingdom unlocks when they complete enough achievements. The UI is a hand-illustrated fantasy world map. The tone is warm and whimsical, not romantic.

---

## Core Concept

The **Land-of-Almost-Awake** contains 6 kingdoms, each representing a different emotional theme. The 2 users share one workspace and unlock kingdoms progressively by completing achievements they define themselves.

Each kingdom requires a configurable number of completed achievements to unlock the next — default is **10**, set by User 1 at workspace creation time. Both users share the same threshold.

Kingdoms unlock in fixed order. Only the current active kingdom accepts new achievements. Completed kingdoms are viewable but read-only.

When all 6 kingdoms are completed, the app enters **memorial state** — the fully lit map is preserved as a shared artifact. No reset in v1.

---

## The 6 Kingdoms

| Order | Name | Meaning | Accent Color |
|-------|------|---------|--------------|
| 1 | Miamas | I love | Warm amber |
| 2 | Miploris | I mourn | Dusty rose |
| 3 | Mirevas | I dream | Deep blue |
| 4 | Miaudacas | I dare | Burnt orange |
| 5 | Mimovas | I dance | Sage green |
| 6 | Mibatolos | I fight | Deep purple |

Kingdom names are kept in original form — mysterious, faithful to the book.

---

## Data Model

```
workspaces
  id, invite_code, invite_used (boolean, default false),
  achievement_threshold (default 10), created_at

users
  id, workspace_id, display_name, email, password_hash, created_at

kingdoms
  id, name, meaning, order, accent_color, lore_quote, unlocked_at (nullable)
  (seed data — fixed, not user-editable)

achievements
  id, workspace_id, kingdom_id
  title          -- user-defined, free text
  note           -- optional text
  created_by     -- user id
  completed_by   -- user id (nullable)
  completed_at   -- timestamp (nullable)
  created_at
```

**Indexes:** `achievements(workspace_id, kingdom_id, completed_at)` — hit frequently for progression queries.

**Progression logic (backend):** Count `completed_at IS NOT NULL` achievements per kingdom per workspace. When count >= `workspace.achievement_threshold`, the next kingdom in order becomes `active` and its `unlocked_at` is set. Backend returns unlock status + `unlocked_at` per kingdom on every `/kingdoms` fetch.

---

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/signup | Create workspace + first user, accepts optional `achievement_threshold` (min 1, max 50), returns `invite_code` |
| POST | /auth/join | Join existing workspace via `invite_code`. Rejects if `invite_used = true` or workspace already has 2 users |
| POST | /auth/login | Authenticate, return JWT |
| GET | /kingdoms | List all 6 kingdoms with progress and `unlocked_at` for current workspace |
| GET | /achievements | List achievements for current workspace (filter by `kingdom_id` optional) |
| POST | /achievements | Create new achievement in active kingdom |
| PATCH | /achievements/:id/complete | Mark achievement complete. Uses `UPDATE ... WHERE completed_by IS NULL` guard. Returns `{ newKingdomUnlocked, journeyComplete, kingdom }`. Emits Supabase Broadcast `kingdom_unlocked` event if threshold crossed |
| DELETE | /achievements/:id | Delete achievement. Only allowed if `created_by = current_user AND completed_at IS NULL` |

---

## Screens

### 1. Auth — Signup

- Display name + email + password fields
- Optional: achievement threshold input (default 10, range 1–50)
- On submit → receive `invite_code` → show it clearly for User 1 to share

### 2. Auth — Join

- Single invite code input
- On submit → join workspace → enter app

### 3. World Map (Home)

- Full-screen hybrid SVG map (SVG layers for kingdoms/labels/seals/click regions, raster parchment texture underneath)
- 6 kingdoms placed at different positions on the map
- Kingdom states:
  - `locked` — grayscale, lock icon, not clickable
  - `active` — full color, subtle pulse glow, clickable
  - `completed` — full color + small seal/stamp, clickable (read-only view)
- Nothing else on screen — no stats, no headers, no clutter
- Tap a kingdom → navigate to Kingdom Detail

### 4. Kingdom Detail

- Kingdom name (large, serif font)
- List of achievements: pending vs completed, who created, who completed
- Swipe or long-press own pending achievement → delete option appears
- Progress: a subtle row of dots at the bottom (e.g. ●●●●●○○○○○ = 5/10)
- Single FAB: "+ Achievement" (only visible when kingdom is `active`)
- Tap achievement → expand inline to show note (if any)
- Back arrow → World Map

**Principle:** 1 screen = 1 action. No extra panels, no sidebars.

### 5. Add Achievement (Modal)

- Single text input: achievement title
- Note: collapsed by default, small "add note" link to expand textarea
- Submit button
- Dismissible by tapping outside

### 6. Cinematic Unlock

- Triggered by Supabase Broadcast `kingdom_unlocked` event (for both users simultaneously)
- Full-screen takeover, no skip button (~3–4 seconds):
  1. Map background fades in, screen shakes slightly
  2. New kingdom pulses from grayscale to full color
  3. Kingdom name appears with particle/glow effect
  4. Short fade out
- Returns to updated World Map
- **Offline catch-up:** On app load, compare each kingdom's `unlocked_at` vs locally stored `last_seen_at`. If missed unlock detected → play a softer catch-up version of the cinematic

### 7. Final Completion (Mibatolos)

- Distinct from regular unlock cinematic — longer, more ceremonial (~6–8 seconds)
- Full map lights up completely
- Returns to memorial state World Map — all 6 kingdoms glowing, no FAB anywhere

### 8. Completed Kingdom View

- Same layout as Kingdom Detail
- Visual difference: header has a seal/stamp mark
- Read-only — no FAB, no add button, no delete
- Achievements list shows who completed each and when

---

## Auth Flow

- **User 1 signs up** → workspace created → receives single-use `invite_code`
- **User 2 joins** → enters invite_code → backend checks `invite_used = false` AND `user count < 2` → joins workspace → `invite_used` set to `true`
- Both share `workspace_id` — all data is workspace-scoped
- JWT stored in localStorage, sent as Bearer token on all API calls

---

## Realtime Sync

**Table subscriptions (Supabase Realtime):**
- `achievements` table, filtered by `workspace_id`
- Events: `INSERT` (new achievement), `UPDATE` (completed or deleted)
- On event → update Zustand store → UI re-renders automatically

**Broadcast channel:**
- Channel: `workspace:{workspace_id}`
- Event: `kingdom_unlocked` — emitted by backend after confirmed threshold crossing
- Both users' apps listen at root level → trigger cinematic overlay
- Broadcast is UX convenience only — `/kingdoms` API is the source of truth

---

## Concurrent Completion Guard

```sql
UPDATE achievements
SET completed_by = $user_id, completed_at = NOW()
WHERE id = $id AND completed_by IS NULL
```

- `0 rows affected` → return `409 Conflict` with latest achievement payload
- UI: optimistically disable complete button immediately after tap
- Realtime update disables button for the other user once it lands

---

## Frontend Architecture

- **Zustand store:** `kingdoms[]`, `achievements[]`, `currentUser`, `partner`, `pendingUnlock`, `journeyComplete`
- **React Router:** `/` (map), `/kingdom/:id`, `/auth/signup`, `/auth/join`, `/auth/login`
- **Cinematic component:** standalone full-screen overlay, triggered by store flag `pendingUnlock`
- **Final completion component:** separate overlay triggered by `journeyComplete` flag
- **Root-level Broadcast listener:** subscribes to `kingdom_unlocked` on app mount, sets store flags
- **Map:** Hybrid SVG — kingdom regions as `<g>` elements with CSS state classes, parchment raster texture as SVG `<image>` or CSS background

---

## Visual Design Principles

- **Style:** Hand-illustrated, book illustration aesthetic — not pixel art, not flat design
- **Palette:** Earthy base (parchment, dark ink) + each kingdom's accent color
- **Typography:** Serif for kingdom names, clean sans-serif for all UI text
- **Map:** Hybrid SVG — SVG layers for interaction, raster PNG for texture/illustration
- **Principle:** Less is more. Each screen shows only what's needed for the current action.

---

## Out of Scope (v1)

- Push notifications
- Photo attachments on achievements
- Custom kingdom names or order
- Achievement categories/tags
- Dark mode
- Invite code regeneration (v2)
- Chapter/reset system (v2)
