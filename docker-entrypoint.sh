#!/bin/sh
set -e

# On first boot the Fly volume at /data is empty — seed it from the baked snapshot.
# On later boots the existing database (with all live data) is left untouched.
DB_PATH="${DB_FILE:-/data/greyfusion.db}"

if [ ! -f "$DB_PATH" ]; then
  echo "[entrypoint] No database on volume — bootstrapping from baked seed snapshot..."
  mkdir -p "$(dirname "$DB_PATH")"
  cp /app/prisma/seed.db "$DB_PATH"
  echo "[entrypoint] Database initialised at $DB_PATH"
else
  echo "[entrypoint] Existing database found at $DB_PATH — preserving live data."
fi

exec node server.js
