import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { track as trackCms } from "@/lib/analytics";
import { Loader2, Eye, Send, Mail, Check, AlertCircle } from "lucide-react";

interface PreviewResponse {
  content: {
    weekStarting: string;
    subjectLine: string;
    introText: string;
    topPolls: Array<{
      id: number;
      question: string;
      category: string;
      totalVotes: number;
      options: Array<{ text: string; percentage: number; voteCount: number }>;
    }>;
    resolvingPredictions: Array<{
      id: number;
      question: string;
      yesPercentage: number;
      daysToResolve: number;
    }>;
    featuredVoice: {
      id: number;
      name: string;
      role: string | null;
      company: string | null;
      quote: string | null;
      headline: string;
    } | null;
    perItemSummaries: Record<number, string>;
  };
  html: string;
}

interface DigestRow {
  id: number;
  weekStarting: string;
  subjectLine: string | null;
  status: string;
  pushedAt: string | null;
  beehiivPostId: string | null;
  pollCount: number;
  predictionCount: number;
}

export default function NewsletterDigestPage() {
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<string | null>(null);
  const [digests, setDigests] = useState<DigestRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api.listDigests().then((r: { digests: DigestRow[] }) => setDigests(r.digests ?? []));
  }, [pushResult]);

  const handlePreview = async () => {
    setError(null);
    setPreviewLoading(true);
    try {
      const r = await api.previewDigest();
      setPreview(r as PreviewResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePush = async () => {
    setError(null);
    setPushing(true);
    setPushResult(null);
    try {
      const result = await api.pushDigest();
      trackCms("cms_digest_pushed", {
        weekStarting: result.weekStarting,
        polls: preview?.content.topPolls.length ?? 0,
        predictions: preview?.content.resolvingPredictions.length ?? 0,
      });
      setPushResult(`Draft pushed to Beehiiv (post ${result.beehiivPostId ?? "?"}) for week of ${result.weekStarting}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Push failed");
    } finally {
      setPushing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Weekly Digest</h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
          Preview this week's digest, then push it as a draft to Beehiiv. The cron auto-fires Friday 9am Asia/Dubai. You can also push manually here.
        </p>
      </div>

      <div className="bg-card border border-border p-6 mb-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handlePreview}
          disabled={previewLoading}
          className="bg-foreground text-background px-5 py-2 text-sm font-bold uppercase tracking-widest disabled:opacity-50 inline-flex items-center gap-2"
        >
          {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          {previewLoading ? "Building…" : "Preview this week"}
        </button>
        <button
          type="button"
          onClick={handlePush}
          disabled={pushing}
          className="bg-primary text-white px-5 py-2 text-sm font-bold uppercase tracking-widest disabled:opacity-50 inline-flex items-center gap-2"
        >
          {pushing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {pushing ? "Pushing…" : "Push to Beehiiv now"}
        </button>
        {pushResult && (
          <span className="text-emerald-500 text-sm inline-flex items-center gap-1.5"><Check className="w-4 h-4" />{pushResult}</span>
        )}
        {error && (
          <span className="text-destructive text-sm inline-flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{error}</span>
        )}
      </div>

      {preview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-card border border-border p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Editorial preview
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">Subject line</p>
                <p className="font-medium">{preview.content.subjectLine}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">Intro</p>
                <p className="leading-relaxed text-muted-foreground">{preview.content.introText}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">Top polls ({preview.content.topPolls.length})</p>
                <ul className="space-y-2">
                  {preview.content.topPolls.map((p) => (
                    <li key={p.id} className="border-l-2 border-primary pl-3">
                      <p className="font-medium">{p.question}</p>
                      <p className="text-xs text-muted-foreground">{p.category} · {p.totalVotes} votes</p>
                      <p className="text-xs text-muted-foreground italic mt-1">{preview.content.perItemSummaries[p.id] ?? ""}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">Resolving predictions ({preview.content.resolvingPredictions.length})</p>
                <ul className="space-y-2">
                  {preview.content.resolvingPredictions.map((p) => (
                    <li key={p.id} className="border-l-2 border-border pl-3">
                      <p className="font-medium text-sm">{p.question}</p>
                      <p className="text-xs text-muted-foreground">{p.yesPercentage}% yes · resolves in {p.daysToResolve}d</p>
                    </li>
                  ))}
                </ul>
              </div>
              {preview.content.featuredVoice && (
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">Featured voice</p>
                  <p className="font-medium">{preview.content.featuredVoice.name}</p>
                  <p className="text-xs text-muted-foreground">{preview.content.featuredVoice.role}{preview.content.featuredVoice.company ? ` · ${preview.content.featuredVoice.company}` : ""}</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-card border border-border p-2 overflow-hidden">
            <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground p-4">Email rendering</p>
            <iframe
              title="Digest preview"
              srcDoc={preview.html}
              className="w-full h-[800px] bg-white"
            />
          </div>
        </div>
      )}

      <div className="bg-card border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold">Past digests</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Week</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Pushed</th>
              <th className="px-4 py-3">Polls / Predictions</th>
            </tr>
          </thead>
          <tbody>
            {digests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No digests yet.</td>
              </tr>
            )}
            {digests.map((d) => (
              <tr key={d.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{d.weekStarting}</td>
                <td className="px-4 py-3">{d.subjectLine ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs uppercase tracking-widest font-bold ${d.status === "pushed" ? "text-emerald-500" : d.status === "failed" ? "text-destructive" : "text-muted-foreground"}`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{d.pushedAt ? new Date(d.pushedAt).toLocaleString() : "—"}</td>
                <td className="px-4 py-3 text-xs">{d.pollCount} / {d.predictionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
