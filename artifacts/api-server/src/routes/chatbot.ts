import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";

const router: IRouter = Router();

const chatbotRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // max 30 messages per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages, please try again later" },
});

const SYSTEM_PROMPT = `You are The Tribunal's AI assistant. The Tribunal is a digital platform amplifying the voice of 541 million people across 19 MENA countries.

Key features:
- Debates: Anonymous polling on critical MENA issues (politics, economy, society, technology)
- Predictions: Forecast future events with crowd-sourced confidence levels
- Pulse: Real-time trends and statistics across the MENA region
- Voices: Profiles of thought leaders, activists, journalists from MENA
- Majlis: Private discussion space for invited members

The platform stands for: no editorial agenda, private opinions with public data, real people only, and asking the questions no one else asks.

Keep responses concise, helpful, and focused on the platform. If asked about topics outside the platform, gently redirect.`;

interface ChatMessage {
  role: string;
  content: string;
}

router.post("/chatbot/message", chatbotRateLimit, async (req, res) => {
  try {
    const { message, history } = req.body as {
      message?: string;
      history?: ChatMessage[];
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "message is required" });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: "Message too long (max 2000 characters)" });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "Chatbot is not configured" });
    }

    // Build messages array from history + current message
    const messages: { role: string; content: string }[] = [];

    if (Array.isArray(history)) {
      // Only keep the last 20 messages to avoid token overflow
      const recentHistory = history.slice(-20);
      for (const msg of recentHistory) {
        if (
          msg &&
          typeof msg.role === "string" &&
          typeof msg.content === "string" &&
          (msg.role === "user" || msg.role === "assistant")
        ) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    messages.push({ role: "user", content: message.trim() });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        temperature: 0.5,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[CHATBOT] Claude API error:", response.status, errText);
      return res.status(502).json({ error: "Failed to get response from AI" });
    }

    const data = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };

    const text =
      data.content?.find((c) => c.type === "text")?.text ??
      "I'm sorry, I couldn't generate a response. Please try again.";

    return res.json({ response: text });
  } catch (err) {
    console.error("[CHATBOT] Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
