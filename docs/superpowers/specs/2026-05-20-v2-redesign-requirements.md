# Land-of-Almost-Awake v2 — Redesign Requirements

**Date:** 2026-05-20  
**Scope:** System redesign (separate user spaces) + full design overhaul

---

## 1. System Changes

### 1.1 Separate User Spaces

**Before (v1):** 2 users share 1 workspace, 1 pool of achievements, 1 shared map.

**After (v2):**
- Each user has their **own map** of 6 kingdoms with independent progression
- Each user can **view** their partner's map (read-only)
- There is a **7th shared kingdom** in the center of the UI — always active for both, no unlock threshold, no ownership — both users can add/complete/delete freely

### 1.2 Data Model Changes

**New table: `user_kingdoms`**
```sql
user_kingdoms (
  id uuid primary key,
  user_id uuid references users(id),
  workspace_id uuid references workspaces(id),
  kingdom_id uuid references kingdoms(id),
  unlocked_at timestamptz,
  unique(user_id, kingdom_id)
)
```

**Modified: `achievements`**
- Add `owner_user_id uuid references users(id) nullable`
- Personal achievements: `owner_user_id = creator's user_id`
- Shared kingdom achievements: `owner_user_id = NULL`
- Index: `achievements(workspace_id, owner_user_id, kingdom_id, completed_at)`

**Modified: `kingdoms`**
- Add 7th kingdom row: `{ name: 'Miveritas', meaning: 'We share', order: 7, scope: 'shared' }`
- Add `scope` column: `'personal' | 'shared'` (default 'personal')
- Remove global `unlocked_at` — progression now lives in `user_kingdoms`

**Seed: `user_kingdoms`**
- On signup/join, insert rows for all 6 personal kingdoms per user
- Miamas (order 1) starts with `unlocked_at = now()`, others `null`
- Shared kingdom (order 7) is never inserted into `user_kingdoms` — always active

### 1.3 API Changes

**Modified routes:**
- `GET /kingdoms` — returns my 6 kingdoms (from `user_kingdoms`) + shared kingdom + partner's 6 kingdoms (read-only flag)
- `GET /achievements?kingdom_id=&scope=mine|partner|shared` — scoped fetch
- `POST /achievements` — sets `owner_user_id` based on scope (null for shared)
- `PATCH /achievements/:id/complete` — allowed for: owner (personal), either user (shared)
- `DELETE /achievements/:id` — allowed for: creator (personal), either user (shared)
- `PATCH /achievements/:id/complete` response — unlock logic uses `user_kingdoms` not global `kingdoms.unlocked_at`

**New routes:**
- `GET /users/partner` — returns partner's display_name and user_id

### 1.4 Permissions Matrix

| Action | My achievements | Partner's achievements | Shared achievements |
|--------|----------------|----------------------|---------------------|
| View | ✅ | ✅ | ✅ |
| Add | ✅ | ❌ | ✅ |
| Complete | ✅ | ❌ | ✅ |
| Delete | ✅ (own pending) | ❌ | ✅ (any pending) |

### 1.5 Frontend Architecture Changes

**Zustand store — new shape:**
```js
{
  myKingdoms: [],        // 6 personal kingdoms with my progress
  partnerKingdoms: [],   // 6 partner kingdoms (read-only)
  sharedKingdom: null,   // the 7th shared kingdom
  myAchievements: [],    // achievements for currently viewed personal kingdom
  sharedAchievements: [], // achievements for shared kingdom
  partner: null,         // { id, display_name }
  // ... auth, unlock state same as v1
}
```

