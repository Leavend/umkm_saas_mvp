/*
  Warnings:

  - A unique constraint covering the columns `[sequenceNumber]` on the table `prompt` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "guest_session" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '7 days');

-- AlterTable
ALTER TABLE "prompt" ADD COLUMN     "sequenceNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "prompt_sequenceNumber_key" ON "prompt"("sequenceNumber");
