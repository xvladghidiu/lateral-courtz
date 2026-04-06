# Dashboard Page — Redesign Spec

## Overview

Redesign the Dashboard page from a glass modal over a static map to a full-width page matching the new app identity (`#0a0a0c` background, no map, no modal). The page shows the user's full court bookings split into "Upcoming" and "Past" via a tab toggle. Sessions (created games) are removed from this page — Phase 1 is full court bookings only.

## Page Structure

- **Background:** Solid `#0a0a0c`, no map.
- **Container:** `fixed inset-0 overflow-y-auto z-10` (same pattern as CourtDetails to work with body `overflow: hidden`).
- **Content width:** `max-w-[800px] mx-auto`, padded with `px-4 md:px-8`.
- **Back link:** Top-left, navigates to `/`. Same style as CourtDetails (`font-['Space_Grotesk'] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]`).
- **Page title:** "My Bookings" in Lixdu font, 22px, uppercase, tracking 3px.
- **Tab toggle:** Below the title. Two pills side by side — "Upcoming" and "Past".
- **Booking list:** Compact rows for the active tab.
- **Empty state:** Centered muted message when no bookings exist for the active tab.

## Tab Toggle

Two pills in a flex row with a small gap.

**Active pill:**
- `bg-[rgba(212,160,18,0.15)] border border-[rgba(212,160,18,0.3)] text-[#d4a012]`
- Font: Space Grotesk, 11px, uppercase, tracking 2px, font-medium

**Inactive pill:**
- `bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.5)]`
- Hover: `bg-[rgba(255,255,255,0.12)]`
- Same font specs as active

Pill padding: `px-5 py-2`, `rounded-lg`.

## Compact Booking Row

Each row is a single horizontal bar, not a card. No border-radius per row — clean list feel.

**Layout:** Flex row, items centered, justify-between.

**Left side:**
- Court name: Space Grotesk, 13px, `text-[rgba(255,255,255,0.85)]`
- Dot separator
- Date & time: Space Grotesk, 11px, `text-[rgba(255,255,255,0.4)]`
- Format: "Mar 28 · 18:00"

**Right side:**
- Status badge: Glass pill with status-specific color.
  - confirmed: `text-[rgba(100,220,140,0.8)]`
  - filling: `text-[rgba(255,200,100,0.8)]`
  - cancelled: `text-[rgba(255,100,100,0.8)]`
  - completed: `text-[rgba(255,255,255,0.5)]`
- Badge style: `bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] rounded-full px-3 py-1 text-[9px] uppercase tracking-[1.5px]`

**Row style:**
- `bg-[rgba(255,255,255,0.04)]` background
- `border-b border-[rgba(255,255,255,0.06)]` bottom border (no card wrapper)
- `px-4 py-3.5` padding
- Hover: `bg-[rgba(255,255,255,0.07)]` with transition
- Clickable: navigates to `/sessions/:sessionId`
- Cursor pointer

**No price displayed** — keeping it minimal.

## Empty State

When the active tab has no bookings:

- Centered text in a subtle glass container
- `bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-xl py-8`
- Message text: Space Grotesk, 11px, `text-[rgba(255,255,255,0.3)]`
- Upcoming empty: "No upcoming bookings"
- Past empty: "No past bookings"

## Data Flow

**Tab state:** `useState<"upcoming" | "past">("upcoming")` — page-level.

**Splitting bookings:**
- A booking is "upcoming" if its associated session date >= today's date
- A booking is "past" if its associated session date < today's date
- Computed via `useMemo` partitioning the bookings array

**Existing hooks (no changes):**
- `useMyBookings()` — user's bookings
- `useMySessions()` — session details (date, time, courtId) for each booking
- `useCourts()` — court name resolution

**Removed from page:**
- "My Sessions" section (created games) — not relevant for Phase 1 full court bookings
- Map background
- Glass modal wrapper

## Backend Changes

None.

## Scope

**In scope:**
- Full page layout rewrite with new identity
- Tab toggle (upcoming/past)
- Compact booking rows
- Empty states
- Auth redirect (keep existing)

**Out of scope:**
- Session creation/management
- Booking cancellation
- Filtering/sorting
