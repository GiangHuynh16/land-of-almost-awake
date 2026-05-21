# Land-of-Almost-Awake — UI Design Brief

**Date:** 2026-05-21  
**For:** Claude design  
**Scope:** Re-skin all non-map screens using the v2 dark navy palette. The World Map SVG is already done — do NOT touch it.

---

## Design System

### Color Palette
```js
bg:          '#0D1B3E'  // deep navy — page background
bgSecondary: '#111D45'  // dark royal blue — sidebar, banners
bgCard:      '#162040'  // cards, modals, list items
border:      '#243060'  // borders, dividers
textPrimary: '#F7F1FF'  // moonlight white — main text
textMuted:   '#8A9BB8'  // blue-grey — labels, subtitles, placeholders
primaryBtn:  '#2F4FA8'  // royal blue — primary action buttons
```

### Kingdom Accent Colors (use for highlights, borders, FAB)
```js
Miamas:    accent '#F6C879'  glow '#FFE5A0'
Miploris:  accent '#E9A6B8'  glow '#FFD0DF'
Mirevas:   accent '#2F4FA8'  glow '#6A9FE8'
Miaudacas: accent '#F3A36D'  glow '#FFD4A8'
Mimovas:   accent '#A8DDB5'  glow '#D0F5DC'
Mibatolos: accent '#9B7AD6'  glow '#C9B3F5'
Miveritas: accent '#BDEBFF'  glow '#E8F8FF'  (shared kingdom)
```

### Typography
- Kingdom names, headings: `font-family: Georgia, serif` — letter-spaced
- Body text: system-ui / Tailwind default sans
- Lore quotes, subtitles: `italic`, color `textMuted`

---

## Files to Design (do not touch anything else)

### 1. `src/pages/auth/Login.jsx`

**Current state:** `bg-stone-800` inputs, `bg-amber-700` button — old warm palette, inconsistent with v2.

**Redesign to:**
- Page background: `#0D1B3E`
- Title: `"Return to the world"` — Georgia serif, `#F7F1FF`, large
- Inputs: background `#162040`, border `#243060`, text `#F7F1FF`, placeholder `#8A9BB8`, rounded-lg
- Input focus: border changes to `#2F4FA8` (blue glow)
- Submit button: background `#2F4FA8`, text `#F7F1FF`, hover slightly lighter, rounded-lg, full width
- Link to signup: muted `#8A9BB8` text, link color `#BDEBFF`
- Error message: `text-red-400`
- Overall: centered card on the dark background, max-w-sm, no visible card border (just spacing)

---

### 2. `src/pages/auth/Signup.jsx`

**Current state:** Same old amber palette. Has two views: the signup form, and the invite code display screen.

**Redesign to (form view):**
- Same input/button/background style as Login
- Title: `"Begin your journey"` — Georgia serif
- The `achievement_threshold` number input: styled same as other inputs
- Label `"Achievements to unlock each kingdom (1–50)"`: `#8A9BB8`, text-sm
- Link to join: same muted style as Login

**Redesign to (invite code display view — shown after signup):**
- Title: `"Your journey begins"` — Georgia serif, large, `#F7F1FF`
- Subtitle: `"Share this code with your companion"` — italic, `#8A9BB8`
- Invite code box: monospace font (`font-mono`), very large text (`text-4xl`+), letter-spaced (`tracking-widest`), border with `#BDEBFF` (sky blue glow), background `#162040`, `text-shadow` or box-shadow with `#BDEBFF` glow effect at ~20% opacity
- CTA button: same royal blue primary button, `"Enter the world"`

---

### 3. `src/pages/auth/Join.jsx`

**Current state:** Same old amber palette. 4 fields: name, email, password, invite code.

**Redesign to:**
- Same style as Login/Signup
- Title: `"Join the journey"` — Georgia serif
- Invite code input: `uppercase`, `tracking-widest`, slightly highlighted border — make it visually distinct
- Link to signup: same muted style

---

### 4. `src/components/AddAchievementModal.jsx`

**Current state:** `bg-stone-900` modal on `bg-black/60` overlay, amber button.

**Redesign to:**
- Overlay: `bg-black/70`
- Modal card: background `#162040`, border `#243060`, rounded-xl
- Title: `"New achievement"` — Georgia serif, `#F7F1FF`
- Title input: background `#111D45`, border `#243060`, text `#F7F1FF`, placeholder `#8A9BB8`, rounded-lg, focus border `#2F4FA8`
- Note textarea: same style as input, `resize-none`
- `+ add note` toggle: color `#8A9BB8`, hover `#BDEBFF`
- Submit button: background `#2F4FA8`, text `#F7F1FF`, full width, disabled: opacity-40
- Error text: `text-red-400 text-xs`

---

### 5. `src/pages/KingdomDetail.jsx`

**Current state:** Already partially updated to v2 colors — just needs polish.

**Review and fix:**
- Page background: must be `#0D1B3E` (add to the root div or `main.jsx` body)
- Achievement card background: `#162040` (pending), `rgba(22,32,64,0.6)` (completed) — confirm these are applied
- Completed achievement: strikethrough text, color `#8A9BB8`, checkmark `✦` in kingdom accent color
- Progress dots at bottom: filled = kingdom accent color, empty = `#162040` with `#243060` border
- FAB button: kingdom accent color background, `#0D1B3E` text/icon
- Partner view banner (shown when viewing partner's kingdom): left border stripe in kingdom accent color, background `#111D45`, italic text `#8A9BB8`
- Back arrow `←`: color `#8A9BB8`
- Kingdom name in header: Georgia serif, kingdom accent color, letter-spaced
- Meaning subtitle: italic, `#8A9BB8`

---

### 6. `src/pages/SharedKingdom.jsx`

**Current state:** Same v2 structure as KingdomDetail — review for visual consistency.

**Same polish as KingdomDetail.** Additionally:
- The `∞ Shared` badge: border in `#BDEBFF`, text `#E8F8FF`, subtle glow

---

### 7. `src/pages/WorldMap.jsx` (header only)

**Current state:** Has a username label and a partner button.

**The map SVG itself is complete — do not touch `WorldMapSVG.jsx`.**

Only polish the header bar:
- Background: `#0D1B3E` (should already match map)
- Username: Georgia serif, `#F7F1FF`, slightly letter-spaced
- Partner button: pill shape, border `#243060`, text `#8A9BB8`, hover border `#2F4FA8`, hover text `#F7F1FF`

---

### 8. `src/pages/PartnerMap.jsx` (header only)

**Same rules as WorldMap header.**

The `← My Map` button and the `"Viewing X's kingdoms"` label:
- Button: same pill style
- Label: italic, `#8A9BB8`

---

## Global

- `src/index.css` or `src/main.jsx`: set `body { background-color: #0D1B3E; color: #F7F1FF; }` to prevent flash of white background
- All scrollbars (if visible): style to match dark theme

---

## Constraints

- **Do NOT touch:** `WorldMapSVG.jsx`, `CinematicUnlock.jsx`, `FinalCompletion.jsx`, `useRealtimeSync.js`, `useAppStore.js`, `api.js`, `constants.js`, any backend files
- **Stack:** Tailwind CSS 3 + inline `style={{}}` for colors outside Tailwind's default palette — both are acceptable, use whichever is cleaner per element
- **No new packages** — no animation libraries, no UI component libraries
- Keep all existing logic, state, and event handlers intact — only change visual styling
