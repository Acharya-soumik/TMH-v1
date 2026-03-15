import { useState } from "react"
import { Link } from "wouter"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Users, ArrowRight, Share2, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useVotePoll } from "@workspace/api-client-react"
import type { Poll, PollOption } from "@workspace/api-client-react/src/generated/api.schemas"
import { useVoter } from "@/hooks/use-voter"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface PollCardProps {
  poll: Poll
  featured?: boolean
}

export function PollCard({ poll, featured = false }: PollCardProps) {
  const { hasVoted, getVotedOption, recordVote, token } = useVoter()
  const { toast } = useToast()
  const voteMutation = useVotePoll()
  
  const [localOptions, setLocalOptions] = useState<PollOption[]>(poll.options)
  const [localTotal, setLocalTotal] = useState(poll.totalVotes)
  const isVoted = hasVoted(poll.id)
  const votedOptionId = getVotedOption(poll.id)

  const handleVote = (optionId: number) => {
    if (isVoted) return

    // Optimistic update locally
    recordVote(poll.id, optionId)
    const newTotal = localTotal + 1
    const newOptions = localOptions.map(opt => {
      const newCount = opt.id === optionId ? opt.voteCount + 1 : opt.voteCount
      return {
        ...opt,
        voteCount: newCount,
        percentage: Math.round((newCount / newTotal) * 100)
      }
    })
    setLocalOptions(newOptions)
    setLocalTotal(newTotal)

    voteMutation.mutate(
      { id: poll.id, data: { optionId, voterToken: token } },
      {
        onSuccess: (data) => {
          if (data.success) {
            setLocalOptions(data.options)
            setLocalTotal(data.totalVotes)
          }
        },
        onError: () => {
          toast({
            title: "Vote failed",
            description: "Could not record your vote. Please try again.",
            variant: "destructive"
          })
        }
      }
    )
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/polls/${poll.id}`
    if (navigator.share) {
      navigator.share({ title: poll.question, url })
    } else {
      navigator.clipboard.writeText(url)
      toast({ title: "Link copied!", description: "Poll link copied to clipboard." })
    }
  }

  const isLive = !poll.endsAt || new Date(poll.endsAt) > new Date()

  return (
    <div className={cn(
      "bg-card rounded-2xl border border-border shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:border-primary/30",
      featured ? "md:flex-row md:items-stretch" : ""
    )}>
      <div className={cn("p-6 sm:p-8 flex-1 flex flex-col", featured ? "md:p-12 md:w-1/2" : "")}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full uppercase tracking-wider">
              {poll.category}
            </span>
            {isLive && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                LIVE
              </span>
            )}
          </div>
          <button 
            onClick={handleShare}
            className="text-muted-foreground hover:text-primary transition-colors p-2"
            aria-label="Share poll"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <Link href={`/polls/${poll.id}`}>
          <h3 className={cn(
            "font-serif font-bold text-foreground hover:text-primary transition-colors cursor-pointer mb-3",
            featured ? "text-3xl md:text-4xl leading-tight" : "text-xl"
          )}>
            {poll.question}
          </h3>
        </Link>
        
        {poll.context && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">
            {poll.context}
          </p>
        )}

        <div className="mt-auto pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {localTotal.toLocaleString()} votes
            </span>
            {poll.endsAt && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {isLive ? `Ends ${formatDistanceToNow(new Date(poll.endsAt))} from now` : 'Ended'}
              </span>
            )}
          </div>
          
          {!featured && (
            <Link href={`/polls/${poll.id}`} className="text-primary hover:underline flex items-center gap-1">
              View <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      <div className={cn(
        "p-6 sm:p-8 bg-secondary/30 border-t border-border flex flex-col justify-center", 
        featured ? "md:w-1/2 md:border-t-0 md:border-l" : ""
      )}>
        <AnimatePresence mode="wait">
          {!isVoted ? (
            <motion.div 
              key="voting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {localOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  disabled={!isLive}
                  className={cn(
                    "w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 font-medium",
                    "bg-card border-border hover:border-primary hover:shadow-md",
                    !isLive && "opacity-50 cursor-not-allowed hover:border-border hover:shadow-none"
                  )}
                >
                  {option.text}
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {localOptions.map((option) => (
                <div key={option.id} className="relative">
                  <div className="flex justify-between items-end mb-2 text-sm font-medium">
                    <span className={cn(
                      "flex items-center gap-2", 
                      option.id === votedOptionId ? "text-primary font-bold" : "text-foreground"
                    )}>
                      {option.text}
                      {option.id === votedOptionId && <CheckCircle2 className="w-4 h-4" />}
                    </span>
                    <span className="text-foreground">{option.percentage}%</span>
                  </div>
                  <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${option.percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        option.id === votedOptionId ? "bg-primary" : "bg-muted-foreground/40"
                      )}
                    />
                  </div>
                </div>
              ))}
              <div className="text-center mt-6 pt-4 border-t border-border">
                <p className="text-sm font-medium text-primary bg-primary/10 inline-block px-4 py-1.5 rounded-full">
                  Your vote has been recorded
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
