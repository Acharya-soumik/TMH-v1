import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Save, Plus, Trash2 } from "lucide-react";

interface NavLink {
  label: string;
  href: string;
  enabled: boolean;
}

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface SiteSettings {
  navigation: {
    links: NavLink[];
    ctaButton: { label: string; href: string; enabled: boolean };
  };
  footer: {
    links: FooterLink[];
    socialLinks: SocialLink[];
    copyright: string;
    tagline: string;
  };
  seo: {
    siteTitle: string;
    siteDescription: string;
    ogImage: string;
  };
  cookieConsent: {
    enabled: boolean;
    message: string;
    acceptLabel: string;
    dismissLabel: string;
    linkText: string;
    linkHref: string;
  };
  shareGate: {
    enabled: boolean;
    heading: string;
    body: string;
    shareButtonText: string;
    skipText: string;
    emailPlaceholder: string;
  };
}

export default function PageSiteSettings() {
  const [config, setConfig] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"navigation" | "footer" | "seo" | "cookie" | "sharegate">("navigation");

  useEffect(() => {
    api.getSiteSettings().then(setConfig).catch(console.error).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await api.updateSiteSettings(config as unknown as Record<string, unknown>);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  if (!config) return <div className="text-center py-12 text-red-500">Failed to load site settings</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold uppercase tracking-wide">Site Settings<span className="text-primary">.</span></h1>
        <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm hover:bg-primary/90 disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-1 border-b border-border">
        {(["navigation", "footer", "seo", "cookie", "sharegate"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
            {tab === "sharegate" ? "Share Gate" : tab === "cookie" ? "Cookie Consent" : tab}
          </button>
        ))}
      </div>

      {activeTab === "navigation" && (
        <div className="space-y-4">
          <section className="border border-border rounded-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold uppercase tracking-wide">Navigation Links</h2>
              <button onClick={() => setConfig({ ...config, navigation: { ...config.navigation, links: [...config.navigation.links, { label: "", href: "/", enabled: true }] } })} className="flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-sm hover:bg-secondary/80">
                <Plus className="w-3 h-3" /> Add Link
              </button>
            </div>
            {config.navigation.links.map((link, i) => (
              <div key={i} className="flex items-center gap-2 border border-border/50 rounded-sm p-2 bg-card">
                <input value={link.label} onChange={e => { const links = [...config.navigation.links]; links[i] = { ...link, label: e.target.value }; setConfig({ ...config, navigation: { ...config.navigation, links } }); }} placeholder="Label" className="flex-1 px-2 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                <input value={link.href} onChange={e => { const links = [...config.navigation.links]; links[i] = { ...link, href: e.target.value }; setConfig({ ...config, navigation: { ...config.navigation, links } }); }} placeholder="/path" className="w-32 px-2 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={link.enabled} onChange={e => { const links = [...config.navigation.links]; links[i] = { ...link, enabled: e.target.checked }; setConfig({ ...config, navigation: { ...config.navigation, links } }); }} className="accent-primary" />
                  Visible
                </label>
                <button onClick={() => setConfig({ ...config, navigation: { ...config.navigation, links: config.navigation.links.filter((_, j) => j !== i) } })} className="text-muted-foreground hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </section>

          <section className="border border-border rounded-sm p-4 space-y-3">
            <h2 className="font-serif text-lg font-bold uppercase tracking-wide">CTA Button</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Label</label>
                <input value={config.navigation.ctaButton.label} onChange={e => setConfig({ ...config, navigation: { ...config.navigation, ctaButton: { ...config.navigation.ctaButton, label: e.target.value } } })} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Link</label>
                <input value={config.navigation.ctaButton.href} onChange={e => setConfig({ ...config, navigation: { ...config.navigation, ctaButton: { ...config.navigation.ctaButton, href: e.target.value } } })} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={config.navigation.ctaButton.enabled} onChange={e => setConfig({ ...config, navigation: { ...config.navigation, ctaButton: { ...config.navigation.ctaButton, enabled: e.target.checked } } })} className="accent-primary" />
              Show CTA button
            </label>
          </section>
        </div>
      )}

      {activeTab === "footer" && (
        <div className="space-y-4">
          <section className="border border-border rounded-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold uppercase tracking-wide">Footer Links</h2>
              <button onClick={() => setConfig({ ...config, footer: { ...config.footer, links: [...config.footer.links, { label: "", href: "/" }] } })} className="flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-sm hover:bg-secondary/80">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            {config.footer.links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={link.label} onChange={e => { const links = [...config.footer.links]; links[i] = { ...link, label: e.target.value }; setConfig({ ...config, footer: { ...config.footer, links } }); }} placeholder="Label" className="flex-1 px-2 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                <input value={link.href} onChange={e => { const links = [...config.footer.links]; links[i] = { ...link, href: e.target.value }; setConfig({ ...config, footer: { ...config.footer, links } }); }} placeholder="/path" className="w-32 px-2 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                <button onClick={() => setConfig({ ...config, footer: { ...config.footer, links: config.footer.links.filter((_, j) => j !== i) } })} className="text-muted-foreground hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </section>

          <section className="border border-border rounded-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold uppercase tracking-wide">Social Links</h2>
              <button onClick={() => setConfig({ ...config, footer: { ...config.footer, socialLinks: [...config.footer.socialLinks, { platform: "", url: "", icon: "" }] } })} className="flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-sm hover:bg-secondary/80">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            {config.footer.socialLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={link.platform} onChange={e => { const socialLinks = [...config.footer.socialLinks]; socialLinks[i] = { ...link, platform: e.target.value }; setConfig({ ...config, footer: { ...config.footer, socialLinks } }); }} placeholder="Platform" className="w-32 px-2 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                <input value={link.url} onChange={e => { const socialLinks = [...config.footer.socialLinks]; socialLinks[i] = { ...link, url: e.target.value }; setConfig({ ...config, footer: { ...config.footer, socialLinks } }); }} placeholder="URL" className="flex-1 px-2 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                <input value={link.icon} onChange={e => { const socialLinks = [...config.footer.socialLinks]; socialLinks[i] = { ...link, icon: e.target.value }; setConfig({ ...config, footer: { ...config.footer, socialLinks } }); }} placeholder="Icon key" className="w-24 px-2 py-1.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                <button onClick={() => setConfig({ ...config, footer: { ...config.footer, socialLinks: config.footer.socialLinks.filter((_, j) => j !== i) } })} className="text-muted-foreground hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </section>

          <section className="border border-border rounded-sm p-4 space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Copyright</label>
              <input value={config.footer.copyright} onChange={e => setConfig({ ...config, footer: { ...config.footer, copyright: e.target.value } })} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Tagline</label>
              <input value={config.footer.tagline} onChange={e => setConfig({ ...config, footer: { ...config.footer, tagline: e.target.value } })} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </section>
        </div>
      )}

      {activeTab === "seo" && (
        <section className="border border-border rounded-sm p-4 space-y-3">
          <h2 className="font-serif text-lg font-bold uppercase tracking-wide">SEO / Meta</h2>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Site Title</label>
            <input value={config.seo.siteTitle} onChange={e => setConfig({ ...config, seo: { ...config.seo, siteTitle: e.target.value } })} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Site Description</label>
            <textarea value={config.seo.siteDescription} onChange={e => setConfig({ ...config, seo: { ...config.seo, siteDescription: e.target.value } })} rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">OG Image Path</label>
            <input value={config.seo.ogImage} onChange={e => setConfig({ ...config, seo: { ...config.seo, ogImage: e.target.value } })} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </section>
      )}

      {activeTab === "cookie" && (
        <section className="border border-border rounded-sm p-4 space-y-3">
          <h2 className="font-serif text-lg font-bold uppercase tracking-wide">Cookie Consent Banner</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={config.cookieConsent.enabled} onChange={e => setConfig({ ...config, cookieConsent: { ...config.cookieConsent, enabled: e.target.checked } })} className="accent-primary" />
            Enable cookie consent banner
          </label>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Message</label>
            <textarea value={config.cookieConsent.message} onChange={e => setConfig({ ...config, cookieConsent: { ...config.cookieConsent, message: e.target.value } })} rows={2} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Accept Button Label</label>
              <input value={config.cookieConsent.acceptLabel} onChange={e => setConfig({ ...config, cookieConsent: { ...config.cookieConsent, acceptLabel: e.target.value } })} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Dismiss Button Label</label>
              <input value={config.cookieConsent.dismissLabel} onChange={e => setConfig({ ...config, cookieConsent: { ...config.cookieConsent, dismissLabel: e.target.value } })} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Privacy Link Text</label>
              <input value={config.cookieConsent.linkText} onChange={e => setConfig({ ...config, cookieConsent: { ...config.cookieConsent, linkText: e.target.value } })} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Privacy Link URL</label>
              <input value={config.cookieConsent.linkHref} onChange={e => setConfig({ ...config, cookieConsent: { ...config.cookieConsent, linkHref: e.target.value } })} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </section>
      )}

      {activeTab === "sharegate" && (
        <section className="border border-border rounded-sm p-4 space-y-3">
          <h2 className="font-serif text-lg font-bold uppercase tracking-wide">Share Gate</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={config.shareGate.enabled} onChange={e => setConfig({ ...config, shareGate: { ...config.shareGate, enabled: e.target.checked } })} className="accent-primary" />
            Enable share gate on polls
          </label>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Heading</label>
            <input value={config.shareGate.heading} onChange={e => setConfig({ ...config, shareGate: { ...config.shareGate, heading: e.target.value } })} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Body</label>
            <textarea value={config.shareGate.body} onChange={e => setConfig({ ...config, shareGate: { ...config.shareGate, body: e.target.value } })} rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Share Button Text</label>
              <input value={config.shareGate.shareButtonText} onChange={e => setConfig({ ...config, shareGate: { ...config.shareGate, shareButtonText: e.target.value } })} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Skip Text</label>
              <input value={config.shareGate.skipText} onChange={e => setConfig({ ...config, shareGate: { ...config.shareGate, skipText: e.target.value } })} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Email Placeholder</label>
            <input value={config.shareGate.emailPlaceholder} onChange={e => setConfig({ ...config, shareGate: { ...config.shareGate, emailPlaceholder: e.target.value } })} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </section>
      )}
    </div>
  );
}
