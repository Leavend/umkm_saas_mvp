-- DropIndex
DROP INDEX "public"."project_userId_idx";

-- AlterTable
ALTER TABLE "account" ADD COLUMN     "rawProfile" JSONB;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "account_providerId_idx" ON "account"("providerId");

-- CreateIndex
CREATE INDEX "account_accountId_idx" ON "account"("accountId");

-- CreateIndex
CREATE INDEX "project_name_idx" ON "project"("name");

-- CreateIndex
CREATE INDEX "project_userId_createdAt_idx" ON "project"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "session_expiresAt_idx" ON "session"("expiresAt");
