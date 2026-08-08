#!/bin/sh
set -e

export DATABASE_URL="${DATABASE_URL:-file:/data/greyfusion.db}"

# Resolve the on-disk path from the file: URL and ensure its directory exists.
DB_PATH=$(printf '%s' "$DATABASE_URL" | sed 's/^file://')
mkdir -p "$(dirname "$DB_PATH")"

echo "[entrypoint] DATABASE_URL=$DATABASE_URL"
echo "[entrypoint] DB_PATH=$DB_PATH"

# Count seeded admin users. AdminUser is populated at the very end of the seed, so a
# non-zero count means the schema exists AND the seed ran to completion. Zero (or a
# missing table) means we must (re)apply the schema + seed to the volume database.
SEED_ROWS=$(node -e "try{const D=require('better-sqlite3');const db=new D(process.argv[1]);let n=0;try{n=db.prepare('SELECT COUNT(*) AS c FROM AdminUser').get().c}catch(e){}db.close();process.stdout.write(String(n))}catch(e){process.stdout.write('0')}" "$DB_PATH" 2>/dev/null || printf '0')

if [ "$SEED_ROWS" = "0" ]; then
  echo "[entrypoint] Volume database empty/incomplete - applying schema + seed to $DB_PATH ..."
  npx prisma db push --accept-data-loss
  npm run db:seed
  echo "[entrypoint] Database seeded."
else
  echo "[entrypoint] Database ready ($SEED_ROWS admin users) - preserving live data."
fi

exec npm run start
