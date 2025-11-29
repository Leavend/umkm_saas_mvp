-- AlterTable
ALTER TABLE "guest_session" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '7 days');

-- CreateTable
CREATE TABLE "prompt_request" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "userId" TEXT,
    "guestSessionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prompt_request_userId_idx" ON "prompt_request"("userId");

-- CreateIndex
CREATE INDEX "prompt_request_guestSessionId_idx" ON "prompt_request"("guestSessionId");

-- CreateIndex
CREATE INDEX "prompt_request_status_idx" ON "prompt_request"("status");

-- CreateIndex
CREATE INDEX "prompt_request_createdAt_idx" ON "prompt_request"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "prompt_request" ADD CONSTRAINT "prompt_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
