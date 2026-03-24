import { useState } from "react"
import { useGetRankings } from "@workspace/api-client-react"
import type { GetRankingsType } from "@workspace/api-client-react/src/generated/api.schemas"
import { Layout } from "@/components/layout/Layout"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
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
      <div className="bg-background border-b border-border py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-1 w-12 bg-primary mb-6"></div>
          <h1 className="font-serif font-black uppercase text-5xl md:text-7xl text-foreground leading-none tracking-tight mb-6">
            Power Rankings
          </h1>
          <p className="text-lg text-muted-foreground font-sans">
            The definitive index of influence, driven by platform engagement, votes, and algorithmic impact.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Type selector */}
        <div className="flex flex-nowrap overflow-x-auto pb-4 mb-12 gap-8 border-b border-border">
          {types.map(t => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={cn(
                "pb-3 text-xs uppercase tracking-widest whitespace-nowrap transition-colors",
                type === t.id 
                  ? "border-b-2 border-primary text-primary font-bold" 
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="bg-background border border-border">
          <div className="p-6 border-b border-border bg-foreground text-background flex items-center justify-between">
            <h2 className="font-serif font-black uppercase text-2xl tracking-wide">{data?.title || 'Rankings'}</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-background/70">Updated Weekly</span>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-secondary animate-pulse" />)}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data?.entries.map((entry) => (
                <div key={entry.rank} className="p-4 sm:p-6 flex items-center gap-4 sm:gap-6 hover:bg-secondary/30 transition-colors">
                  <div className="flex flex-col items-center justify-center w-12 flex-shrink-0">
                    <span className={cn(
                      "font-serif font-black tracking-tighter",
                      entry.rank === 1 ? "text-primary text-4xl" : 
                      entry.rank === 2 ? "text-foreground text-3xl" : 
                      entry.rank === 3 ? "text-foreground text-2xl" : 
                      "text-muted-foreground text-xl"
                    )}>
                      #{entry.rank}
                    </span>
                    <div className={cn(
                      "text-[10px] font-bold flex items-center mt-1",
                      entry.change > 0 ? "text-primary" :
                      entry.change < 0 ? "text-muted-foreground" :
                      "text-muted-foreground/50"
                    )}>
                      {entry.change > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> :
                       entry.change < 0 ? <TrendingDown className="w-3 h-3 mr-0.5" /> :
                       <Minus className="w-3 h-3 mr-0.5" />}
                      {entry.change !== 0 ? Math.abs(entry.change) : '-'}
                    </div>
                  </div>

                  {entry.imageUrl && (
                    <img src={entry.imageUrl} alt={entry.label} className="w-12 h-12 rounded-sm object-cover border border-border hidden sm:block grayscale" />
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-bold uppercase tracking-wider text-xl text-foreground truncate">{entry.label}</h3>
                    {entry.sublabel && (
                      <p className="text-xs uppercase tracking-widest text-muted-foreground truncate">{entry.sublabel}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-serif font-bold text-foreground">
                      {entry.score.toLocaleString()}
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
