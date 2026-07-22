# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Next.js/Prisma"

WORKDIR /app

ENV NODE_ENV="production"

FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp openssl pkg-config python-is-python3

# Copy package files and configuration files first
COPY package.json package-lock.json prisma.config.js ./

# Copy the prisma folder containing your schema and migrations
COPY prisma ./prisma

# Install dependencies without running scripts automatically
RUN npm install --include=dev --legacy-peer-deps --ignore-scripts

# Now run prisma generate explicitly with the config in place
RUN npx prisma generate

COPY . .

RUN npx next build --experimental-build-mode compile

RUN DATABASE_URL="file:/app/prisma/seed.db" npx prisma db push --accept-data-loss
RUN DATABASE_URL="file:/app/prisma/seed.db" npm run db:seed || true

RUN npm prune --omit=dev

FROM base

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY --from=build /app/.next/standalone /app
COPY --from=build /app/.next/static /app/.next/static
COPY --from=build /app/public /app/public
COPY --from=build /app/docker-entrypoint.js /app/docker-entrypoint.js

# Copy Prisma schema, migrations, and config for runtime migrations
COPY --from=build /app/prisma /app/prisma
COPY --from=build /app/prisma.config.js /app/prisma.config.js

RUN chmod +x /app/docker-entrypoint.js

RUN mkdir -p /app/data
VOLUME /app/data

ENTRYPOINT [ "/app/docker-entrypoint.js" ]

EXPOSE 3000
ENV DATABASE_URL="file:/app/data/sqlite.db"
ENV PORT="3000"
ENV HOSTNAME="0.0.0.0"
CMD [ "node", "server.js" ]