# Court Details Page — Redesign Spec

## Overview

Redesign the court details page (`/courts/:id`) from a centered modal overlay to a full-width hybrid layout with a photo hero, two-column content area, and sticky booking sidebar. The primary user flow is **Book Full Court** (Phase 1); session creation/joining is secondary (Phase 2).

## Page Structure

### Desktop (>768px)

Three vertical zones:

1. **Photo hero** — full-width CSS grid (`2fr 1fr 1fr`, 2 rows, ~280px height). First photo spans 2 rows. "Show all" overlay on the last photo (visual-only for now). Falls back to a gradient placeholder with court type icon when `photos[]` is empty.
2. **Two-column content** — left column for court info, sessions preview, and reviews. Right column for the sticky booking sidebar.
3. **Back button** — overlaid top-left on the hero, navigates to `/` (Discover).

### Mobile (<768px)

Single column. Hero becomes a horizontal scroll carousel (~200px height) with dot indicators. All content stacks vertically. Booking sidebar content flows inline (no glass card wrapper). A sticky bottom bar (64px + safe-area inset) shows price and "Book Full Court" button.

## Components

### PhotoHero

- **Input:** `photos: string[]` from court data.
- **Desktop:** CSS grid — 1 large (2-row span) + 4 smaller photos. "Show all" button on last photo.
- **Mobile:** Horizontal scroll carousel with dot indicators.
- **Empty state:** Gradient placeholder with court type icon.

### CourtHeader

- Court name (Lixdu font, uppercase, tracking).
- Address (Space Grotesk, muted).
- Type pill (Indoor/Outdoor) + surface pill (Hardwood/Asphalt/Rubber).
- Rating display (amber stars + score + review count).
- Amenities row (glass pills with icons).
- **Price moves out of here** — it lives in the sidebar now.

### SessionsPreview

- Compact session list for the selected date.
- Section header: "Open Sessions · {formatted date}".
- Each row: format (5v5/3v3), start time, duration, spots remaining.
- Clicking a row navigates to `/sessions/:id`.
- Empty state: "No sessions for this date" message.
- Reads `selectedDate` from page-level state (shared with sidebar calendar).

### ReviewsSection

Two sub-parts:

**RatingBreakdown:**
- Left: large score (DSEG or monospace, 36px), amber stars, total review count.
- Right: 5-row horizontal bar chart showing distribution per star level.
- Data computed from reviews array (pure function, no API call).
- Wrapped in a subtle glass card (`rgba(255,255,255,0.04)` bg).

**ReviewList + ReviewForm:**
- Review items: stars, username (first 8 chars of userId), date, comment text.
- Review form: star selector (1–5 buttons), textarea, leather-textured submit button.
- Login prompt if not authenticated (link to `/login`).
- Same behavior as current, improved visual treatment.

### BookingSidebar

Sticky glass card on the right column:

- **Price:** DSEG font, `$X /player/hr`.
- **Calendar:** Existing `GlassCalendar` component, compact. Controls `selectedDate`.
- **Time slot chips:** Horizontal wrap of selectable time slots. Selected slot gets amber highlight (`rgba(212,160,18,0.15)` bg, amber border). Phase 1: hardcoded hourly slots (16:00, 18:00, 20:00). Phase 2: backend-driven availability.
- **Price summary:** "Full court · {duration}" line showing the selected duration. No total shown — checkout wizard handles pricing.
- **CTA:** "Book Full Court" button with basketball leather texture background (`/assets/basketball-leather.jpg`), amber glow shadow on hover. Navigates to `/checkout?courtId={id}&date={selectedDate}&time={selectedTimeSlot}`.
- **Sticky behavior:** `position: sticky; top: 32px`.

### CourtLocationMap

- Small Leaflet map (~140px height) below the sidebar.
- Centered on court's `lat`/`lng` with a pin marker.
- Non-interactive: dragging, zoom, scroll all disabled.
- Dark Carto tiles (same as rest of app).
- Rounded corners with subtle border.

### MobileBookingBar

- Visible only on mobile (`md:hidden`).
- Fixed to bottom of viewport.
- Glass background with backdrop blur.
- Left: price display. Right: "Book Full Court" leather button.
- Height: 64px + safe-area padding (`pb-safe`).

## Data Flow

### Page-level state

| State | Type | Owner | Consumers |
|---|---|---|---|
| `selectedDate` | `string` | `CourtDetails` page | `BookingSidebar`, `SessionsPreview` |
| `selectedTimeSlot` | `string \| null` | `BookingSidebar` | Price summary, checkout navigation |

### Existing hooks (no changes)

- `useCourt(id)` — court details.
- `useCourtSessions(id, date)` — sessions for selected date.
- `useReviews(courtId)` — all reviews.
- `usePostReview(courtId)` — submit review mutation.

### Derived data (no API changes)

- `ratingDistribution` — count of reviews per star level, computed from `reviews[]`.
- `availableTimeSlots` — Phase 1: hardcoded `["16:00", "18:00", "20:00"]`. Phase 2: `GET /courts/:id/availability?date=`.
- `totalPrice` — not calculated on this page. The sidebar displays `pricePerPlayerPerHour` as the rate. Exact booking total is computed by the checkout wizard based on court pricing rules.

### Checkout navigation

```
navigate(`/checkout?courtId=${id}&date=${selectedDate}&time=${selectedTimeSlot}`)
```

## Visual Treatment

### Design tokens used

All tokens from the existing glass design system in `global.css`:

- Glass card: `bg-[rgba(255,255,255,0.12)] backdrop-blur-[24px] border border-[rgba(255,255,255,0.15)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]`
- Glass pill: `bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] rounded-full`
- Amber accent: `#d4a012` (stars, selected states)
- Text primary: `rgba(255,255,255,0.85)`
- Text muted: `rgba(255,255,255,0.4)`
- Section divider: `border-[rgba(255,255,255,0.06)]`

### Fonts

- Court name: Lixdu (uppercase, tracking 3px)
- Body/labels: Space Grotesk (uppercase, tracking 1.5–2px)
- Price numbers: DSEG7 monospace
- CTA text: Lixdu (uppercase, tracking 2.5px)

### CTA button style

Primary "Book Full Court" uses basketball leather texture:
```
backgroundImage: url(/assets/basketball-leather.jpg)
backgroundSize: cover
box-shadow: 0 4px 20px rgba(232,120,23,0.4) (on hover)
```

Secondary actions use glass pills.

## Page Background

With the modal pattern removed, the page uses a solid dark background (`#0a0a0c`) matching the app's base color. The `MapBackground` component is removed from this page entirely — the map only appears as the small `CourtLocationMap` in the sidebar.

## "Create a Game" in Phase 1

The "Create a Game" button is **not shown** on the court details page in Phase 1. It will return in Phase 2 when session flows are built. The only CTA is "Book Full Court."

## Backend Changes

None. All data is served by existing endpoints. Time slot availability is hardcoded in Phase 1.

## Scope Boundaries

**In scope (Phase 1):**
- Full page layout restructure (hero, two-column, sticky sidebar)
- Photo hero with placeholder fallback
- Booking sidebar with calendar, time slots, CTA
- Rating breakdown chart
- Mobile responsive layout with sticky bottom bar
- Checkout navigation via query params

**Out of scope (Phase 2+):**
- Session creation/joining flows
- Photo lightbox/gallery modal
- Backend-driven time slot availability
- Photo upload for courts
- "Create a Game" CTA (hidden or deprioritized in Phase 1)
