import { Router, type IRouter } from "express";
import { db, profilesTable, pollsTable, pollOptionsTable } from "@workspace/db";
import { desc, sql, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/rankings", async (req, res) => {
  try {
    const { type = "profiles" } = req.query as Record<string, string>;

    if (type === "profiles" || type === "founders") {
      const profiles = await db
        .select()
        .from(profilesTable)
        .where(type === "founders" ? eq(profilesTable.sector, "Venture & Startups") : sql`true`)
        .orderBy(desc(profilesTable.viewCount))
        .limit(10);

      return res.json({
        type,
        title: type === "founders" ? "Most Influential Founders" : "Top Voices",
        entries: profiles.map((p, i) => ({
          rank: i + 1,
          label: p.name,
          sublabel: `${p.role}${p.company ? `, ${p.company}` : ""} · ${p.country}`,
          score: p.viewCount,
          change: Math.floor(Math.random() * 5) - 2,
          imageUrl: p.imageUrl ?? null,
        })),
      });
    }

    if (type === "sectors") {
      const sectors = [
        { sector: "Technology & AI", score: 94, change: 2 },
        { sector: "Venture & Startups", score: 88, change: 1 },
        { sector: "Finance", score: 81, change: -1 },
        { sector: "Real Estate", score: 77, change: 0 },
        { sector: "Media & Content", score: 73, change: 3 },
        { sector: "Healthcare", score: 68, change: -2 },
        { sector: "Retail & Consumer", score: 62, change: 1 },
        { sector: "Energy", score: 58, change: 0 },
      ];
      return res.json({
        type,
        title: "Most Discussed Sectors",
        entries: sectors.map((s, i) => ({
          rank: i + 1,
          label: s.sector,
          sublabel: null,
          score: s.score,
          change: s.change,
          imageUrl: null,
        })),
      });
    }

    if (type === "cities") {
      const cities = [
        { city: "Dubai", country: "UAE", score: 96, change: 0 },
        { city: "Riyadh", country: "Saudi Arabia", score: 91, change: 2 },
        { city: "Cairo", country: "Egypt", score: 82, change: -1 },
        { city: "Abu Dhabi", country: "UAE", score: 78, change: 1 },
        { city: "Doha", country: "Qatar", score: 72, change: 0 },
        { city: "Amman", country: "Jordan", score: 64, change: 3 },
        { city: "Beirut", country: "Lebanon", score: 58, change: -2 },
        { city: "Manama", country: "Bahrain", score: 52, change: 1 },
      ];
      return res.json({
        type,
        title: "Top Cities for Ambition",
        entries: cities.map((c, i) => ({
          rank: i + 1,
          label: c.city,
          sublabel: c.country,
          score: c.score,
          change: c.change,
          imageUrl: null,
        })),
      });
    }

    if (type === "women_leaders") {
      const women = await db
        .select()
        .from(profilesTable)
        .orderBy(desc(profilesTable.viewCount))
        .limit(10);

      return res.json({
        type,
        title: "Most Admired Women Leaders",
        entries: women.map((p, i) => ({
          rank: i + 1,
          label: p.name,
          sublabel: `${p.role}${p.company ? `, ${p.company}` : ""} · ${p.country}`,
          score: p.viewCount,
          change: Math.floor(Math.random() * 3) - 1,
          imageUrl: p.imageUrl ?? null,
        })),
      });
    }

    if (type === "topics") {
      const polls = await db
        .select({
          id: pollsTable.id,
          question: pollsTable.question,
          category: pollsTable.category,
          totalVotes: sql<number>`(SELECT SUM(vote_count) FROM poll_options WHERE poll_id = polls.id)`,
        })
        .from(pollsTable)
        .orderBy(sql`(SELECT SUM(vote_count) FROM poll_options WHERE poll_id = polls.id) DESC`)
        .limit(10);

      return res.json({
        type,
        title: "Most Debated Topics",
        entries: polls.map((p, i) => ({
          rank: i + 1,
          label: p.question,
          sublabel: p.category,
          score: Number(p.totalVotes) || 0,
          change: Math.floor(Math.random() * 5) - 2,
          imageUrl: null,
        })),
      });
    }

    res.status(400).json({ error: "Invalid ranking type" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch rankings" });
  }
});

export default router;
