#!/bin/sh
set -e

# Seed the Fly volume from the baked snapshot when the database is missing OR empty.
# An un-tabled SQLite file is only a few KB; a properly seeded one is several MB, so a
# size threshold reliably distinguishes "blank/broken" from "real live data".
DB_PATH="${DB_FILE:-/data/greyfusion.db}"
SEED="/app/prisma/seed.db"
MIN_BYTES=65536

mkdir -p "$(dirname "$DB_PATH")"

DB_SIZE=0
[ -f "$DB_PATH" ] && DB_SIZE=$(wc -c < "$DB_PATH" 2>/dev/null || echo 0)

if [ "$DB_SIZE" -lt "$MIN_BYTES" ]; then
  echo "[entrypoint] Database missing or empty ($DB_SIZE bytes) — seeding volume from baked snapshot..."
  cp "$SEED" "$DB_PATH"
  echo "[entrypoint] Seeded $DB_PATH ($(wc -c < "$DB_PATH") bytes)."
else
  echo "[entrypoint] Existing database found at $DB_PATH ($DB_SIZE bytes) — preserving live data."
fi

exec node server.js
