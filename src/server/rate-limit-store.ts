import { lt, sql } from "drizzle-orm";
import { dbError } from "@/lib/errors";
import { err, ok, type Result } from "@/lib/result";
import { db } from "@/server/db/client";
import { rateLimits } from "@/server/db/schema";
import type { RateLimitStore } from "@/server/rate-limit";

/** Returns true for connection-level errors that may resolve after a Neon cold-start wakeup. */
function isConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as NodeJS.ErrnoException).code;
  return (
    code === "ETIMEDOUT" ||
    code === "ECONNREFUSED" ||
    code === "ECONNRESET" ||
    error.message.includes("connect") ||
    error.message.includes("timeout")
  );
}

/** Waits `ms` milliseconds. */
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Rate-limit counters in Postgres: one upsert per hit, resetting the window when it has passed. */
export const dbRateLimitStore: RateLimitStore = {
  async increment(key, windowSeconds, now) {
    // ISO strings with an explicit cast: Date objects inside a raw sql template are not serialized for Postgres.
    const cutoff = sql`${new Date(now.getTime() - windowSeconds * 1000).toISOString()}::timestamptz`;
    const start = sql`${now.toISOString()}::timestamptz`;

    const attempt = async () =>
      db
        .insert(rateLimits)
        .values({ key, windowStart: now, count: 1 })
        .onConflictDoUpdate({
          target: rateLimits.key,
          set: {
            count: sql`case when ${rateLimits.windowStart} <= ${cutoff} then 1 else ${rateLimits.count} + 1 end`,
            windowStart: sql`case when ${rateLimits.windowStart} <= ${cutoff} then ${start} else ${rateLimits.windowStart} end`,
          },
        })
        .returning({ count: rateLimits.count, windowStart: rateLimits.windowStart });

    try {
      const [row] = await attempt();
      return ok(row);
    } catch (firstError) {
      // On a connection error (e.g. Neon compute waking from suspend), wait
      // briefly and try once more before giving up.
      if (isConnectionError(firstError)) {
        await wait(2000);
        try {
          const [row] = await attempt();
          return ok(row);
        } catch (retryError) {
          return err(dbError(retryError));
        }
      }
      return err(dbError(firstError));
    }
  },
};

/** Deletes counters whose window started before `before`. Used by the daily cleanup. */
export async function deleteRateLimitsBefore(before: Date): Promise<Result<number>> {
  try {
    const deleted = await db
      .delete(rateLimits)
      .where(lt(rateLimits.windowStart, before))
      .returning({ key: rateLimits.key });
    return ok(deleted.length);
  } catch (error) {
    return err(dbError(error));
  }
}
