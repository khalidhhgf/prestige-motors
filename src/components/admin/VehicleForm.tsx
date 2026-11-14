"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Trash2, Plus, ImagePlus, Star } from "lucide-react";
import { api } from "@/lib/client";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker, type MediaItem } from "./MediaPicker";
import { PageHeader } from "./Modal";

type Opt = { id: string; name: string; group?: string };
type V = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const EMPTY: V = {
  title: "", brandId: "", modelId: "", modelName: "", categoryId: "", price: "", priceNegotiable: false, year: new Date().getFullYear(), mileage: 0, engineCc: "",
  transmission: "Automatic", fuelType: "Petrol", bodyType: "", exteriorColor: "", interiorColor: "", condition: "USED", city: "", registrationCity: "", description: "",
  status: "AVAILABLE", published: false, featured: false, origin: "LOCAL", auctionGrade: "", importYear: "", registrationYear: "", originalMileage: "", verifiedMileage: "",
  tokenTaxInfo: "", customsDetails: "", auctionSheetUrl: "", specs: [], featureIds: [], seoTitle: "", seoDescription: "", images: [],
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="a-card p-5"><h2 className="mb-4 font-semibold">{title}</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div></section>
);

export default function VehicleForm({ initial, brands, models, categories, features, cities }: { initial?: V; brands: Opt[]; models: (Opt & { brandId: string })[]; categories: Opt[]; features: Opt[]; cities: string[] }) {
  const [v, setV] = useState<V>(() => {
    if (!initial) return EMPTY;
    const out: V = { ...EMPTY };
    for (const k of Object.keys(EMPTY)) if (initial[k] !== undefined && initial[k] !== null) out[k] = initial[k];
    out.price = Number(initial.price);
    out.featureIds = initial.features?.map((f: V) => f.featureId) ?? [];
    out.images = initial.images?.map((i: V) => ({ url: i.url, thumbUrl: i.thumbUrl, alt: i.alt })) ?? [];
    out.specs = Array.isArray(initial.specs) ? initial.specs : [];
    return out;
  });
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const set = (k: string, val: unknown) => setV((s) => ({ ...s, [k]: val }));
  const bind = (k: string) => ({ value: v[k] ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(k, e.target.value) });
  const brandModels = models.filter((m) => m.brandId === v.brandId);
  const moveImg = (i: number, d: number) => setV((s) => { const a = [...s.images]; const j = i + d; if (j < 0 || j >= a.length) return s; [a[i], a[j]] = [a[j], a[i]]; return { ...s, images: a }; });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...v, price: Number(v.price), mileage: Number(v.mileage || 0), year: Number(v.year) };
      if (initial?.id) { await api(`/api/admin/vehicles/${initial.id}`, { method: "PUT", body }); toast.success("Vehicle updated"); router.refresh(); }
      else { await api("/api/admin/vehicles", { body }); toast.success("Vehicle created"); router.push("/admin/vehicles"); router.refresh(); }
    } catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); }
  }

  const groups = features.reduce<Record<string, Opt[]>>((a, f) => { (a[f.group ?? "General"] ??= []).push(f); return a; }, {});

  return (
    <form onSubmit={submit} className="space-y-6">
      <PageHeader title={initial ? "Edit vehicle" : "Add vehicle"} desc={initial ? initial.title : "Fill in the details, add photos, then publish."}
        action={<div className="flex gap-2"><button type="button" className="a-btn-ghost" onClick={() => router.push("/admin/vehicles")}>Back</button><button className="a-btn-primary" disabled={busy}>{busy ? "Saving…" : "Save vehicle"}</button></div>} />

      <Section title="Basic information">
        <div className="sm:col-span-2"><label className="a-label">Title *</label><input required className="a-input" placeholder="e.g. Toyota Corolla Altis X 1.6" {...bind("title")} /></div>
        <div><label className="a-label">Price (PKR) *</label><input required type="number" min={0} className="a-input" {...bind("price")} /></div>
        <div><label className="a-label">Brand *</label><select required className="a-input" value={v.brandId} onChange={(e) => setV((s) => ({ ...s, brandId: e.target.value, modelId: "", modelName: "" }))}><option value="">Select brand</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
        <div><label className="a-label">Model</label><select className="a-input" value={v.modelId} onChange={(e) => setV((s) => ({ ...s, modelId: e.target.value, modelName: "" }))} disabled={!v.brandId}><option value="">— none / new —</option>{brandModels.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
        <div><label className="a-label">…or add a new model</label><input className="a-input" placeholder="New model name" disabled={!!v.modelId} {...bind("modelName")} /></div>
        <div><label className="a-label">Category</label><select className="a-input" {...bind("categoryId")}><option value="">None</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className="a-label">Model year *</label><input required type="number" min={1950} max={new Date().getFullYear() + 1} className="a-input" {...bind("year")} /></div>
        <div><label className="a-label">Mileage (km)</label><input type="number" min={0} className="a-input" {...bind("mileage")} /></div>
        <div><label className="a-label">Engine capacity (cc)</label><input type="number" min={0} className="a-input" {...bind("engineCc")} /></div>
        <div><label className="a-label">Transmission</label><select className="a-input" {...bind("transmission")}>{["Automatic", "Manual", "CVT", "DCT"].map((x) => <option key={x}>{x}</option>)}</select></div>
        <div><label className="a-label">Fuel type</label><select className="a-input" {...bind("fuelType")}>{["Petrol", "Diesel", "Hybrid", "Electric", "CNG", "LPG"].map((x) => <option key={x}>{x}</option>)}</select></div>
        <div><label className="a-label">Body type</label><input className="a-input" placeholder="SUV, Sedan…" {...bind("bodyType")} /></div>
        <div><label className="a-label">Exterior colour</label><input className="a-input" {...bind("exteriorColor")} /></div>
        <div><label className="a-label">Interior colour</label><input className="a-input" {...bind("interiorColor")} /></div>
        <div><label className="a-label">Condition</label><select className="a-input" {...bind("condition")}><option value="NEW">New</option><option value="USED">Used</option><option value="RECONDITIONED">Reconditioned</option></select></div>
        <div><label className="a-label">City</label><input list="cities" className="a-input" {...bind("city")} /><datalist id="cities">{cities.map((c) => <option key={c} value={c} />)}</datalist></div>
        <div><label className="a-label">Registration city</label><input list="cities" className="a-input" {...bind("registrationCity")} /></div>
        <div className="sm:col-span-2 lg:col-span-3"><label className="a-label">Description</label><textarea rows={6} className="a-input" {...bind("description")} /></div>
      </Section>

      <section className="a-card p-5">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Photographs</h2><button type="button" className="a-btn-ghost" onClick={() => setPicker(true)}><ImagePlus size={16} /> Add photos</button></div>
        {v.images.length === 0 ? <p className="rounded border border-dashed p-8 text-center text-sm text-slate-500">No photos yet. The first photo is the featured image shown in listings.</p> : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {v.images.map((im: V, i: number) => (
              <div key={im.url + i} className="overflow-hidden rounded border bg-slate-50">
                <div className="relative aspect-[4/3]">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={im.thumbUrl || im.url} alt="" className="h-full w-full object-cover" />{i === 0 && <span className="absolute left-1 top-1 flex items-center gap-1 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-white"><Star size={10} /> Featured</span>}</div>
                <div className="flex justify-between p-1.5">
                  <div className="flex"><button type="button" className="p-1 disabled:opacity-30" disabled={i === 0} onClick={() => moveImg(i, -1)} aria-label="Move earlier"><ArrowUp size={15} /></button><button type="button" className="p-1 disabled:opacity-30" disabled={i === v.images.length - 1} onClick={() => moveImg(i, 1)} aria-label="Move later"><ArrowDown size={15} /></button>{i !== 0 && <button type="button" className="p-1 text-xs underline" onClick={() => setV((s) => { const a = [...s.images]; const [x] = a.splice(i, 1); a.unshift(x); return { ...s, images: a }; })}>Set featured</button>}</div>
                  <button type="button" className="p-1 text-red-600" onClick={() => set("images", v.images.filter((_: V, j: number) => j !== i))} aria-label="Remove photo"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        {picker && <MediaPicker multiple folder="vehicles" onClose={() => setPicker(false)} onPick={(items: MediaItem[]) => set("images", [...v.images, ...items.filter((m) => !v.images.some((x: V) => x.url === m.url)).map((m) => ({ url: m.url, thumbUrl: m.thumbUrl, alt: m.alt }))])} />}
      </section>

      <Section title="Pakistan market details (optional)">
        <div><label className="a-label">Origin</label><select className="a-input" {...bind("origin")}><option value="LOCAL">Local assembled</option><option value="IMPORTED">Imported</option></select></div>
        <div><label className="a-label">Auction grade</label><input className="a-input" placeholder="e.g. 4.5" {...bind("auctionGrade")} /></div>
        <div><label className="a-label">Auction sheet URL</label><input className="a-input" {...bind("auctionSheetUrl")} /></div>
        <div><label className="a-label">Import year</label><input type="number" className="a-input" {...bind("importYear")} /></div>
        <div><label className="a-label">Registration year</label><input type="number" className="a-input" {...bind("registrationYear")} /></div>
        <div><label className="a-label">Original mileage (km)</label><input type="number" className="a-input" {...bind("originalMileage")} /></div>
        <div><label className="a-label">Verified mileage (km)</label><input type="number" className="a-input" {...bind("verifiedMileage")} /></div>
        <div><label className="a-label">Token tax information</label><input className="a-input" {...bind("tokenTaxInfo")} /></div>
        <div><label className="a-label">Customs / import details</label><input className="a-input" {...bind("customsDetails")} /></div>
      </Section>

      <section className="a-card p-5">
        <h2 className="mb-4 font-semibold">Features</h2>
        {features.length === 0 && <p className="text-sm text-slate-500">No features defined yet — add some under Inventory → Features.</p>}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(groups).map(([g, list]) => (
            <div key={g}><p className="mb-2 text-xs font-semibold uppercase text-slate-500">{g}</p>
              {list.map((f) => <label key={f.id} className="flex items-center gap-2 py-0.5 text-sm"><input type="checkbox" checked={v.featureIds.includes(f.id)} onChange={(e) => set("featureIds", e.target.checked ? [...v.featureIds, f.id] : v.featureIds.filter((x: string) => x !== f.id))} /> {f.name}</label>)}</div>
          ))}
        </div>
      </section>

      <section className="a-card p-5">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Extra specifications</h2><button type="button" className="a-btn-ghost" onClick={() => set("specs", [...v.specs, { key: "", value: "" }])}><Plus size={14} /> Add row</button></div>
        <div className="space-y-2">{v.specs.map((s: V, i: number) => (
          <div key={i} className="flex gap-2"><input className="a-input" placeholder="Name (e.g. Drive)" value={s.key} onChange={(e) => set("specs", v.specs.map((x: V, j: number) => (j === i ? { ...x, key: e.target.value } : x)))} /><input className="a-input" placeholder="Value" value={s.value} onChange={(e) => set("specs", v.specs.map((x: V, j: number) => (j === i ? { ...x, value: e.target.value } : x)))} /><button type="button" className="px-2 text-red-600" onClick={() => set("specs", v.specs.filter((_: V, j: number) => j !== i))} aria-label="Remove"><Trash2 size={16} /></button></div>
        ))}</div>
      </section>

      <Section title="Visibility, status & SEO">
        <div><label className="a-label">Availability status</label><select className="a-input" {...bind("status")}><option value="AVAILABLE">Available</option><option value="RESERVED">Reserved</option><option value="SOLD">Sold</option></select></div>
        <div className="flex flex-col justify-end gap-2 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={v.published} onChange={(e) => set("published", e.target.checked)} /> Published (visible on website)</label><label className="flex items-center gap-2"><input type="checkbox" checked={v.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured on homepage</label><label className="flex items-center gap-2"><input type="checkbox" checked={v.priceNegotiable} onChange={(e) => set("priceNegotiable", e.target.checked)} /> Price negotiable</label></div>
        <div />
        <div><label className="a-label">SEO title</label><input maxLength={70} className="a-input" {...bind("seoTitle")} /></div>
        <div className="sm:col-span-2"><label className="a-label">SEO description</label><input maxLength={170} className="a-input" {...bind("seoDescription")} /></div>
      </Section>
      <div className="flex justify-end"><button className="a-btn-primary" disabled={busy}>{busy ? "Saving…" : "Save vehicle"}</button></div>
    </form>
  );
}
