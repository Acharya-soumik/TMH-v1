import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import {
  db,
  pollsTable,
  pollOptionsTable,
  profilesTable,
  predictionsTable,
} from "@workspace/db";
import { eq, sql, desc, inArray } from "drizzle-orm";

const router = Router();

const CMS_USERNAME = process.env.CMS_USERNAME ?? "admin";
const CMS_PIN = process.env.CMS_PIN ?? "1234";

const sessions = new Map<string, { username: string; createdAt: number }>();

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

const VALID_STATUSES = new Set(["draft", "in_review", "approved", "rejected", "revision", "flagged", "archived"]);

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ["in_review", "approved", "rejected"],
  in_review: ["approved", "rejected", "draft"],
  approved: ["flagged", "archived", "draft"],
  rejected: ["revision", "draft"],
  revision: ["in_review", "approved", "draft"],
  flagged: ["approved", "archived"],
  archived: ["approved", "draft"],
};

function isValidStatusTransition(from: string | null, to: string): boolean {
  if (!from) return VALID_STATUSES.has(to);
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

function requireCmsAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["x-cms-token"] as string;
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const session = sessions.get(token)!;
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    sessions.delete(token);
    return res.status(401).json({ error: "Session expired" });
  }
  next();
}

router.post("/cms/auth/login", (req, res) => {
  const { username, pin } = req.body;
  if (username === CMS_USERNAME && pin === CMS_PIN) {
    const token = generateToken();
    sessions.set(token, { username, createdAt: Date.now() });
    return res.json({ token, username });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

router.post("/cms/auth/verify", requireCmsAuth, (_req, res) => {
  return res.json({ valid: true });
});

router.get("/cms/stats", requireCmsAuth, async (_req, res) => {
  try {
    const [pollCount] = await db.select({ count: sql<number>`count(*)::int` }).from(pollsTable);
    const [predictionCount] = await db.select({ count: sql<number>`count(*)::int` }).from(predictionsTable);
    const [profileCount] = await db.select({ count: sql<number>`count(*)::int` }).from(profilesTable);

    const [draftPolls] = await db.select({ count: sql<number>`count(*)::int` }).from(pollsTable).where(eq(pollsTable.editorialStatus, "draft"));
    const [draftPredictions] = await db.select({ count: sql<number>`count(*)::int` }).from(predictionsTable).where(eq(predictionsTable.editorialStatus, "draft"));
    const [draftProfiles] = await db.select({ count: sql<number>`count(*)::int` }).from(profilesTable).where(eq(profilesTable.editorialStatus, "draft"));

    const [livePolls] = await db.select({ count: sql<number>`count(*)::int` }).from(pollsTable).where(eq(pollsTable.editorialStatus, "approved"));
    const [livePredictions] = await db.select({ count: sql<number>`count(*)::int` }).from(predictionsTable).where(eq(predictionsTable.editorialStatus, "approved"));
    const [liveProfiles] = await db.select({ count: sql<number>`count(*)::int` }).from(profilesTable).where(eq(profilesTable.editorialStatus, "approved"));

    const [flaggedPolls] = await db.select({ count: sql<number>`count(*)::int` }).from(pollsTable).where(eq(pollsTable.editorialStatus, "flagged"));
    const [flaggedPredictions] = await db.select({ count: sql<number>`count(*)::int` }).from(predictionsTable).where(eq(predictionsTable.editorialStatus, "flagged"));
    const [flaggedProfiles] = await db.select({ count: sql<number>`count(*)::int` }).from(profilesTable).where(eq(profilesTable.editorialStatus, "flagged"));

    const [reviewPolls] = await db.select({ count: sql<number>`count(*)::int` }).from(pollsTable).where(eq(pollsTable.editorialStatus, "in_review"));
    const [reviewPredictions] = await db.select({ count: sql<number>`count(*)::int` }).from(predictionsTable).where(eq(predictionsTable.editorialStatus, "in_review"));
    const [reviewProfiles] = await db.select({ count: sql<number>`count(*)::int` }).from(profilesTable).where(eq(profilesTable.editorialStatus, "in_review"));

    const [archivedPolls] = await db.select({ count: sql<number>`count(*)::int` }).from(pollsTable).where(eq(pollsTable.editorialStatus, "archived"));
    const [archivedPredictions] = await db.select({ count: sql<number>`count(*)::int` }).from(predictionsTable).where(eq(predictionsTable.editorialStatus, "archived"));
    const [archivedProfiles] = await db.select({ count: sql<number>`count(*)::int` }).from(profilesTable).where(eq(profilesTable.editorialStatus, "archived"));

    const recentDebates = await db.select().from(pollsTable).orderBy(desc(pollsTable.updatedAt)).limit(5);
    const recentPredictions = await db.select().from(predictionsTable).orderBy(desc(predictionsTable.updatedAt)).limit(5);
    const recentProfiles = await db.select().from(profilesTable).orderBy(desc(profilesTable.updatedAt)).limit(5);

    return res.json({
      debates: { total: pollCount?.count ?? 0, drafts: draftPolls?.count ?? 0, live: livePolls?.count ?? 0, flagged: flaggedPolls?.count ?? 0, inReview: reviewPolls?.count ?? 0, archived: archivedPolls?.count ?? 0 },
      predictions: { total: predictionCount?.count ?? 0, drafts: draftPredictions?.count ?? 0, live: livePredictions?.count ?? 0, flagged: flaggedPredictions?.count ?? 0, inReview: reviewPredictions?.count ?? 0, archived: archivedPredictions?.count ?? 0 },
      voices: { total: profileCount?.count ?? 0, drafts: draftProfiles?.count ?? 0, live: liveProfiles?.count ?? 0, flagged: flaggedProfiles?.count ?? 0, inReview: reviewProfiles?.count ?? 0, archived: archivedProfiles?.count ?? 0 },
      recentActivity: [
        ...recentDebates.map(d => ({ type: "debate" as const, id: d.id, title: d.question, status: d.editorialStatus, updatedAt: d.updatedAt })),
        ...recentPredictions.map(p => ({ type: "prediction" as const, id: p.id, title: p.question, status: p.editorialStatus, updatedAt: p.updatedAt })),
        ...recentProfiles.map(p => ({ type: "voice" as const, id: p.id, title: p.name, status: p.editorialStatus, updatedAt: p.updatedAt })),
      ].sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()).slice(0, 10),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Stats failed" });
  }
});

router.get("/cms/debates", requireCmsAuth, async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const debates = (status && status !== "all")
      ? await db.select().from(pollsTable).where(eq(pollsTable.editorialStatus, status)).orderBy(desc(pollsTable.updatedAt))
      : await db.select().from(pollsTable).orderBy(desc(pollsTable.updatedAt));
    const debatesWithOptions = await Promise.all(
      debates.map(async (debate) => {
        const options = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, debate.id));
        return { ...debate, options };
      })
    );
    return res.json({ items: debatesWithOptions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch debates" });
  }
});

router.get("/cms/debates/:id", requireCmsAuth, async (req, res) => {
  try {
    const [debate] = await db.select().from(pollsTable).where(eq(pollsTable.id, Number(req.params.id)));
    if (!debate) return res.status(404).json({ error: "Not found" });
    const options = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, debate.id));
    return res.json({ ...debate, options });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch debate" });
  }
});

