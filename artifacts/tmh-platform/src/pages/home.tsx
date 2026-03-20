import { useState, useEffect } from "react"
import { useGetFeaturedPoll, useListPolls, useListProfiles, useListCategories } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { PollCard } from "@/components/poll/PollCard"
import { ProfileCard } from "@/components/profile/ProfileCard"
import { Link } from "wouter"
import { cn } from "@/lib/utils"
import { ArrowRight, ChevronRight } from "lucide-react"
import { useVoter } from "@/hooks/use-voter"
import { useVotePoll } from "@workspace/api-client-react"

const FLAG_MAP: Record<string, string> = {
  AE: "🇦🇪", SA: "🇸🇦", EG: "🇪🇬", JO: "🇯🇴", LB: "🇱🇧", KW: "🇰🇼",
  BH: "🇧🇭", QA: "🇶🇦", OM: "🇴🇲", MA: "🇲🇦", TN: "🇹🇳", IQ: "🇮🇶",
  PS: "🇵🇸", TR: "🇹🇷", US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", IN: "🇮🇳", AU: "🇦🇺",
}

interface PlatformStats {
  livePolls: number
  totalVotes: number
  countries: number
  activeThisWeek: number
}

interface ActivityItem {
  countryCode: string | null
  countryName: string | null
  pollId: number
  questionSnippet: string
  secondsAgo: number
}

