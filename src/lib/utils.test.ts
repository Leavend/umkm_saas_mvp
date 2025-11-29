// Unit tests for lib/utils.ts
import { describe, it, expect } from "vitest";
import {
  cn,
  isValidEmail,
  isValidCreditAmount,
  formatCurrency,
  formatDate,
  formatDateShort,
  extractErrorMessage,
  isEmpty,
  sleep,
  safeJsonParse,
} from "~/lib/utils";

describe("utils", () => {
  describe("cn (className merger)", () => {
    it("should merge class names", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
      expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    });

    it("should resolve Tailwind conflicts", () => {
      expect(cn("px-2", "px-4")).toBe("px-4");
    });
  });

  describe("isValidEmail", () => {
    it("should validate correct email", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
    });

    it("should reject invalid email", () => {
      expect(isValidEmail("invalid-email")).toBe(false);
      expect(isValidEmail("test@")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
    });

    it("should handle non-string input", () => {
      expect(isValidEmail(123 as any)).toBe(false);
      expect(isValidEmail(null as any)).toBe(false);
    });
  });

  describe("isValidCreditAmount", () => {
    it("should validate positive integers", () => {
      expect(isValidCreditAmount(10)).toBe(true);
      expect(isValidCreditAmount(100)).toBe(true);
    });

    it("should reject invalid amounts", () => {
      expect(isValidCreditAmount(-1)).toBe(false);
      expect(isValidCreditAmount(0)).toBe(false);
      expect(isValidCreditAmount(1.5)).toBe(false);
      expect(isValidCreditAmount("10" as any)).toBe(false);
    });

    it("should enforce max limit", () => {
      expect(isValidCreditAmount(1000000000)).toBe(false);
    });
  });

  describe("formatCurrency", () => {
    it("should format IDR currency", () => {
      expect(formatCurrency(29000)).toBe("Rp\u00a029.000");
    });

    it("should format USD currency", () => {
      expect(formatCurrency(29, "en-US", "USD")).toBe("$29");
    });

    it("should handle zero", () => {
      expect(formatCurrency(0)).toBe("Rp\u00a00");
    });
  });

  describe("formatDate", () => {
    it("should format date in en-US", () => {
      const date = new Date("2025-01-15");
      const formatted = formatDate(date, "en-US");
      expect(formatted).toContain("January");
      expect(formatted).toContain("15");
    });
  });

  describe("formatDateShort", () => {
    it("should format date in short format", () => {
      const date = new Date("2025-01-15");
      const formatted = formatDateShort(date, "en-US");
      expect(formatted).toContain("Jan");
      expect(formatted).toContain("15");
    });
  });

  describe("extractErrorMessage", () => {
    it("should extract Error message", () => {
      const error = new Error("Test error");
      expect(extractErrorMessage(error)).toBe("Test error");
    });

    it("should handle string errors", () => {
      expect(extractErrorMessage("String error")).toBe("String error");
    });

    it("should handle unknown errors", () => {
      expect(extractErrorMessage({ foo: "bar" })).toContain("foo");
    });
  });

  describe("isEmpty", () => {
    it("should detect empty values", () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty("")).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it("should detect non-empty values", () => {
      expect(isEmpty("text")).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ key: "value" })).toBe(false);
      expect(isEmpty(0)).toBe(false);
    });
  });

  describe("safeJsonParse", () => {
    it("should parse valid JSON", () => {
      expect(safeJsonParse('{"key":"value"}', {})).toEqual({ key: "value" });
    });

    it("should return fallback on invalid JSON", () => {
      expect(safeJsonParse("invalid", { default: true })).toEqual({
        default: true,
      });
    });
  });

  describe("sleep", () => {
    it("should delay execution", async () => {
      const start = Date.now();
      await sleep(100);
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(90);
    });
  });
});