router.put("/cms/debates/:id", requireCmsAuth, async (req, res) => {
  try {
    const { options, ...data } = req.body;
    if (data.editorialStatus && VALID_STATUSES.has(data.editorialStatus)) {
      const [current] = await db.select({ editorialStatus: pollsTable.editorialStatus }).from(pollsTable).where(eq(pollsTable.id, Number(req.params.id)));
      if (current && !isValidStatusTransition(current.editorialStatus, data.editorialStatus)) {
        return res.status(400).json({ error: `Cannot transition from '${current.editorialStatus}' to '${data.editorialStatus}'` });
      }
    }
    await db.update(pollsTable).set({ ...data, updatedAt: new Date() }).where(eq(pollsTable.id, Number(req.params.id)));
    if (options && Array.isArray(options)) {
      await db.delete(pollOptionsTable).where(eq(pollOptionsTable.pollId, Number(req.params.id)));
      if (options.length > 0) {
        await db.insert(pollOptionsTable).values(
          options.map((opt: { text: string; voteCount?: number }) => ({ pollId: Number(req.params.id), text: opt.text, voteCount: opt.voteCount ?? 0 }))
        );
      }
    }
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Update failed" });
  }
});

router.delete("/cms/debates/:id", requireCmsAuth, async (req, res) => {
  try {
    await db.delete(pollOptionsTable).where(eq(pollOptionsTable.pollId, Number(req.params.id)));
    await db.delete(pollsTable).where(eq(pollsTable.id, Number(req.params.id)));
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Delete failed" });
  }
});

