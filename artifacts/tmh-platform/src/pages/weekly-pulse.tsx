import { useGetWeeklyPulse } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { PollCard } from "@/components/poll/PollCard"
import { Calendar, Zap, AlertTriangle, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

export default function WeeklyPulse() {
  const { data, isLoading } = useGetWeeklyPulse()

  if (isLoading || !data) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-serif">Compiling this week's pulse...</h2>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full font-bold text-sm mb-6 uppercase tracking-widest">
            <Calendar className="w-4 h-4" /> {data.weekLabel}
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            The Weekly <span className="text-primary italic">Pulse.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
            Every Friday, we distill millions of votes and interactions across the TMH network into the defining narratives of the Middle East.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Big Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.stats.map((stat, i) => (
            <div key={i} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</h3>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-serif font-bold text-foreground">{stat.value}</span>
                {stat.change && (
                  <span className={cn(
                    "text-sm font-bold pb-1",
                    stat.sentiment === 'positive' ? "text-emerald-500" :
                    stat.sentiment === 'negative' ? "text-destructive" :
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
        <div className="relative p-1 bg-gradient-to-r from-primary to-accent rounded-3xl">
          <div className="bg-background rounded-[1.4rem] p-8 md:p-10 h-full flex flex-col md:flex-row items-center gap-8">
            <div className="bg-destructive/10 text-destructive p-4 rounded-full flex-shrink-0">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold mb-3 text-foreground">The Biggest Surprise</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {data.biggestSurprise}
              </p>
            </div>
          </div>
        </div>

        {/* Sector Sentiment */}
        <div>
          <h2 className="font-serif text-3xl font-bold flex items-center gap-3 mb-8 border-b border-border pb-4">
            <Activity className="w-8 h-8 text-accent" /> Sector Sentiment Index
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {data.sectorSentiment.map((sector, i) => (
              <div key={i} className="bg-secondary/30 p-5 rounded-xl border border-border">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg">{sector.sector}</span>
                  <span className={cn(
                    "font-bold text-sm px-3 py-1 rounded-full",
                    sector.sentiment > 0 ? "bg-emerald-500/10 text-emerald-500" :
                    sector.sentiment < 0 ? "bg-destructive/10 text-destructive" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {sector.sentiment > 0 ? '+' : ''}{sector.sentiment}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">{sector.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Polls */}
        <div>
          <h2 className="font-serif text-3xl font-bold flex items-center gap-3 mb-8 border-b border-border pb-4">
            <Zap className="w-8 h-8 text-primary" /> Defining Debates
          </h2>
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
