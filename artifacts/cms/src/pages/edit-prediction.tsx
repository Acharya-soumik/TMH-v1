import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { api } from "@/lib/api";
import DynamicList from "@/components/dynamic-list";
import PreviewPanel from "@/components/preview-panel";
import type React from "react";
import { Eye, Save, Send, Check, Archive, RotateCcw } from "lucide-react";

export default function EditPredictionPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const isNew = params.id === "new";
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState({
    question: "", category: "", categorySlug: "", resolvesAt: "",
    yesPercentage: 50, noPercentage: 50, totalCount: 0, momentum: 0,
    momentumDirection: "up", trendData: [] as number[], editorialStatus: "draft",
    isFeatured: false, tags: [] as string[],
  });

  useEffect(() => {
    if (!isNew) {
      api.getPrediction(Number(params.id)).then(data => {
        setForm({
          question: data.question || "", category: data.category || "", categorySlug: data.categorySlug || "",
          resolvesAt: data.resolvesAt ? data.resolvesAt.split("T")[0] : "",
          yesPercentage: data.yesPercentage ?? 50, noPercentage: data.noPercentage ?? 50,
          totalCount: data.totalCount ?? 0, momentum: data.momentum ?? 0,
          momentumDirection: data.momentumDirection || "up", trendData: data.trendData || [],
          editorialStatus: data.editorialStatus || "draft", isFeatured: data.isFeatured || false,
          tags: data.tags || [],
        });
        setLoading(false);
      }).catch(() => navigate("/predictions"));
    }
  }, [params.id, isNew, navigate]);

  const update = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));

  const save = async (status?: string) => {
    setSaving(true);
    try {
      const data = { ...form, editorialStatus: status || form.editorialStatus, resolvesAt: form.resolvesAt || null };
      if (isNew) {
        await api.bulkUpload("predictions", [data]);
      } else {
        await api.updatePrediction(Number(params.id), data);
      }
      navigate("/predictions");
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold">{isNew ? "New Prediction" : "Edit Prediction"}</h1>
        <button onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm"><Eye className="w-3.5 h-3.5" /> Preview</button>
      </div>

      <div className="space-y-4">
        <Field label="Question">
          <textarea value={form.question} onChange={e => update("question", e.target.value)} rows={2} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <input type="text" value={form.category} onChange={e => update("category", e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </Field>
          <Field label="Category Slug">
            <input type="text" value={form.categorySlug} onChange={e => update("categorySlug", e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </Field>
        </div>

        <Field label="Resolves At">
          <input type="date" value={form.resolvesAt} onChange={e => update("resolvesAt", e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Yes %">
            <input type="number" min={0} max={100} value={form.yesPercentage} onChange={e => { const v = Number(e.target.value); update("yesPercentage", v); update("noPercentage", 100 - v); }} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </Field>
          <Field label="No %">
            <input type="number" min={0} max={100} value={form.noPercentage} readOnly className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm opacity-50" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Momentum">
            <input type="number" step="0.1" value={form.momentum} onChange={e => update("momentum", Number(e.target.value))} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </Field>
          <Field label="Direction">
            <select value={form.momentumDirection} onChange={e => update("momentumDirection", e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="up">Up</option>
              <option value="down">Down</option>
            </select>
          </Field>
        </div>

        <Field label="Tags">
          <DynamicList items={form.tags} onChange={v => update("tags", v)} placeholder="Add tag..." />
        </Field>

        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={e => update("isFeatured", e.target.checked)} className="accent-primary" /> Featured</label>
      </div>

      <div className="flex gap-2 pt-4 border-t border-border">
        <button onClick={() => save()} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 disabled:opacity-50"><Save className="w-3.5 h-3.5" /> Save Draft</button>
        <button onClick={() => save("in_review")} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"><Send className="w-3.5 h-3.5" /> Submit for Review</button>
        <button onClick={() => save("approved")} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"><Check className="w-3.5 h-3.5" /> Approve</button>
        <button onClick={() => save("revision")} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700 disabled:opacity-50"><RotateCcw className="w-3.5 h-3.5" /> Revision</button>
        <button onClick={() => save("archived")} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 disabled:opacity-50"><Archive className="w-3.5 h-3.5" /> Archive</button>
        <button onClick={() => navigate("/predictions")} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
      </div>

      {showPreview && <PreviewPanel type="predictions" item={form} onClose={() => setShowPreview(false)} />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium mb-1.5">{label}</label>{children}</div>;
}
