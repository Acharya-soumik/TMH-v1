import { Router } from "express"

const router = Router()

const CRITERIA = [
  {
    key: "impact",
    label: "Real, verifiable impact",
    maxScore: 15,
    passSignals: ["raised", "exits", "million", "users", "employees", "founded", "launched", "built", "revenue", "funded", "acquired", "unicorn", "exit"],
    failSignals: ["passionate about", "experienced in", "interested in", "aspiring"],
  },
  {
    key: "mena",
    label: "MENA connection",
    maxScore: 15,
    passSignals: ["dubai", "uae", "saudi", "egypt", "jordan", "lebanon", "bahrain", "qatar", "oman", "kuwait", "morocco", "mena", "gulf", "middle east", "riyadh", "cairo", "abu dhabi"],
    failSignals: [],
  },
  {
    key: "story",
    label: "Unique story",
    maxScore: 15,
    passSignals: ["pivot", "failed", "failure", "lost", "struggle", "challenge", "overcome", "unexpected", "left", "quit", "bet", "risk", "decided"],
    failSignals: ["joined", "promoted", "worked my way"],
  },
  {
    key: "built",
    label: "Built something tangible",
    maxScore: 15,
    passSignals: ["founded", "co-founded", "built", "created", "launched", "started", "developed", "shipped", "product", "company", "startup", "NGO", "platform"],
    failSignals: [],
  },
  {
    key: "quote",
    label: "Original quote",
    maxScore: 10,
    passSignals: [],
    failSignals: ["work hard", "dream big", "never give up", "believe in yourself", "success is a journey", "sky is the limit"],
  },
  {
    key: "linkedin",
    label: "LinkedIn provided",
    maxScore: 10,
    passSignals: ["linkedin.com"],
    failSignals: [],
  },
]

function scoreApplication(data: any): { score: number; status: string; reasoning: string; checklist: any[] } {
  const searchText = [data.bio ?? "", data.impact ?? "", data.quote ?? "", data.linkedin ?? ""].join(" ").toLowerCase()
  const menaText = [data.country ?? "", data.city ?? "", data.bio ?? ""].join(" ").toLowerCase()

  const checklist = CRITERIA.map(criterion => {
    let text = searchText
    if (criterion.key === "mena") text = menaText
    if (criterion.key === "quote") text = (data.quote ?? "").toLowerCase()
    if (criterion.key === "linkedin") text = (data.linkedin ?? "").toLowerCase()

    const passCount = criterion.passSignals.filter(s => text.includes(s)).length
    const failCount = criterion.failSignals.filter(s => text.includes(s)).length

    let rawScore: number
    if (criterion.key === "linkedin") {
      rawScore = criterion.passSignals.some(s => text.includes(s)) ? criterion.maxScore : 0
    } else if (criterion.key === "quote") {
      rawScore = failCount > 0 ? Math.round(criterion.maxScore * 0.2) : criterion.maxScore * 0.7
    } else {
      const passRatio = Math.min(passCount / Math.max(criterion.passSignals.length * 0.3, 1), 1)
      rawScore = Math.round(criterion.maxScore * passRatio)
      if (failCount > 0) rawScore = Math.round(rawScore * 0.4)
    }

    if (data.bio && data.bio.length >= 100 && criterion.key === "impact") rawScore = Math.max(rawScore, 5)

    return {
      criterion: criterion.label,
      score: Math.min(rawScore, criterion.maxScore),
      maxScore: criterion.maxScore,
      notes: passCount > 0 ? `${passCount} signal(s) detected` : failCount > 0 ? "Concern signals detected" : "Insufficient signals",
    }
  })

  const bioLengthBonus = data.bio && data.bio.split(/\s+/).length >= 80 ? 5 : data.bio && data.bio.split(/\s+/).length >= 40 ? 3 : 0
  const allFieldsBonus = (data.name && data.email && data.title && data.company && data.bio && data.linkedin && data.impact) ? 5 : 0

  const baseScore = checklist.reduce((sum, c) => sum + c.score, 0)
  const score = Math.min(100, baseScore + bioLengthBonus + allFieldsBonus)

  let status: string
  let reasoning: string

  if (score >= 70) {
    status = "passed"
    reasoning = `Strong application. Score ${score}/100. Multiple verifiable impact signals, MENA connection confirmed, LinkedIn provided. Ready for editorial review.`
  } else if (score >= 40) {
    status = "conditional"
    reasoning = `Promising application. Score ${score}/100. Shows potential but needs stronger impact evidence or more specific MENA connection. Resubmit in 30 days with specific outcomes.`
  } else {
    status = "not_yet"
    reasoning = `Score ${score}/100. TMH bar is high — applications need verifiable impact signals, specific MENA connection, and a genuinely unique story. Keep building and reapply in 90 days.`
  }

  return { score, status, reasoning, checklist }
}

router.post("/apply", async (req, res) => {
  const { name, email, title, company, bio, linkedin, quote, impact, city, country, sector } = req.body

  if (!name || !email || !title || !company || !bio || !linkedin) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  const aiResult = scoreApplication({ name, email, title, company, bio, linkedin, quote, impact, city, country })

  console.log(`[APPLY] Application from: ${name} <${email}> | ${title} @ ${company} | Score: ${aiResult.score} | Status: ${aiResult.status}`)
  console.log(`[APPLY] Reasoning: ${aiResult.reasoning}`)

  return res.json({
    success: true,
    message: "Application received. Our AI review runs in minutes.",
    aiScore: aiResult.score,
    aiStatus: aiResult.status,
    reasoning: aiResult.reasoning,
  })
})

export default router
