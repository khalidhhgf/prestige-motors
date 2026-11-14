"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Search, Trash2, Copy } from "lucide-react";
import { api } from "@/lib/client";
import { useToast } from "@/components/ui/Toast";
import { Confirm, Modal, PageHeader } from "./Modal";
import type { MediaItem } from "./MediaPicker";

export default function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<{ name: string; count: number }[]>([]);
  const [folder, setFolder] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [sel, setSel] = useState<MediaItem | null>(null);
  const [del, setDel] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState("");
  const [upFolder, setUpFolder] = useState("general");
  const ref = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api<{ items: MediaItem[]; folders: { name: string; count: number }[] }>(`/api/admin/media?q=${encodeURIComponent(q)}&folder=${folder}`); setItems(r.items); setFolders(r.folders); }
    catch (e) { toast.error((e as Error).message); } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, folder]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData(); Array.from(files).forEach((f) => fd.append("files", f)); fd.append("folder", upFolder);
      const r = await api<{ items: MediaItem[] }>("/api/admin/media", { body: fd });
      toast.success(`${r.items.length} image(s) uploaded & optimised`); load();
    } catch (e) { toast.error((e as Error).message); } finally { setUploading(false); if (ref.current) ref.current.value = ""; }
  }
  async function saveAlt() {
    if (!sel) return;
    try { await api(`/api/admin/media/${sel.id}`, { method: "PATCH", body: { alt } }); toast.success("Saved"); setSel(null); load(); } catch (e) { toast.error((e as Error).message); }
  }
  async function remove() {
    if (!del) return;
    try { await api(`/api/admin/media/${del.id}`, { method: "DELETE" }); toast.success("Deleted"); setDel(null); setSel(null); load(); } catch (e) { toast.error((e as Error).message); setDel(null); }
  }

  return (
    <div>
      <PageHeader title="Media library" desc="Images are auto-optimised (WebP, max 2000px) with thumbnails." action={
        <div className="flex gap-2"><select className="a-input w-auto" value={upFolder} onChange={(e) => setUpFolder(e.target.value)}>{["general", "vehicles", "brands", "hero", "blog", "team"].map((f) => <option key={f}>{f}</option>)}</select>
          <input ref={ref} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => upload(e.target.files)} />
          <button className="a-btn-primary" disabled={uploading} onClick={() => ref.current?.click()}><Upload size={16} /> {uploading ? "Uploading…" : "Upload images"}</button></div>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input className="a-input pl-9" placeholder="Search filename…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className="a-input w-auto" value={folder} onChange={(e) => setFolder(e.target.value)}><option value="">All folders</option>{folders.map((f) => <option key={f.name} value={f.name}>{f.name} ({f.count})</option>)}</select>
      </div>
      {loading ? <p className="py-16 text-center text-sm text-slate-500">Loading…</p> : items.length === 0 ? <div className="a-card p-16 text-center text-sm text-slate-500">No images yet. Upload your first image to get started.</div> : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((m) => (
            <button key={m.id} onClick={() => { setSel(m); setAlt(m.alt ?? ""); }} className="a-card overflow-hidden text-left transition hover:shadow-md">
              <div className="aspect-[4/3] bg-slate-100">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={m.thumbUrl || m.url} alt={m.alt || m.filename} loading="lazy" className="h-full w-full object-cover" /></div>
              <p className="truncate px-2 py-1.5 text-xs">{m.filename}</p>
            </button>
          ))}
        </div>
      )}
      {sel && (
        <Modal title="Image details" onClose={() => setSel(null)}>
          <div className="space-y-4 text-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sel.url} alt={sel.alt || sel.filename} className="max-h-64 w-full rounded bg-slate-100 object-contain" />
            <p className="text-slate-500">{sel.filename} · {sel.width}×{sel.height} · {(sel.size / 1024).toFixed(0)} KB · folder: {sel.folder}</p>
            <div className="flex gap-2"><input readOnly className="a-input" value={sel.url} /><button className="a-btn-ghost" onClick={() => { navigator.clipboard.writeText(location.origin + sel.url).then(() => toast.success("URL copied")); }}><Copy size={15} /></button></div>
            <div><label className="a-label">Alt text (SEO / accessibility)</label><input className="a-input" value={alt} onChange={(e) => setAlt(e.target.value)} /></div>
            <div className="flex justify-between"><button className="a-btn-danger" onClick={() => setDel(sel)}><Trash2 size={15} /> Delete</button><button className="a-btn-primary" onClick={saveAlt}>Save</button></div>
          </div>
        </Modal>
      )}
      {del && <Confirm text="Delete this image permanently? Pages or vehicles still using it will show a broken image." onYes={remove} onNo={() => setDel(null)} />}
    </div>
  );
}