function formatSecondsAgo(s: number): string {
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function LiveActivity() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL ?? ""
    const fetchActivity = () => {
      fetch(`${baseUrl}/api/activity`)
        .then(r => r.json())
        .then(d => { if (d.activity?.length) setItems(d.activity) })
        .catch(() => {})
    }
    fetchActivity()
    const refresh = setInterval(fetchActivity, 30000)
    return () => clearInterval(refresh)
  }, [])

  useEffect(() => {
    if (items.length <= 1) return
    const id = setInterval(() => {
      setTick(t => t + 1)
      setActiveIdx(i => (i + 1) % Math.min(items.length, 5))
    }, 4000)
    return () => clearInterval(id)
  }, [items.length])

  if (items.length === 0) return null

  const item = items[activeIdx]

  return (
    <section className="py-10 bg-secondary/20 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse flex-shrink-0" />
          <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-muted-foreground font-serif">
            Live Activity
          </p>
        </div>
        <div key={`${activeIdx}-${tick}`} className="animate-in fade-in duration-500">
          <Link href={`/polls/${item.pollId}`} className="group block">
            <p className="font-sans text-sm text-foreground/80 leading-relaxed group-hover:text-foreground transition-colors">
              <span className="mr-2">{FLAG_MAP[item.countryCode ?? ""] ?? "🌍"}</span>
              <span className="text-muted-foreground">Someone from </span>
              <span className="font-bold text-foreground">{item.countryName ?? item.countryCode ?? "the region"}</span>
              <span className="text-muted-foreground"> just voted on </span>
              <span className="text-primary font-bold group-hover:underline">"{item.questionSnippet}"</span>
              <span className="text-muted-foreground text-[11px] ml-2">· {formatSecondsAgo(item.secondsAgo)}</span>
            </p>
          </Link>
        </div>
        {items.length > 1 && (
          <div className="flex gap-1.5 mt-4">
            {Array.from({ length: Math.min(items.length, 5) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={cn(
                  "h-0.5 transition-all duration-300",
                  i === activeIdx ? "w-6 bg-primary" : "w-3 bg-border hover:bg-foreground/40"
                )}
                aria-label={`Activity ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function PlatformStatsBar({ stats }: { stats: PlatformStats | null }) {
  if (!stats) return null
  const items = [
    { label: "Total Votes", value: stats.totalVotes.toLocaleString() },
    { label: "Live Debates", value: stats.livePolls.toLocaleString() },
    { label: "Countries", value: `${stats.countries}+` },
    { label: "Active This Week", value: stats.activeThisWeek.toLocaleString() },
  ]
  return (
    <div className="border-t border-border py-3">
      <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
        {items.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="font-display font-black text-base text-foreground tabular-nums">{value}</span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-serif">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const { data: featuredPoll, isLoading: featuredLoading } = useGetFeaturedPoll()
  const { data: trendingPolls, isLoading: trendingLoading } = useListPolls({ filter: "trending", limit: 4 })
  const { data: stripPolls } = useListPolls({ filter: "trending", limit: 8 })
  const { data: featuredProfiles, isLoading: profilesLoading } = useListProfiles({ filter: "featured", limit: 8 })
  const { data: categories } = useListCategories()
  const { profile, totalVotesAllTime, hasVoted } = useVoter()

  const [ctaEmail, setCtaEmail] = useState("")
  const [ctaJoined, setCtaJoined] = useState(() => !!localStorage.getItem("tmh_cta_joined"))
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)

  useEffect(() => {
    const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL ?? ""
    fetch(`${baseUrl}/api/stats`)
      .then(r => r.json())
      .then(d => setPlatformStats(d))
      .catch(() => {})
  }, [])

  const totalVotes = platformStats?.totalVotes ?? featuredPoll?.totalVotes ?? 0

  const heroSubhead = (() => {
    if (totalVotesAllTime > 0 && profile) {
      return `You've cast ${totalVotesAllTime} vote${totalVotesAllTime !== 1 ? "s" : ""}. ${totalVotes.toLocaleString()} total have been cast across the region.`
    }
    return totalVotes > 0
      ? `${totalVotes.toLocaleString()} votes cast — and the region is divided.`
      : "The digital town square the Middle East has never had."
  })()

  const handleCtaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ctaEmail.trim()) return
    localStorage.setItem("tmh_cta_joined", ctaEmail)
    setCtaJoined(true)
  }

  const tickerPolls = trendingPolls?.polls ?? []
  const tickerText = tickerPolls.length
    ? tickerPolls.map(p => `${p.question} — ${(p.totalVotes ?? 0).toLocaleString()} votes`).join("  ·  ") + "  ·  "
    : "New debate every 24 hours  ·  400 million people, one voice  ·  The Middle East unfiltered  ·  "

  const issueDate = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  return (
    <Layout>
      <style>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker-animate { animation: ticker 70s linear infinite; white-space: nowrap; }
        .ticker-animate:hover { animation-play-state: paused; }
        @keyframes fadein { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .section-fadein { animation: fadein 0.5s ease forwards; }
      `}</style>

      {/* ── MASTHEAD ── */}
      <div className="bg-background border-b-2 border-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 text-[9px] uppercase tracking-[0.2em] text-muted-foreground border-b border-border font-serif">
            <span>Est. 2026 · The Middle East · Issue No. 001</span>
            <span className="hidden sm:block">{issueDate}</span>
            <span className="text-primary font-bold">Opinion of Record</span>
          </div>

          <div className="border-t-2 border-b-2 border-foreground py-5 my-3 text-center">
            <h1 className="font-display font-black text-5xl md:text-6xl lg:text-7xl uppercase tracking-tight text-foreground leading-none">
              The Middle East Hustle<span className="text-primary">.</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-serif mt-2">
              The voice of 400 million.
            </p>
          </div>

          <nav className="flex items-center justify-center gap-6 py-2 text-[10px] uppercase tracking-widest font-serif">
            {[
              { href: "/polls", label: "Polls" },
              { href: "/profiles", label: "The Hustlers" },
              { href: "/rankings", label: "Rankings" },
              { href: "/weekly-pulse", label: "Weekly Pulse" },
              { href: "/about", label: "About" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground font-bold transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <PlatformStatsBar stats={platformStats} />
        </div>
      </div>

      {/* ── NEWS TICKER ── */}
      <div className="bg-foreground text-background h-9 flex items-center overflow-hidden">
        <span className="flex-shrink-0 bg-primary text-white px-3 h-full flex items-center font-bold text-[10px] uppercase tracking-widest font-serif z-10">
          LIVE
        </span>
        <div className="flex-1 overflow-hidden">
          <span className="ticker-animate inline-block text-[11px] uppercase tracking-widest font-medium text-background/80 font-serif px-4">
            {(tickerText + tickerText)}
          </span>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="bg-background py-20 lg:py-32 border-b border-border section-fadein">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="h-1 w-16 bg-primary mb-6" />
            <h2 className="font-display font-black uppercase text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight text-foreground mb-6">
              400 Million People.<br />One Question.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground font-sans">
              {heroSubhead}
            </p>
          </div>

          {featuredLoading ? (
            <div className="h-96 bg-secondary animate-pulse border border-border" />
          ) : featuredPoll ? (
            <div className="w-full">
              <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary mb-4 flex items-center gap-2 font-serif">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                Today's Lead Debate
              </div>
              <PollCard poll={featuredPoll} featured />
            </div>
          ) : null}
        </div>
      </section>

      {/* ── QUESTION STRIP ── */}
      {stripPolls?.polls && stripPolls.polls.length > 0 && (
        <section className="py-12 bg-secondary/30 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-serif font-black uppercase text-[11px] tracking-[0.3em] text-primary mb-1">
                  The Questions No One's Asking
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-serif">
                  Vote on any of them. Share the ones that matter.
                </p>
              </div>
              <Link href="/polls" className="hidden sm:flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground font-serif">
                All Debates <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {stripPolls.polls.map(poll => (
                <QuickVoteCard key={poll.id} poll={poll} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── THIS WEEK'S DEBATES ── */}
      <section className="py-20 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 border-l-4 border-primary pl-4">
            <h2 className="font-serif font-black uppercase text-2xl text-foreground">
              This Week's Debates
            </h2>
            <Link href="/polls" className="hidden sm:inline-block text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground font-serif">
              View All
            </Link>
          </div>

          {trendingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3].map(i => <div key={i} className="h-72 bg-secondary animate-pulse border border-border" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {trendingPolls?.polls.slice(0, 4).map((poll, idx) => (
                <div key={poll.id} className={cn(idx === 0 && trendingPolls.polls.length >= 3 ? "md:col-span-2" : "")}>
                  <PollCard poll={poll} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 sm:hidden">
            <Link href="/polls" className="block text-center text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground border border-border py-4 font-serif">
              View All Debates
            </Link>
          </div>
        </div>
      </section>

      {/* ── THE HUSTLERS ── */}
      <section className="bg-foreground text-background py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight text-background leading-none">
                The Hustlers
              </h2>
              <div className="h-1 w-full bg-primary mt-3" />
            </div>
            <Link href="/profiles" className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest text-background/50 hover:text-background font-serif">
              View All →
            </Link>
          </div>
          <p className="text-background/60 font-sans text-base mt-4 mb-10 max-w-xl">
            The founders, operators, and change-makers shaping the Middle East. Real people. Real stories.
          </p>

          {profilesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-background/10 animate-pulse border border-background/20" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProfiles?.profiles.slice(0, 8).map(profile => (
                <div key={profile.id} className="dark">
                  <ProfileCard profile={profile} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-8">
            <Link href="/profiles" className="inline-flex items-center gap-2 bg-primary text-white font-bold uppercase tracking-widest text-xs px-8 py-3 hover:bg-primary/90 transition-colors font-serif">
              View All Hustlers <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── COUNTRY LEADERBOARD ── */}
      <CountryLeaderboard />

      {/* ── EXPLORE TOPICS ── */}
      {categories?.categories && categories.categories.length > 0 && (
        <section className="py-20 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 border-l-4 border-primary pl-4">
              <h2 className="font-serif font-black uppercase text-2xl text-foreground">
                Explore Topics
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.categories.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/polls?category=${cat.slug}`}
                  className="bg-secondary p-5 flex flex-col justify-between transition-all hover:bg-foreground hover:text-background group border border-border hover:-translate-y-0.5 hover:shadow-md duration-300"
                >
                  <span className="font-serif font-bold uppercase tracking-wider text-base mb-3 leading-tight">{cat.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-background/50">
                    {cat.pollCount} Debates
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── LIVE ACTIVITY ── */}
      <LiveActivity />

      {/* ── NEWSLETTER CTA ── */}
      <section className="bg-foreground text-background py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">
            <div className="flex-1 md:basis-2/3">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-3 font-serif">Join 10,000+ Voices</p>
              <h2 className="font-display font-black text-4xl md:text-5xl uppercase leading-none tracking-tight text-background mb-4">
                The Region's Opinion.<br />Unfiltered.
              </h2>
              <p className="text-background/60 font-sans text-base leading-relaxed max-w-xl">
                Every Tuesday: one question, one country breakdown, one Hustler. The pulse of 400 million people — straight to your inbox.
              </p>
            </div>
            <div className="w-full md:basis-1/3">
              {ctaJoined ? (
                <div className="border-2 border-primary p-8 text-center">
                  <p className="font-display font-black text-3xl uppercase text-primary tracking-tight">You're In.</p>
                  <p className="text-[10px] uppercase tracking-widest text-background/50 mt-2 font-serif">Watch your inbox Tuesday.</p>
                </div>
              ) : (
                <form onSubmit={handleCtaSubmit} className="flex flex-col gap-3">
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={ctaEmail}
                    onChange={e => setCtaEmail(e.target.value)}
                    className="bg-background text-foreground border-none px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-primary text-sm font-sans"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-white font-bold uppercase tracking-widest px-6 py-3 text-xs hover:bg-primary/90 transition-colors font-serif"
                  >
                    Join The Hustle
                  </button>
                  <p className="text-[9px] text-background/40 font-sans">No spam. Unsubscribe anytime.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

function CountryLeaderboard() {
  const [countries, setCountries] = useState<{ code: string; name: string; count: number; percentage: number }[]>([])

  useEffect(() => {
    fetch("/api/stats/countries")
      .then(r => r.json())
      .then(d => { if (d.countries?.length >= 2) setCountries(d.countries.slice(0, 8)) })
      .catch(() => {})
  }, [])

  if (countries.length < 2) return null

  const top = countries[0].count

  return (
    <section className="py-16 bg-secondary/20 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div className="border-l-4 border-primary pl-4">
            <h2 className="font-serif font-black uppercase text-2xl text-foreground">
              How Does Your Country Vote?
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 font-serif">
              Live participation — updated with every vote
            </p>
          </div>
          <a href="/polls" className="hidden sm:inline-block text-[10px] uppercase tracking-widest font-bold text-primary font-serif hover:text-foreground transition-colors">
            Represent Your Country →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {countries.map((country, i) => (
            <div key={country.code} className="flex items-center gap-4">
              <div className="flex items-center gap-3 w-44 flex-shrink-0">
                <span className="text-xl">{FLAG_MAP[country.code] ?? "🌍"}</span>
                <div>
                  <div className={cn("font-serif font-bold text-sm uppercase tracking-wide", i === 0 ? "text-primary" : "text-foreground")}>
                    {country.name}
                  </div>
                  <div className="text-[9px] text-muted-foreground font-sans">{country.count.toLocaleString()} votes</div>
                </div>
              </div>
              <div className="flex-1 h-2 bg-secondary overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-700", i === 0 ? "bg-primary" : "bg-foreground/25")}
                  style={{ width: `${Math.round((country.count / top) * 100)}%` }}
                />
              </div>
              <span className={cn("text-sm font-bold font-serif flex-shrink-0 w-10 text-right", i === 0 ? "text-primary" : "text-foreground")}>
                {country.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function QuickVoteCard({ poll }: { poll: any }) {
  const { hasVoted, getVotedOption, recordVote, token } = useVoter()
  const voteMutation = useVotePoll()
  const [localOptions, setLocalOptions] = useState(poll.options ?? [])
  const [localTotal, setLocalTotal] = useState(poll.totalVotes ?? 0)
  const isVoted = hasVoted(poll.id)
  const votedOptionId = getVotedOption(poll.id)

  const handleVote = (optionId: number) => {
    if (isVoted) return
    recordVote(poll.id, optionId, poll.categorySlug)
    const newTotal = localTotal + 1
    const newOpts = localOptions.map((o: any) => ({
      ...o,
      voteCount: o.id === optionId ? o.voteCount + 1 : o.voteCount,
      percentage: Math.round(((o.id === optionId ? o.voteCount + 1 : o.voteCount) / newTotal) * 100),
    }))
    setLocalOptions(newOpts)
    setLocalTotal(newTotal)
    voteMutation.mutate({ id: poll.id, data: { optionId, voterToken: token } })
  }

  return (
    <div className="flex-shrink-0 w-72 bg-card border border-border p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-transform duration-200">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/polls/${poll.id}`}>
          <p className="font-serif font-black uppercase text-sm leading-tight text-foreground hover:text-primary transition-colors line-clamp-3 cursor-pointer">
            {poll.question}
          </p>
        </Link>
        {!isVoted && (
          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse mt-1" title="Not voted yet" />
        )}
      </div>
      <div className="space-y-1.5 mt-1">
        {localOptions.slice(0, 3).map((option: any) => (
          isVoted ? (
            <div key={option.id} className="relative">
              <div className="h-8 w-full bg-secondary overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-500", option.id === votedOptionId ? "bg-primary" : "bg-foreground/15")}
                  style={{ width: `${option.percentage ?? 0}%` }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-between px-2">
                <span className={cn("text-[10px] font-bold font-sans truncate", option.id === votedOptionId ? "text-white" : "text-foreground")}>
                  {option.text}
                </span>
                <span className={cn("text-[10px] font-bold font-sans flex-shrink-0", option.id === votedOptionId ? "text-white" : "text-foreground/60")}>
                  {option.percentage ?? 0}%
                </span>
              </div>
            </div>
          ) : (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              className="w-full text-left text-[11px] font-sans px-3 py-2 border border-border hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-100 text-foreground/80 truncate"
            >
              {option.text}
            </button>
          )
        ))}
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-serif">{localTotal.toLocaleString()} votes</span>
        <Link href={`/polls/${poll.id}`} className="text-[9px] uppercase tracking-widest text-primary font-bold font-serif">
          View →
        </Link>
      </div>
    </div>
  )
}
