import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/**
 * Prisma 7 (Rust-free) client with the better-sqlite3 driver adapter — no binary engines,
 * which makes cPanel/CloudLinux and Fly deployment painless (pure JS + one native dep).
 *
 * Production MySQL switch (3 lines):
 *   1. prisma/schema.prisma  -> datasource provider = "mysql"
 *   2. npm i @prisma/adapter-mariadb
 *   3. Below: new PrismaMariaDb({ ... }) from DATABASE_URL
 */

/**
 * Return the canonical Prisma SQLite URL (`file:<absolute-path>`) that the adapter expects,
 * and make sure the parent directory exists so the driver can never fail to open it.
 * In production we default to the mounted volume DB; in dev to ./prisma/dev.db.
 */
function resolveSqliteUrl(): string {
  const fallback = process.env.NODE_ENV === "production" ? "file:/data/greyfusion.db" : "file:./prisma/dev.db";
  const raw = process.env.DATABASE_URL ?? fallback;
  const bare = raw.replace(/^file:/, "");
  const abs = path.isAbsolute(bare) ? bare : path.join(process.cwd(), bare);
  try {
    fs.mkdirSync(path.dirname(abs), { recursive: true });
  } catch {
    /* directory already exists or is not creatable — the adapter will surface any real error */
  }
  return `file:${abs}`;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: resolveSqliteUrl() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
