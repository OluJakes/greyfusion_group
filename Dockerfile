# syntax=docker/dockerfile:1
# Greyfusion — production image for Fly.io with a persistent SQLite volume.
# A fully-seeded database is baked at build time; the entrypoint copies it onto the
# mounted volume only if the volume is empty, so live data survives deploys.

FROM node:22-slim AS base
WORKDIR /app
RUN apt-get update -qq \
 && apt-get install -y --no-install-recommends openssl ca-certificates python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

# ---------- build: install deps, build Next, bake a seeded DB ----------
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
# Copy manifests + prisma first so postinstall (`prisma generate`) has the schema.
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm install --include=dev --legacy-peer-deps
# App source, then regenerate the client against the schema and build.
COPY . .
RUN npx prisma generate
RUN npm run build
# Bake a seeded SQLite snapshot into the image (offline seed — no network needed).
RUN DATABASE_URL="file:/app/prisma/seed.db" npx prisma db push --skip-generate --accept-data-loss \
 && DATABASE_URL="file:/app/prisma/seed.db" npm run db:seed

# ---------- runner: minimal standalone server + baked DB ----------
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
# Next standalone output (includes traced node_modules incl. better-sqlite3).
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# Safety net: ensure the native SQLite driver + adapter are present at runtime
# (Next traces them via serverComponentsExternalPackages; this guarantees it).
COPY --from=build /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=build /app/node_modules/@prisma/adapter-better-sqlite3 ./node_modules/@prisma/adapter-better-sqlite3
# The baked, seeded database + the first-boot bootstrap script.
COPY --from=build /app/prisma/seed.db ./prisma/seed.db
COPY --from=build /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh
EXPOSE 3000
CMD ["./docker-entrypoint.sh"]
