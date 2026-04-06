# Booking Flow Redesign

## Summary

Restyle the 4 booking flow pages (Court Details, Create Session, Session Details, Checkout) to match the new visual identity. Full-screen static dark map background with a single centered scrollable glass card.

## Shared Layout

All 4 pages share the same structure:

- **Background:** Full-screen static map using CartoDB dark tiles (`dark_all`). No markers, no interactivity, no zoom controls. Centered on default fallback (40.73, -73.99). Purely decorative.
- **Glass card:** Single centered scrollable container, vertically centered or top-aligned when content overflows viewport.
  - Max width: `600px`
  - Background: `rgba(255,255,255,0.15)` (more opaque than login's 0.08 for readability)
  - `backdrop-blur-[24px] backdrop-saturate-[180%]`
  - Border: `1px solid rgba(255,255,255,0.12)`
  - Border radius: `rounded-2xl`
  - Shadow: `0 8px 32px rgba(0,0,0,0.3)`
  - Padding: `px-8 py-10`
  - Overflow: `overflow-y-auto max-h-[90vh]`

## Fonts

| Element | Font | Size | Style |
|---------|------|------|-------|
| Page title (court name, "Checkout", etc.) | Lixdu | 20-22px | uppercase, tracking 2-3px |
| Section headings | Square Sans Serif 7 | 12px | uppercase, tracking 2px |
| Labels, meta text, badges | Square Sans Serif 7 | 10-11px | uppercase, tracking 1.5px |
| Button text | Square Sans Serif 7 | 12px | uppercase, tracking 2px |
| Body/detail text | Square Sans Serif 7 (inherited) | 13-14px | normal |
| Numeric displays (price, counts) | DSEG | varies | bold |

## Buttons

- **Primary CTA:** Basketball leather texture (`/assets/basketball-leather.jpg`), `background-size: cover`, `background-position: center`, white text, `rounded-xl`, hover shadow `0 4px 20px rgba(232,120,23,0.4)`
- **Secondary CTA:** Glass treatment — `rgba(255,255,255,0.08)` bg, `border rgba(255,255,255,0.12)`, white text, same rounding

## Glass Inputs

Same as login pages:
- Background: `rgba(255,255,255,0.06)`
- Border: `1px solid rgba(255,255,255,0.1)`
- Border radius: `rounded-xl`
- Padding: `px-4 py-3`
- Text: white, 14px
- Placeholder: Square Sans Serif 7, 11px, uppercase, tracking 1.5px, `rgba(255,255,255,0.3)`
- Focus: border `rgba(255,255,255,0.25)`

## Glass Badges/Pills

For type, surface, amenity, and status badges:
- Background: `rgba(255,255,255,0.08)`
- Border: `1px solid rgba(255,255,255,0.1)`
- Border radius: `rounded-full`
- Padding: `px-3 py-1`
- Text: Square Sans Serif 7, 9-10px, uppercase, tracking 1.5px, `rgba(255,255,255,0.6)`

## Segmented Controls

For Create Session form (duration, format, mode):
- Container: glass bg with border, `rounded-xl`, `p-1`
- Inactive segment: transparent, `rgba(255,255,255,0.5)` text
- Active segment: `rgba(255,255,255,0.15)` bg, white text, `rounded-lg`

---

## Page: Court Details (`/courts/:id`)

### Card Contents (top to bottom)

1. **Court name** — Lixdu, 22px, white
2. **Address** — Square Sans Serif 7, 11px, `rgba(255,255,255,0.4)`
3. **Badge row** — type (indoor/outdoor) + surface pills, inline
4. **Rating** — amber stars `#d4a012` + review count
5. **Amenity pills** — flex-wrapped glass pills
6. **Price** — DSEG font for the number, large (24px), with "/player/hr" in Square Sans Serif 7
7. **Divider** — `1px solid rgba(255,255,255,0.08)`, margin y
8. **"Open Sessions" heading** — Square Sans Serif 7, 12px, uppercase
9. **Date picker** — glass-styled input, type="date"
10. **Session list** — each session as a glass sub-card (`rgba(255,255,255,0.06)` bg, border, rounded-xl, padding) showing:
    - Format + time + duration
    - PlayerSlots visualization
    - "Join" leather button (small)
11. **CTAs** — "Create a Game" (leather), "Book Full Court" (glass secondary), side by side
12. **Divider**
13. **"Reviews" heading**
14. **Review cards** — each review with stars, user, date, comment text

## Page: Create Session (`/sessions/new`)

### Card Contents

1. **"Create a Session"** — Lixdu, 20px
2. **Court name subtitle** — Square Sans Serif 7, 11px, `rgba(255,255,255,0.4)`
3. **Form fields:**
   - Date — glass input, type="date"
   - Start time — glass input, type="time"
   - Duration — segmented control (30, 60, 90, 120 min)
   - Format — segmented control (5v5, 3v3)
   - Mode — segmented control (Open Game, Full Court)
4. **Price summary** — glass sub-card showing price per player (DSEG) and total players
5. **"Create Session"** — leather button, full width

## Page: Session Details (`/sessions/:id`)

### Card Contents

1. **Status badge** — glass pill with status text
2. **Format + mode badges** — glass pills inline
3. **Court name** — Lixdu, 20px, links to court details
4. **Date, time, duration** — Square Sans Serif 7, 12px
5. **Deadline countdown** — if applicable, orange text
6. **Divider**
7. **"Players" heading** — Square Sans Serif 7, 12px
8. **PlayerSlots** — visualization (adapted for glass theme: slots use `rgba(255,255,255,0.06)` empty, `rgba(255,255,255,0.15)` filled)
9. **Player count** — "X/Y players"
10. **Action area:**
    - If can join: "Join Game" leather button → redirects to checkout
    - If already in: "You're in this game" — green text
    - If creator: share URL box (glass input with copy)

## Page: Checkout (`/checkout/:sessionId`)

### Checkout Form State

1. **"Checkout"** — Lixdu, 20px
2. **Session summary** — glass sub-card with court name, date, time, format, duration, price per player
3. **"Payment Details" heading** — Square Sans Serif 7, 12px
4. **Card inputs** — glass-styled: card number, expiry (half width), CVV (half width)
5. **"Confirm & Pay $X"** — leather button, full width
6. **Error display** — `#ff3b30` text below button

### Success State (replaces form)

1. **Spinning 🏀** — large (60-80px), CSS spin animation (1s, then slows to stop over 2s)
2. **"YOU'RE IN!"** — Square Sans Serif 7 font, 18px, uppercase, tracking 4px, white, fade-in after spin settles
3. **Court name + date/time** — fade-in after title, Square Sans Serif 7, 12px, `rgba(255,255,255,0.5)`
4. **"View Session"** — leather button, fade-in last

Animations staggered: spin (0-2s) → title fade (1.5s) → details fade (2s) → button fade (2.5s)

## Files to Modify

- `client/src/pages/CourtDetails.tsx` — full restyle
- `client/src/pages/CreateSession.tsx` — full restyle
- `client/src/pages/SessionDetails.tsx` — full restyle
- `client/src/pages/Checkout.tsx` — full restyle
- `client/src/components/PlayerSlots.tsx` — adapt colors for glass theme
- `client/src/styles/global.css` — add checkout celebration animations
