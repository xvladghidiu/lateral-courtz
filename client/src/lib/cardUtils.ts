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
