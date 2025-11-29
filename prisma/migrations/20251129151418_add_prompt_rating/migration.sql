-- AlterTable
ALTER TABLE "guest_session" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '7 days');

-- CreateTable
CREATE TABLE "prompt_rating" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "userId" TEXT,
    "guestSessionId" TEXT,
    "rating" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prompt_rating_promptId_idx" ON "prompt_rating"("promptId");

-- CreateIndex
CREATE INDEX "prompt_rating_userId_idx" ON "prompt_rating"("userId");

-- CreateIndex
CREATE INDEX "prompt_rating_guestSessionId_idx" ON "prompt_rating"("guestSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_rating_promptId_userId_key" ON "prompt_rating"("promptId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_rating_promptId_guestSessionId_key" ON "prompt_rating"("promptId", "guestSessionId");

-- AddForeignKey
ALTER TABLE "prompt_rating" ADD CONSTRAINT "prompt_rating_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_rating" ADD CONSTRAINT "prompt_rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
