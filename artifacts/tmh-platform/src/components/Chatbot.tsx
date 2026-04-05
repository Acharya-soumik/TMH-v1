import { useState, useRef, useEffect, useCallback, type ReactNode } from "react"
import { useLocation } from "wouter"
import { X, Send, Sparkles, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { useSiteSettings } from "@/hooks/use-cms-data"

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? ""

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

// ── Noor avatar SVG ──────────────────────────────────────────────
function NoorAvatar({ size = 36 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 30% 30%, #FFC857 0%, #DC143C 55%, #7A0A1F 100%)",
        borderRadius: "50%",
        boxShadow: "0 0 0 2px rgba(255,200,87,0.15), 0 6px 18px rgba(220,20,60,0.35)",
      }}
    >
      <Sparkles
        className="text-white"
        style={{ width: size * 0.55, height: size * 0.55 }}
        strokeWidth={2.5}
      />
    </div>
  )
}

// ── Markdown-style link parser ───────────────────────────────────
// Matches [text](/path) and splits message into text/link segments
function parseInlineLinks(text: string, navigate: (path: string) => void, closePanel: () => void): ReactNode[] {
  const parts: ReactNode[] = []
  const regex = /\[([^\]]+)\]\((\/[^\s)]*)\)/g
  let lastIndex = 0
  let match
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const label = match[1]
    const path = match[2]
    parts.push(
      <button
        key={`link-${key++}`}
        onClick={(e) => {
          e.preventDefault()
          navigate(path)
          closePanel()
        }}
        className="inline text-primary font-bold hover:underline cursor-pointer"
      >
        {label}
      </button>
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  return parts
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

export function Chatbot() {
  const [, navigate] = useLocation()
  const { data: siteSettings } = useSiteSettings()
  const majlisEnabled = siteSettings?.featureToggles?.majlis?.enabled ?? false

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Set greeting once site settings load (so we know whether to mention Majlis)
  useEffect(() => {
    if (messages.length > 0) return
    const baseGreeting = "Hi — I'm Noor, your guide to The Tribunal. ✨"
    const features = majlisEnabled
      ? "Ask me about debates, predictions, MENA trends, voices, or Majlis — I can point you to specific things worth checking out."
      : "Ask me about debates, predictions, MENA trends, or voices — I can point you to specific things worth checking out."
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `${baseGreeting}\n\n${features}`,
      },
    ])
  }, [majlisEnabled, messages.length])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => inputRef.current?.focus(), 300)
    return () => clearTimeout(t)
  }, [isOpen])

  const closePanel = useCallback(() => setIsOpen(false), [])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content: text }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    const botId = `bot-${Date.now()}`
    setMessages(prev => [...prev, { id: botId, role: "assistant", content: "" }])

    try {
      const history = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.role, content: m.content }))

      abortRef.current = new AbortController()
      const res = await fetch(`${API_BASE}/api/chatbot/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, stream: true }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error || "Failed to get response")
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No stream")

      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                accumulated += parsed.text
                const current = accumulated
                setMessages(prev => prev.map(m => m.id === botId ? { ...m, content: current } : m))
              }
            } catch {}
          }
        }
      }

      if (!accumulated) {
        setMessages(prev => prev.map(m => m.id === botId ? { ...m, content: "hmm, couldn't get a response — try again?" } : m))
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (last?.id === botId && !last.content) {
          return prev.map(m => m.id === botId ? { ...m, content: "sorry, something went wrong. try again in a sec." } : m)
        }
        return prev
      })
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating trigger bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="bubble"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[600] flex items-center gap-3 pl-3 pr-4 py-3 rounded-full shadow-2xl cursor-pointer group"
            style={{
              background: "linear-gradient(135deg, #DC143C 0%, #9A0E2C 100%)",
              boxShadow: "0 10px 30px rgba(220,20,60,0.4)",
            }}
            aria-label="Chat with Noor"
          >
            <NoorAvatar size={32} />
            <span className="font-serif font-black text-xs uppercase tracking-[0.15em] text-white pr-1">
              Ask Noor
            </span>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-[600] w-[min(420px,calc(100vw-3rem))] flex flex-col rounded-2xl overflow-hidden origin-bottom-right"
            style={{
              height: "min(580px, calc(100vh - 6rem))",
              boxShadow: "0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(220,20,60,0.2)",
              background: "var(--background)",
            }}
          >
            {/* Header */}
            <div
              className="relative flex items-center justify-between px-5 py-4 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #DC143C 0%, #7A0A1F 100%)",
              }}
            >
              {/* Decorative radial glow */}
              <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30"
                style={{ background: "radial-gradient(circle, #FFC857 0%, transparent 70%)" }}
              />

              <div className="flex items-center gap-3 relative z-10">
                <NoorAvatar size={42} />
                <div>
                  <h3 className="font-serif font-black text-base uppercase tracking-wide text-white flex items-center gap-1">
                    Noor<span className="text-[#FFC857]">.</span>
                  </h3>
                  <p className="text-[10px] text-white/80 font-sans flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Your guide to The Tribunal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-5 space-y-4"
              style={{
                background: "linear-gradient(180deg, rgba(220,20,60,0.02) 0%, var(--background) 100%)",
              }}
            >
              {messages.map(msg => {
                const isUser = msg.role === "user"
                const isStreaming = !isUser && !msg.content && isLoading
                return (
                  <div
                    key={msg.id}
                    className={cn("flex items-start gap-2.5", isUser ? "justify-end" : "justify-start")}
                  >
                    {!isUser && <NoorAvatar size={28} />}
                    <div
                      className={cn(
                        "max-w-[78%] px-4 py-3 text-sm leading-relaxed font-sans whitespace-pre-line",
                        isUser
                          ? "text-white rounded-2xl rounded-br-sm"
                          : "rounded-2xl rounded-bl-sm border border-border"
                      )}
                      style={
                        isUser
                          ? { background: "linear-gradient(135deg, #DC143C 0%, #9A0E2C 100%)" }
                          : { background: "var(--secondary)" }
                      }
                    >
                      {isStreaming ? (
                        <TypingDots />
                      ) : isUser ? (
                        msg.content
                      ) : (
                        parseInlineLinks(msg.content, navigate, closePanel)
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border px-4 py-3" style={{ background: "var(--background)" }}>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Noor anything..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 text-sm text-foreground font-sans bg-secondary border border-border rounded-full focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150 cursor-pointer flex-shrink-0",
                    input.trim() && !isLoading
                      ? "text-white shadow-md hover:scale-105 active:scale-95"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  )}
                  style={
                    input.trim() && !isLoading
                      ? { background: "linear-gradient(135deg, #DC143C 0%, #9A0E2C 100%)" }
                      : undefined
                  }
                  aria-label="Send message"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[9px] text-muted-foreground font-sans mt-2 text-center tracking-wide">
                Noor is powered by AI. Be kind — she's learning too.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
