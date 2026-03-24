import { useState, useEffect, useCallback } from "react"
import { Layout } from "@/components/layout/Layout"
import { LiveNumber } from "@/components/live-counter/FlipDigit"
import { TrendingUp, TrendingDown, Minus, BarChart3, Globe, Fuel, Wifi, Plane, Rocket, DollarSign, Users, Smartphone } from "lucide-react"

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000
const BASE_DATE = new Date("2026-01-01T00:00:00Z").getTime()

interface StatConfig {
  id: string
  label: string
  category: string
  baseValue: number
  annualGrowth: number
  unit: string
  prefix?: string
  suffix?: string
  icon: React.ReactNode
  trend: "up" | "down" | "flat"
  trendLabel: string
  description: string
  source: string
  decimals?: number
}

const MENA_COUNTRIES = [
  { code: "AE", name: "UAE", flag: "🇦🇪", pop: 10_280_000, gdpB: 509 },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", pop: 37_400_000, gdpB: 1069 },
  { code: "EG", name: "Egypt", flag: "🇪🇬", pop: 109_300_000, gdpB: 395 },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", pop: 44_500_000, gdpB: 268 },
  { code: "MA", name: "Morocco", flag: "🇲🇦", pop: 37_800_000, gdpB: 152 },
  { code: "DZ", name: "Algeria", flag: "🇩🇿", pop: 46_300_000, gdpB: 240 },
  { code: "SD", name: "Sudan", flag: "🇸🇩", pop: 48_100_000, gdpB: 51 },
  { code: "YE", name: "Yemen", flag: "🇾🇪", pop: 34_400_000, gdpB: 22 },
  { code: "SY", name: "Syria", flag: "🇸🇾", pop: 23_200_000, gdpB: 12 },
  { code: "TN", name: "Tunisia", flag: "🇹🇳", pop: 12_500_000, gdpB: 49 },
  { code: "JO", name: "Jordan", flag: "🇯🇴", pop: 11_500_000, gdpB: 50 },
  { code: "LB", name: "Lebanon", flag: "🇱🇧", pop: 5_600_000, gdpB: 18 },
  { code: "LY", name: "Libya", flag: "🇱🇾", pop: 7_100_000, gdpB: 45 },
  { code: "OM", name: "Oman", flag: "🇴🇲", pop: 4_700_000, gdpB: 105 },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", pop: 4_400_000, gdpB: 165 },
  { code: "QA", name: "Qatar", flag: "🇶🇦", pop: 2_700_000, gdpB: 220 },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", pop: 1_600_000, gdpB: 46 },
  { code: "PS", name: "Palestine", flag: "🇵🇸", pop: 5_500_000, gdpB: 19 },
  { code: "IR", name: "Iran", flag: "🇮🇷", pop: 89_200_000, gdpB: 402 },
  { code: "MR", name: "Mauritania", flag: "🇲🇷", pop: 4_900_000, gdpB: 10 },
]

