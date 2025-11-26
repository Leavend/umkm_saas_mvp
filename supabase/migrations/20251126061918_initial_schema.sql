/*
  # Initial Database Schema

  1. New Tables
    - `user` - User accounts with authentication data
      - `id` (cuid, primary key)
      - `name` (text, optional)
      - `email` (text, unique, required)
      - `emailVerified` (timestamp, optional)
      - `image` (text, optional)
      - `role` (enum: USER/ADMIN, default: USER)
      - `credits` (integer, default: 10)
      - `lastDailyCreditAt` (timestamp, optional)
      - `createdAt` (timestamp, default: now)
      - `updatedAt` (timestamp, auto-update)
    
    - `account` - OAuth accounts linked to users
      - `id` (cuid, primary key)
      - `userId` (foreign key to user)
      - `type`, `provider`, `providerAccountId`
      - OAuth tokens and session data
    
    - `session` - NextAuth sessions
      - `id` (cuid, primary key)
      - `sessionToken` (unique)
      - `userId` (foreign key to user)
      - `expires` (timestamp)
    
    - `verification_token` - Email verification tokens
      - `identifier`, `token`, `expires`
    
    - `guest_session` - Anonymous guest sessions
      - `id` (cuid, primary key)
      - `accessToken`, `sessionSecret`, `fingerprint`
      - `credits` (integer, default: 10)
      - `ipAddress`, `userAgent`
      - `expiresAt` (default: 7 days from now)
    
    - `prompt` - AI prompts marketplace content
      - `id` (cuid, primary key)
      - `title`, `text`, `imageUrl`, `category`
      - `createdAt`, `updatedAt`

  2. Security
    - No RLS needed for auth tables (managed by NextAuth)
    - No RLS needed for prompt table (public read access)

  3. Indexes
    - User email for fast lookups
    - Account userId for joins
    - Session userId for joins
    - Prompt category and createdAt for filtering
*/

-- Create enum for user roles
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- User table
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  role "UserRole" NOT NULL DEFAULT 'USER',
  credits INTEGER NOT NULL DEFAULT 10,
  "lastDailyCreditAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Account table
CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE,
  UNIQUE (provider, "providerAccountId")
);

CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account"("userId");

-- Session table
CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session"("userId");

-- Verification token table
CREATE TABLE IF NOT EXISTS "verification_token" (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  UNIQUE (identifier, token)
);

-- Guest session table
CREATE TABLE IF NOT EXISTS "guest_session" (
  id TEXT PRIMARY KEY,
  "accessToken" TEXT UNIQUE NOT NULL,
  "sessionSecret" TEXT NOT NULL,
  fingerprint TEXT UNIQUE NOT NULL,
  credits INTEGER NOT NULL DEFAULT 10,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "expiresAt" TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  "lastDailyCreditAt" TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS "guest_session_expiresAt_idx" ON "guest_session"("expiresAt");

-- Prompt table
CREATE TABLE IF NOT EXISTS "prompt" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  category TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "prompt_category_idx" ON "prompt"(category);
CREATE INDEX IF NOT EXISTS "prompt_createdAt_idx" ON "prompt"("createdAt" DESC);

-- Set admin role for tiohadybayu@gmail.com (will be applied when user first logs in)
-- This is a safe operation that won't fail if user doesn't exist yet
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "user" WHERE email = 'tiohadybayu@gmail.com') THEN
    UPDATE "user" SET role = 'ADMIN' WHERE email = 'tiohadybayu@gmail.com';
  END IF;
END $$;
