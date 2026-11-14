"use client";
import { useCallback, useEffect, useState } from "react";
import { Search, Download, Phone, MessageCircle } from "lucide-react";
import { api } from "@/lib/client";
import { useToast } from "@/components/ui/Toast";
import { Modal, PageHeader } from "./Modal";
import { formatDate } from "@/lib/format";

const STATUSES = ["NEW", "CONTACTED", "FOLLOW_UP", "INTERESTED", "NEGOTIATION", "CONVERTED", "LOST"];
const label = (s: string) => s.replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
const COLORS: Record<string, string> = { NEW: "bg-blue-100 text-blue-700", CONTACTED: "bg-sky-100 text-sky-700", FOLLOW_UP: "bg-amber-100 text-amber-700", INTERESTED: "bg-violet-100 text-violet-700", NEGOTIATION: "bg-orange-100 text-orange-700", CONVERTED: "bg-emerald-100 text-emerald-700", LOST: "bg-slate-200 text-slate-600" };

type Lead = { id: string; name: string; phone: string; email: string | null; message: string | null; source: string; type: string; status: string; createdAt: string; vehicle: { title: string; slug: string } | null; assignee: { id: string; name: string } | null };
type Detail = Lead & { inquiries: { id: string; message: string; createdAt: string; channel: string }[]; notes: { id: string; body: string; createdAt: string; author: { name: string } | null }[] };

export default function LeadsManager() {
  const [rows, setRows] = useState<Lead[]>([]);
  const [q, setQ] = useState(""); const [status, setStatus] = useState(""); const [type, setType] = useState(""); const [assignee, setAssignee] = useState("");
  const [page, setPage] = useState(1); const [pages, setPages] = useState(1); const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState<Detail | null>(null);
  const [note, setNote] = useState("");
  const toast = useToast();
  const qs = `q=${encodeURIComponent(q)}&status=${status}&type=${type}&assignee=${assignee}`;

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api<{ items: Lead[]; pages: number; total: number }>(`/api/admin/leads?${qs}&page=${page}`); setRows(r.items); setPages(r.pages); setTotal(r.total); }
    catch (e) { toast.error((e as Error).message); } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs, page]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  useEffect(() => { api<{ items: { id: string; name: string }[] }>("/api/admin/staff").then((r) => setStaff(r.items)).catch(() => {}); }, []);

  async function openLead(id: string) { try { setOpen((await api<{ item: Detail }>(`/api/admin/leads/${id}`)).item); setNote(""); } catch (e) { toast.error((e as Error).message); } }
  async function patch(body: object) {
    if (!open) return;
    try { await api(`/api/admin/leads/${open.id}`, { method: "PATCH", body }); await openLead(open.id); load(); toast.success("Updated"); }
    catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div>
      <PageHeader title="Leads / CRM" desc={`${total} leads`} action={<a className="a-btn-ghost" href={`/api/admin/leads?${qs}&export=csv`}><Download size={16} /> Export CSV</a>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input className="a-input pl-9" placeholder="Search name, phone, email, message…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
        <select className="a-input w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
        <select className="a-input w-auto" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}><option value="">All types</option><option value="INQUIRY">Vehicle inquiry</option><option value="CONTACT">Contact</option><option value="SELL_CAR">Sell car</option><option value="FINANCE">Finance</option></select>
        <select className="a-input w-auto" value={assignee} onChange={(e) => { setAssignee(e.target.value); setPage(1); }}><option value="">Anyone</option><option value="none">Unassigned</option>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
      </div>
      <div className="a-card overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50"><tr><th className="a-th">Customer</th><th className="a-th">Vehicle / type</th><th className="a-th">Status</th><th className="a-th">Assigned</th><th className="a-th">Date</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan={5} className="a-td py-10 text-center text-slate-500">Loading…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={5} className="a-td py-10 text-center text-slate-500">No leads match.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="cursor-pointer hover:bg-slate-50" onClick={() => openLead(r.id)}>
                <td className="a-td"><p className="font-medium">{r.name}</p><p className="text-xs text-slate-500">{r.phone}</p></td>
                <td className="a-td">{r.vehicle?.title ?? <span className="text-slate-500">{label(r.type)}</span>}</td>
                <td className="a-td"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[r.status]}`}>{label(r.status)}</span></td>
                <td className="a-td">{r.assignee?.name ?? "—"}</td>
                <td className="a-td whitespace-nowrap text-xs text-slate-500">{formatDate(r.createdAt, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && <div className="mt-4 flex items-center justify-center gap-3 text-sm"><button className="a-btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>Page {page} of {pages}<button className="a-btn-ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></div>}

      {open && (
        <Modal title={open.name} onClose={() => setOpen(null)} wide>
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap gap-2">
              <a className="a-btn-ghost" href={`tel:${open.phone}`}><Phone size={15} /> {open.phone}</a>
              <a className="a-btn-ghost" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${open.phone.replace(/\D/g, "")}`}><MessageCircle size={15} /> WhatsApp</a>
              {open.email && <a className="a-btn-ghost" href={`mailto:${open.email}`}>{open.email}</a>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="a-label">Status</label><select className="a-input" value={open.status} onChange={(e) => patch({ status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></div>
              <div><label className="a-label">Assigned to</label><select className="a-input" value={open.assignee?.id ?? ""} onChange={(e) => patch({ assigneeId: e.target.value || null })}><option value="">Unassigned</option>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            </div>
            <p className="text-slate-500">Source: {open.source} · Type: {label(open.type)}{open.vehicle && <> · Vehicle: <a className="underline" target="_blank" href={`/inventory/${open.vehicle.slug}`}>{open.vehicle.title}</a></>}</p>
            <div><h3 className="mb-2 font-semibold">Inquiry history</h3><ul className="space-y-2">{open.inquiries.map((i) => <li key={i.id} className="rounded border bg-slate-50 p-3"><p className="whitespace-pre-line">{i.message}</p><p className="mt-1 text-xs text-slate-500">{formatDate(i.createdAt, true)} · {i.channel}</p></li>)}</ul></div>
            <div><h3 className="mb-2 font-semibold">Internal notes</h3>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (note.trim()) { patch({ note }); setNote(""); } }}><input className="a-input" placeholder="Add a note…" value={note} onChange={(e) => setNote(e.target.value)} /><button className="a-btn-primary">Add</button></form>
              <ul className="mt-3 space-y-2">{open.notes.map((n) => <li key={n.id} className="rounded border p-3"><p className="whitespace-pre-line">{n.body}</p><p className="mt-1 text-xs text-slate-500">{n.author?.name ?? "System"} · {formatDate(n.createdAt, true)}</p></li>)}{open.notes.length === 0 && <li className="text-slate-500">No notes yet.</li>}</ul></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