const STATS: StatConfig[] = [
  {
    id: "population",
    label: "MENA Population",
    category: "Demographics",
    baseValue: 541_000_000,
    annualGrowth: 0.0156,
    unit: "people",
    icon: <Users className="w-5 h-5" />,
    trend: "up",
    trendLabel: "+1.56%/yr",
    description: "Total population across 20 MENA countries. Growing by ~8.2 million per year — roughly 1 new person every 4 seconds.",
    source: "UN World Population Prospects 2025",
  },
  {
    id: "gdp",
    label: "Combined GDP",
    category: "Economy",
    baseValue: 3_850_000_000_000,
    annualGrowth: 0.033,
    unit: "USD",
    prefix: "$",
    icon: <DollarSign className="w-5 h-5" />,
    trend: "up",
    trendLabel: "+3.3%/yr",
    description: "Total nominal GDP of the MENA region. Outpacing global growth at 3.3% — fastest since 2016 excluding post-Covid rebound.",
    source: "World Bank / IMF WEO 2026",
  },
  {
    id: "oil",
    label: "Oil Production",
    category: "Energy",
    baseValue: 31_000_000,
    annualGrowth: 0.018,
    unit: "barrels/day",
    suffix: " bbl/day",
    icon: <Fuel className="w-5 h-5" />,
    trend: "up",
    trendLabel: "+1.8%/yr",
    description: "Middle East oil production at ~31 million barrels per day. OPEC+ voluntary cuts phasing out, led by Saudi Arabia at 9.6M bpd.",
    source: "OPEC Monthly Oil Market Report",
  },
  {
    id: "internet",
    label: "Internet Users",
    category: "Digital",
    baseValue: 357_000_000,
    annualGrowth: 0.048,
    unit: "users",
    icon: <Wifi className="w-5 h-5" />,
    trend: "up",
    trendLabel: "+4.8%/yr",
    description: "Mobile internet users across MENA. GCC penetration leads at 92%. Bahrain near 100% mobile internet penetration.",
    source: "GSMA Mobile Economy MENA 2025",
  },
  {
    id: "smartphones",
    label: "Smartphone Subscriptions",
    category: "Digital",
    baseValue: 652_000_000,
    annualGrowth: 0.035,
    unit: "subscriptions",
    icon: <Smartphone className="w-5 h-5" />,
    trend: "up",
    trendLabel: "+3.5%/yr",
    description: "Active smartphone subscriptions. GCC smartphone penetration exceeds 90%, with 5G connections at 17% of total.",
    source: "GSMA Intelligence 2025",
  },
  {
    id: "tourism",
    label: "Tourist Arrivals",
    category: "Tourism",
    baseValue: 100_000_000,
    annualGrowth: 0.035,
    unit: "arrivals/yr",
    icon: <Plane className="w-5 h-5" />,
    trend: "up",
    trendLabel: "+3.5%/yr",
    description: "International tourist arrivals — MENA is the world's strongest-performing tourism region, 39% above pre-pandemic 2019 levels.",
    source: "UNWTO World Tourism Barometer 2026",
  },
  {
    id: "startups",
    label: "Startup Funding",
    category: "Innovation",
    baseValue: 7_500_000_000,
    annualGrowth: 0.225,
    unit: "USD/yr",
    prefix: "$",
    icon: <Rocket className="w-5 h-5" />,
    trend: "up",
    trendLabel: "+22.5%/yr",
    description: "Total startup funding across MENA in 2025. 647 funded startups. Equity funding up 77% YoY. UAE and Saudi Arabia lead the ecosystem.",
    source: "Wamda / MAGNiTT 2025",
  },
  {
    id: "remittances",
    label: "Remittance Outflows",
    category: "Economy",
    baseValue: 67_000_000_000,
    annualGrowth: 0.04,
    unit: "USD/yr",
    prefix: "$",
    icon: <BarChart3 className="w-5 h-5" />,
    trend: "up",
    trendLabel: "+4.0%/yr",
    description: "Annual remittance inflows to MENA countries. Egypt is the largest recipient at $32B+. Lebanon's remittances equal 27.5% of GDP.",
    source: "World Bank Migration & Remittances Report",
  },
  {
    id: "fdi",
    label: "FDI Inflows",
    category: "Economy",
    baseValue: 65_000_000_000,
    annualGrowth: 0.06,
    unit: "USD/yr",
    prefix: "$",
    icon: <Globe className="w-5 h-5" />,
    trend: "up",
    trendLabel: "+6.0%/yr",
    description: "Foreign direct investment into the MENA region. UAE and Saudi Arabia attract the majority, driven by Vision 2030 and diversification.",
    source: "UNCTAD World Investment Report 2025",
  },
]

function useLiveCounter(baseValue: number, annualGrowth: number, tickMs = 1000) {
  const perMs = (baseValue * annualGrowth) / MS_PER_YEAR
  const calc = useCallback(() => {
    const elapsed = Date.now() - BASE_DATE
    return Math.floor(baseValue + elapsed * perMs)
  }, [baseValue, perMs])
  const [value, setValue] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setValue(calc()), tickMs)
    return () => clearInterval(id)
  }, [calc, tickMs])
  return value
}

