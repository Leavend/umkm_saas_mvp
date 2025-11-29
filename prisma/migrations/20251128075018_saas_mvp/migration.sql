-- AlterTable
ALTER TABLE "guest_session" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '7 days');
