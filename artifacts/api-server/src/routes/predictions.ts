import { Router } from "express";
import rateLimit from "express-rate-limit";
import { db, predictionsTable, predictionVotesTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";

const router = Router();

const voteRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many votes from this IP, please try again later" },
});

router.post("/:id/vote", voteRateLimit, async (req, res) => {
  try {
    const predictionId = Number(req.params.id);
    const { choice, voterToken } = req.body;

    if (!choice || !voterToken) {
      return res.status(400).json({ error: "choice and voterToken are required" });
    }

    const [prediction] = await db
      .select({
        editorialStatus: predictionsTable.editorialStatus,
        options: predictionsTable.options,
      })
      .from(predictionsTable)
      .where(eq(predictionsTable.id, predictionId));

    if (!prediction) {
      return res.status(404).json({ error: "Prediction not found" });
    }
    if (prediction.editorialStatus !== "approved") {
      return res.status(403).json({ error: "Voting is not open for this prediction" });
    }

    const validOptions = prediction.options || ["yes", "no"];
    if (!validOptions.includes(choice)) {
      return res.status(400).json({ error: `choice must be one of: ${validOptions.join(", ")}` });
    }

    const [existing] = await db
      .select()
      .from(predictionVotesTable)
      .where(
        and(
          eq(predictionVotesTable.predictionId, predictionId),
          eq(predictionVotesTable.voterToken, voterToken)
        )
      );

    let changed = false;
    if (existing) {
      if (existing.choice === choice) {
        return res.status(200).json({ error: "Already voted with this choice", unchanged: true });
      }
      await db
        .update(predictionVotesTable)
        .set({ choice })
        .where(eq(predictionVotesTable.id, existing.id));
      changed = true;
    } else {
      await db.insert(predictionVotesTable).values({
        predictionId,
        choice,
        voterToken,
        country: null,
      });
    }

    // Calculate per-option percentages
    const allVotes = await db
      .select({ choice: predictionVotesTable.choice, count: count() })
      .from(predictionVotesTable)
      .where(eq(predictionVotesTable.predictionId, predictionId))
      .groupBy(predictionVotesTable.choice);

    const total = allVotes.reduce((sum, v) => sum + v.count, 0);
    const optionResults: Record<string, number> = {};
    for (const opt of validOptions) {
      const voteRow = allVotes.find(v => v.choice === opt);
      optionResults[opt] = total > 0 ? Math.round(((voteRow?.count ?? 0) / total) * 100) : 0;
    }

    // Keep yesPercentage/noPercentage for backward compat
    const yesPercentage = optionResults["yes"] ?? optionResults[validOptions[0]] ?? 50;
    const noPercentage = prediction.options
      ? (optionResults[validOptions[1]] ?? 50)
      : (100 - yesPercentage);

    await db
      .update(predictionsTable)
      .set({
        yesPercentage,
        noPercentage,
        totalCount: total,
        optionResults,
        updatedAt: new Date(),
      })
      .where(eq(predictionsTable.id, predictionId));

    return res.json({
      success: true,
      changed,
      yesPercentage,
      noPercentage,
      optionResults,
      totalCount: total,
    });
  } catch (err) {
    console.error("Prediction vote error:", err);
    return res.status(500).json({ error: "Failed to record prediction vote" });
  }
});

router.get("/:id/results", async (req, res) => {
  try {
    const predictionId = Number(req.params.id);
    const [prediction] = await db
      .select()
      .from(predictionsTable)
      .where(eq(predictionsTable.id, predictionId));

    if (!prediction) {
      return res.status(404).json({ error: "Prediction not found" });
    }

    return res.json({
      yesPercentage: prediction.yesPercentage,
      noPercentage: prediction.noPercentage,
      totalCount: prediction.totalCount,
    });
  } catch (err) {
    console.error("Prediction results error:", err);
    return res.status(500).json({ error: "Failed to fetch prediction results" });
  }
});

export default router;
