import { useState, useRef, useEffect, useCallback, type ReactNode } from "react"
import { useLocation } from "wouter"
import { X, Send, MessageCircle, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { useSiteSettings } from "@/hooks/use-cms-data"

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? ""

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  time: string
}

function getTimeStr(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// ── Markdown-style link parser ───────────────────────────────────
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
        className="inline text-[#5BA4E6] font-semibold hover:underline cursor-pointer"
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
    <div className="flex items-center gap-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.5)" }}
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

  useEffect(() => {
    if (messages.length > 0) return
    const greeting = majlisEnabled
      ? "hey! im noor — ask me about debates, predictions, trends, voices, or majlis. ill point you to the good stuff"
      : "hey! im noor — ask me about debates, predictions, trends, or voices. ill point you to the good stuff"
    setMessages([
      { id: "welcome", role: "assistant", content: greeting, time: getTimeStr() },
    ])
  }, [majlisEnabled, messages.length])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => inputRef.current?.focus(), 300)
    return () => clearTimeout(t)
  }, [isOpen])

  const closePanel = useCallback(() => setIsOpen(false), [])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content: text, time: getTimeStr() }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    const botId = `bot-${Date.now()}`
    const botTime = getTimeStr()
    setMessages(prev => [...prev, { id: botId, role: "assistant", content: "", time: botTime }])

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
        setMessages(prev => prev.map(m => m.id === botId ? { ...m, content: "hmm couldnt get a response — try again?" } : m))
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (last?.id === botId && !last.content) {
          return prev.map(m => m.id === botId ? { ...m, content: "something went wrong. try again" } : m)
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
      {/* Floating trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="bubble"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[600] flex items-center justify-center w-14 h-14 rounded-full cursor-pointer group"
            style={{
              background: "#DC143C",
              boxShadow: "0 4px 14px rgba(220,20,60,0.35)",
            }}
            aria-label="Chat with Noor"
          >
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
            >
              <MessageCircle className="w-6 h-6 text-white" strokeWidth={2} />
            </motion.div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
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
            className="fixed bottom-6 right-6 z-[600] w-[min(400px,calc(100vw-3rem))] flex flex-col overflow-hidden origin-bottom-right rounded-xl"
            style={{
              height: "min(560px, calc(100vh - 6rem))",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header — dark with crimson accent */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ background: "#1a1a1a" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0"
                  style={{ background: "#DC143C" }}
                >
                  <span className="font-serif font-black text-white text-sm">N</span>
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold leading-tight">Noor</h3>
                  <p className="text-[10px] text-white/50 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Messages — WhatsApp-style */}
            <div
              className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5"
              style={{
                background: "#0b0b0b",
                backgroundImage: "radial-gradient(circle at 50% 0%, rgba(220,20,60,0.03) 0%, transparent 60%)",
              }}
            >
              {messages.map(msg => {
                const isUser = msg.role === "user"
                const isStreaming = !isUser && !msg.content && isLoading

                return (
                  <div
                    key={msg.id}
                    className={cn("flex", isUser ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "relative max-w-[82%] px-3 py-2 text-[13px] leading-[1.45] font-sans",
                        isUser
                          ? "rounded-xl rounded-br-sm"
                          : "rounded-xl rounded-bl-sm"
                      )}
                      style={{
                        background: isUser ? "#DC143C" : "#1e1e1e",
                        color: isUser ? "#fff" : "rgba(255,255,255,0.9)",
                        wordBreak: "break-word",
                      }}
                    >
                      {/* Tail */}
                      <div
                        className="absolute bottom-0 w-2.5 h-2.5"
                        style={{
                          [isUser ? "right" : "left"]: -4,
                          background: isUser ? "#DC143C" : "#1e1e1e",
                          clipPath: isUser
                            ? "polygon(0 0, 100% 0, 0 100%)"
                            : "polygon(100% 0, 0 0, 100% 100%)",
                        }}
                      />
                      <div className="whitespace-pre-line">
                        {isStreaming ? (
                          <TypingDots />
                        ) : isUser ? (
                          msg.content
                        ) : (
                          parseInlineLinks(msg.content, navigate, closePanel)
                        )}
                      </div>
                      <div
                        className={cn(
                          "text-[9px] mt-1 select-none",
                          isUser ? "text-white/40 text-right" : "text-white/25 text-right"
                        )}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="px-3 py-2.5 flex items-center gap-2" style={{ background: "#141414" }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="type a message..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 text-[13px] text-white font-sans rounded-full focus:outline-none transition-colors placeholder:text-white/30 disabled:opacity-50"
                style={{ background: "#222" }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150 cursor-pointer flex-shrink-0",
                  input.trim() && !isLoading
                    ? "text-white"
                    : "text-white/20 cursor-not-allowed"
                )}
                style={{
                  background: input.trim() && !isLoading ? "#DC143C" : "#222",
                }}
                aria-label="Send message"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
