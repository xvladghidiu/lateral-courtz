# Bookings Page Redesign — Timeline Layout

## Overview

Redesign the Bookings page (`Dashboard.tsx`) from a flat row list into a rich timeline layout with glass morphism booking cards grouped by date. The page gets a dark map background and follows the same visual language as CourtDetails and CreateSession.

## Page Structure

### Background

Non-interactive dark CartoDB map tiles covering the full viewport (same pattern as CreateSession), with a semi-transparent overlay `bg-[rgba(10,10,12,0.85)]` on top. Content scrolls over this backdrop.

### Header

- Back link: `← BACK` in Space Grotesk, 10px, uppercase, links to `/`
- Title: "My Bookings" in Lixdu font, 36px, uppercase, 4px tracking, white
- Tab toggle: Upcoming / Past — same component as current, restyled:
  - Active: `bg-[rgba(212,160,18,0.15)] border border-[rgba(212,160,18,0.3)] text-[#d4a012]`
  - Inactive: `bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.5)]`

### Timeline

Vertical line on the left side with gold accent dots at each date group.

- **Timeline line**: 1px wide, `bg-[rgba(255,255,255,0.08)]`, runs from first to last group
- **Date dots**: 10px circle, `bg-[rgba(212,160,18,0.3)] border border-[#d4a012]`, positioned on the line
- **Date header**: Space Grotesk, 10px, uppercase, 1.5px tracking, `text-[rgba(255,255,255,0.35)]` — e.g., "APR 18"
- Content indented ~30px from the left edge to make room for the timeline

### Booking Cards

Glass morphism horizontal cards within each date group. Multiple bookings on the same date stack under the same header.

**Card container**: `bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl` with `hover:bg-[rgba(255,255,255,0.1)]` transition. Clickable — navigates to `/courts/:courtId`.

**Layout**: Horizontal flex, `overflow-hidden`.

**Left side — Map thumbnail** (80x80px):
- Static Leaflet map snippet showing the court location with a basketball pin
- Dark CartoDB tiles, no controls, no interaction
- `rounded-l-xl` on the card, `shrink-0`

**Right side — Details** (flex-1, padded):
- **Row 1**: Court name (Lixdu, 13px, uppercase, 1.5px tracking, white) + Status badge (right-aligned)
- **Row 2**: Time info line — `startTime · duration min · format · players/maxPlayers` in Space Grotesk, 11px, `text-[rgba(255,255,255,0.35)]`
- **Row 3**: Format/player pills + DSEG price (right-aligned)
  - Format pill: e.g., "5v5" — `bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-full px-2.5 py-0.5 text-[9px]`
  - Player count pill: e.g., "8/10" — same style
  - Price: DSEG font, 16px, `text-[rgba(255,255,255,0.8)]` — shows `amountPaid` from booking

### Status Badges

Same color scheme as current, pill-shaped:
- `confirmed`: green — `bg-[rgba(100,220,140,0.1)] border-[rgba(100,220,140,0.2)] text-[rgba(100,220,140,0.8)]`
- `cancelled`: red — `bg-[rgba(255,100,100,0.1)] border-[rgba(255,100,100,0.2)] text-[rgba(255,100,100,0.8)]`
- `filling`: yellow — `bg-[rgba(255,200,100,0.1)] border-[rgba(255,200,100,0.2)] text-[rgba(255,200,100,0.8)]`
- `completed`: muted — `bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.4)]`

### Empty State

Centered vertically and horizontally:
- Spinning basketball emoji (64px, `animate-ball-spin`) — same loader used elsewhere
- Text: "No upcoming bookings" or "No past bookings" — Space Grotesk, 13px, dimmed
- CTA button: "Explore Courts" — leather-textured button (`basketball-leather.jpg` background), links to `/`

## Data Flow

Same hooks as current — no backend changes:
- `useMyBookings()` → list of bookings
- `useMySessions()` → sessions linked to bookings
- `useCourts()` → court data for names, coordinates, photos

Bookings are grouped by `session.date` (already available). Within each date group, sorted by `session.startTime`.

## Mobile Behavior

- Timeline line and dots still visible
- Map thumbnails shrink to 60px width
- Cards take full width
- Single column layout (same as desktop, just narrower)

## Components Affected

- **`client/src/pages/Dashboard.tsx`** — Full rewrite of the page layout and card rendering. Keep the data-fetching logic and tab toggle state.

No new files needed. The map thumbnail can use an inline Leaflet `MapContainer` with the same dark tile URL, or a static image approach. Inline Leaflet is preferred for consistency.

## Map Thumbnail Approach

Each booking card renders a small `MapContainer` (80x80px) showing the court location:
- Dark CartoDB tiles
- Single basketball pin marker at `[court.lat, court.lng]`
- Zoom level ~15
- All interactions disabled (dragging, zoom, scroll, keyboard)
- `rounded-l-xl` to match card border radius
