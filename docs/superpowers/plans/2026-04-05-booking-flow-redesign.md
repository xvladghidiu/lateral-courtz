# Booking Flow Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the 4 booking flow pages (Court Details, Create Session, Session Details, Checkout) with map background + glass card layout, matching the new visual identity.

**Architecture:** Each page gets the same wrapper: static dark map background with a centered scrollable glass card. All sub-components within each page are restyled to use glass treatments. Primary CTAs use basketball leather texture. Checkout success gets a celebration animation.

**Tech Stack:** React, Leaflet, react-leaflet, Tailwind CSS, TypeScript

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `client/src/styles/global.css` | Modify | Add celebration animations (spin-slow, fade-in-up, staggered delays) |
| `client/src/components/PlayerSlots.tsx` | Modify | Adapt slot colors for glass theme |
| `client/src/pages/CourtDetails.tsx` | Modify | Full restyle with map bg + glass card |
| `client/src/pages/CreateSession.tsx` | Modify | Full restyle with map bg + glass card |
| `client/src/pages/SessionDetails.tsx` | Modify | Full restyle with map bg + glass card |
| `client/src/pages/Checkout.tsx` | Modify | Full restyle with map bg + glass card + celebration screen |

---

### Task 1: Add Celebration Animations to Global CSS

**Files:**
- Modify: `client/src/styles/global.css`

- [ ] **Step 1: Add celebration keyframes and utilities**

Append before the `@keyframes user-pulse` block:

```css
@utility animate-spin-slow {
  animation: spin-slow 2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
}

@utility animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes spin-slow {
  0% { transform: rotate(0deg) scale(0.5); opacity: 0; }
  20% { opacity: 1; transform: rotate(360deg) scale(1.1); }
  60% { transform: rotate(900deg) scale(1); }
  100% { transform: rotate(1080deg) scale(1); }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/styles/global.css
git commit -m "feat: add celebration animations for checkout success"
```

---

### Task 2: Adapt PlayerSlots for Glass Theme

**Files:**
- Modify: `client/src/components/PlayerSlots.tsx`

- [ ] **Step 1: Read the current file and update slot colors**

Change the Slot component colors from the current opaque dark-theme tokens to glass-friendly ones:

- Empty slot: change `bg-[rgba(255,255,255,0.02)] border border-border` to `bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)]`
- Filled slot (red): change `bg-[rgba(230,51,40,0.15)] border border-[rgba(230,51,40,0.2)]` to `bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.2)]`
- Filled slot (orange): change `bg-[rgba(232,114,13,0.15)] border border-[rgba(232,114,13,0.2)]` to `bg-[rgba(255,255,255,0.18)] border border-[rgba(255,255,255,0.25)]`
- Inner accent bar (`after:bg-accent-red` / `after:bg-accent-orange`): change to `after:bg-[rgba(255,255,255,0.6)]` / `after:bg-[rgba(255,255,255,0.4)]`
- Counter text: ensure it's `text-[rgba(255,255,255,0.6)]`

- [ ] **Step 2: Commit**

```bash
git add client/src/components/PlayerSlots.tsx
git commit -m "feat: adapt PlayerSlots colors for glass theme"
```

---

### Task 3: Restyle Court Details Page

**Files:**
- Modify: `client/src/pages/CourtDetails.tsx`

- [ ] **Step 1: Read the current file**

Read `client/src/pages/CourtDetails.tsx` to get the full current implementation.

- [ ] **Step 2: Add map imports and wrap layout**

Add to imports:
```typescript
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
```

Remove `Header` import — the page will not have a navigation header (the glass card is the full experience, with a back link instead).

- [ ] **Step 3: Replace the page wrapper**

Replace the outer JSX structure. The current pattern is:
```tsx
<div className="min-h-screen">
  <Header ... />
  <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-8">
    ...content...
  </div>
</div>
```

Replace with:
```tsx
<div className="relative w-screen h-screen overflow-hidden">
  {/* Map background */}
  <div className="absolute inset-0 z-0">
    <MapContainer
      center={[40.73, -73.99]}
      zoom={13}
      zoomControl={false}
      attributionControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      className="w-full h-full"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
    </MapContainer>
  </div>

  {/* Glass card */}
  <div className="absolute inset-0 z-10 flex items-start justify-center px-4 py-10 overflow-y-auto">
    <div className="w-full max-w-[600px] bg-[rgba(255,255,255,0.15)] backdrop-blur-[24px] backdrop-saturate-[180%] border border-[rgba(255,255,255,0.12)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] px-8 py-10">
      ...content...
    </div>
  </div>
</div>
```

- [ ] **Step 4: Restyle all sub-components**

Apply the glass treatment to each sub-component within the file:

**CourtHeader:**
- Court name: `font-['Lixdu',sans-serif] text-[22px] uppercase tracking-[3px] text-[rgba(255,255,255,0.85)]`
- Address: `font-['Square_Sans_Serif_7',sans-serif] text-[11px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]`
- Price number: `font-['DSEG',monospace] text-[24px] text-[rgba(255,255,255,0.85)]`
- Price suffix: `font-['Square_Sans_Serif_7',sans-serif] text-[10px] text-[rgba(255,255,255,0.4)]`

