-- AlterTable
ALTER TABLE "project" ADD COLUMN     "guestSessionId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "guest_session" (
    "id" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 10,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (now() + interval '7 days'),
    "lastDailyCreditAt" TIMESTAMP(3),

    CONSTRAINT "guest_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "guest_session_expiresAt_idx" ON "guest_session"("expiresAt");

-- CreateIndex
CREATE INDEX "project_guestSessionId_createdAt_idx" ON "project"("guestSessionId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_guestSessionId_fkey" FOREIGN KEY ("guestSessionId") REFERENCES "guest_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
