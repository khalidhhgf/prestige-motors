"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { api } from "@/lib/client";
import { useToast } from "@/components/ui/Toast";
import { Confirm, PageHeader } from "./Modal";
import { formatFullPrice } from "@/lib/format";

type Row = { id: string; slug: string; title: string; price: string; year: number; status: string; published: boolean; featured: boolean; brand: { name: string }; images: { thumbUrl: string | null; url: string }[] };

const ACTIONS: [string, (r: Row) => boolean, string][] = [
  ["publish", (r) => !r.published, "Publish"], ["unpublish", (r) => r.published, "Unpublish"],
  ["feature", (r) => !r.featured, "Mark featured"], ["unfeature", (r) => r.featured, "Remove featured"],
  ["available", (r) => r.status !== "AVAILABLE", "Mark available"], ["reserved", (r) => r.status !== "RESERVED", "Mark reserved"], ["sold", (r) => r.status !== "SOLD", "Mark sold"],
  ["duplicate", () => true, "Duplicate"],
];

export default function VehicleList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<string | null>(null);
  const [del, setDel] = useState<Row | null>(null);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api<{ items: Row[]; pages: number; total: number }>(`/api/admin/vehicles?q=${encodeURIComponent(q)}&status=${status}&page=${page}`);
      setRows(r.items); setPages(r.pages); setTotal(r.total);
    } catch (e) { toast.error((e as Error).message); } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, page]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  async function act(r: Row, action: string) {
    setMenu(null);
    try { await api(`/api/admin/vehicles/${r.id}`, { method: "PATCH", body: { action } }); toast.success(action === "duplicate" ? "Vehicle duplicated (as draft)" : "Updated"); load(); }
    catch (e) { toast.error((e as Error).message); }
  }
  async function remove() {
    if (!del) return;
    try { await api(`/api/admin/vehicles/${del.id}`, { method: "DELETE" }); toast.success("Vehicle deleted"); setDel(null); load(); }
    catch (e) { toast.error((e as Error).message); setDel(null); }
  }

  return (
    <div>
      <PageHeader title="Vehicles" desc={`${total} in inventory`} action={<Link href="/admin/vehicles/new" className="a-btn-primary"><Plus size={16} /> Add vehicle</Link>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input className="a-input pl-9" placeholder="Search title or brand…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
        <select className="a-input w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All</option><option value="published">Published</option><option value="draft">Drafts</option><option value="AVAILABLE">Available</option><option value="RESERVED">Reserved</option><option value="SOLD">Sold</option>
        </select>
      </div>
      <div className="a-card overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50"><tr><th className="a-th">Vehicle</th><th className="a-th hidden sm:table-cell">Price</th><th className="a-th hidden sm:table-cell">Status</th><th className="a-th hidden md:table-cell">Visibility</th><th className="a-th text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan={5} className="a-td py-10 text-center text-slate-500">Loading…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={5} className="a-td py-10 text-center text-slate-500">No vehicles found.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="a-td"><div className="flex items-center gap-3"><div className="h-12 w-16 shrink-0 overflow-hidden rounded bg-slate-200">{/* eslint-disable-next-line @next/next/no-img-element */}{r.images[0] && <img src={r.images[0].thumbUrl || r.images[0].url} alt="" loading="lazy" className="h-full w-full object-cover" />}</div><div><Link href={`/admin/vehicles/${r.id}`} className="font-medium hover:underline">{r.title}</Link><p className="text-xs text-slate-500">{r.brand.name} · {r.year}</p><p className="mt-1 text-xs text-slate-700 sm:hidden">{formatFullPrice(r.price)} · {r.status[0] + r.status.slice(1).toLowerCase()} · {r.published ? "Published" : "Draft"}</p></div></div></td>
                <td className="a-td hidden whitespace-nowrap sm:table-cell">{formatFullPrice(r.price)}</td>
                <td className="a-td hidden sm:table-cell"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-700" : r.status === "RESERVED" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"}`}>{r.status[0] + r.status.slice(1).toLowerCase()}</span></td>
                <td className="a-td hidden text-xs md:table-cell">{r.published ? "Published" : "Draft"}{r.featured ? " · ★ Featured" : ""}</td>
                <td className="a-td relative text-right">
                  <Link href={`/admin/vehicles/${r.id}`} className="a-btn-ghost !px-2.5 !py-1">Edit</Link>
                  <button className="ml-1 p-1.5" onClick={() => setMenu(menu === r.id ? null : r.id)} aria-label="More actions"><MoreHorizontal size={18} /></button>
                  {menu === r.id && (
                    <div className="absolute right-4 top-full z-20 w-44 rounded-md border bg-white py-1 text-left shadow-lg">
                      {ACTIONS.filter(([, show]) => show(r)).map(([a, , label]) => <button key={a} className="block w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100" onClick={() => act(r, a)}>{label}</button>)}
                      {r.published && <a className="block px-3 py-1.5 text-sm hover:bg-slate-100" href={`/inventory/${r.slug}`} target="_blank">View on site</a>}
                      <button className="block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50" onClick={() => { setMenu(null); setDel(r); }}>Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && <div className="mt-4 flex items-center justify-center gap-3 text-sm"><button className="a-btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>Page {page} of {pages}<button className="a-btn-ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></div>}
      {del && <Confirm text={`Delete “${del.title}”? It will be removed from the website and inventory.`} onYes={remove} onNo={() => setDel(null)} />}
    </div>
  );
}
