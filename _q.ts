import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
async function run() {
  const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: "./prisma/dev.db" }) });
  console.log("vehicles=", await prisma.vehicle.count(), "media=", await prisma.entityMedia.count(), "main=", await prisma.entityMedia.count({ where: { isMain: true } }));
}
run().catch(e => { console.error("ERR:", e.message); process.exit(1); });
