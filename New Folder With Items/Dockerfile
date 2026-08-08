# syntax=docker/dockerfile:1

########################  BUILD STAGE  ########################
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Toolchain required to compile the better-sqlite3 native addon.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Install ALL dependencies (including dev: prisma CLI, tsx, typescript, next).
# These are carried into the runner so the volume DB can be created + seeded at boot.
COPY package.json package-lock.json* ./
# The postinstall hook runs `prisma generate`, which needs the schema + config present
# BEFORE dependencies finish installing — copy them first.
COPY prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci --include=dev

# Application source.
COPY . .

# public/ can be empty and get dropped from the build context.
RUN mkdir -p public

# Generate the Rust-free Prisma client (prisma-client generator -> src/generated/prisma).
RUN npx prisma generate

# ISR / prerendered pages read Prisma during `next build`, so stand up a THROWAWAY
# database just for the build, then delete it so it can never be mistaken for the
# runtime database on the volume.
ENV DATABASE_URL="file:/app/build.db"
RUN npx prisma db push --accept-data-loss \
 && npm run db:seed \
 && npm run build \
 && rm -f /app/build.db /app/build.db-wal /app/build.db-shm

########################  RUNNER STAGE  ########################
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# Default to the mounted Fly volume; fly.toml [env] can override.
ENV DATABASE_URL="file:/data/greyfusion.db"

# Copy the FULL built app: node_modules (compiled better-sqlite3, prisma CLI, tsx),
# .next, src, prisma schema + seed, generated client, and the entrypoint.
COPY --from=build /app ./

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

# The entrypoint creates the schema + seed directly inside the volume database on first
# boot, then starts Next.js. No database file is ever copied, so a "table does not exist"
# error is impossible.
CMD ["./docker-entrypoint.sh"]
