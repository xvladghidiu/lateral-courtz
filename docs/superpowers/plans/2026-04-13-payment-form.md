# Payment Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the confirm step in the CreateSession wizard with a side-by-side payment step that includes a booking summary and mock credit card form.

**Architecture:** Single-file change in `CreateSession.tsx`. The `StepConfirm` component is removed and replaced by `StepPayment`. Card formatting/validation helpers are extracted to a new utility file for testability. No backend changes — the "Pay" button triggers the same `createSession` mutation after a simulated delay.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vitest

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `client/src/lib/cardUtils.ts` | Create | Card formatting (spaces, slash), brand detection, Luhn validation, expiry validation |
| `client/src/lib/__tests__/cardUtils.test.ts` | Create | Unit tests for all card utility functions |
| `client/src/pages/CreateSession.tsx` | Modify | Remove `StepConfirm`, add `StepPayment`, update `STEPS` array |

---

### Task 1: Card Utility Functions — Tests

**Files:**
- Create: `client/src/lib/cardUtils.ts` (empty exports)
- Create: `client/src/lib/__tests__/cardUtils.test.ts`

- [ ] **Step 1: Create empty cardUtils module with type stubs**

```ts
// client/src/lib/cardUtils.ts

export type CardBrand = "visa" | "mastercard" | "amex" | null;

export function formatCardNumber(raw: string): string {
  return raw;
}

export function detectBrand(raw: string): CardBrand {
  return null;
}

export function luhnCheck(raw: string): boolean {
  return false;
}

export function formatExpiry(raw: string): string {
  return raw;
}

export function isExpiryValid(formatted: string): boolean {
  return false;
}

export function isCvvValid(raw: string): boolean {
  return false;
}
```

- [ ] **Step 2: Write failing tests for all functions**

```ts
// client/src/lib/__tests__/cardUtils.test.ts

import { describe, it, expect } from "vitest";
import {
  formatCardNumber,
  detectBrand,
  luhnCheck,
  formatExpiry,
  isExpiryValid,
  isCvvValid,
} from "../cardUtils.js";

describe("formatCardNumber", () => {
  it("inserts spaces every 4 digits", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
  });

  it("strips non-digit characters before formatting", () => {
    expect(formatCardNumber("4242-4242-4242-4242")).toBe("4242 4242 4242 4242");
  });

  it("handles partial input", () => {
    expect(formatCardNumber("424242")).toBe("4242 42");
  });

  it("truncates to 16 digits", () => {
    expect(formatCardNumber("42424242424242429999")).toBe("4242 4242 4242 4242");
  });

  it("returns empty string for empty input", () => {
    expect(formatCardNumber("")).toBe("");
  });
});

describe("detectBrand", () => {
  it("detects Visa (starts with 4)", () => {
    expect(detectBrand("4242")).toBe("visa");
  });

  it("detects Mastercard (starts with 51-55)", () => {
    expect(detectBrand("5100")).toBe("mastercard");
    expect(detectBrand("5500")).toBe("mastercard");
  });

  it("detects Amex (starts with 34 or 37)", () => {
    expect(detectBrand("3400")).toBe("amex");
    expect(detectBrand("3700")).toBe("amex");
  });

  it("returns null for unknown prefix", () => {
    expect(detectBrand("9999")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(detectBrand("")).toBeNull();
  });
});

describe("luhnCheck", () => {
  it("passes for valid Visa test number", () => {
    expect(luhnCheck("4242424242424242")).toBe(true);
  });

  it("passes for valid Mastercard test number", () => {
    expect(luhnCheck("5555555555554444")).toBe(true);
  });

  it("fails for invalid number", () => {
    expect(luhnCheck("1234567890123456")).toBe(false);
  });

  it("fails for too-short input", () => {
    expect(luhnCheck("4242")).toBe(false);
  });

  it("strips spaces before checking", () => {
    expect(luhnCheck("4242 4242 4242 4242")).toBe(true);
  });
});

describe("formatExpiry", () => {
  it("inserts slash after 2 digits", () => {
    expect(formatExpiry("1228")).toBe("12/28");
  });

  it("handles partial input", () => {
    expect(formatExpiry("1")).toBe("1");
    expect(formatExpiry("12")).toBe("12");
  });

  it("strips non-digit characters", () => {
    expect(formatExpiry("12/28")).toBe("12/28");
  });

  it("truncates to 4 digits", () => {
    expect(formatExpiry("122899")).toBe("12/28");
  });
});

describe("isExpiryValid", () => {
  it("accepts a future date", () => {
    expect(isExpiryValid("12/99")).toBe(true);
  });

  it("rejects month 00", () => {
    expect(isExpiryValid("00/28")).toBe(false);
  });

  it("rejects month 13", () => {
    expect(isExpiryValid("13/28")).toBe(false);
  });

  it("rejects past date", () => {
    expect(isExpiryValid("01/20")).toBe(false);
  });

  it("rejects incomplete input", () => {
    expect(isExpiryValid("12")).toBe(false);
    expect(isExpiryValid("")).toBe(false);
  });
});

describe("isCvvValid", () => {
  it("accepts 3 digits", () => {
    expect(isCvvValid("123")).toBe(true);
  });

  it("rejects 2 digits", () => {
    expect(isCvvValid("12")).toBe(false);
  });

  it("rejects 4 digits", () => {
    expect(isCvvValid("1234")).toBe(false);
  });

  it("rejects non-digits", () => {
    expect(isCvvValid("12a")).toBe(false);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd client && npx vitest run src/lib/__tests__/cardUtils.test.ts`
