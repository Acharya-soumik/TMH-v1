import { useState } from "react"
import { useGetRankings } from "@workspace/api-client-react"
import type { GetRankingsType } from "@workspace/api-client-react/src/generated/api.schemas"
import { Layout } from "@/components/layout/Layout"
import { Trophy, TrendingUp, TrendingDown, Minus, Hash } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Rankings() {
  const [type, setType] = useState<GetRankingsType>('profiles')
  const { data, isLoading } = useGetRankings({ type })

  const types: { id: GetRankingsType; label: string }[] = [
    { id: 'profiles', label: 'Overall Voices' },
    { id: 'founders', label: 'Top Founders' },
    { id: 'women_leaders', label: 'Women Leaders' },
    { id: 'sectors', label: 'Hottest Sectors' },
    { id: 'cities', label: 'Rising Cities' },
    { id: 'topics', label: 'Debated Topics' },
  ]

  return (
    <Layout>
      <div className="bg-card border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-2xl mb-4 text-accent">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Power Rankings
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The definitive index of influence, driven by platform engagement, votes, and algorithmic impact.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Type selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {types.map(t => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-bold transition-all",
                type === t.id 
                  ? "bg-foreground text-background shadow-md scale-105" 
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between">
            <h2 className="font-serif font-bold text-2xl">{data?.title || 'Rankings'}</h2>
            <span className="text-sm font-medium text-muted-foreground">Updated Weekly</span>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-xl bg-secondary animate-pulse" />)}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data?.entries.map((entry) => (
                <div key={entry.rank} className="p-4 sm:p-6 flex items-center gap-4 sm:gap-6 hover:bg-secondary/20 transition-colors">
                  <div className="flex flex-col items-center justify-center w-12 flex-shrink-0">
                    <span className={cn(
                      "font-serif text-2xl font-bold",
                      entry.rank === 1 ? "text-primary text-4xl" : 
                      entry.rank === 2 ? "text-foreground/80 text-3xl" : 
                      entry.rank === 3 ? "text-accent text-3xl" : 
                      "text-muted-foreground"
                    )}>
                      #{entry.rank}
                    </span>
                    <div className={cn(
                      "text-xs font-bold flex items-center mt-1",
                      entry.change > 0 ? "text-emerald-500" :
                      entry.change < 0 ? "text-destructive" :
                      "text-muted-foreground"
                    )}>
                      {entry.change > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> :
                       entry.change < 0 ? <TrendingDown className="w-3 h-3 mr-0.5" /> :
                       <Minus className="w-3 h-3 mr-0.5" />}
                      {entry.change !== 0 ? Math.abs(entry.change) : '-'}
                    </div>
                  </div>

                  {entry.imageUrl ? (
                    <img src={entry.imageUrl} alt={entry.label} className="w-12 h-12 rounded-full object-cover border border-border hidden sm:block" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hidden sm:flex">
                      <Hash className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-foreground truncate">{entry.label}</h3>
                    {entry.sublabel && (
                      <p className="text-sm text-muted-foreground truncate">{entry.sublabel}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-foreground">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                      Score
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
