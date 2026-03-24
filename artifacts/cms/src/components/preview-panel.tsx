import { X, TrendingUp, TrendingDown } from "lucide-react";

interface PollOption {
  text: string;
  voteCount: number;
}

interface DebateItem {
  question: string;
  context?: string;
  category: string;
  tags?: string[];
  options?: PollOption[];
}

interface PredictionItem {
  question: string;
  category: string;
  yesPercentage: number;
  noPercentage: number;
  momentum: number;
  momentumDirection: string;
  resolvesAt?: string;
  tags?: string[];
}

interface VoiceItem {
  name: string;
  headline: string;
  role: string;
  company?: string;
  sector: string;
  country: string;
  city: string;
  imageUrl?: string;
  summary: string;
  story?: string;
  lessonsLearned?: string[];
  quote?: string;
}

interface PreviewPanelProps {
  type: "debates" | "predictions" | "voices";
  item: Record<string, unknown>;
  onClose: () => void;
}

export default function PreviewPanel({ type, item, onClose }: PreviewPanelProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex justify-end z-50">
      <div className="w-full max-w-lg bg-[#0A0A0A] h-full overflow-auto border-l border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.08)]">
          <span className="text-xs text-[rgba(255,255,255,0.4)] uppercase tracking-wider font-serif">Preview</span>
          <button onClick={onClose} className="text-[rgba(255,255,255,0.4)] hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {type === "debates" && <DebatePreview item={item as unknown as DebateItem} />}
          {type === "predictions" && <PredictionPreview item={item as unknown as PredictionItem} />}
          {type === "voices" && <VoicePreview item={item as unknown as VoiceItem} />}
        </div>
      </div>
    </div>
  );
}

function DebatePreview({ item }: { item: DebateItem }) {
  const totalVotes = item.options?.reduce((s: number, o: PollOption) => s + (o.voteCount || 0), 0) || 0;
  return (
    <div className="space-y-5">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#DC143C", fontFamily: "'Barlow Condensed', sans-serif" }}>{item.category}</span>
        <h2 className="text-xl font-bold mt-2 text-white leading-snug" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{item.question}</h2>
      </div>
      {item.context && <p className="text-sm text-[rgba(255,255,255,0.6)] leading-relaxed">{item.context}</p>}
      <div className="space-y-2">
        {item.options?.map((opt: PollOption, i: number) => {
          const pct = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
          return (
            <div key={i} className="relative bg-[rgba(255,255,255,0.04)] rounded-lg overflow-hidden p-3">
              <div className="absolute inset-0 rounded-lg" style={{ width: `${pct}%`, background: i === 0 ? "rgba(220,20,60,0.15)" : "rgba(255,255,255,0.04)" }} />
              <div className="relative flex justify-between items-center">
                <span className="text-sm text-white">{opt.text}</span>
                <span className="text-sm font-semibold text-white">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag: string, i: number) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.5)]">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function PredictionPreview({ item }: { item: PredictionItem }) {
  return (
    <div className="space-y-5">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#DC143C", fontFamily: "'Barlow Condensed', sans-serif" }}>{item.category}</span>
        <h2 className="text-xl font-bold mt-2 text-white leading-snug" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{item.question}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[rgba(220,20,60,0.1)] border border-[rgba(220,20,60,0.2)] rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">{item.yesPercentage}%</p>
          <p className="text-xs text-[rgba(255,255,255,0.5)] mt-1">YES</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-white">{item.noPercentage}%</p>
          <p className="text-xs text-[rgba(255,255,255,0.5)] mt-1">NO</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm text-[rgba(255,255,255,0.5)]">
        <div className="flex items-center gap-1">
          {item.momentumDirection === "up" ? <TrendingUp className="w-3.5 h-3.5 text-green-400" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
          <span>{item.momentum}%</span>
        </div>
        {item.resolvesAt && <span>Resolves {new Date(item.resolvesAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>}
      </div>
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag: string, i: number) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.5)]">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function VoicePreview({ item }: { item: VoiceItem }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-full object-cover border-2 border-[rgba(220,20,60,0.3)]" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[rgba(220,20,60,0.15)] flex items-center justify-center text-xl font-bold text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            {item.name?.charAt(0)}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{item.name}</h2>
          <p className="text-sm text-[rgba(255,255,255,0.5)]">{item.role}{item.company ? `, ${item.company}` : ""}</p>
          <p className="text-xs text-[rgba(255,255,255,0.4)] mt-0.5">{item.city}, {item.country} · {item.sector}</p>
        </div>
      </div>
      <p className="text-sm text-[rgba(255,255,255,0.5)] leading-relaxed italic" style={{ fontFamily: "'Playfair Display', serif" }}>"{item.headline}"</p>
      <div>
        <h3 className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.3)] mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Summary</h3>
        <p className="text-sm text-[rgba(255,255,255,0.7)] leading-relaxed">{item.summary}</p>
      </div>
      {item.story && item.story !== item.summary && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.3)] mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Story</h3>
          <p className="text-sm text-[rgba(255,255,255,0.7)] leading-relaxed whitespace-pre-wrap">{item.story}</p>
        </div>
      )}
      {item.lessonsLearned && item.lessonsLearned.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.3)] mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Lessons Learned</h3>
          <ul className="space-y-1.5">
            {item.lessonsLearned.map((lesson: string, i: number) => (
              <li key={i} className="text-sm text-[rgba(255,255,255,0.7)] flex items-start gap-2">
                <span className="text-[#DC143C] mt-0.5">▸</span> {lesson}
              </li>
            ))}
          </ul>
        </div>
      )}
      {item.quote && (
        <blockquote className="border-l-2 border-[#DC143C] pl-4 py-1">
          <p className="text-sm text-[rgba(255,255,255,0.8)] italic" style={{ fontFamily: "'Playfair Display', serif" }}>"{item.quote}"</p>
        </blockquote>
      )}
    </div>
  );
}
