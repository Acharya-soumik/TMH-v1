import { Router } from "express"
import { db, newsletterSubscribersTable } from "@workspace/db"

const router = Router()

router.post("/newsletter/subscribe", async (req, res) => {
  try {
    const { email, source = "homepage" } = req.body
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Valid email required" })
    }
    await db.insert(newsletterSubscribersTable).values({
      email: email.toLowerCase().trim(),
      source,
    }).onConflictDoNothing()
    console.log(`[NEWSLETTER] Subscriber added: ${email} (source: ${source})`)
    return res.json({ success: true })
  } catch (err) {
    console.error(err)
    return res.json({ success: true })
  }
})

router.get("/newsletter/count", async (_req, res) => {
  try {
    const { sql } = await import("drizzle-orm")
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(newsletterSubscribersTable)
    return res.json({ count: Number(row?.count ?? 0) })
  } catch {
    return res.json({ count: 0 })
  }
})

export default router
