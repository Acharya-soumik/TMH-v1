import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";

const router: IRouter = Router();

const chatbotRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages, please try again later" },
});

const SYSTEM_PROMPT = `You are The Tribunal's AI assistant. Reply like a WhatsApp message — short, direct, no fluff.

Rules:
- Max 2-3 sentences per reply
- No filler words, no "certainly", no "I'd be happy to"
- Skip grammar perfection, be natural
- Use line breaks not paragraphs
- If they ask about the platform, answer directly
- If off-topic, one line redirect: "that's outside what we cover here — ask me about debates, predictions, pulse, or voices"

The Tribunal = digital platform for 541M people across 19 MENA countries.
Features: Debates (anonymous polls on MENA issues), Predictions (crowd forecasts), Pulse (live MENA trends/stats), Voices (thought leader profiles), Majlis (private member chat).
Values: no editorial agenda, private opinions public data, real people only.`;

interface ChatMessage {
  role: string;
  content: string;
}

router.post("/chatbot/message", chatbotRateLimit, async (req, res) => {
  try {
    const { message, history, stream } = req.body as {
      message?: string;
      history?: ChatMessage[];
      stream?: boolean;
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

    const messages: { role: string; content: string }[] = [];
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-20);
      for (const msg of recentHistory) {
        if (msg && typeof msg.role === "string" && typeof msg.content === "string" && (msg.role === "user" || msg.role === "assistant")) {
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
        max_tokens: 256,
        temperature: 0.7,
        system: SYSTEM_PROMPT,
        messages,
        stream: !!stream,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[CHATBOT] Claude API error:", response.status, errText);
      return res.status(502).json({ error: "Failed to get response from AI" });
    }

    // Streaming mode
    if (stream && response.body) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const body = response.body as any;
      const reader = typeof body.getReader === "function" ? body.getReader() : null;

      if (reader) {
        const decoder = new TextDecoder();
        let done = false;
        while (!done) {
          const result = await reader.read();
          done = result.done;
          if (result.value) {
            const chunk = decoder.decode(result.value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6);
                if (jsonStr === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(jsonStr);
                  if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                    res.write(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`);
                  }
                  if (parsed.type === "message_stop") {
                    res.write(`data: [DONE]\n\n`);
                  }
                } catch {}
              }
            }
          }
        }
        res.end();
      } else if (body.pipe) {
        body.pipe(res);
      } else {
        res.end();
      }
      return;
    }

    // Non-streaming mode
    const data = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = data.content?.find((c) => c.type === "text")?.text ?? "couldn't generate a response, try again";
    return res.json({ response: text });
  } catch (err) {
    console.error("[CHATBOT] Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
