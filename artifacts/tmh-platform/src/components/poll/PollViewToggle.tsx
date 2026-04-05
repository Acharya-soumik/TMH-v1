import { useState } from "react"
import { Globe, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { ResultsBreakdown } from "./ResultsBreakdown"
import { TrendChart } from "./TrendChart"

interface PollViewToggleProps {
  pollId: number
  totalVotes: number
  userCountry?: string | null
  compact?: boolean
}

type View = "country" | "timeline"

export function PollViewToggle({ pollId, totalVotes, userCountry, compact = false }: PollViewToggleProps) {
  const [view, setView] = useState<View>("country")

  return (
    <div className={cn("mt-4", compact && "mt-3")}>
      <div className="flex items-center gap-1 border-b border-border mb-4">
        <button
          onClick={() => setView("country")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-[0.15em] font-bold font-serif transition-colors border-b-2 -mb-px",
            view === "country"
              ? "text-primary border-primary"
              : "text-muted-foreground border-transparent hover:text-foreground"
          )}
        >
          <Globe className="w-3 h-3" />
          By Country
        </button>
        <button
          onClick={() => setView("timeline")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-[0.15em] font-bold font-serif transition-colors border-b-2 -mb-px",
            view === "timeline"
              ? "text-primary border-primary"
              : "text-muted-foreground border-transparent hover:text-foreground"
          )}
        >
          <TrendingUp className="w-3 h-3" />
          Over Time
        </button>
      </div>

      {view === "country" && (
        <ResultsBreakdown pollId={pollId} totalVotes={totalVotes} userCountry={userCountry} />
      )}

      {view === "timeline" && (
        <div className="h-48">
          <TrendChart pollId={pollId} />
        </div>
      )}
    </div>
  )
}
