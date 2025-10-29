-- Enhance guest session security tokens

ALTER TABLE "guest_session" ADD COLUMN "accessToken" TEXT;
ALTER TABLE "guest_session" ADD COLUMN "sessionSecret" TEXT;
ALTER TABLE "guest_session" ADD COLUMN "fingerprint" TEXT;

UPDATE "guest_session"
SET
  "accessToken" = md5(random()::text || "id"::text),
  "sessionSecret" = md5(random()::text || "id"::text || 'secret'),
  "fingerprint" = md5(random()::text || "id"::text || 'fingerprint')
WHERE "accessToken" IS NULL OR "sessionSecret" IS NULL OR "fingerprint" IS NULL;

ALTER TABLE "guest_session" ALTER COLUMN "accessToken" SET NOT NULL;
ALTER TABLE "guest_session" ALTER COLUMN "sessionSecret" SET NOT NULL;
ALTER TABLE "guest_session" ALTER COLUMN "fingerprint" SET NOT NULL;

CREATE UNIQUE INDEX "guest_session_accessToken_key" ON "guest_session" ("accessToken");
CREATE UNIQUE INDEX "guest_session_fingerprint_key" ON "guest_session" ("fingerprint");
