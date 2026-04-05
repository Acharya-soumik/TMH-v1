export interface TitlePunctuationConfig {
  character?: string;
  color?: string;
  fontStyle?: "normal" | "italic";
  fontWeight?: "normal" | "bold";
}

export const DEFAULT_PUNCTUATION: TitlePunctuationConfig = {
  character: ".",
  color: "#DC143C",
  fontStyle: "normal",
  fontWeight: "bold",
};

const COLOR_OPTIONS = [
  { label: "Red (Crimson)", value: "#DC143C" },
  { label: "Gold", value: "#FFC107" },
  { label: "White", value: "#F2EDE4" },
  { label: "Green", value: "#10B981" },
  { label: "Blue", value: "#3B82F6" },
  { label: "Purple", value: "#A855F7" },
  { label: "Orange", value: "#F97316" },
];

interface Props {
  value: TitlePunctuationConfig | undefined;
  onChange: (value: TitlePunctuationConfig) => void;
}

export function TitlePunctuationEditor({ value, onChange }: Props) {
  const cfg: TitlePunctuationConfig = { ...DEFAULT_PUNCTUATION, ...(value ?? {}) };

  const update = (patch: Partial<TitlePunctuationConfig>) => {
    onChange({ ...cfg, ...patch });
  };

  return (
    <section className="border border-border rounded-sm p-4 space-y-3">
      <div>
        <h3 className="font-serif text-sm font-bold uppercase tracking-wide">Title Punctuation</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Adds a styled character at the end of the page title (e.g., the red period on "The Tribunal.").
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Character</label>
          <input
            type="text"
            maxLength={3}
            value={cfg.character ?? ""}
            onChange={e => update({ character: e.target.value })}
            placeholder="."
            className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Color</label>
          <select
            value={cfg.color}
            onChange={e => update({ color: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {COLOR_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Font Style</label>
          <select
            value={cfg.fontStyle}
            onChange={e => update({ fontStyle: e.target.value as "normal" | "italic" })}
            className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="normal">Normal</option>
            <option value="italic">Italic</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Weight</label>
          <select
            value={cfg.fontWeight}
            onChange={e => update({ fontWeight: e.target.value as "normal" | "bold" })}
            className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>
      </div>

      {/* Preview */}
      <div className="border border-border/50 rounded-sm p-3 bg-secondary/30">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
        <p className="font-serif text-xl font-bold uppercase">
          Sample Title
          <span
            style={{
              color: cfg.color,
              fontStyle: cfg.fontStyle,
              fontWeight: cfg.fontWeight === "bold" ? 900 : 400,
            }}
          >
            {cfg.character}
          </span>
        </p>
      </div>
    </section>
  );
}