router.get("/cms/predictions", requireCmsAuth, async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const items = (status && status !== "all")
      ? await db.select().from(predictionsTable).where(eq(predictionsTable.editorialStatus, status)).orderBy(desc(predictionsTable.updatedAt))
      : await db.select().from(predictionsTable).orderBy(desc(predictionsTable.updatedAt));
    return res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch predictions" });
  }
});

router.get("/cms/predictions/:id", requireCmsAuth, async (req, res) => {
  try {
    const [item] = await db.select().from(predictionsTable).where(eq(predictionsTable.id, Number(req.params.id)));
    if (!item) return res.status(404).json({ error: "Not found" });
    return res.json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch prediction" });
  }
});

router.put("/cms/predictions/:id", requireCmsAuth, async (req, res) => {
  try {
    if (req.body.editorialStatus && VALID_STATUSES.has(req.body.editorialStatus)) {
      const [current] = await db.select({ editorialStatus: predictionsTable.editorialStatus }).from(predictionsTable).where(eq(predictionsTable.id, Number(req.params.id)));
      if (current && !isValidStatusTransition(current.editorialStatus, req.body.editorialStatus)) {
        return res.status(400).json({ error: `Cannot transition from '${current.editorialStatus}' to '${req.body.editorialStatus}'` });
      }
    }
    await db.update(predictionsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(predictionsTable.id, Number(req.params.id)));
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Update failed" });
  }
});

router.delete("/cms/predictions/:id", requireCmsAuth, async (req, res) => {
  try {
    await db.delete(predictionsTable).where(eq(predictionsTable.id, Number(req.params.id)));
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Delete failed" });
  }
});

router.get("/cms/voices", requireCmsAuth, async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const items = (status && status !== "all")
      ? await db.select().from(profilesTable).where(eq(profilesTable.editorialStatus, status)).orderBy(desc(profilesTable.updatedAt))
      : await db.select().from(profilesTable).orderBy(desc(profilesTable.updatedAt));
    return res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch voices" });
  }
});

router.get("/cms/voices/:id", requireCmsAuth, async (req, res) => {
  try {
    const [item] = await db.select().from(profilesTable).where(eq(profilesTable.id, Number(req.params.id)));
    if (!item) return res.status(404).json({ error: "Not found" });
    return res.json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch voice" });
  }
});

router.put("/cms/voices/:id", requireCmsAuth, async (req, res) => {
  try {
    if (req.body.editorialStatus && VALID_STATUSES.has(req.body.editorialStatus)) {
      const [current] = await db.select({ editorialStatus: profilesTable.editorialStatus }).from(profilesTable).where(eq(profilesTable.id, Number(req.params.id)));
      if (current && !isValidStatusTransition(current.editorialStatus, req.body.editorialStatus)) {
        return res.status(400).json({ error: `Cannot transition from '${current.editorialStatus}' to '${req.body.editorialStatus}'` });
      }
    }
    await db.update(profilesTable).set({ ...req.body, updatedAt: new Date() }).where(eq(profilesTable.id, Number(req.params.id)));
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Update failed" });
  }
});