**TypeBadge, SurfaceBadge, AmenityPill:**
- All: `bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] rounded-full px-3 py-1 font-['Square_Sans_Serif_7',sans-serif] text-[9px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.6)]`

**RatingDisplay:**
- Stars: `text-[#d4a012]`
- Count: `text-[rgba(255,255,255,0.4)]`

**DatePicker:**
- Glass input: `bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-[14px] focus:border-[rgba(255,255,255,0.25)] outline-none`

**SessionRow (each session):**
- Glass sub-card: `bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl p-4`
- Text: white/rgba white variants
- Join button: leather texture `style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}`

**Section headings ("Open Sessions", "Reviews"):**
- `font-['Square_Sans_Serif_7',sans-serif] text-[12px] uppercase tracking-[2px] text-[rgba(255,255,255,0.6)]`

**Dividers:**
- `border-t border-[rgba(255,255,255,0.08)] my-6`

**CTAs:**
- "Create a Game": leather texture button, full class: `w-full text-white rounded-xl px-6 py-3 font-['Square_Sans_Serif_7',sans-serif] text-[12px] uppercase tracking-[2px] hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all` with `style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}`
- "Book Full Court": `bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-white rounded-xl px-6 py-3 font-['Square_Sans_Serif_7',sans-serif] text-[12px] uppercase tracking-[2px] hover:bg-[rgba(255,255,255,0.14)] transition-all`

**ReviewCard (inline restyle):**
- Stars: keep `text-[#d4a012]`
- User/date: `text-[rgba(255,255,255,0.4)]`
- Comment: `text-[rgba(255,255,255,0.7)]`
- Separator: `border-[rgba(255,255,255,0.08)]`

**ReviewForm:**
- Textarea: glass input style
- Submit: leather texture button
- Star selector buttons: glass pills, active = `bg-[rgba(255,255,255,0.15)]`

**Back link (replaces Header):**
- Add at top of glass card: `<Link to="/" className="font-['Square_Sans_Serif_7',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors mb-6 inline-block">← Back</Link>`

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/CourtDetails.tsx
git commit -m "feat: restyle Court Details with map background and glass card"
```

---

### Task 4: Restyle Create Session Page

**Files:**
- Modify: `client/src/pages/CreateSession.tsx`

- [ ] **Step 1: Read the current file**

Read `client/src/pages/CreateSession.tsx`.

- [ ] **Step 2: Add map imports, remove Header, wrap in map+glass layout**

Same pattern as Task 3:
- Add `MapContainer`, `TileLayer` imports and `leaflet/dist/leaflet.css`
- Remove `Header` import
- Wrap in map background + glass card (max-w `500px` since it's a simpler form)
- Add back link at top of card

- [ ] **Step 3: Restyle form components**

**Page title:**
- `font-['Lixdu',sans-serif] text-[20px] uppercase tracking-[2px] text-[rgba(255,255,255,0.85)]`

**Court name subtitle:**
- `font-['Square_Sans_Serif_7',sans-serif] text-[11px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]`

**FormInput (date, time):**
- Label: `font-['Square_Sans_Serif_7',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]`
- Input: `bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-[14px] focus:border-[rgba(255,255,255,0.25)] outline-none`

**SegmentedControl:**
- Container: `bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl p-1 flex`
- Inactive: `text-[rgba(255,255,255,0.5)] font-['Square_Sans_Serif_7',sans-serif] text-[10px] uppercase tracking-[1.5px] px-4 py-2 rounded-lg transition-all`
- Active: `bg-[rgba(255,255,255,0.15)] text-white`
- Label above: `font-['Square_Sans_Serif_7',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]`

**PriceSummary:**
- Container: `bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl p-4`
- Price value: `font-['DSEG',monospace] text-[20px] text-[rgba(255,255,255,0.85)]`
- Labels: `font-['Square_Sans_Serif_7',sans-serif] text-[10px] text-[rgba(255,255,255,0.4)]`

**Submit button:**
- Leather texture: `style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}`
- Class: `w-full text-white rounded-xl px-6 py-3 font-['Square_Sans_Serif_7',sans-serif] text-[12px] uppercase tracking-[2px] hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all disabled:opacity-50`

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/CreateSession.tsx
git commit -m "feat: restyle Create Session with map background and glass card"
```

---

### Task 5: Restyle Session Details Page

**Files:**
- Modify: `client/src/pages/SessionDetails.tsx`

- [ ] **Step 1: Read the current file**

Read `client/src/pages/SessionDetails.tsx`.

- [ ] **Step 2: Add map imports, remove Header, wrap in map+glass layout**

Same pattern as Tasks 3-4. Max-w `600px`. Add back link.

- [ ] **Step 3: Restyle sub-components**

