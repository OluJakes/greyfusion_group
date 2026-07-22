# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Next.js/Prisma"

WORKDIR /app

ENV NODE_ENV="production"

FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp openssl pkg-config python-is-python3

COPY package-lock.json package.json ./
COPY prisma .
RUN npm install --include=dev

RUN npx prisma generate

COPY . .

RUN npx next build --experimental-build-mode compile

RUN npm prune --omit=dev

FROM base

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY --from=build /app/.next/standalone /app
COPY --from=build /app/.next/static /app/.next/static
COPY --from=build /app/public /app/public
COPY --from=build /app/docker-entrypoint.js /app/docker-entrypoint.js
RUN chmod +x /app/docker-entrypoint.js

RUN mkdir -p /data
VOLUME /data

ENTRYPOINT [ "/app/docker-entrypoint.js" ]

EXPOSE 3000
ENV DATABASE_URL="file:///data/sqlite.db"
CMD [ "node", "server.js" ]