router.delete("/cms/voices/:id", requireCmsAuth, async (req, res) => {
  try {
    await db.delete(profilesTable).where(eq(profilesTable.id, Number(req.params.id)));
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Delete failed" });
  }
});

router.post("/cms/:type/:id/status", requireCmsAuth, async (req, res) => {
  const { type, id } = req.params;
  const { action } = req.body;

  const validTransitions: Record<string, Record<string, string>> = {
    approve: { draft: "approved", in_review: "approved", revision: "approved" },
    reject: { in_review: "rejected", draft: "rejected" },
    review: { draft: "in_review", revision: "in_review" },
    revision: { rejected: "revision" },
    flag: { approved: "flagged" },
    archive: { approved: "archived", flagged: "archived" },
    unflag: { flagged: "approved" },
    unarchive: { archived: "approved" },
    unpublish: { approved: "draft" },
  };

  if (!action || !validTransitions[action]) {
    return res.status(400).json({ error: "Invalid action" });
  }

  try {
    const numId = Number(id);
    let currentStatus: string | undefined;

    if (type === "debates") {
      const [item] = await db.select({ editorialStatus: pollsTable.editorialStatus }).from(pollsTable).where(eq(pollsTable.id, numId));
      currentStatus = item?.editorialStatus;
    } else if (type === "predictions") {
      const [item] = await db.select({ editorialStatus: predictionsTable.editorialStatus }).from(predictionsTable).where(eq(predictionsTable.id, numId));
      currentStatus = item?.editorialStatus;
    } else if (type === "voices") {
      const [item] = await db.select({ editorialStatus: profilesTable.editorialStatus }).from(profilesTable).where(eq(profilesTable.id, numId));
      currentStatus = item?.editorialStatus;
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

    if (!currentStatus) return res.status(404).json({ error: "Not found" });

    const newStatus = validTransitions[action][currentStatus];
    if (!newStatus) {
      return res.status(400).json({ error: `Cannot ${action} from status '${currentStatus}'` });
    }

    if (type === "debates") {
      await db.update(pollsTable).set({ editorialStatus: newStatus, updatedAt: new Date() }).where(eq(pollsTable.id, numId));
    } else if (type === "predictions") {
      await db.update(predictionsTable).set({ editorialStatus: newStatus, updatedAt: new Date() }).where(eq(predictionsTable.id, numId));
    } else {
      await db.update(profilesTable).set({ editorialStatus: newStatus, updatedAt: new Date() }).where(eq(profilesTable.id, numId));
    }

    return res.json({ success: true, newStatus });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Status update failed" });
  }
});

router.post("/cms/:type/bulk-action", requireCmsAuth, async (req, res) => {
  const { type } = req.params;
  const { ids, action } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids array is required" });
  }

  try {
    if (type !== "debates" && type !== "predictions" && type !== "voices") {
      return res.status(400).json({ error: "Invalid type" });
    }

    if (action === "delete") {
      if (type === "debates") {
        await db.delete(pollOptionsTable).where(inArray(pollOptionsTable.pollId, ids));
        await db.delete(pollsTable).where(inArray(pollsTable.id, ids));
      } else if (type === "predictions") {
        await db.delete(predictionsTable).where(inArray(predictionsTable.id, ids));
      } else {
        await db.delete(profilesTable).where(inArray(profilesTable.id, ids));
      }
      return res.json({ success: true, deleted: ids.length });
    }

    const statusMap: Record<string, string> = {
      approve: "approved",
      reject: "rejected",
      flag: "flagged",
      archive: "archived",
      unflag: "approved",
      unarchive: "approved",
      unpublish: "draft",
      revision: "revision",
    };

    const newStatus = statusMap[action];
    if (!newStatus) return res.status(400).json({ error: "Invalid action" });

    if (type === "debates") {
      await db.update(pollsTable).set({ editorialStatus: newStatus, updatedAt: new Date() }).where(inArray(pollsTable.id, ids));
    } else if (type === "predictions") {
      await db.update(predictionsTable).set({ editorialStatus: newStatus, updatedAt: new Date() }).where(inArray(predictionsTable.id, ids));
    } else {
      await db.update(profilesTable).set({ editorialStatus: newStatus, updatedAt: new Date() }).where(inArray(profilesTable.id, ids));
    }
    return res.json({ success: true, updated: ids.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Bulk action failed" });
  }
});

router.post("/cms/upload/:type", requireCmsAuth, async (req, res) => {
  const { type } = req.params;
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "items array is required" });
  }

  try {
    if (type === "debates") {
      const created = [];
      for (const item of items) {
        const { options: opts, ...pollData } = item;
        const [poll] = await db.insert(pollsTable).values({
          question: pollData.question,
          context: pollData.context ?? null,
          category: pollData.category,
          categorySlug: pollData.categorySlug ?? pollData.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          tags: pollData.tags ?? [],
          pollType: pollData.pollType ?? "binary",
          isFeatured: pollData.isFeatured ?? false,
          isEditorsPick: pollData.isEditorsPick ?? false,
          editorialStatus: pollData.editorialStatus ?? "draft",
          endsAt: pollData.endsAt ? new Date(pollData.endsAt) : null,
          relatedProfileIds: pollData.relatedProfileIds ?? [],
        }).returning();

        if (opts && Array.isArray(opts)) {
          await db.insert(pollOptionsTable).values(
            opts.map((o: string | { text: string }) => ({ pollId: poll.id, text: typeof o === "string" ? o : o.text, voteCount: 0 }))
          );
        }
        created.push(poll);
      }
      return res.json({ success: true, created: created.length, items: created });
    }

    if (type === "predictions") {
      const values = items.map((item: Record<string, unknown>) => ({
        question: item.question as string,
        category: item.category as string,
        categorySlug: (item.categorySlug as string) ?? (item.category as string).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        resolvesAt: item.resolvesAt ? new Date(item.resolvesAt as string) : null,
        yesPercentage: (item.yesPercentage as number) ?? 50,
        noPercentage: (item.noPercentage as number) ?? 50,
        totalCount: (item.totalCount as number) ?? 0,
        momentum: (item.momentum as number) ?? 0,
        momentumDirection: (item.momentumDirection as string) ?? "up",
        trendData: (item.trendData as number[]) ?? [],
        editorialStatus: (item.editorialStatus as string) ?? "draft",
        isFeatured: (item.isFeatured as boolean) ?? false,
        tags: (item.tags as string[]) ?? [],
      }));
      const created = await db.insert(predictionsTable).values(values).returning();
      return res.json({ success: true, created: created.length, items: created });
    }

    if (type === "voices") {
      const values = items.map((item: Record<string, unknown>) => ({
        name: item.name as string,
        headline: item.headline as string,
        role: item.role as string,
        company: (item.company as string) ?? null,
        companyUrl: (item.companyUrl as string) ?? null,
        sector: item.sector as string,
        country: item.country as string,
        city: item.city as string,
        imageUrl: (item.imageUrl as string) ?? null,
        summary: item.summary as string,
        story: item.story as string,
        lessonsLearned: (item.lessonsLearned as string[]) ?? [],
        quote: item.quote as string,
        isFeatured: (item.isFeatured as boolean) ?? false,
        isVerified: (item.isVerified as boolean) ?? false,
        editorialStatus: (item.editorialStatus as string) ?? "draft",
      }));
      const created = await db.insert(profilesTable).values(values).returning();
      return res.json({ success: true, created: created.length, items: created });
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

const uploadsDir = path.resolve("/home/runner/workspace/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/cms/upload-image", requireCmsAuth, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image provided" });
  }
  const url = `/api/cms/uploads/${req.file.filename}`;
  return res.json({ url, filename: req.file.filename });
});

router.get("/cms/uploads/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(uploadsDir, filename);
  if (!filePath.startsWith(uploadsDir) || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  return res.sendFile(filePath);
});

export default router;