**StatusBadge:**
- Glass pill: `bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] rounded-full px-3 py-1 font-['Square_Sans_Serif_7',sans-serif] text-[9px] uppercase tracking-[1.5px]`
- Text color by status: filling = `text-[rgba(255,200,100,0.8)]`, confirmed = `text-[rgba(100,220,140,0.8)]`, cancelled = `text-[rgba(255,100,100,0.8)]`, completed = `text-[rgba(255,255,255,0.5)]`

**Badge (format/mode):**
- Same glass pill style as StatusBadge with `text-[rgba(255,255,255,0.6)]`

**Court name:**
- `font-['Lixdu',sans-serif] text-[20px] uppercase tracking-[2px] text-[rgba(255,255,255,0.85)]`
- Link: `hover:text-white transition-colors`

**Date/time/duration:**
- `font-['Square_Sans_Serif_7',sans-serif] text-[12px] text-[rgba(255,255,255,0.5)]`

**DeadlineCountdown:**
- `font-['Square_Sans_Serif_7',sans-serif] text-[11px] text-[rgba(255,200,100,0.8)]`

**Section heading ("Players"):**
- `font-['Square_Sans_Serif_7',sans-serif] text-[12px] uppercase tracking-[2px] text-[rgba(255,255,255,0.6)]`

**Player count:**
- `font-['Square_Sans_Serif_7',sans-serif] text-[11px] text-[rgba(255,255,255,0.4)]`

**JoinButton:**
- Leather texture button (same pattern as other CTAs)

**"You're in this game" text:**
- `font-['Square_Sans_Serif_7',sans-serif] text-[12px] text-[rgba(100,220,140,0.8)]`

**Share URL box:**
- `bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl p-4`
- Input inside: glass input style

**Login prompt:**
- `font-['Square_Sans_Serif_7',sans-serif] text-[11px] text-[rgba(255,255,255,0.4)]`
- Link: `text-[rgba(255,255,255,0.7)] hover:text-white`

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/SessionDetails.tsx
git commit -m "feat: restyle Session Details with map background and glass card"
```

---

### Task 6: Restyle Checkout Page with Celebration

**Files:**
- Modify: `client/src/pages/Checkout.tsx`

- [ ] **Step 1: Read the current file**

Read `client/src/pages/Checkout.tsx`.

- [ ] **Step 2: Add map imports, remove Header, wrap in map+glass layout**

Same pattern. Max-w `500px`. Add back link.

- [ ] **Step 3: Restyle checkout form components**

**Page title:**
- `font-['Lixdu',sans-serif] text-[20px] uppercase tracking-[2px] text-[rgba(255,255,255,0.85)]`

**SessionSummary:**
- Container: `bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5`
- Labels (SummaryRow): `font-['Square_Sans_Serif_7',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]`
- Values: `font-['Square_Sans_Serif_7',sans-serif] text-[12px] text-[rgba(255,255,255,0.7)]`

**Payment heading:**
- `font-['Square_Sans_Serif_7',sans-serif] text-[12px] uppercase tracking-[2px] text-[rgba(255,255,255,0.6)]`

**CardInput:**
- Label: `font-['Square_Sans_Serif_7',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]`
- Input: glass input style (same as login)
- Grid: `grid grid-cols-2 gap-3`, card number uses full width

**Pay button:**
- Leather texture, full width
- Text: "Confirm & Pay $X"

**ErrorToast:**
- Keep fixed positioning, update bg to `bg-[rgba(10,10,12,0.85)] backdrop-blur-[24px] border border-[rgba(255,100,100,0.2)]`

- [ ] **Step 4: Replace SuccessCard with celebration screen**

Replace the current `SuccessCard` component with:

```tsx
function SuccessCard({ sessionId, courtName, date, startTime }: {
  sessionId: string;
  courtName: string;
  date: string;
  startTime: string;
}) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      {/* Spinning basketball */}
      <div className="text-[64px] animate-spin-slow mb-6">🏀</div>

      {/* Title */}
      <h2
        className="font-['Square_Sans_Serif_7',sans-serif] text-[18px] uppercase tracking-[4px] text-white animate-fade-in-up"
        style={{ animationDelay: "1.5s" }}
      >
        YOU'RE IN!
      </h2>

      {/* Details */}
      <p
        className="font-['Square_Sans_Serif_7',sans-serif] text-[12px] text-[rgba(255,255,255,0.5)] mt-3 animate-fade-in-up"
        style={{ animationDelay: "2s" }}
      >
        {courtName} · {date} · {startTime}
      </p>

      {/* View session button */}
      <div className="animate-fade-in-up mt-8 w-full" style={{ animationDelay: "2.5s" }}>
        <Link
          to={`/sessions/${sessionId}`}
          className="block w-full text-white text-center rounded-xl px-6 py-3 font-['Square_Sans_Serif_7',sans-serif] text-[12px] uppercase tracking-[2px] hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all no-underline"
          style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          View Session
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/Checkout.tsx
git commit -m "feat: restyle Checkout with map background, glass card, and celebration screen"
```