Expected: All tests fail (stub implementations return wrong values).

- [ ] **Step 4: Commit test stubs**

```bash
git add client/src/lib/cardUtils.ts client/src/lib/__tests__/cardUtils.test.ts
git commit -m "test: add card utility tests with stubs"
```

---

### Task 2: Card Utility Functions — Implementation

**Files:**
- Modify: `client/src/lib/cardUtils.ts`

- [ ] **Step 1: Implement all functions**

Replace the contents of `client/src/lib/cardUtils.ts` with:

```ts
export type CardBrand = "visa" | "mastercard" | "amex" | null;

export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function detectBrand(raw: string): CardBrand {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits[0] === "4") return "visa";
  const two = parseInt(digits.slice(0, 2), 10);
  if (two >= 51 && two <= 55) return "mastercard";
  if (two === 34 || two === 37) return "amex";
  return null;
}

export function luhnCheck(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 13) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i]!, 10);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + "/" + digits.slice(2);
}

export function isExpiryValid(formatted: string): boolean {
  const match = formatted.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1]!, 10);
  const year = parseInt(match[2]!, 10) + 2000;
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const expiry = new Date(year, month);
  return expiry > now;
}

export function isCvvValid(raw: string): boolean {
  return /^\d{3}$/.test(raw);
}
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `cd client && npx vitest run src/lib/__tests__/cardUtils.test.ts`
Expected: All 22 tests pass.

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/cardUtils.ts
git commit -m "feat: implement card formatting, brand detection, and validation"
```

---

### Task 3: Replace StepConfirm with StepPayment

**Files:**
- Modify: `client/src/pages/CreateSession.tsx:1-494`

This is the main UI task. We modify `CreateSession.tsx` to:
1. Update the `STEPS` tuple
2. Remove `StepConfirm`
3. Add `StepPayment` with side-by-side layout
4. Wire up the new step in the main component

- [ ] **Step 1: Add import for card utilities**

At the top of `CreateSession.tsx`, add after the existing imports (after line 11):

```ts
import {
  formatCardNumber,
  detectBrand,
  luhnCheck,
  formatExpiry,
  isExpiryValid,
  isCvvValid,
} from "../lib/cardUtils.js";
```

- [ ] **Step 2: Update STEPS array**

