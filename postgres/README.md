# PostgreSQL setup for ProExergy app

This directory is a preparation guide for moving the application database from the current local SQLite configuration to PostgreSQL for VPS or team-managed deployment.

## Current app state

The app is currently configured for SQLite in:

- [prisma/schema.prisma](../prisma/schema.prisma)
- [src/lib/prisma.ts](../src/lib/prisma.ts)

The database currently points to a file-based database, which is fine for local development but not the safest choice for production or multi-instance deployment.

## Recommended production database

Use PostgreSQL on a managed or dedicated VPS-hosted instance.

Reasons:
- safer for production data
- easier backup and restore
- better concurrency and scaling
- more predictable migration management

## Important operational note

This repo has not been used to delete, reset, or rewrite any live database. A destructive change like clearing a production database should only happen after:

1. verifying the database backup
2. confirming the target environment
3. checking the app schema and data usage
4. communicating the plan to the dev team

## Required environment variables

Set these in the application environment before switching to PostgreSQL:

```bash
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE_NAME?sslmode=require"
```

Use a secure connection policy. If the PostgreSQL host is only reachable inside a private network, keep this behind Traefik, a VPN, or an internal network layer.

## Prisma migration plan

1. Change the Prisma datasource from SQLite to PostgreSQL.
2. Update the app to use the Postgres connection string.
3. Generate Prisma client and validate the schema.
4. Run schema sync or migration commands in a safe environment.
5. Import the backup or seed data only after verification.

## Migration steps

Example commands:

```bash
npx prisma generate
npx prisma db push
```

For a controlled production deployment, prefer a migration flow such as:

```bash
npx prisma migrate deploy
```

Do not use `--accept-data-loss` on a live shared database unless the team has already confirmed the backup and rollback plan.

## Backup recommendation

Use `pg_dump` to create regular backups.

Example backup command:

```bash
pg_dump "$DATABASE_URL" > backup-$(date +%F-%H%M%S).sql
```

A full backup script is included in [backup.sh](./backup.sh).

## Security recommendation

- restrict DB access to the VPS or trusted network
- do not expose the PostgreSQL port publicly unless necessary
- prefer TLS or a private network tunnel for remote access
- keep secrets in environment variables or a secrets manager

## Team implementation checklist

- [ ] create PostgreSQL database and user
- [ ] create application env file with secure DATABASE_URL
- [ ] update Prisma datasource provider
- [ ] run Prisma generate
- [ ] migrate or push schema
- [ ] verify app can read and write data
- [ ] back up the production database
- [ ] document rollback process

## References

- [schema.sql](./schema.sql)
- [migration-plan.md](./migration-plan.md)
- [backup.sh](./backup.sh)
- [.env.example](./.env.example)
