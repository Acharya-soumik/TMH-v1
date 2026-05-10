/**
 * AI-generated captions per platform. Talks directly to the OpenAI-proxy-to-Claude
 * endpoint via fetch to avoid pulling the integrations-openai-ai-server package
 * (which has unrelated typecheck issues).
 */

const MODEL = "claude-sonnet-4-6"

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>
}

async function chatCompletion(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY
  if (!baseUrl || !apiKey) return null

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 600,
    }),
  })
  if (!res.ok) {
    console.warn("[press-kit/captions] LLM HTTP error:", res.status, await res.text().catch(() => ""))
    return null
  }
  const data = (await res.json()) as ChatCompletionResponse
  return data.choices?.[0]?.message?.content ?? null
}

export interface CaptionInput {
  contentType: "poll" | "prediction" | "voice" | "pulse"
  contentId: number
  question?: string
  quote?: string
  stat?: string
  category?: string
  voicesName?: string
  winningOption?: string
  winningPercentage?: number
}

export interface CaptionSet {
  x: string
  ig: string
  linkedin: string
}

const SYSTEM_PROMPT = `You write social media captions for The Tribunal — a MENA-focused debate, prediction, and voices platform. Voice is sharp, regional, intelligent. No fluff, no clichés.

For each platform, return JSON exactly in this shape:
{
  "x": "<one-line tweet under 240 chars, no hashtags inline, ends with 1-2 short hashtags>",
  "ig": "<2-3 short lines, hook + insight + CTA, ends with 4-6 hashtags including #MENA>",
  "linkedin": "<2-3 short paragraphs, professional tone, ends with one question to spark replies>"
}

Always preserve the data: never invent percentages or quotes that weren't supplied. Always include the canonical link with the appropriate UTM at the end of the caption text — use {{LINK}} as a placeholder; the caller substitutes it.`

export async function generateCaptions(input: CaptionInput, baseUrl: string): Promise<CaptionSet> {
  const utmBase = `?utm_source=press_kit&utm_medium=social&utm_content=${input.contentType}_${input.contentId}`
  const linkPath =
    input.contentType === "poll"
      ? `/debates/${input.contentId}`
      : input.contentType === "prediction"
        ? `/predictions/${input.contentId}`
        : input.contentType === "voice"
          ? `/voices/${input.contentId}`
          : "/pulse"
  const link = `${baseUrl}${linkPath}${utmBase}`

  const userMsg = JSON.stringify(input, null, 2)

  let parsed: CaptionSet | null = null
  try {
    const raw = await chatCompletion(SYSTEM_PROMPT, userMsg)
    if (raw) {
      parsed = JSON.parse(raw) as CaptionSet
    }
  } catch (err) {
    console.warn("[press-kit/captions] AI generation failed, using fallback:", err)
  }

  const fallback = buildFallback(input, link)
  if (!parsed) return fallback

  return {
    x: substituteLink(parsed.x ?? fallback.x, link),
    ig: substituteLink(parsed.ig ?? fallback.ig, link),
    linkedin: substituteLink(parsed.linkedin ?? fallback.linkedin, link),
  }
}

function substituteLink(s: string, link: string): string {
  if (s.includes("{{LINK}}")) return s.replace(/\{\{LINK\}\}/g, link)
  return `${s.trim()}\n\n${link}`
}

function buildFallback(input: CaptionInput, link: string): CaptionSet {
  if (input.contentType === "poll") {
    const q = input.question ?? "MENA debate"
    const stat = input.winningPercentage != null && input.winningOption
      ? ` ${Math.round(input.winningPercentage)}% chose ${input.winningOption}.`
      : ""
    return {
      x: `${q}${stat} Vote on The Tribunal. ${link} #MENA #Debate`,
      ig: `${q}${stat}\n\nWhere do you stand? Vote at the link in bio.\n\n#MENA #Debate #MiddleEast #Tribunal #Voices`,
      linkedin: `New on The Tribunal: ${q}${stat}\n\nThe full breakdown by country and sector is live.\n\nWhich way are you leaning?\n${link}`,
    }
  }
  if (input.contentType === "prediction") {
    const q = input.question ?? "MENA prediction"
    return {
      x: `${q} See where the region stands. ${link} #MENA #Prediction`,
      ig: `${q}\n\nWhat do you think happens?\n\n#MENA #Prediction #MiddleEast #Tribunal`,
      linkedin: `Live prediction on The Tribunal: ${q}\n\nWhat's your call?\n${link}`,
    }
  }
  if (input.contentType === "voice") {
    const quote = input.quote ?? ""
    const name = input.voicesName ?? "A new voice"
    return {
      x: `"${quote}" — ${name}. New on The Tribunal. ${link}`,
      ig: `"${quote}"\n— ${name}\n\nNew voice on The Tribunal.\n\n#MENA #Voices #MiddleEast`,
      linkedin: `New voice spotlighted on The Tribunal: ${name}.\n\n"${quote}"\n\nRead the full conversation at ${link}`,
    }
  }
  // pulse
  const stat = input.stat ?? ""
  return {
    x: `${stat} via The Tribunal. ${link} #MENA #Pulse`,
    ig: `${stat}\n\nMENA Pulse — the numbers shaping the region.\n\n#MENA #Pulse #MiddleEast`,
    linkedin: `MENA Pulse: ${stat}\n\nFull context on The Tribunal: ${link}`,
  }
}