Replace line 14:
```ts
const STEPS = ["date", "options", "confirm", "success"] as const;
```
With:
```ts
const STEPS = ["date", "options", "payment", "success"] as const;
```

- [ ] **Step 3: Remove StepConfirm component**

Delete the `StepConfirm` function (lines 233-305 — the entire function including its props and JSX). Keep `SummaryRow`, `formatDisplayDate`, and `formatTime` — they are reused by `StepPayment`.

- [ ] **Step 4: Add StepPayment component**

Insert the following component where `StepConfirm` was (after the `formatTime` function, before `StepSuccess`):

```tsx
function StepPayment({
  courtName,
  date,
  time,
  duration,
  format,
  mode,
  pricePerHour,
  isPending,
  onSubmit,
  onBack,
}: {
  courtName: string;
  date: string;
  time: string;
  duration: number;
  format: SessionFormat;
  mode: SessionMode;
  pricePerHour: number;
  isPending: boolean;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [processing, setProcessing] = useState(false);

  const pricePerPlayer = pricePerHour * (duration / 60);
  const totalPlayers = MAX_PLAYERS[format];
  const brand = detectBrand(cardNumber);

  const cardNumberValid = luhnCheck(cardNumber);
  const expiryValid = isExpiryValid(expiry);
  const cvvValid = isCvvValid(cvv);
  const nameValid = cardName.trim().length > 0;
  const allValid = nameValid && cardNumberValid && expiryValid && cvvValid;

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function inputClass(valid: boolean, field: string): string {
    const base = "w-full bg-[rgba(255,255,255,0.04)] rounded-xl px-4 py-3 text-[13px] text-white font-['Space_Grotesk',sans-serif] outline-none transition-colors placeholder:text-[rgba(255,255,255,0.2)]";
    if (touched[field] && !valid) return `${base} border border-[rgba(255,59,48,0.5)]`;
    return `${base} border border-[rgba(255,255,255,0.1)] focus:border-[rgba(255,255,255,0.25)]`;
  }

  function handlePay() {
    if (!allValid || processing) return;
    setProcessing(true);
    setTimeout(() => {
      onSubmit();
    }, 1500);
  }

  return (
    <div className="animate-fade-in-up" style={{ animationDuration: "0.3s", animationFillMode: "forwards" }}>
      <h2 className="font-['Lixdu',sans-serif] text-[36px] uppercase tracking-[4px] text-white mb-2 text-center">
        Payment
      </h2>
      <p className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.35)] text-center mb-6">
        Complete your booking
      </p>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left: Booking Summary */}
        <div className="hidden md:block flex-1 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl px-5 py-2">
          <SummaryRow label="Court" value={courtName} />
          <SummaryRow label="Date" value={formatDisplayDate(date)} />
          <SummaryRow label="Time" value={formatTime(time)} />
          <SummaryRow label="Duration" value={`${duration} min`} />
          <SummaryRow label="Format" value={format} />
          <SummaryRow label="Type" value={mode === "open" ? "Open Game" : "Full Court"} />
          <SummaryRow label="Players" value={`${totalPlayers}`} />
          <div className="border-t border-[rgba(255,255,255,0.1)] mt-2 pt-3 pb-2 text-center">
            <span className="font-['DSEG',monospace] text-[28px] text-[rgba(255,255,255,0.9)]">${pricePerPlayer}</span>
            <span className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.35)] ml-2">/ player</span>
          </div>
        </div>

        {/* Mobile: compact summary */}
        <div className="md:hidden text-center mb-2">
          <div className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.4)]">
            {courtName} · {formatDisplayDate(date)} · {formatTime(time)} · {format}
          </div>
          <span className="font-['DSEG',monospace] text-[28px] text-[rgba(255,255,255,0.9)]">${pricePerPlayer}</span>
          <span className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.35)] ml-2">/ player</span>
        </div>

        {/* Right: Card Form */}
        <div className="flex-[1.2] flex flex-col gap-2.5">
          {/* Cardholder Name */}
          <div>
            <span className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.35)] mb-1.5 block">
              Cardholder Name
            </span>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              onBlur={() => handleBlur("name")}
              placeholder="Full name on card"
              className={inputClass(nameValid, "name")}
            />
          </div>

          {/* Card Number */}
          <div>
            <span className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.35)] mb-1.5 block">
              Card Number
            </span>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={formatCardNumber(cardNumber)}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                onBlur={() => handleBlur("card")}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                className={inputClass(cardNumberValid, "card")}
              />
              {brand && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1px] text-[rgba(255,255,255,0.3)]">
                  {brand}
                </span>
              )}
            </div>
          </div>

          {/* Expiry + CVV */}
          <div className="flex gap-2.5">
            <div className="flex-1">
              <span className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.35)] mb-1.5 block">
                Expiry
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                onBlur={() => handleBlur("expiry")}
                placeholder="MM/YY"
                maxLength={5}
                className={inputClass(expiryValid, "expiry")}
              />
            </div>
            <div className="flex-1">
              <span className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.35)] mb-1.5 block">
                CVV
              </span>
              <input
                type="password"
                inputMode="numeric"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                onBlur={() => handleBlur("cvv")}
                placeholder="···"
                maxLength={3}
                className={inputClass(cvvValid, "cvv")}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3.5 rounded-xl font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[3px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.12)] hover:text-white transition-all"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handlePay}
              disabled={!allValid || processing}
              className="flex-[2] py-3.5 rounded-xl font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[3px] text-white hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all disabled:opacity-50"
              style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
            >
              {processing ? "Processing..." : `🏀 Pay $${pricePerPlayer}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Update the main component's step rendering**

