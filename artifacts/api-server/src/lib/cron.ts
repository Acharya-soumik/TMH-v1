/**
 * Scheduled jobs.
 *
 * Friday 9am Asia/Dubai → generate + push the weekly newsletter digest to
 * Beehiiv as a draft. Founder reviews + sends from Beehiiv UI.
 *
 * Multi-replica safety: a Postgres advisory lock guards the job so only one
 * replica fires it per scheduled tick. If we ever scale past one Railway
 * service replica, this prevents double-pushing the digest.
 *
 * Disabled by default — set DIGEST_CRON_ENABLED=true on prod only.
 */

import cron from "node-cron"
import { pool } from "@workspace/db"
import { generateAndPushDigest } from "../services/newsletter-digest.js"

const DIGEST_LOCK_KEY = 1985_03_04 // arbitrary stable bigint for the digest job

export function initCron(): void {
  if (process.env.DIGEST_CRON_ENABLED !== "true") {
    console.log("[cron] DIGEST_CRON_ENABLED != 'true' — skipping cron registration")
    return
  }

  // Friday 9am Asia/Dubai
  cron.schedule(
    "0 9 * * 5",
    () => {
      void runDigestJobWithLock().catch((err) => {
        console.error("[cron/digest] unhandled error:", err)
      })
    },
    { timezone: "Asia/Dubai" },
  )

  console.log("[cron] Registered: digest job (Friday 9am Asia/Dubai)")
}

async function runDigestJobWithLock(): Promise<void> {
  const client = await pool.connect()
  try {
    const lockRes = await client.query("SELECT pg_try_advisory_lock($1) AS acquired", [
      DIGEST_LOCK_KEY,
    ])
    const acquired = lockRes.rows?.[0]?.acquired === true
    if (!acquired) {
      console.log("[cron/digest] Lock not acquired (another replica handled it) — skipping")
      return
    }
    console.log("[cron/digest] Starting weekly digest job…")
    const result = await generateAndPushDigest(new Date())
    console.log("[cron/digest] Done:", result)
  } catch (err) {
    console.error("[cron/digest] Job error:", err)
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock($1)", [DIGEST_LOCK_KEY])
    } catch {
      // ignore
    }
    client.release()
  }
}
