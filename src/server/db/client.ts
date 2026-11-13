import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/config/env";
import * as schema from "@/server/db/schema";

// Reuse one pool across hot reloads in development.
const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

/**
 * postgres.js connects lazily, so importing this module never touches the
 * network. `prepare: false` keeps it compatible with transaction-mode poolers
 * such as Neon's pooled connection string.
 */
const sql =
  globalForDb.sql ??
  postgres(env.DATABASE_URL, {
    max: 10,
    prepare: false,
    idle_timeout: 20,
    // Neon free-tier computes suspend after inactivity and need a few seconds
    // to wake. A short connect_timeout lets us detect that fast and retry
    // instead of hanging for 20+ seconds until the OS TCP timeout fires.
    connect_timeout: 10,
  });
if (env.NODE_ENV !== "production") globalForDb.sql = sql;

/** The Drizzle client. Only repositories import it. */
export const db = drizzle(sql, { schema });
