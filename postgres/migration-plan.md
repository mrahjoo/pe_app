# PostgreSQL migration plan

## Goal

Move this application from SQLite to PostgreSQL in a way that is safe, predictable, and easy for the dev team to implement later.

## Current schema summary

The existing Prisma schema defines these models:

- Conversation
- Message

The app stores chat metadata and message content in the database.

## Proposed database model

Use the same Prisma model structure and let Prisma generate the PostgreSQL schema.

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Conversation {
  id        String   @id @default(cuid())
  userId    String
  title     String   @default("New Chat")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  messages  Message[]
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  role           String
  content        String
  parts          String?
  createdAt      DateTime     @default(now())

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}
```

## Implementation steps

1. Create a PostgreSQL database and role on the VPS or managed PostgreSQL service.
2. Create a secure connection string in the app environment.
3. Replace the Prisma datasource provider from `sqlite` to `postgresql`.
4. Update the DB URL in `.env` or deployment secrets.
5. Run:

```bash
npx prisma generate
npx prisma db push
```

6. Validate that the app can create and read conversations and messages.
7. Import any existing data only after verifying the schema matches the app logic.

## Safety checklist

- [ ] take a backup before any schema change
- [ ] verify the target DB is the correct server
- [ ] confirm the app has permission to create tables and indexes
- [ ] test in staging before production replacement
- [ ] keep a rollback plan for schema and data

## Production guidance

- keep the DB on a stable host or managed service
- do not run writes against a shared demo database
- prefer TLS or private networking for remote access
- schedule automated database backups

## Rollback strategy

If anything breaks:

1. restore the database from the latest backup
2. revert the application env values
3. switch Prisma back to the previous datasource config
4. redeploy the app version tied to the backup

## Data import

For a later import from SQLite or another source, validate the following before switching production traffic:

- user IDs remain consistent
- conversation IDs are unique
- message ordering is preserved where required
- `conversationId` foreign keys are valid

This app does not appear to require a complex reporting schema, so the migration should stay straightforward if the existing data model remains stable.
