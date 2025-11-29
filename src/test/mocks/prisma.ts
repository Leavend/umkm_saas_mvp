// Mock Prisma client for testing

import { vi } from "vitest";
import { PrismaClient } from "@prisma/client";

// Create a mock Prisma client
export const mockPrismaClient = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  guestSession: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  prompt: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  savedPrompt: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn((callback) => callback(mockPrismaClient)),
  $queryRaw: vi.fn(),
} as unknown as PrismaClient;

// Reset all mocks
export function resetMocks() {
  Object.values(mockPrismaClient).forEach((model: any) => {
    if (model && typeof model === "object") {
      Object.values(model).forEach((fn: any) => {
        if (fn && typeof fn.mockReset === "function") {
          fn.mockReset();
        }
      });
    }
  });
}
