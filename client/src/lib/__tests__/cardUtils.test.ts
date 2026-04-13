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
