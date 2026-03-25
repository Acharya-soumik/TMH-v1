import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BarChart3, Vote, Users, Mail, FileText, TrendingUp, Globe } from "lucide-react";

interface Analytics {
  overview: {
    totalVotes: number;
    totalPolls: number;
    totalProfiles: number;
    totalSubscribers: number;
    totalApplications: number;
  };
  votesByCategory: { category: string; count: number }[];
  topPolls: { id: number; question: string; category: string; totalVotes: number }[];
  recentVotes: { date: string; count: number }[];
  votesByCountry: { country: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading analytics...</p></div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Failed to load analytics</p></div>;
  }

  const maxVotesByCategory = Math.max(...data.votesByCategory.map(c => c.count), 1);
  const maxVotesByCountry = Math.max(...data.votesByCountry.map(c => c.count), 1);
  const maxRecentVotes = Math.max(...data.recentVotes.map(v => v.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold uppercase tracking-wide">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform engagement and content performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Votes", value: data.overview.totalVotes, icon: Vote, color: "text-primary" },
          { label: "Debates", value: data.overview.totalPolls, icon: BarChart3, color: "text-blue-400" },
          { label: "Voices", value: data.overview.totalProfiles, icon: Users, color: "text-green-400" },
          { label: "Subscribers", value: data.overview.totalSubscribers, icon: Mail, color: "text-yellow-400" },
          { label: "Applications", value: data.overview.totalApplications, icon: FileText, color: "text-purple-400" },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-serif text-lg font-bold uppercase tracking-wide">Daily Vote Activity</h2>
          </div>
          {data.recentVotes.length === 0 ? (
            <p className="text-muted-foreground text-sm">No vote data yet</p>
          ) : (
            <div className="space-y-1.5">
              {data.recentVotes.map(v => (
                <div key={v.date} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">
                    {new Date(v.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </span>
                  <div className="flex-1 h-5 bg-background overflow-hidden">
                    <div
                      className="h-full bg-primary/60 transition-all"
                      style={{ width: `${(v.count / maxRecentVotes) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">{v.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="font-serif text-lg font-bold uppercase tracking-wide">Votes by Category</h2>
          </div>
          {data.votesByCategory.length === 0 ? (
            <p className="text-muted-foreground text-sm">No category data yet</p>
          ) : (
            <div className="space-y-2">
              {data.votesByCategory.slice(0, 10).map(cat => (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className="text-sm w-32 truncate shrink-0">{cat.category}</span>
                  <div className="flex-1 h-5 bg-background overflow-hidden">
                    <div
                      className="h-full bg-blue-500/50 transition-all"
                      style={{ width: `${(cat.count / maxVotesByCategory) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">{cat.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Vote className="w-4 h-4 text-primary" />
            <h2 className="font-serif text-lg font-bold uppercase tracking-wide">Top Debates by Engagement</h2>
          </div>
          {data.topPolls.length === 0 ? (
            <p className="text-muted-foreground text-sm">No debate data yet</p>
          ) : (
            <div className="space-y-2">
              {data.topPolls.map((poll, i) => (
                <div key={poll.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <span className="text-xs text-muted-foreground w-5 pt-0.5 shrink-0">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{poll.question}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{poll.category}</span>
                      <span className="text-xs text-primary font-medium">{Number(poll.totalVotes).toLocaleString()} votes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-primary" />
            <h2 className="font-serif text-lg font-bold uppercase tracking-wide">Votes by Country</h2>
          </div>
          {data.votesByCountry.length === 0 ? (
            <p className="text-muted-foreground text-sm">No country data yet</p>
          ) : (
            <div className="space-y-2">
              {data.votesByCountry.map(c => (
                <div key={c.country} className="flex items-center gap-3">
                  <span className="text-sm w-32 truncate shrink-0">{c.country}</span>
                  <div className="flex-1 h-5 bg-background overflow-hidden">
                    <div
                      className="h-full bg-green-500/40 transition-all"
                      style={{ width: `${(c.count / maxVotesByCountry) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
