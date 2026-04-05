import { useState, useRef, useEffect } from "react"
import { Link } from "wouter"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, Share2, Linkedin, Lock, Mail, CheckCircle2, Flame, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useVotePoll } from "@workspace/api-client-react"
import type { Poll, PollOption } from "@workspace/api-client-react"
import { useVoter } from "@/hooks/use-voter"
import { useToast } from "@/hooks/use-toast"
import { useSiteSettings } from "@/hooks/use-cms-data"
import { cn } from "@/lib/utils"
import { PollViewToggle } from "./PollViewToggle"
import { getIpConsent } from "@/components/IpConsentBanner"
import { generateShareCard, generateStoryCard, getPollUrl, getWhatsAppUrl, getLinkedInUrl } from "@/lib/shareCard"
import { ShareToMajlisModal } from "@/components/ShareToMajlisModal"
import { ShareModal } from "@/components/ShareModal"

interface PollCardProps {
  poll: Poll
  featured?: boolean
}

type Phase = "vote" | "gate" | "results"

function getInitialPhase(pollId: number, hasVoted: (id: number) => boolean, shareGateEnabled?: boolean): Phase {
  if (typeof window === "undefined") return "vote"
  if (!hasVoted(pollId)) return "vote"
  // If share gate is disabled in CMS, skip straight to results
  if (!shareGateEnabled) return "results"
  if (localStorage.getItem(`tmh_unlocked_${pollId}`)) return "results"
  if (localStorage.getItem("tmh_email_submitted")) return "results"
  return "gate"
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return true; } catch {}
  }
  try {
    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0"
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

function generateInsight(
  votedPct: number,
  options: PollOption[]
): string {
  const maxPct = Math.max(...options.map(o => o.percentage ?? 0))
  const isMostDivided = maxPct < 35
  const isInMajority = votedPct >= 50
  const isStrong = votedPct >= 65

  if (isMostDivided) return "This is the most divided debate on The Tribunal right now. No clear majority."
  if (isStrong) return `${Math.round(votedPct)}% of the region voted the same way. You're with the majority.`
  if (isInMajority) return `You voted with ${Math.round(votedPct)}% of voters — a slim majority.`
  if (votedPct < 20) return `Only ${Math.round(votedPct)}% chose this. You might be onto something.`
  return `${Math.round(votedPct)}% of voters agree with you on this one.`
}

export function PollCard({ poll, featured = false }: PollCardProps) {
  const { hasVoted, getVotedOption, recordVote, token, currentStreak, isFirstTimer, markWelcomed, totalVotesAllTime } = useVoter()
  const { toast } = useToast()
  const { data: siteSettings } = useSiteSettings()
  const shareGate = siteSettings?.shareGate
  const voteMutation = useVotePoll()
  const [localOptions, setLocalOptions] = useState<PollOption[]>(poll.options ?? [])
  const [localTotal, setLocalTotal] = useState(poll.totalVotes ?? 0)
  const shareGateEnabled = !!shareGate?.enabled
  const [phase, setPhase] = useState<Phase>(() => getInitialPhase(poll.id, hasVoted, shareGateEnabled))
  const [isSharing, setIsSharing] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [newsletterOptIn, setNewsletterOptIn] = useState(true)
  const [wasFirstTimer, setWasFirstTimer] = useState(false)
  const [showShareTooltip, setShowShareTooltip] = useState(false)
  const [showMajlisShare, setShowMajlisShare] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showGateModal, setShowGateModal] = useState(true)
  const shareTooltipRef = useRef<HTMLDivElement>(null)
  const majlisEnabled = siteSettings?.featureToggles?.majlis?.enabled ?? false
  const emailCaptureEnabled = siteSettings?.featureToggles?.emailCapture?.enabled ?? true
  const hasMajlisToken = majlisEnabled && typeof window !== "undefined" && !!localStorage.getItem("majlis_token")

  const isVoted = hasVoted(poll.id)
  const votedOptionId = getVotedOption(poll.id)

  // Re-evaluate phase when vote status changes or shareGate setting loads from CMS
  useEffect(() => {
    if (isVoted && phase === "vote") {
      if (!shareGateEnabled) {
        setPhase("results")
      } else {
        const unlocked = localStorage.getItem("tmh_email_submitted") || localStorage.getItem(`tmh_unlocked_${poll.id}`)
        setPhase(unlocked ? "results" : "gate")
      }
    }
  }, [isVoted, phase, poll.id, shareGateEnabled])

  // When shareGate loads asynchronously and is disabled, transition gate -> results
  useEffect(() => {
    if (phase === "gate" && !shareGateEnabled) {
      setPhase("results")
    }
  }, [shareGateEnabled, phase])

  const unlock = () => {
    localStorage.setItem(`tmh_unlocked_${poll.id}`, "true")
    setPhase("results")
  }

  const handleVote = (optionId: number) => {
    // If clicking the same option they already voted for, do nothing
    if (votedOptionId === optionId) return

    const isChangeVote = isVoted
    const previousOptionId = votedOptionId

    if (!isChangeVote) {
      const firstVote = isFirstTimer
      setWasFirstTimer(firstVote)
    }

    recordVote(poll.id, optionId, poll.categorySlug)

    // Optimistic UI update
    let newTotal = localTotal
    if (!isChangeVote) newTotal = localTotal + 1

    const newOptions = localOptions.map(opt => {
      let newCount = opt.voteCount
      if (opt.id === optionId) newCount += 1
      if (isChangeVote && opt.id === previousOptionId) newCount = Math.max(newCount - 1, 0)
      return { ...opt, voteCount: newCount, percentage: newTotal > 0 ? Math.round((newCount / newTotal) * 100) : 0 }
    })
    setLocalOptions(newOptions)
    setLocalTotal(newTotal)

    const consent = getIpConsent()
    voteMutation.mutate(
      { id: poll.id, data: { optionId, voterToken: token, ipConsent: consent !== "rejected" } },
      {
        onSuccess: (data) => {
          if (data.success) {
            const serverMap = new Map(data.options.map((o: PollOption) => [o.id, o]))
            setLocalOptions(prev =>
              prev.map(opt => {
                const updated = serverMap.get(opt.id)
                return updated ? { ...opt, voteCount: updated.voteCount, percentage: updated.percentage } : opt
              })
            )
            setLocalTotal(data.totalVotes)
          }
        },
        onError: () => {
          toast({ title: "Vote failed", description: "Could not record your vote. Please try again.", variant: "destructive" })
        },
      }
    )

    // Only transition phase on first vote, not on vote changes
    if (!isChangeVote) {
      const alreadyUnlocked = localStorage.getItem("tmh_email_submitted") || localStorage.getItem(`tmh_unlocked_${poll.id}`)
      setTimeout(() => {
        if (!shareGateEnabled || alreadyUnlocked) { unlock() } else { setShowGateModal(true); setPhase("gate") }
      }, 500)
    }
  }

  const handleShareWhatsApp = () => {
    const url = getWhatsAppUrl(poll.question, getPollUrl(poll.id))
    window.open(url, "_blank", "noopener,noreferrer")
    setTimeout(unlock, 800)
  }

  const handleShareLinkedIn = () => {
    const url = getLinkedInUrl(getPollUrl(poll.id))
    window.open(url, "_blank", "noopener,noreferrer")
    setTimeout(unlock, 800)
  }

  const handleShareX = () => {
    const text = encodeURIComponent(`"${poll.question}" — where do you stand? Vote on The Tribunal:`)
    const url = encodeURIComponent(getPollUrl(poll.id))
    window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer")
    setTimeout(unlock, 800)
  }

  const handleShareInstagramStory = async () => {
    const votedOption = localOptions.find(o => o.id === votedOptionId)
    if (!votedOption) return
    setIsSharing(true)
    try {
      const blob = await generateStoryCard({
        question: poll.question,
        votedOptionText: votedOption.text,
        votedPct: votedOption.percentage ?? 0,
        totalVotes: localTotal,
      })
      if (!blob) throw new Error("canvas failed")

      const file = new File([blob], "tmh-story.png", { type: "image/png" })
      const canShare = navigator.canShare && navigator.canShare({ files: [file] })

      if (canShare) {
        await navigator.share({ files: [file], title: poll.question })
        setTimeout(unlock, 800)
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "tmh-story.png"
        a.click()
        URL.revokeObjectURL(url)
        toast({ title: "Story card saved!", description: "Open Instagram and share it to your Story." })
        setTimeout(unlock, 800)
      }
    } catch {
      toast({ title: "Couldn't generate story card", description: "Try another share option below.", variant: "destructive" })
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyLink = async () => {
    const pollUrl = getPollUrl(poll.id)
    const votedOpt = localOptions.find(o => o.id === votedOptionId)
    const votePart = votedOpt ? `I voted "${votedOpt.text}"` : "Where do you stand?"
    const fullText = `"${poll.question}" — ${votePart} on The Tribunal: ${pollUrl}`
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
    await copyToClipboard(fullText)
    setTimeout(unlock, 500)
  }

  const handleCardShareIcon = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowShareModal(true)
  }

  const handleEmailUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setEmailSubmitted(true)
    localStorage.setItem("tmh_email_submitted", "true")
    const baseUrl = import.meta.env?.VITE_API_BASE_URL ?? ""
    fetch(`${baseUrl}/api/polls/${poll.id}/email-unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), newsletterOptIn }),
    }).catch(() => {})
    setTimeout(unlock, 1000)
  }

  const handleShareStance = async () => {
    const pollUrl = getPollUrl(poll.id)
    const votedOption = localOptions.find(o => o.id === votedOptionId)
    if (!votedOption) return
    setIsSharing(true)
    const votedPct = Math.round(votedOption.percentage ?? 0)
    const shareText = `I voted "${votedOption.text}" on The Tribunal 🔴\n\n"${poll.question}"\n\n${votedPct}% of the region agrees. Where do you stand? 👇\n${pollUrl}`
    try {
      const blob = await generateShareCard({
        question: poll.question,
        votedOptionText: votedOption.text,
        votedPct: votedOption.percentage ?? 0,
        totalVotes: localTotal,
      })
      const isMobile = /Mobi|Android/i.test(navigator.userAgent)
      const file = blob ? new File([blob], "tmh-poll.png", { type: "image/png" }) : null
      const canShareFile = file && navigator.canShare && navigator.canShare({ files: [file] })
      if (isMobile && canShareFile) {
        await navigator.share({ title: poll.question, text: shareText, files: [file!] })
      } else if (navigator.share) {
        await navigator.share({ title: poll.question, text: shareText, url: pollUrl })
      } else {
        const ok = await copyToClipboard(shareText)
        toast({ title: ok ? "Copied — share your take!" : "Ready to share", description: "Paste it anywhere to spread the debate." })
      }
    } catch (err) {
      const ok = await copyToClipboard(shareText || pollUrl)
      toast({ title: ok ? "Copied to clipboard!" : "Share this link", description: ok ? "Paste it anywhere to share your stance." : pollUrl })
    } finally {
      setIsSharing(false)
    }
  }

  const handleWelcomeCTA = () => {
    markWelcomed()
    document.getElementById("cross-sell-polls")?.scrollIntoView({ behavior: "smooth" })
  }

  const isLive = !poll.endsAt || new Date(poll.endsAt) > new Date()
  const votedOption = localOptions.find(o => o.id === votedOptionId)

  return (
    <>
      <div className={cn(
        "bg-card border border-border flex flex-col transition-all duration-300",
        featured ? "md:flex-row md:items-stretch" : ""
      )}>
        {/* Left: question + metadata */}
        <div className={cn("p-6 sm:p-8 flex-1 flex flex-col", featured ? "md:p-12 md:w-1/2" : "")}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.25em]">
                {poll.category}
              </span>
              {isLive && (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-[0.25em]">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  LIVE
                </span>
              )}
            </div>

            <div className="relative flex items-center gap-2">
              {/* "You haven't weighed in" subtle dot when not voted */}
              {!isVoted && (
                <span className="hidden sm:flex items-center gap-1 text-[9px] uppercase tracking-widest text-muted-foreground font-serif">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                  Weigh in
                </span>
              )}
              {/* "You voted" when voted */}
              {isVoted && (
                <span className="hidden sm:flex items-center gap-1 text-[9px] uppercase tracking-widest text-primary font-serif font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  Voted
                </span>
              )}
              {hasMajlisToken && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMajlisShare(true) }}
                  className="text-muted-foreground hover:text-primary transition-colors p-2"
                  aria-label="Share to Majlis chat"
                  title="Share to Majlis"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleCardShareIcon}
                className="text-muted-foreground hover:text-foreground transition-colors p-2"
                aria-label="Share debate"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {showShareTooltip && (
                <div
                  ref={shareTooltipRef}
                  className="absolute right-0 top-full mt-1 z-50 bg-foreground text-background px-3 py-2 text-[10px] font-sans shadow-lg min-w-max max-w-[240px]"
                >
                  <p className="font-bold mb-1">Poll link:</p>
                  <p className="text-background/70 break-all">{getPollUrl(poll.id)}</p>
                </div>
              )}
            </div>
          </div>

          <Link href={`/debates/${poll.id}`}>
            <h3 className={cn(
              "font-serif font-black text-foreground uppercase tracking-tight hover:text-primary transition-colors cursor-pointer mb-4",
              featured ? "text-4xl md:text-5xl leading-none" : "text-3xl leading-none"
            )}>
              {poll.question}
            </h3>
          </Link>

          {poll.context && (
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4 font-sans">
              {poll.context}
            </p>
          )}

          <div className="mt-auto pt-6 border-t border-border flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="flex items-center gap-4">
              {isVoted && votedOption ? (
                <span className="text-primary font-bold">
                  You voted: {votedOption.text.length > 20 ? votedOption.text.slice(0, 17) + "…" : votedOption.text} · {localTotal.toLocaleString()} total
                </span>
              ) : (
                <>
                  <span>{localTotal.toLocaleString()} votes</span>
                  {poll.endsAt && (
                    <span>{isLive ? `Ends ${formatDistanceToNow(new Date(poll.endsAt))}` : "Ended"}</span>
                  )}
                </>
              )}
            </div>
            {!featured && (
              <Link href={`/debates/${poll.id}`} className="text-foreground hover:text-primary flex items-center gap-1 transition-colors font-bold">
                VIEW <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Right: voting / gate / results panel */}
        <div className={cn(
          "p-6 sm:p-8 bg-background border-t border-border flex flex-col justify-center",
          featured ? "md:w-1/2 md:border-t-0 md:border-l" : ""
        )}>
          <AnimatePresence mode="wait">

            {/* PHASE: VOTE */}
            {phase === "vote" && (() => {
              const ptype = poll.pollType as string
              const isBinaryPair = ptype === "binary" && localOptions.length === 2
              return (
              <motion.div key="voting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-3 mb-4 border-l-4 border-primary pl-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    {ptype === "hot_take" ? "What Do You Think?" : ptype === "scale" ? "Rate This" : "Cast Your Vote"}
                  </span>
                </div>

                {/* BINARY: Two prominent YES/NO buttons side by side */}
                {isBinaryPair && (
                  <div className="flex gap-3">
                    {localOptions.map((option, i) => {
                      const isYes = i === 0
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleVote(option.id)}
                          disabled={!isLive}
                          className={cn(
                            "flex-1 py-5 text-center font-bold text-sm uppercase tracking-widest border-2 transition-all duration-150",
                            isYes
                              ? "border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                              : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
                            !isLive && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {option.text}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* HOT TAKE: Agree/Disagree with colored emphasis */}
                {ptype === "hot_take" && (
                  <div className="space-y-3">
                    {localOptions.map((option, i) => {
                      const colors = ["border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white", "border-red-500 text-red-500 hover:bg-red-500 hover:text-white", "border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white", "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"]
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleVote(option.id)}
                          disabled={!isLive}
                          className={cn(
                            "group w-full text-left px-5 py-4 border-2 transition-all duration-150 font-bold text-sm uppercase tracking-wider",
                            colors[i % colors.length],
                            !isLive && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <span className="block transition-transform duration-150 group-hover:translate-x-1">
                            {option.text}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* SCALE: Horizontal rating buttons */}
                {ptype === "scale" && (
                  <div className="flex gap-2 flex-wrap">
                    {localOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleVote(option.id)}
                        disabled={!isLive}
                        className={cn(
                          "flex-1 min-w-[3rem] py-4 text-center border border-border transition-all duration-150 font-bold text-sm",
                          "hover:bg-primary hover:text-primary-foreground hover:border-primary",
                          !isLive && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                )}

                {/* MULTIPLE CHOICE + DEFAULT: Standard stacked option buttons */}
                {!isBinaryPair && ptype !== "hot_take" && ptype !== "scale" && (
                  <div className="space-y-3">
                    {localOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleVote(option.id)}
                        disabled={!isLive}
                        className={cn(
                          "tmh-vote-option group w-full text-left px-5 py-4 border border-border transition-colors duration-150 font-medium text-sm font-sans",
                          "bg-background text-foreground",
                          "hover:bg-foreground hover:text-background hover:border-foreground",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          !isLive && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span className="block transition-transform duration-150 group-hover:translate-x-1">
                          {option.text}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
              )
            })()}

            {/* PHASE: SHARE GATE — blurred placeholder in panel */}
            {phase === "gate" && (
              <motion.div key="gate-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="space-y-3 pointer-events-none select-none" style={{ filter: "blur(3.5px)", opacity: 0.45 }}>
                  {localOptions.slice(0, 3).map(opt => (
                    <div key={opt.id} className="flex items-center gap-3">
                      <span className="text-xs font-sans text-foreground truncate flex-1">{opt.text}</span>
                      <div className="w-20 h-2 bg-border overflow-hidden rounded">
                        <div className="h-full bg-primary transition-all" style={{ width: `${opt.percentage ?? 0}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{opt.percentage ?? 0}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-primary">
                  <Lock className="w-3.5 h-3.5" />
                  {shareGate?.heading || "Share to unlock full breakdown"}
                </div>
              </motion.div>
            )}

            {/* PHASE: RESULTS */}
            {phase === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* First-time welcome message */}
                {wasFirstTimer && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-primary/10 border border-primary/30 p-4"
                  >
                    <p className="font-serif font-black uppercase text-sm text-primary tracking-tight mb-1">
                      Welcome to The Tribunal<span className="text-primary">.</span>
                    </p>
                    <p className="text-[11px] text-foreground/70 font-sans leading-relaxed">
                      You just joined {localTotal.toLocaleString()} people shaping the region's most honest conversation.
                    </p>
                    <button
                      onClick={handleWelcomeCTA}
                      className="mt-3 text-[10px] font-black uppercase tracking-widest text-primary hover:text-foreground transition-colors border-b border-primary/40 hover:border-foreground pb-0.5"
                    >
                      Keep Voting →
                    </button>
                  </motion.div>
                )}

                {/* Streak badge */}
                {currentStreak >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <Flame className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary font-serif">
                      {currentStreak}-day streak
                    </span>
                  </motion.div>
                )}
                {currentStreak === 1 && totalVotesAllTime === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-serif"
                  >
                    Day 1 — come back tomorrow.
                  </motion.div>
                )}

                {/* Personal Insight Card */}
                {votedOptionId && votedOption && (() => {
                  const pct = votedOption.percentage ?? 0
                  const insight = generateInsight(pct, localOptions)
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-secondary/60 border border-border p-4"
                    >
                      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-2 font-serif">
                        Your Result
                      </p>
                      <p className="font-serif font-black uppercase text-sm text-foreground tracking-tight leading-snug">
                        {insight}
                      </p>
                      <div className="mt-3 pt-3 border-t border-border/60 flex items-center gap-2">
                        <span className="text-[10px] text-primary font-bold font-sans">"{votedOption.text}"</span>
                        <span className="text-[10px] text-muted-foreground font-sans">— your vote</span>
                      </div>
                    </motion.div>
                  )
                })()}

                <PollViewToggle
                  pollId={poll.id}
                  totalVotes={localTotal}
                  resultsView={
                    <>
                      {/* Results bars — clickable to change vote */}
                      {localOptions.map((option, i) => (
                        <div
                          key={option.id}
                          className={cn("relative cursor-pointer group/bar", option.id !== votedOptionId && "hover:opacity-80")}
                          onClick={() => handleVote(option.id)}
                          role="button"
                          aria-label={`Change vote to ${option.text}`}
                        >
                          <div className="flex justify-between items-end mb-1">
                            <span className={cn(
                              "text-sm font-sans",
                              option.id === votedOptionId ? "text-primary font-bold" : "text-foreground font-medium group-hover/bar:text-primary"
                            )}>
                              {option.text}
                            </span>
                            <span className="font-serif font-bold text-lg text-foreground leading-none">{option.percentage}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-secondary overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${option.percentage}%` }}
                              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.25, 1, 0.5, 1] }}
                              className={cn("h-full", option.id === votedOptionId ? "bg-primary" : "bg-foreground/20")}
                            />
                          </div>
                        </div>
                      ))}

                      <div className="pt-4 border-t border-border flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
                        <p className="font-serif font-black uppercase tracking-widest text-sm text-primary">
                          Voted — Results Live
                        </p>
                      </div>
                    </>
                  }
                />

                {/* Share Your Stance */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className={cn(
                      "w-full flex items-center justify-center gap-2.5 px-5 py-3.5",
                      "bg-foreground text-background text-[11px] font-black uppercase tracking-[0.2em]",
                      "hover:bg-primary hover:text-white transition-colors duration-150",
                    )}
                  >
                    <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
                    Share Your Result
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* ── SHARE GATE OVERLAY ── */}
      {phase === "gate" && showGateModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center p-4"
          style={{ background: "rgba(10,10,10,0.88)", backdropFilter: "blur(14px)" }}
          onClick={() => setShowGateModal(false)}
        >
          <div
            className="tmh-gate-card relative w-full max-w-lg rounded-[14px] p-8 sm:p-10 space-y-5"
            style={{ background: "#141414", border: "1px solid rgba(220,20,60,0.22)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close hint */}
            <button
              onClick={() => setShowGateModal(false)}
              className="absolute top-4 right-4 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground font-serif"
            >
              {shareGate?.skipText || "Skip →"}
            </button>

            {/* Header */}
            <div>
              <p className="font-serif font-black uppercase text-2xl tracking-tight text-foreground" style={{ fontSize: "2.1rem", lineHeight: 1.05 }}>
                {shareGate?.heading || "Unlock Full Results"}
              </p>
              <p className="text-[13px] text-muted-foreground font-sans mt-2 leading-relaxed">
                {shareGate?.body || "Share this debate — or drop your email. Either unlocks the full regional breakdown."}
              </p>
            </div>

            {/* Blurred preview bars */}
            <div className="space-y-2 py-1 pointer-events-none select-none" style={{ filter: "blur(3.5px)" }}>
              {localOptions.slice(0, 3).map(opt => (
                <div key={opt.id} className="flex items-center gap-3">
                  <span className="text-xs font-sans text-foreground/70 truncate flex-1">{opt.text}</span>
                  <div className="flex-shrink-0 w-24 h-[9px] rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded" style={{ width: `${opt.percentage ?? 0}%`, background: "#DC143C" }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right flex-shrink-0">{opt.percentage ?? 0}%</span>
                </div>
              ))}
            </div>

            {/* WhatsApp — full width */}
            <button
              onClick={handleShareWhatsApp}
              className="w-full flex items-center justify-center gap-3 px-5 py-4 font-black uppercase tracking-[0.15em] text-[11px] transition-colors duration-150 rounded-sm cursor-pointer"
              style={{ background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.28)", color: "#25D366" }}
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share on WhatsApp
            </button>

            {/* Other share buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "LinkedIn", onClick: handleShareLinkedIn, icon: <Linkedin className="w-4 h-4 text-[#0A66C2]" /> },
                {
                  label: "X", onClick: handleShareX,
                  icon: <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.732-8.853L2.16 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                },
                {
                  label: "Instagram", onClick: handleShareInstagramStory,
                  icon: <svg className="w-4 h-4 text-[#E4405F]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 1 1-2.88 0 1.441 1.441 0 0 1 2.88 0z"/></svg>
                },
                {
                  label: linkCopied ? "Copied!" : "Copy",
                  onClick: handleCopyLink,
                  icon: linkCopied
                    ? <CheckCircle2 className="w-4 h-4 text-primary" />
                    : <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                },
              ].map(btn => (
                <button
                  key={btn.label}
                  onClick={btn.onClick}
                  className="flex flex-col items-center gap-1.5 px-2 py-3 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 rounded-sm cursor-pointer"
                >
                  {btn.icon}
                  <span className="text-[9px] uppercase tracking-[0.1em] font-bold text-muted-foreground font-serif">{btn.label}</span>
                </button>
              ))}
            </div>

            {emailCaptureEnabled && (
              <>
                {/* OR divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold font-serif">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Email unlock */}
                {emailSubmitted ? (
                  <div className="flex items-center gap-2 text-[11px] font-bold text-primary uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4" />
                    Unlocking results…
                  </div>
                ) : (
                  <form onSubmit={handleEmailUnlock} className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder={shareGate?.emailPlaceholder || "your@email.com"}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="flex-1 px-4 py-3 text-white text-sm font-sans focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground rounded-sm"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 text-white font-black uppercase tracking-[0.1em] text-[11px] hover:opacity-90 transition-opacity whitespace-nowrap rounded-sm font-serif"
                      style={{ background: "#DC143C" }}
                    >
                      Unlock Results
                    </button>
                  </form>
                )}

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newsletterOptIn}
                    onChange={e => setNewsletterOptIn(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-sm accent-primary cursor-pointer"
                  />
                  <span className="text-[10px] text-muted-foreground font-sans">
                    Send me The Tribunal newsletter with insights & results
                  </span>
                </label>
                <p className="text-[10px] text-muted-foreground font-sans">No spam. Unsubscribe anytime.</p>
              </>
            )}
          </div>
        </div>
      )}

      {showMajlisShare && (
        <ShareToMajlisModal
          shareString={`[share:debate:${poll.id}|${poll.question}|${localTotal} votes|${poll.category}]`}
          onClose={() => setShowMajlisShare(false)}
        />
      )}

      {showShareModal && (
        <ShareModal
          url={getPollUrl(poll.id)}
          title={poll.question}
          heading={phase === "results" ? "Share This" : "Share to Unlock Full Results"}
          body={phase === "results"
            ? "See what others have to say — share and spark a conversation."
            : "We keep The Tribunal free by making opinion data shareable. Share this debate to see the full breakdown."
          }
          category={poll.category}
          totalVotes={localTotal}
          votedOptionText={votedOption?.text}
          votedPct={votedOption?.percentage}
          options={localOptions.map(o => ({ text: o.text, percentage: o.percentage ?? 0 }))}
          onClose={() => {
            setShowShareModal(false)
            // After modal closes, check if email was submitted and unlock if so
            if (phase === "gate" && localStorage.getItem("tmh_email_submitted")) {
              unlock()
            }
          }}
        />
      )}
    </>
  )
}
