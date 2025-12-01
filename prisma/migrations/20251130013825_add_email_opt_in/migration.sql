-- AlterTable
ALTER TABLE "guest_session" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '7 days');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "emailOptIn" BOOLEAN NOT NULL DEFAULT false;
