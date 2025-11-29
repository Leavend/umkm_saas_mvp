// Unit tests for lib/errors.ts
import { describe, it, expect } from "vitest";
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  InsufficientCreditsError,
} from "~/lib/errors";

describe("errors", () => {
  describe("ValidationError", () => {
    it("should create error with field and value", () => {
      const error = new ValidationError("Invalid email", "email", "test@");

      expect(error.message).toBe("Invalid email");
      expect(error.name).toBe("ValidationError");
      expect(error.field).toBe("email");
      expect(error.value).toBe("test@");
    });

    it("should be instanceof Error", () => {
      const error = new ValidationError("Test", "field", "value");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  describe("NotFoundError", () => {
    it("should create error with resource details", () => {
      const error = new NotFoundError("User not found", "user", "123");

      // NotFoundError auto-formats message
      expect(error.message).toBe("user with id '123' was not found");
      expect(error.name).toBe("NotFoundError");
      expect(error.resource).toBe("user");
      expect(error.id).toBe("123");
    });
  });

  describe("UnauthorizedError", () => {
    it("should create unauthorized error", () => {
      const error = new UnauthorizedError("Access denied");

      expect(error.message).toBe("Access denied");
      expect(error.name).toBe("UnauthorizedError");
    });

    it("should accept additional context", () => {
      const error = new UnauthorizedError("No permission", { userId: "123" });

      // UnauthorizedError adds timestamp and operation
      expect(error.context).toHaveProperty("userId", "123");
      expect(error.context).toHaveProperty("timestamp");
      expect(error.context).toHaveProperty("operation");
    });
  });

  describe("InsufficientCreditsError", () => {
    it("should create error with credit details", () => {
      const error = new InsufficientCreditsError(
        "Not enough credits",
        100,
        50,
        { userId: "123" },
      );

      // InsufficientCreditsError auto-formats message
      expect(error.message).toBe("Requires 100 credits, but only 50 available");
      expect(error.name).toBe("InsufficientCreditsError");
      expect(error.required).toBe(100);
      expect(error.available).toBe(50);
      expect(error.context).toHaveProperty("userId", "123");
    });

    it("should format message with credit amounts", () => {
      const error = new InsufficientCreditsError("Custom message", 100, 50);

      // Uses auto-formatted message
      expect(error.message).toBe("Requires 100 credits, but only 50 available");
    });
  });
});
