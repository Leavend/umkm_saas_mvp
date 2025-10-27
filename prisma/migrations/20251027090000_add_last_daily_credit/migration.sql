-- Add lastDailyCreditAt column to track daily credit grants per user
ALTER TABLE "user"
ADD COLUMN "lastDailyCreditAt" TIMESTAMP(3);
