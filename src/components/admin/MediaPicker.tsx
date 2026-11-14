"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, X, Search, Check } from "lucide-react";
import { api } from "@/lib/client";
import { useToast } from "@/components/ui/Toast";

export type MediaItem = { id: string; url: string; thumbUrl: string | null; filename: string; alt: string | null; folder: string; size: number; width: number | null; height: number | null };

export function MediaPicker({ onPick, onClose, multiple = false, folder = "general" }: { onPick: (items: MediaItem[]) => void; onClose: () => void; multiple?: boolean; folder?: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems((await api<{ items: MediaItem[] }>(`/api/admin/media?q=${encodeURIComponent(q)}`)).items); }
    catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      fd.append("folder", folder);
      const r = await api<{ items: MediaItem[] }>("/api/admin/media", { body: fd });
      setItems((a) => [...r.items, ...a]);
      setSel((s) => (multiple ? [...s, ...r.items] : r.items.slice(0, 1)));
      toast.success(`${r.items.length} image(s) uploaded`);
    } catch (e) { toast.error((e as Error).message); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  const toggle = (m: MediaItem) => setSel((s) => (multiple ? (s.find((x) => x.id === m.id) ? s.filter((x) => x.id !== m.id) : [...s, m]) : [m]));

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-3" role="dialog" aria-modal="true" aria-label="Media library">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4"><h2 className="font-semibold">Select image{multiple ? "s" : ""}</h2><button onClick={onClose} aria-label="Close"><X /></button></div>
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative min-w-48 flex-1"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by filename…" className="a-input pl-9" /></div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
          <button className="a-btn-primary" disabled={uploading} onClick={() => fileRef.current?.click()}><Upload size={16} /> {uploading ? "Uploading…" : "Upload"}</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? <p className="py-10 text-center text-sm text-slate-500">Loading…</p> : items.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No images yet. Upload your first image.</p> : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {items.map((m) => { const on = sel.some((x) => x.id === m.id); return (
                <button key={m.id} onClick={() => toggle(m)} className={`relative aspect-[4/3] overflow-hidden rounded border-2 ${on ? "border-slate-900" : "border-transparent"}`} title={m.filename}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.thumbUrl || m.url} alt={m.alt || m.filename} className="h-full w-full object-cover" loading="lazy" />
                  {on && <span className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-white"><Check size={14} /></span>}
                </button>
              ); })}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t p-4"><span className="text-sm text-slate-500">{sel.length} selected</span>
          <div className="flex gap-2"><button className="a-btn-ghost" onClick={onClose}>Cancel</button><button className="a-btn-primary" disabled={!sel.length} onClick={() => { onPick(sel); onClose(); }}>Use selected</button></div></div>
      </div>
    </div>
  );
}

/** Single image field with preview. */
export function ImageField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {label && <label className="a-label">{label}</label>}
      <div className="flex items-center gap-3">
        <div className="h-16 w-24 shrink-0 overflow-hidden rounded border bg-slate-100">{/* eslint-disable-next-line @next/next/no-img-element */}{value && <img src={value} alt="" className="h-full w-full object-cover" />}</div>
        <button type="button" className="a-btn-ghost" onClick={() => setOpen(true)}>{value ? "Change" : "Choose image"}</button>
        {value && <button type="button" className="text-sm text-red-600" onClick={() => onChange("")}>Remove</button>}
      </div>
      {open && <MediaPicker onPick={(m) => onChange(m[0].url)} onClose={() => setOpen(false)} />}
    </div>
  );
}
