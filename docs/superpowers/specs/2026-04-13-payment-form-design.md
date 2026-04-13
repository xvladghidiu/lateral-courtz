# Payment Form — Design Spec

## Overview

Replace the existing "confirm" step in the CreateSession wizard with a payment step that includes both a booking summary and a mock credit card form. The wizard flow stays at 4 steps: **date → options → payment → success**.

This is a UI-only mock — no payment processor integration. The "Pay" button triggers the same `createSession` mutation as the current "Book It" button, with a brief fake processing animation in between.

## Flow Change

**Before:** `["date", "options", "confirm", "success"]`
**After:** `["date", "options", "payment", "success"]`

Step dots remain at 3 (success is excluded, same as current behavior). The `StepConfirm` component is removed and replaced by `StepPayment`.

## Layout

Side-by-side on desktop (within the existing `max-w-[540px]` centered content area):

- **Left panel** — Booking summary using the existing `SummaryRow` component. Shows: court name, date, time, duration, format, type, players. DSEG-styled price at the bottom (`$X / player`).
- **Right panel** — Card form with 4 fields: cardholder name, card number, expiry, CVV. Buttons at the bottom: ghost "Back" + leather-textured "Pay $X" CTA.

On mobile (below `md` breakpoint), stacks vertically: compact summary on top, card form below.

## Card Form Fields

### Cardholder Name
- Free text input
- Placeholder: `"Full name on card"`
- No special formatting

### Card Number
- 16-digit input with auto-formatting: groups of 4 separated by spaces (`4242 4242 4242 4242`)
- Maxlength: 19 characters (16 digits + 3 spaces)
- Card brand detection from first digits:
  - `4xxx` → VISA
  - `5[1-5]xx` → Mastercard
  - `3[47]xx` → AMEX
- Brand label displayed at the right edge of the input
- Validation: Luhn algorithm check, inline red border on invalid

### Expiry
- Auto-formatted as `MM/YY` — slash inserted automatically after 2 digits
- Maxlength: 5 characters
- Validation: month 01-12, not in the past

### CVV
- 3 digits, masked with `type="password"` or bullet characters
- Maxlength: 3

## Styling

All inputs match the existing glass morphism pattern:
- `bg-[rgba(255,255,255,0.04)]`
- `border border-[rgba(255,255,255,0.1)]`
- `rounded-xl` (10px)
- `px-4 py-3`
- `text-[13px] text-white` for values
- `font-['Space_Grotesk',sans-serif]`

Labels use:
- `font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.35)]`

Focus state: `border-[rgba(255,255,255,0.25)]`
Error state: `border-[rgba(255,59,48,0.5)]`

Title: `font-['Lixdu',sans-serif] text-[36px] uppercase tracking-[4px]` — "Payment"
Subtitle: `font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.35)]` — "Complete your booking"

## Buttons

Same pattern as other wizard steps:
- **Back:** `flex-1`, ghost style (`bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)]`), goes to "options" step
- **Pay:** `flex-[2]`, leather texture background (`basketball-leather.jpg`), text reads `"🏀 Pay $X"` where X is the per-player price

## Processing State

When "Pay" is clicked:
1. Button text changes to `"Processing..."` with `disabled` state
2. Brief 1.5s simulated delay (`setTimeout`)
3. Then calls `mutate(input, { onSuccess: () => setStep("success") })` — same as current flow
4. On mutation error, re-enable the button (no simulated delay on retry)

## Validation Behavior

- All 4 fields required — "Pay" button disabled until all pass
- Validation runs on blur for each field
- Card number gets Luhn check
- Expiry checked for valid month and not-in-past
- CVV checked for exactly 3 digits
- Invalid fields show red border, no error text (keeps it clean)

## Components Affected

- **`CreateSession.tsx`** — Remove `StepConfirm`, add `StepPayment`, update `STEPS` array
- **`SummaryRow`** — Already exists, reused as-is in the left panel
- **`formatDisplayDate` / `formatTime`** — Already exist, reused as-is

No new files needed. The `StepPayment` component lives in `CreateSession.tsx` alongside the other step components.

## Mobile Behavior

Below `md` breakpoint:
- Side-by-side becomes `flex-col`
- Left summary panel shows condensed one-line: `"Iulius Park · Thu, Apr 23 · 6:00 PM · 3v3"` with price, instead of full rows
- Card form takes full width below
