import { useState, useRef, useEffect, useCallback } from "react"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? ""

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "hey! ask me anything about The Tribunal \u2014 debates, predictions, pulse, voices",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

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

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content: text }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    const botId = `bot-${Date.now()}`
    // Add empty bot message that we'll stream into
    setMessages(prev => [...prev, { id: botId, role: "assistant", content: "" }])

    try {
      const history = messages.filter(m => m.id !== "welcome").map(m => ({ role: m.role, content: m.content }))

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

      // If stream returned nothing, show fallback
      if (!accumulated) {
        setMessages(prev => prev.map(m => m.id === botId ? { ...m, content: "hmm, couldn't get a response. try again?" } : m))
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (last?.id === botId && !last.content) {
          return prev.map(m => m.id === botId ? { ...m, content: "sorry, something went wrong. try again in a sec" } : m)
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
      {/* Floating chat bubble */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={cn(
          "fixed bottom-6 right-6 z-[600] flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 cursor-pointer",
          "bg-[#DC143C] hover:bg-[#B01030] text-white",
          "hover:scale-105 active:scale-95",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-[600] w-[min(400px,calc(100vw-3rem))] flex flex-col rounded-xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right",
          "border border-border bg-background",
          isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-75 opacity-0 pointer-events-none"
        )}
        style={{ height: "min(500px, calc(100vh - 6rem))" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-[#DC143C]">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-white" />
            <div>
              <h3 className="font-serif font-black text-sm uppercase tracking-wide text-white">Ask The Tribunal</h3>
              <p className="text-[10px] text-white/70 font-sans">AI-powered assistant</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close chat"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] px-4 py-2.5 rounded-xl text-sm leading-relaxed font-sans whitespace-pre-line",
                  msg.role === "user"
                    ? "bg-[#DC143C] text-white rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm border border-border"
                )}
              >
                {msg.content || (isLoading && msg.id.startsWith("bot-") ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> typing...
                  </span>
                ) : msg.content)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border px-4 py-3 bg-background">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about The Tribunal..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm text-foreground font-sans bg-secondary border border-border rounded-lg focus:outline-none focus:border-[#DC143C] transition-colors placeholder:text-muted-foreground disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150 cursor-pointer",
                input.trim() && !isLoading
                  ? "bg-[#DC143C] hover:bg-[#B01030] text-white"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              )}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
