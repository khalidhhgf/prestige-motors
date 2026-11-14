"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "./Modal";
import { ImageField } from "./MediaPicker";
import type { SiteSettings } from "@/lib/settings";

const T = ({ s, set, k, label, ...p }: { s: SiteSettings; set: (k: keyof SiteSettings, v: unknown) => void; k: keyof SiteSettings; label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div><label className="a-label">{label}</label><input className="a-input" value={String(s[k] ?? "")} onChange={(e) => set(k, e.target.value)} {...p} /></div>
);
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => <section className="a-card p-5"><h2 className="mb-4 font-semibold">{title}</h2><div className="grid gap-4 sm:grid-cols-2">{children}</div></section>;

export default function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [s, setS] = useState(initial);
  const [cities, setCities] = useState(initial.cities.join("\n"));
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const set = (k: keyof SiteSettings, v: unknown) => setS((x) => ({ ...x, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try { await api("/api/admin/settings", { method: "PUT", body: { ...s, cities: cities.split("\n").map((c) => c.trim()).filter(Boolean) } }); toast.success("Settings saved"); router.refresh(); }
    catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  }
  const p = { s, set };

  return (
    <form onSubmit={save} className="space-y-6">
      <PageHeader title="Website settings" action={<button className="a-btn-primary" disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>} />
      <Card title="Branding">
        <T {...p} k="siteName" label="Website name" required /><T {...p} k="tagline" label="Tagline" />
        <ImageField label="Logo (leave empty to use the name)" value={s.logoUrl} onChange={(v) => set("logoUrl", v)} />
        <ImageField label="Favicon" value={s.faviconUrl} onChange={(v) => set("faviconUrl", v)} />
        <div><label className="a-label">Primary (accent) colour</label><div className="flex gap-2"><input type="color" className="h-10 w-14" value={s.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} /><input className="a-input" value={s.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} /></div></div>
        <div><label className="a-label">Secondary colour</label><div className="flex gap-2"><input type="color" className="h-10 w-14" value={s.secondaryColor} onChange={(e) => set("secondaryColor", e.target.value)} /><input className="a-input" value={s.secondaryColor} onChange={(e) => set("secondaryColor", e.target.value)} /></div></div>
      </Card>
      <Card title="Contact details">
        <T {...p} k="phone" label="Phone number" /><T {...p} k="whatsapp" label="WhatsApp number (with country code)" placeholder="+923001234567" /><T {...p} k="email" label="Email" type="email" />
        <div className="sm:col-span-2"><T {...p} k="address" label="Business address" /></div>
        <div className="sm:col-span-2"><label className="a-label">Opening hours</label><textarea rows={3} className="a-input" value={s.openingHours} onChange={(e) => set("openingHours", e.target.value)} /></div>
        <div className="sm:col-span-2"><T {...p} k="mapEmbedUrl" label="Google Maps embed URL" placeholder="https://www.google.com/maps?q=…&output=embed" /><p className="mt-1 text-xs text-slate-500">Google Maps → Share → Embed a map → copy the src URL.</p></div>
      </Card>
      <Card title="Regional">
        <T {...p} k="currency" label="Currency code" /><T {...p} k="currencySymbol" label="Currency display" /><T {...p} k="country" label="Country" /><T {...p} k="timezone" label="Time zone" />
        <div className="sm:col-span-2"><label className="a-label">Cities (one per line)</label><textarea rows={6} className="a-input" value={cities} onChange={(e) => setCities(e.target.value)} /></div>
      </Card>
      <Card title="Social media">
        <T {...p} k="facebook" label="Facebook URL" /><T {...p} k="instagram" label="Instagram URL" /><T {...p} k="youtube" label="YouTube URL" /><T {...p} k="tiktok" label="TikTok URL" />
      </Card>
      <Card title="SEO defaults & footer">
        <div className="sm:col-span-2"><T {...p} k="seoTitle" label="Default page title" maxLength={70} /></div>
        <div className="sm:col-span-2"><label className="a-label">Default meta description</label><textarea rows={2} maxLength={170} className="a-input" value={s.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} /></div>
        <ImageField label="Default social share image" value={s.ogImage} onChange={(v) => set("ogImage", v)} />
        <div><label className="a-label">Footer text</label><textarea rows={2} className="a-input" value={s.footerText} onChange={(e) => set("footerText", e.target.value)} /></div>
      </Card>
      <section className="a-card border-amber-300 p-5">
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={s.maintenanceMode} onChange={(e) => set("maintenanceMode", e.target.checked)} /><span><b>Maintenance mode</b><br /><span className="text-slate-500">Visitors see a maintenance page. Signed-in admins can still browse the site.</span></span></label>
      </section>
      <div className="flex justify-end"><button className="a-btn-primary" disabled={busy}>{busy ? "Saving…" : "Save settings"}</button></div>
    </form>
  );
}
