#!/usr/bin/env bash
set -euo pipefail

: "${PGHOST:?Set PGHOST before running this script}"
: "${PGUSER:?Set PGUSER before running this script}"
: "${PGDATABASE:?Set PGDATABASE before running this script}"
: "${BACKUP_DIR:=./backups}"

mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date +%F-%H%M%S)"
BACKUP_FILE="$BACKUP_DIR/${PGDATABASE}-${TIMESTAMP}.sql"

export PGPASSWORD="${PGPASSWORD:-}"

if [ -z "${PGPASSWORD:-}" ]; then
  echo "PGPASSWORD is not set. Export it or set it in the environment before running this script."
  exit 1
fi

pg_dump \
  --host="$PGHOST" \
  --port="${PGPORT:-5432}" \
  --username="$PGUSER" \
  --dbname="$PGDATABASE" \
  --clean \
  --if-exists \
  --format=plain \
  --file="$BACKUP_FILE"

echo "Database backup saved to: $BACKUP_FILE"
