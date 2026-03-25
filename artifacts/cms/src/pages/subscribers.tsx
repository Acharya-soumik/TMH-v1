import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Mail, Download, Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface Subscriber {
  id: number;
  email: string;
  source: string;
  countryCode: string | null;
  pollId: number | null;
  createdAt: string;
}

interface SourceStat {
  source: string;
  count: number;
}

const SOURCE_LABELS: Record<string, string> = {
  share_gate: "Share Gate",
  footer: "Footer Signup",
  newsletter_cta: "Newsletter CTA",
  homepage: "Homepage",
};

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sourceStats, setSourceStats] = useState<SourceStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getSubscribers({ search: search || undefined, page });
      setSubscribers(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setSourceStats(data.sourceStats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this subscriber?")) return;
    try {
      await api.deleteSubscriber(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = async () => {
    try {
      await api.exportSubscribers();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const totalSubs = sourceStats.reduce((s, i) => s + i.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold uppercase tracking-wide">Subscribers</h1>
          <p className="text-muted-foreground text-sm mt-1">{totalSubs} total subscribers</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {sourceStats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sourceStats.map(s => (
            <div key={s.source} className="bg-card border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{SOURCE_LABELS[s.source] || s.source}</p>
              <p className="text-2xl font-bold mt-1">{s.count}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by email..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors">
          Search
        </button>
      </form>

      <div className="bg-card border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-xs text-muted-foreground uppercase tracking-wide">Email</th>
              <th className="text-left p-3 text-xs text-muted-foreground uppercase tracking-wide">Source</th>
              <th className="text-left p-3 text-xs text-muted-foreground uppercase tracking-wide">Country</th>
              <th className="text-left p-3 text-xs text-muted-foreground uppercase tracking-wide">Date</th>
              <th className="p-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
            ) : subscribers.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No subscribers found</td></tr>
            ) : subscribers.map(sub => (
              <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="p-3 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                  {sub.email}
                </td>
                <td className="p-3">
                  <span className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground">
                    {SOURCE_LABELS[sub.source] || sub.source}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{sub.countryCode || "—"}</td>
                <td className="p-3 text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <button onClick={() => handleDelete(sub.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">Page {page} of {totalPages} ({total} total)</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-secondary text-secondary-foreground disabled:opacity-30 hover:bg-secondary/80 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 bg-secondary text-secondary-foreground disabled:opacity-30 hover:bg-secondary/80 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