function TrendBadge({ trend, label }: { trend: "up" | "down" | "flat"; label: string }) {
  const colors = {
    up: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    down: "text-red-400 bg-red-400/10 border-red-400/20",
    flat: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  }
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${colors[trend]}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

function formatHumanReadable(v: number, isCurrency: boolean) {
  if (isCurrency) {
    if (v >= 1_000_000_000_000) return `$${(v / 1_000_000_000_000).toFixed(2)}T`
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    return `$${v.toLocaleString()}`
  }
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  return v.toLocaleString()
}

function scaleForDisplay(v: number): { scaled: number; suffix: string } {
  if (v >= 1_000_000_000) return { scaled: Math.floor(v / 1_000_000), suffix: "M" }
  if (v >= 1_000_000) return { scaled: Math.floor(v / 1_000), suffix: "K" }
  return { scaled: v, suffix: "" }
}

function StatCard({ stat }: { stat: StatConfig }) {
  const value = useLiveCounter(stat.baseValue, stat.annualGrowth)
  const [expanded, setExpanded] = useState(false)

  const displayValue = stat.id === "oil" ? stat.baseValue : value
  const isCurrency = stat.unit === "USD" || stat.unit === "USD/yr"
  const humanLabel = formatHumanReadable(displayValue, isCurrency)

  const showFullNumber = displayValue < 1_000_000_000
  const { scaled, suffix: scaleSuffix } = scaleForDisplay(displayValue)

  return (
    <div
      className="border border-white/5 bg-black/40 rounded-sm p-5 hover:border-[#DC143C]/30 transition-all cursor-pointer group"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-white/40 group-hover:text-[#DC143C]/60 transition-colors">
          {stat.icon}
          <span className="text-[9px] uppercase tracking-[0.15em] font-mono text-white/30">{stat.category}</span>
        </div>
        <TrendBadge trend={stat.trend} label={stat.trendLabel} />
      </div>

      <h3 className="font-display font-bold text-xs uppercase tracking-[0.12em] text-white/60 mb-2">
        {stat.label}
      </h3>

      <div className="mb-2 flex items-baseline gap-1">
        <span className="font-display font-black tabular-nums text-white" style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)", letterSpacing: "-0.02em" }}>
          {stat.prefix || ""}
          <LiveNumber
            value={showFullNumber ? displayValue : scaled}
            className="font-display font-black tabular-nums"
            style={{ fontSize: "inherit", letterSpacing: "inherit" }}
          />
        </span>
        {!showFullNumber && scaleSuffix && (
          <span className="text-sm text-white/40 font-mono uppercase ml-0.5">{scaleSuffix}</span>
        )}
        {stat.id === "oil" && (
          <span className="text-[10px] text-white/30 font-mono">bbl/day</span>
        )}
      </div>

      <p className="text-[9px] uppercase tracking-[0.08em] text-white/25 font-mono">
        {humanLabel}
      </p>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <p className="text-xs text-white/50 font-sans leading-relaxed mb-2">{stat.description}</p>
          <p className="text-[8px] text-white/20 font-mono uppercase tracking-wider">{stat.source}</p>
        </div>
      )}
    </div>
  )
}

function CountryTable() {
  const totalPop = MENA_COUNTRIES.reduce((s, c) => s + c.pop, 0)
  const totalGdp = MENA_COUNTRIES.reduce((s, c) => s + c.gdpB, 0)
  const sorted = [...MENA_COUNTRIES].sort((a, b) => b.gdpB - a.gdpB)

  return (
    <div className="border border-white/5 bg-black/40 rounded-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-display font-bold text-xs uppercase tracking-[0.12em] text-white/60">
          20 Countries — One Region
        </h3>
        <span className="text-[9px] font-mono text-white/25 uppercase">
          {totalPop.toLocaleString()} people · ${totalGdp.toLocaleString()}B GDP
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] font-mono">
          <thead>
            <tr className="text-white/30 uppercase tracking-wider text-[9px] border-b border-white/5">
              <th className="text-left py-2 px-4">Country</th>
              <th className="text-right py-2 px-4">Population</th>
              <th className="text-right py-2 px-4">GDP (B)</th>
              <th className="text-right py-2 px-4 hidden sm:table-cell">GDP/Cap</th>
              <th className="text-left py-2 px-4 hidden md:table-cell">Share</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const gdpPerCap = Math.round((c.gdpB * 1_000_000_000) / c.pop)
              const gdpShare = ((c.gdpB / totalGdp) * 100).toFixed(1)
              return (
                <tr key={c.code} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-2 px-4 text-white/70">
                    <span className="mr-2">{c.flag}</span>
                    {c.name}
                  </td>
                  <td className="py-2 px-4 text-right tabular-nums text-white/50">
                    {(c.pop / 1_000_000).toFixed(1)}M
                  </td>
                  <td className="py-2 px-4 text-right tabular-nums text-white/50">
                    ${c.gdpB}B
                  </td>
                  <td className="py-2 px-4 text-right tabular-nums text-white/40 hidden sm:table-cell">
                    ${gdpPerCap.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(parseFloat(gdpShare) * 3, 100)}%`,
                            background: "#DC143C",
                            opacity: 0.6,
                          }}
                        />
                      </div>
                      <span className="text-white/30 text-[9px]">{gdpShare}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function MenaPulse() {
  const now = new Date()
  const timestamp = now.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  })

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-16">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#DC143C] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#DC143C]">Live Data Feed</span>
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight leading-none mb-3">
              MENA Pulse
            </h1>
            <p className="text-white/40 font-sans text-sm max-w-2xl leading-relaxed">
              Real-time economic and demographic indicators across 20 countries in the Middle East & North Africa.
              Every number ticks live — because the region never stops.
            </p>
            <p className="text-[9px] font-mono text-white/20 uppercase tracking-wider mt-3">
              {timestamp} · All figures annualized from latest verified sources
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {STATS.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
          </div>

          <CountryTable />

          <div className="mt-10 text-center">
            <p className="text-[9px] font-mono text-white/15 uppercase tracking-wider max-w-xl mx-auto leading-relaxed">
              Data compiled from World Bank, IMF, OPEC, GSMA, UNWTO, Wamda, MAGNiTT, and UNCTAD.
              Growth rates applied to base figures from January 2026. Numbers tick in real-time at calculated per-second rates.
              Click any card for details and source attribution.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
