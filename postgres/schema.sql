-- PostgreSQL schema for this application.
-- This is a reference schema based on the current Prisma model structure.
-- It should be generated and validated with Prisma rather than used as the only source of truth.

CREATE TABLE IF NOT EXISTS "Conversation" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT 'New Chat',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Message" (
  "id" TEXT PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "parts" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Message_conversationId_fkey"
    FOREIGN KEY ("conversationId")
    REFERENCES "Conversation"("id")
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Message_conversationId_idx"
  ON "Message" ("conversationId");

CREATE INDEX IF NOT EXISTS "Conversation_userId_idx"
  ON "Conversation" ("userId");
