/**
 * CMS-protected digest routes.
 *  - POST /api/cms/digest/preview-this-week  → returns the generated digest content (no Beehiiv push)
 *  - POST /api/cms/digest/push-to-beehiiv    → pushes the draft to Beehiiv (manual escape hatch)
 *  - GET  /api/cms/digest                    → list past digests
 */

import { Router, type Request, type Response, type NextFunction } from "express"
import { db, cmsSessionsTable, newsletterDigestsTable } from "@workspace/db"
import { and, eq, gt, desc } from "drizzle-orm"
import {
  selectTopContent,
  generateAndPushDigest,
  buildDigestHtml,
} from "../services/newsletter-digest.js"

const router = Router()

async function requireCmsAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.headers["x-cms-token"] as string | undefined
  if (!token) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }
  try {
    const [session] = await db
      .select()
      .from(cmsSessionsTable)
      .where(and(eq(cmsSessionsTable.token, token), gt(cmsSessionsTable.expiresAt, new Date())))
    if (!session) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }
    next()
  } catch (err) {
    console.error("[digest] auth error:", err)
    res.status(500).json({ error: "Auth check failed" })
  }
}

router.post("/cms/digest/preview-this-week", requireCmsAuth, async (_req, res) => {
  try {
    const content = await selectTopContent(new Date())
    const html = buildDigestHtml(content)
    return res.json({ content, html })
  } catch (err) {
    console.error("[digest/preview] error:", err)
    return res.status(500).json({ error: "preview_failed" })
  }
})

router.post("/cms/digest/push-to-beehiiv", requireCmsAuth, async (_req, res) => {
  try {
    const result = await generateAndPushDigest(new Date())
    return res.json(result)
  } catch (err) {
    console.error("[digest/push] error:", err)
    return res.status(500).json({ error: "push_failed" })
  }
})

router.get("/cms/digest", requireCmsAuth, async (_req, res) => {
  const rows = await db
    .select()
    .from(newsletterDigestsTable)
    .orderBy(desc(newsletterDigestsTable.weekStarting))
    .limit(20)
  return res.json({
    digests: rows.map((r: typeof newsletterDigestsTable.$inferSelect) => ({
      id: r.id,
      weekStarting: r.weekStarting,
      subjectLine: r.subjectLine,
      status: r.status,
      pushedAt: r.pushedAt,
      beehiivPostId: r.beehiivPostId,
      pollCount: r.selectedPollIds.length,
      predictionCount: r.selectedPredictionIds.length,
    })),
  })
})

export default router
