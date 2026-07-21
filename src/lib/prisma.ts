import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/**
 * Prisma 7 (Rust-free) client with driver adapter — no binary engines, which makes
 * cPanel/CloudLinux shared-hosting deployment painless (pure JS + one native sqlite dep).
 *
 * Production MySQL switch (3 lines):
 *   1. prisma/schema.prisma  -> datasource provider = "mysql"
 *   2. npm i @prisma/adapter-mariadb
 *   3. Below: new PrismaMariaDb({ connectionLimit: 3, ... }) from DATABASE_URL
 *      (keep ?connection_limit=3&pool_timeout=20 semantics for shared hosting)
 */

function resolveSqlitePath(): string {
  const raw = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const p = raw.replace(/^file:/, "");
  return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: resolveSqlitePath() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
