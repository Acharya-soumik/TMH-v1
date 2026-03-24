import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { api } from "@/lib/api";
import DynamicList from "@/components/dynamic-list";
import PreviewPanel from "@/components/preview-panel";
import { Eye, Save, Send, Check, Archive, RotateCcw } from "lucide-react";

interface VoiceOption {
  id: number;
  name: string;
}

export default function EditDebatePage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const isNew = params.id === "new";
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [form, setForm] = useState({
    question: "", context: "", category: "", categorySlug: "", tags: [] as string[],
    pollType: "binary", isFeatured: false, isEditorsPick: false, editorialStatus: "draft",
    endsAt: "", relatedProfileIds: [] as number[], options: [{ text: "Yes", voteCount: 0 }, { text: "No", voteCount: 0 }],
  });

  useEffect(() => {
    api.getVoices().then(res => {
      setVoices(res.items.map((v: { id: number; name: string }) => ({ id: v.id, name: v.name })));
    }).catch(() => {});

    if (!isNew) {
      api.getDebate(Number(params.id)).then(data => {
        setForm({
          question: data.question || "", context: data.context || "", category: data.category || "",
          categorySlug: data.categorySlug || "", tags: data.tags || [], pollType: data.pollType || "binary",
          isFeatured: data.isFeatured || false, isEditorsPick: data.isEditorsPick || false,
          editorialStatus: data.editorialStatus || "draft", endsAt: data.endsAt ? data.endsAt.split("T")[0] : "",
          relatedProfileIds: data.relatedProfileIds || [], options: data.options || [],
        });
        setLoading(false);
      }).catch(() => navigate("/debates"));
    }
  }, [params.id, isNew, navigate]);

  const update = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));

  const save = async (status?: string) => {
    setSaving(true);
    try {
      const data = { ...form, editorialStatus: status || form.editorialStatus, endsAt: form.endsAt || null };
      if (isNew) {
        await api.bulkUpload("debates", [{ ...data, options: form.options.map(o => o.text) }]);
      } else {
        await api.updateDebate(Number(params.id), data);
      }
      navigate("/debates");
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold">{isNew ? "New Debate" : "Edit Debate"}</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm"><Eye className="w-3.5 h-3.5" /> Preview</button>
        </div>
      </div>

      <div className="space-y-4">
        <Field label="Question">
          <textarea value={form.question} onChange={e => update("question", e.target.value)} rows={2} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary" />
        </Field>

        <Field label="Context">
          <textarea value={form.context} onChange={e => update("context", e.target.value)} rows={4} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Background context for the debate..." />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <input type="text" value={form.category} onChange={e => update("category", e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </Field>
          <Field label="Category Slug">
            <input type="text" value={form.categorySlug} onChange={e => update("categorySlug", e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Poll Type">
            <select value={form.pollType} onChange={e => update("pollType", e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="binary">Binary (Yes/No)</option>
              <option value="multiple">Multiple Choice</option>
              <option value="scale">Scale</option>
            </select>
          </Field>
          <Field label="Ends At">
            <input type="date" value={form.endsAt} onChange={e => update("endsAt", e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </Field>
        </div>

        <Field label="Tags">
          <DynamicList items={form.tags} onChange={v => update("tags", v)} placeholder="Add tag..." />
        </Field>

        <Field label="Related Voices">
          <div className="border border-border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
            {voices.length === 0 ? (
              <p className="text-xs text-muted-foreground">Loading voices...</p>
            ) : (
              voices.map(v => (
                <label key={v.id} className="flex items-center gap-2 text-sm px-1 py-0.5 hover:bg-secondary/30 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.relatedProfileIds.includes(v.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        update("relatedProfileIds", [...form.relatedProfileIds, v.id]);
                      } else {
                        update("relatedProfileIds", form.relatedProfileIds.filter((id: number) => id !== v.id));
                      }
                    }}
                    className="accent-primary"
                  />
                  {v.name}
                </label>
              ))
            )}
          </div>
          {form.relatedProfileIds.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">{form.relatedProfileIds.length} voice{form.relatedProfileIds.length !== 1 ? "s" : ""} selected</p>
          )}
        </Field>

        <Field label="Poll Options">
          <div className="space-y-2">
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="text" value={opt.text} onChange={e => {
                  const next = [...form.options]; next[i] = { ...next[i], text: e.target.value }; update("options", next);
                }} className="flex-1 px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                {form.options.length > 2 && (
                  <button type="button" onClick={() => update("options", form.options.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-red-400 text-sm">×</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => update("options", [...form.options, { text: "", voteCount: 0 }])} className="text-sm text-primary hover:text-primary/80">+ Add Option</button>
          </div>
        </Field>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={e => update("isFeatured", e.target.checked)} className="accent-primary" /> Featured</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isEditorsPick} onChange={e => update("isEditorsPick", e.target.checked)} className="accent-primary" /> Editor's Pick</label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
        <button onClick={() => save()} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 disabled:opacity-50">
          <Save className="w-3.5 h-3.5" /> Save Draft
        </button>
        <button onClick={() => save("in_review")} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
          <Send className="w-3.5 h-3.5" /> Submit for Review
        </button>
        <button onClick={() => save("approved")} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">
          <Check className="w-3.5 h-3.5" /> Approve
        </button>
        <button onClick={() => save("revision")} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700 disabled:opacity-50">
          <RotateCcw className="w-3.5 h-3.5" /> Revision
        </button>
        <button onClick={() => save("archived")} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 disabled:opacity-50">
          <Archive className="w-3.5 h-3.5" /> Archive
        </button>
        <button onClick={() => navigate("/debates")} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
      </div>

      {showPreview && <PreviewPanel type="debates" item={form} onClose={() => setShowPreview(false)} />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}
