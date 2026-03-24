import { useGetWeeklyPulse } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { PollCard } from "@/components/poll/PollCard"
import { cn } from "@/lib/utils"

export default function WeeklyPulse() {
  const { data, isLoading } = useGetWeeklyPulse()

  if (isLoading || !data) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-serif font-black uppercase tracking-wider text-muted-foreground">Compiling the pulse...</h2>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="inline-flex items-center px-3 py-1 bg-foreground text-background font-bold text-[10px] mb-6 uppercase tracking-[0.2em]">
            {data.weekLabel}
          </div>
          <h1 className="font-serif font-black uppercase text-6xl md:text-8xl text-foreground mb-6 leading-none tracking-tight">
            The Weekly<br />Pulse.
          </h1>
          <p className="text-xl text-muted-foreground font-sans max-w-3xl leading-relaxed">
            Every Friday, we distill millions of votes and interactions across the TMH network into the defining narratives of the Middle East.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Big Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.stats.map((stat, i) => (
            <div key={i} className="bg-background border border-border p-8 hover:border-foreground transition-colors">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">{stat.label}</h3>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-serif font-black text-foreground leading-none">{stat.value}</span>
                {stat.change && (
                  <span className={cn(
                    "text-xs font-bold pb-1 uppercase tracking-wider",
                    stat.sentiment === 'positive' ? "text-primary" :
                    stat.sentiment === 'negative' ? "text-muted-foreground" :
                    "text-muted-foreground"
                  )}>
                    {stat.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* The Biggest Surprise */}
        <div className="bg-foreground text-background p-8 md:p-12 border-l-4 border-primary">
          <h2 className="font-serif font-black uppercase text-3xl mb-4 text-background tracking-wider">The Biggest Surprise</h2>
          <p className="text-xl md:text-2xl text-background/85 font-serif italic leading-relaxed">
            "{data.biggestSurprise}"
          </p>
        </div>

        {/* Sector Sentiment */}
        <div>
          <div className="mb-8 border-b-2 border-foreground pb-4">
            <h2 className="font-serif font-black uppercase text-3xl text-foreground">
              Sector Sentiment
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {data.sectorSentiment.map((sector, i) => (
              <div key={i} className="bg-secondary/30 p-6 border border-border">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-serif font-bold uppercase tracking-wider text-xl text-foreground">{sector.sector}</span>
                  <span className={cn(
                    "font-bold text-[10px] uppercase tracking-widest px-2 py-1",
                    sector.sentiment > 0 ? "bg-foreground text-background" :
                    sector.sentiment < 0 ? "bg-primary text-background" :
                    "bg-border text-foreground"
                  )}>
                    {sector.sentiment > 0 ? '+' : ''}{sector.sentiment}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-sans">{sector.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Polls */}
        <div>
          <div className="mb-8 border-b-2 border-foreground pb-4">
            <h2 className="font-serif font-black uppercase text-3xl text-foreground">
              Defining Debates
            </h2>
          </div>
          <div className="grid gap-8">
            {data.topPolls.map(poll => (
              <PollCard key={poll.id} poll={poll} featured />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
