import { PrismaClient } from "@prisma/client";

const g = globalThis as unknown as { prisma?: PrismaClient };

// Poolers (Neon "-pooler" hosts, Supabase, PgBouncer) need pgbouncer mode in Prisma and one connection per serverless instance.
function datasourceUrl() {
  const url = process.env.DATABASE_URL;
  if (!url || !/-pooler\.|pgbouncer|pooler\.supabase/.test(url) || url.includes("pgbouncer=true")) return url;
  const u = new URL(url);
  u.searchParams.set("pgbouncer", "true");
  if (!u.searchParams.has("connection_limit")) u.searchParams.set("connection_limit", "1");
  return u.toString();
}

export const db =
  g.prisma ??
  new PrismaClient({
    datasourceUrl: datasourceUrl(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") g.prisma = db;
