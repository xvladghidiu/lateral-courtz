# Lateral Courts — UI Redesign: Map-First with Glassmorphism

Redesign the Discover page from a vertical feed layout to a full-screen interactive map with glassmorphism overlays, shot clock stats, and a slide-in side panel for court details.

## What Changes

The current Discover page is a scroll feed: hero map → stat cards → horizontal game scroll → court grid. The new design makes the map the entire experience. Everything floats on top of it as frosted glass.

### Current → New

| Current | New |
|---------|-----|
| Feed layout (scroll page) | Full-screen map (100vh) |
| Dark theme (#050505) | Hybrid: natural map tiles + glass overlays |
| Stats as bento cards | Shot clock displays (DSEG seven-segment font) |
| Horizontal scroll game cards | Side panel on pin tap |
| Court grid below fold | Courts ARE the map pins |
| Separate FullMap page | Map IS the home page |
| Grain overlay | Removed (doesn't work on light/hybrid) |

## Layout

Full-screen interactive Leaflet map fills the viewport. All UI floats on top as glassmorphism overlays:

1. **Header** — slim frosted glass bar at top. Brand dot + "Lateral Courts" on left, avatar on right. No nav pills on desktop (links inline). Mobile uses bottom tabs.
2. **Search bar** — large, centered below header. Frosted light glass. "Search courts near you..."
3. **Shot clock stats** — left edge, vertically stacked with 24px gaps. 3 squared containers.
4. **Court pins** — white pill markers with price labels on the map.
5. **Side panel** — appears on pin tap. Right side (desktop), bottom sheet (mobile).

## Glassmorphism Spec

Two glass variants:

**Light glass** (search bar, header, side panel):
```css
background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(24px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.2);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
```

**Dark glass** (shot clocks):
```css
background: rgba(10, 10, 12, 0.35);
backdrop-filter: blur(24px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
```

Text: dark on light glass, light on dark glass.

## Shot Clock Stats Component

Squared containers (border-radius: 12px) stacked vertically on the left edge of the map.

- **Font:** DSEG7 Classic Bold (seven-segment LED display) loaded from `https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG7-Classic/DSEG7Classic-Bold.woff2`
- **Ghost segments:** `88:88` rendered behind at 5% opacity to simulate unlit segments
- **Size:** 88x88px per clock
- **Gap:** 24px between clocks
- **LED dot:** 4px circle in top-right corner, color-matched, pulsing animation (opacity 1 → 0.4)
- **Top accent line:** colored gradient line matching each clock's color

Three clocks:
1. **Red (#ff3b30):** `{count}:00 ACTIVE` — number of open/filling sessions. Text-shadow glow.
2. **Orange (#ff9500):** `{count}:00 FILLING` — sessions >70% full. Text-shadow glow.
3. **Green (#34c759):** `{count}:00 COURTS` — total courts nearby. Text-shadow glow.

Label below digits: Inter, 7px, weight 700, uppercase, letter-spacing 1.5px, color rgba(255,255,255,0.35).

## Map

- **Tiles:** Carto Positron (`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`) — light, clean, lets glass overlays pop
- **Center:** average of all court coordinates
- **Zoom:** 13 (city neighborhood level)
- **Pins:** white pill markers with price label + stem + dot (reuse existing `priceIcon` from `mapUtils.ts`, restyle for light theme)
- **Interaction:** click pin → open side panel with court data
- **Full interactivity:** zoom, pan, scroll all enabled (unlike the current hero map which is static)

## Side Panel

### Desktop
- Slides in from the right edge
- Width: 400px
- Map width adjusts (shrinks) to accommodate
- Frosted light glass background
- Close button (X) top-right
- Smooth slide animation (300ms ease)

### Mobile
- Slides up from bottom as a sheet
- Initial height: 50vh (half screen)
- Draggable handle at top to expand to full screen
- Frosted light glass background
- Swipe down to dismiss

### Panel Content
1. **Court header:** name (large), rating (amber stars), type badge (indoor/outdoor), surface
2. **Price:** "$X / player / hr" — prominent
3. **Amenities:** pill tags
4. **Open sessions list:** for today's date
   - Each session: format badge (5v5/3v3), time, duration, PlayerSlots visualization, "Join" button
   - Empty state: "No open sessions today"
5. **CTAs:** "Create a Game" and "Book Full Court" buttons
6. **Footer link:** "View full details →" — navigates to `/courts/:id` for reviews, all sessions, etc.

## Color System

### Theme Tokens (replace current dark theme)
```
--color-bg: transparent (map is the bg)
--color-glass-light: rgba(255, 255, 255, 0.15)
--color-glass-light-solid: rgba(255, 255, 255, 0.85) (for side panel, needs readability)
--color-glass-dark: rgba(10, 10, 12, 0.35)
--color-glass-border-light: rgba(255, 255, 255, 0.2)
--color-glass-border-dark: rgba(255, 255, 255, 0.1)
--color-text-on-glass-light: rgba(0, 0, 0, 0.7)
--color-text-on-glass-dark: rgba(255, 255, 255, 0.9)
--color-accent-red: #ff3b30 (iOS red — slightly brighter for light bg)
--color-accent-orange: #ff9500
--color-accent-green: #34c759
--color-accent-amber: #d4a012
```

### What's Removed
- Grain overlay (body::after noise texture)
- Ambient glow radial gradients
- Near-black background (#050505)
- All dark surface colors (#0c0c0e, #111114, etc.)

## Header Restyle

Slim frosted glass bar:
- Height: 48px (down from 54px)
- Light glass background
- Brand: red dot (7px, breathing glow) + "Lateral Courts" — dark text on glass
- Right side: avatar only (gradient red→orange)
- Desktop: add "My Games", "Bookings", "Dashboard" as subtle text links
- Mobile: hide text links, bottom tabs handle navigation
- No center nav pills (too heavy for glass header)

## Files Affected

### Modified
- `client/src/pages/Discover.tsx` — complete rewrite to map-first
- `client/src/pages/FullMap.tsx` — delete (merged into Discover)
- `client/src/components/Header.tsx` — restyle to light glass, slimmer
- `client/src/styles/global.css` — new theme tokens, remove grain/dark bg
- `client/src/App.tsx` — remove /map route, update layout
- `client/src/lib/mapUtils.ts` — restyle pins for light map

### New
- `client/src/components/ShotClock.tsx` — DSEG stat display component
- `client/src/components/SidePanel.tsx` — slide-in court detail panel
- `client/src/components/SidePanelSessions.tsx` — session list inside panel

### Deleted
- `client/src/pages/FullMap.tsx`
- `client/src/components/StatCard.tsx` — replaced by ShotClock
- `client/src/components/CourtCard.tsx` — no court grid needed

### Unchanged
- All server code
- Auth pages (Login, Register)
- Create Session, Session Details, Checkout, Dashboard pages
- PlayerSlots, LiveGameCard, ReviewCard components
- All hooks and API functions
- BottomTabs (still used for mobile)

## Responsive

### Desktop (1024px+)
- Full-screen map
- Header at top
- Shot clocks left-stacked
- Search bar centered
- Side panel slides from right (400px)

### Mobile (< 640px)
- Full-screen map
- Header at top (slimmer)
- Shot clocks smaller (72px), still left-stacked
- Search bar full-width with margins
- Side panel slides up from bottom (sheet)
- Bottom tabs visible

## Non-Functional

- DSEG font loaded from CDN (with fallback to monospace)
- Map tiles cached by Leaflet
- Side panel lazy-loads session data on open (not pre-fetched)
- Panel open/close animated with CSS transitions (no JS animation libraries)
