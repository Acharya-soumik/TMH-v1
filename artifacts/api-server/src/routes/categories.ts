import { Router, type IRouter } from "express";
import { db, pollsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

const ICON_MAP: Record<string, string> = {
  "arts-expression": "🎨",
  "startups-venture": "🚀",
  "business-startups": "🚀",
  "business": "🚀",
  "work-careers": "💼",
  "cities-lifestyle": "🏙️",
  "cities": "🏙️",
  "technology-ai": "🤖",
  "technology_ai": "🤖",
  "leadership": "🎯",
  "consumer-trends": "📈",
  "culture-identity": "🌍",
  "culture-society": "🌍",
  "culture_society": "🌍",
  "economy-finance": "💰",
  "economy": "💰",
  "women-in-region": "⭐",
  "women-equality": "⭐",
  "women_equality": "⭐",
  "media-influence": "📡",
  "sports-events": "🏆",
  "future-region": "🔮",
  "education-learning": "📚",
  "identity-belonging": "🧭",
  "identity": "🧭",
};

router.get("/categories", async (_req, res) => {
  try {
    // Derive categories dynamically from DB — grouped by category name, summing counts across any slug variants
    const rows = await db
      .select({
        category: pollsTable.category,
        categorySlug: pollsTable.categorySlug,
        count: sql<number>`count(*)`,
      })
      .from(pollsTable)
      .groupBy(pollsTable.category, pollsTable.categorySlug)
      .orderBy(pollsTable.category);

    // Merge slug variants under the same category name, keeping the slug with the most polls
    const nameMap: Record<string, { slug: string; count: number }> = {};
    for (const row of rows) {
      const existing = nameMap[row.category];
      const n = Number(row.count);
      if (!existing || n > existing.count) {
        nameMap[row.category] = { slug: row.categorySlug, count: n };
      }
    }

    const categories = Object.entries(nameMap)
      .map(([name, { slug, count }]) => ({
        name,
        slug,
        icon: ICON_MAP[slug] ?? "📌",
        pollCount: count,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;