**Navigation:**
- `/` — World Map showing MY map (6 kingdoms) + shared kingdom in center + partner icon to switch view
- `/partner` — Partner's map (read-only view)
- `/kingdom/:id` — Kingdom detail (my or partner's, derived from context)
- `/shared` — Shared kingdom detail

**KingdomDetail permissions:**
- My kingdom: full add/complete/delete
- Partner's kingdom: read-only, no FAB, no complete button, no delete
- Shared kingdom: full add/complete/delete for both users

### 1.6 Migration
- Clean wipe of existing data (v1 → v2 schema is incompatible)
- Re-run schema SQL, re-seed kingdoms, re-seed user_kingdoms on signup/join

---

## 2. Design Changes

### 2.1 Color Palette

**Base (map background):**
- Background: `#0D1B3E` (deep navy ink)
- Secondary bg: `#111D45` (dark royal blue)
- Text primary: `#F7F1FF` (moonlight white)
- Text muted: `#8A9BB8` (blue-grey)

**6 Personal Kingdoms (pastel, mystical):**
| Kingdom | Color | Glow |
|---------|-------|------|
| Miamas (I love) | `#F6C879` warm gold | `#FFE5A0` |
| Miploris (I mourn) | `#E9A6B8` rose petal | `#FFD0DF` |
| Mirevas (I dream) | `#2F4FA8` royal blue | `#6A9FE8` |
| Miaudacas (I dare) | `#F3A36D` peach amber | `#FFD4A8` |
| Mimovas (I dance) | `#A8DDB5` mint sage | `#D0F5DC` |
| Mibatolos (I fight) | `#9B7AD6` lavender | `#C9B3F5` |

**Shared Kingdom (center):**
| Kingdom | Color | Glow |
|---------|-------|------|
| Miveritas (We share) | `#BDEBFF` sky blue | `#E8F8FF` |

**UI elements:**
- Primary button: `#2F4FA8` (royal blue)
- FAB: kingdom accent color
- Card bg: `#162040` (slightly lighter than bg)
- Border: `#243060` (subtle blue border)
- Active glow: kingdom glow color at 20% opacity

### 2.2 Typography
- Kingdom names: serif (Georgia), large, letter-spaced
- Body text: clean sans-serif (system-ui)
- Lore quotes: italic, muted blue-grey

### 2.3 World Map Visual Design

**Map background:** Deep navy `#0D1B3E` with:
- SVG feTurbulence noise layer simulating star-field/mist
- Subtle radial gradient lighter at center (where shared kingdom sits)
- Tiny star particles scattered across the map (static SVG circles, varying opacity)

**Kingdom nodes (replace plain circles):**
- Irregular soft blob/island shapes using SVG `<path>` with smooth curves
- Each island has: radial gradient fill (dark center → accent color edge), inner glow filter
- Locked islands: fully desaturated, fog overlay (low-opacity white rect with blur filter)
- Active islands: pulsing outer glow ring (CSS animation), soft particle shimmer
- Completed islands: full color + golden seal stamp in corner

**Connecting paths between kingdoms:**
- Animated dashed SVG paths (stroke-dashoffset animation)
- Color: `#243060` base, brightens to kingdom color when that kingdom is active/completed
- Slight curve (cubic bezier) rather than straight lines

**Shared kingdom (center):**
- Larger than personal kingdoms
- Sky blue glow, always fully lit
- Subtle rotating ring around it (slow CSS animation)
- Visual indicator: "∞" or two interlocking circles symbol

### 2.4 Animation Improvements

**Kingdom unlock cinematic (replace current):**
1. Screen dims to near-black
2. Map zooms in toward the newly unlocked kingdom (CSS transform scale)
3. Kingdom blooms from grayscale → full color with particle burst (SVG radial gradient expanding)
4. Kingdom name rises up with letter-spacing animation
5. Soft particle trail follows the connecting path to the new kingdom
6. Duration: ~4-5 seconds, no skip
7. Auto-returns to map

**Final completion (Mibatolos):**
- All 6 kingdoms light up sequentially with 200ms delay between each
- Then full map glows, text rises
- Duration: ~8 seconds

**Idle animations:**
- Active kingdom: continuous soft pulse glow (2s loop)
- Shared kingdom: slow rotation ring (8s loop)
- Star particles: random twinkle (opacity animation, staggered)

**Page transitions:**
- Fade in/out between map and kingdom detail (300ms)

### 2.5 Screens — Visual Spec

**World Map:**
- Full-screen dark map
- Small avatar chips for both users in top corners (my side left, partner side right)
- Partner's map accessible via clicking partner avatar → smooth transition
- Shared kingdom prominently in visual center with "∞" indicator

**Kingdom Detail:**
- Dark card background `#162040`
- Kingdom accent color as left border stripe
- Achievement items: rounded cards, completed ones have subtle strikethrough + kingdom color checkmark
- Progress dots use kingdom accent color
- Partner view: banner at top "Viewing [Partner Name]'s kingdom" in muted style

**Auth pages:**
- Same dark navy background
- Centered form, minimal
- Invite code display: large monospace, golden border glow

---

## 3. Implementation Notes for Builder

### Priority order:
1. Schema migration (user_kingdoms table, owner_user_id on achievements, shared kingdom seed)
2. Backend API updates (scoped kingdoms, scoped achievements, partner route)
3. Frontend store restructure (myKingdoms, partnerKingdoms, sharedKingdom)
4. Navigation update (my map / partner map / shared)
5. KingdomDetail permissions
6. Design overhaul (SVG map, colors, animations)

### Key files to modify:
- `backend/supabase_schema.sql` — full rewrite
- `backend/src/routes/kingdoms.js` — scoped response
- `backend/src/routes/achievements.js` — owner_user_id, scoped permissions
- `backend/src/routes/auth.js` — seed user_kingdoms on signup/join
- `frontend/src/store/useAppStore.js` — new store shape
- `frontend/src/components/WorldMapSVG.jsx` — full visual overhaul
- `frontend/src/pages/WorldMap.jsx` — my/partner view toggle
- `frontend/src/pages/KingdomDetail.jsx` — permission-aware
- `frontend/src/lib/constants.js` — new color palette
- `frontend/src/components/CinematicUnlock.jsx` — new animation

### Do NOT change:
- Auth flow (signup/join/login)
- Realtime sync mechanism (Supabase Realtime + Broadcast)
- JWT middleware
- Vite/React/Zustand/Tailwind stack