In the `CreateSession` default export, replace the confirm step rendering block:

Replace:
```tsx
{step === "confirm" && court && (
  <StepConfirm
    courtName={court.name}
    date={date}
    time={startTime}
    duration={duration}
    format={format}
    mode={mode}
    pricePerHour={court.pricePerPlayerPerHour}
    isPending={isPending}
    onSubmit={handleSubmit}
    onBack={() => setStep("options")}
  />
)}
```

With:
```tsx
{step === "payment" && court && (
  <StepPayment
    courtName={court.name}
    date={date}
    time={startTime}
    duration={duration}
    format={format}
    mode={mode}
    pricePerHour={court.pricePerPlayerPerHour}
    isPending={isPending}
    onSubmit={handleSubmit}
    onBack={() => setStep("options")}
  />
)}
```

- [ ] **Step 6: Update the options step's onNext callback**

In the `StepOptions` rendering block, change:
```tsx
onNext={() => setStep("confirm")}
```
To:
```tsx
onNext={() => setStep("payment")}
```

- [ ] **Step 7: Run typecheck**

Run: `cd client && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 8: Commit**

```bash
git add client/src/pages/CreateSession.tsx
git commit -m "feat: replace confirm step with payment form in booking wizard"
```

---

### Task 4: Manual Verification

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Walk through the flow**

1. Navigate to a court and click "Book Full Court"
2. Pick a date/time → Next
3. Pick options → Next
4. Verify payment step renders with:
   - Side-by-side layout on desktop (summary left, card form right)
   - Lixdu "PAYMENT" title and subtitle
   - All 4 fields present with correct placeholders
   - Brand detection shows "VISA" when typing `4242...`
   - Expiry auto-formats with slash
   - CVV is masked
   - "Pay" button disabled until all fields valid
   - "Back" returns to options
5. Fill in valid card details, click Pay
6. Verify "Processing..." state shows for ~1.5s
7. Verify success screen appears
8. On mobile viewport: verify stacked layout with compact summary

- [ ] **Step 3: Run all tests**

Run: `cd client && npx vitest run`
Expected: All tests pass (card utils + existing rating distribution tests).

- [ ] **Step 4: Final commit if any tweaks were needed**

```bash
git add -A
git commit -m "fix: address payment form polish from manual testing"
```

Skip this step if no changes were needed.
