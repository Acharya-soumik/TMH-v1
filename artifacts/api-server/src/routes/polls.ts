import { Router, type IRouter } from "express";
import { db, pollsTable, pollOptionsTable, votesTable } from "@workspace/db";
import { eq, desc, sql, and, ne } from "drizzle-orm";

const router: IRouter = Router();

function toPollResponse(poll: any, options: any[]) {
  const totalVotes = options.reduce((s: number, o: any) => s + o.voteCount, 0);
  return {
    id: poll.id,
    question: poll.question,
    context: poll.context ?? null,
    category: poll.category,
    categorySlug: poll.categorySlug,
    tags: poll.tags ?? [],
    pollType: poll.pollType,
    options: options.map((o) => ({
      id: o.id,
      text: o.text,
      voteCount: o.voteCount,
      percentage: totalVotes > 0 ? Math.round((o.voteCount / totalVotes) * 1000) / 10 : 0,
    })),
    totalVotes,
    isFeatured: poll.isFeatured,
    isEditorsPick: poll.isEditorsPick,
    createdAt: poll.createdAt?.toISOString() ?? new Date().toISOString(),
    endsAt: poll.endsAt ? poll.endsAt.toISOString() : null,
    relatedProfileIds: poll.relatedProfileIds ?? [],
  };
}

router.get("/polls", async (req, res) => {
  try {
    const { filter, category, limit = "20", offset = "0" } = req.query as Record<string, string>;
    const lim = Math.min(parseInt(limit) || 20, 50);
    const off = parseInt(offset) || 0;

    let query = db.select().from(pollsTable);
    if (category) {
      query = query.where(eq(pollsTable.categorySlug, category)) as any;
    }

    let polls;
    if (filter === "trending" || filter === "most_voted") {
      polls = await (query as any).orderBy(desc(sql`(SELECT SUM(vote_count) FROM poll_options WHERE poll_id = polls.id)`)).limit(lim).offset(off);
    } else if (filter === "editors_picks") {
      const whereClause = category
        ? and(eq(pollsTable.isEditorsPick, true), eq(pollsTable.categorySlug, category))
        : eq(pollsTable.isEditorsPick, true);
      polls = await db.select().from(pollsTable).where(whereClause).orderBy(desc(pollsTable.createdAt)).limit(lim).offset(off);
    } else if (filter === "ending_soon") {
      polls = await (query as any).orderBy(pollsTable.endsAt).limit(lim).offset(off);
    } else {
      polls = await (query as any).orderBy(desc(pollsTable.createdAt)).limit(lim).offset(off);
    }

    const result = await Promise.all(
      polls.map(async (poll: any) => {
        const options = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, poll.id));
        return toPollResponse(poll, options);
      })
    );

    const total = await db.select({ count: sql<number>`count(*)` }).from(pollsTable);
    res.json({ polls: result, total: Number(total[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch polls" });
  }
});

router.get("/polls/featured", async (_req, res) => {
  try {
    const [poll] = await db.select().from(pollsTable).where(eq(pollsTable.isFeatured, true)).orderBy(desc(pollsTable.createdAt)).limit(1);
    if (!poll) {
      const [fallback] = await db.select().from(pollsTable).orderBy(desc(pollsTable.createdAt)).limit(1);
      if (!fallback) return res.status(404).json({ error: "No polls found" });
      const options = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, fallback.id));
      return res.json(toPollResponse(fallback, options));
    }
    const options = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, poll.id));
    res.json(toPollResponse(poll, options));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch featured poll" });
  }
});

router.get("/polls/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [poll] = await db.select().from(pollsTable).where(eq(pollsTable.id, id));
    if (!poll) return res.status(404).json({ error: "Poll not found" });
    const options = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, id));
    res.json(toPollResponse(poll, options));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch poll" });
  }
});

router.post("/polls/:id/vote", async (req, res) => {
  try {
    const pollId = parseInt(req.params.id);
    const { optionId, voterToken } = req.body;

    if (!optionId || !voterToken) {
      return res.status(400).json({ error: "optionId and voterToken are required" });
    }

    const existing = await db
      .select()
      .from(votesTable)
      .where(and(eq(votesTable.pollId, pollId), eq(votesTable.voterToken, voterToken)));

    if (existing.length > 0) {
      const options = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, pollId));
      const total = options.reduce((s: number, o: any) => s + o.voteCount, 0);
      return res.json({
        success: false,
        alreadyVoted: true,
        options: options.map((o) => ({
          id: o.id,
          text: o.text,
          voteCount: o.voteCount,
          percentage: total > 0 ? Math.round((o.voteCount / total) * 1000) / 10 : 0,
        })),
        totalVotes: total,
      });
    }

    await db.insert(votesTable).values({ pollId, optionId, voterToken });
    await db
      .update(pollOptionsTable)
      .set({ voteCount: sql`vote_count + 1` })
      .where(eq(pollOptionsTable.id, optionId));

    const options = await db.select().from(pollOptionsTable).where(eq(pollOptionsTable.pollId, pollId));
    const total = options.reduce((s: number, o: any) => s + o.voteCount, 0);

    res.json({
      success: true,
      alreadyVoted: false,
      options: options.map((o) => ({
        id: o.id,
        text: o.text,
        voteCount: o.voteCount,
        percentage: total > 0 ? Math.round((o.voteCount / total) * 1000) / 10 : 0,
      })),
      totalVotes: total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record vote" });
  }
});

export default router;
