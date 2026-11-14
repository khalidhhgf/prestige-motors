"use client";
import { useCallback, useEffect, useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { api } from "@/lib/client";
import { useToast } from "@/components/ui/Toast";
import { Modal, PageHeader } from "./Modal";
import { formatDate } from "@/lib/format";

const STATUSES = ["PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"];
const label = (s: string) => s[0] + s.slice(1).toLowerCase();
const COLORS: Record<string, string> = { PENDING: "bg-amber-100 text-amber-700", APPROVED: "bg-emerald-100 text-emerald-700", REJECTED: "bg-red-100 text-red-700", COMPLETED: "bg-slate-200 text-slate-700", CANCELLED: "bg-slate-200 text-slate-500" };
type TD = { id: string; name: string; phone: string; email: string | null; preferredDate: string; preferredTime: string | null; message: string | null; status: string; internalNotes: string | null; vehicle: { title: string; slug: string } | null };

export default function TestDrivesManager() {
  const [rows, setRows] = useState<TD[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<TD | null>(null);
  const [notes, setNotes] = useState("");
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows((await api<{ items: TD[] }>(`/api/admin/testdrives?status=${status}`)).items); } catch (e) { toast.error((e as Error).message); } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  useEffect(() => { load(); }, [load]);

  async function patch(id: string, body: object) {
    try { await api(`/api/admin/testdrives?id=${id}`, { method: "PATCH", body }); toast.success("Updated"); await load(); return true; } catch (e) { toast.error((e as Error).message); return false; }
  }

  return (
    <div>
      <PageHeader title="Test drive bookings" desc="Approve, reject or complete requests from the website." action={<select className="a-input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>} />
      <div className="a-card overflow-x-auto">
        <table className="sticky-actions min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50"><tr><th className="a-th">Customer</th><th className="a-th">Vehicle</th><th className="a-th">Preferred slot</th><th className="a-th">Status</th><th className="a-th text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan={5} className="a-td py-10 text-center text-slate-500">Loading…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={5} className="a-td py-10 text-center text-slate-500">No bookings.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="a-td"><p className="font-medium">{r.name}</p><p className="text-xs text-slate-500">{r.phone}</p></td>
                <td className="a-td">{r.vehicle?.title ?? "General"}</td>
                <td className="a-td whitespace-nowrap">{formatDate(r.preferredDate)}{r.preferredTime ? ` · ${r.preferredTime}` : ""}</td>
                <td className="a-td"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[r.status]}`}>{label(r.status)}</span></td>
                <td className="a-td whitespace-nowrap text-right">
                  {r.status === "PENDING" && <><button className="a-btn-primary !px-2.5 !py-1" onClick={() => patch(r.id, { status: "APPROVED" })}>Approve</button> <button className="a-btn-ghost !px-2.5 !py-1 text-red-600" onClick={() => patch(r.id, { status: "REJECTED" })}>Reject</button> </>}
                  <button className="a-btn-ghost !px-2.5 !py-1" onClick={() => { setOpen(r); setNotes(r.internalNotes ?? ""); }}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title={`Test drive – ${open.name}`} onClose={() => setOpen(null)}>
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2"><a className="a-btn-ghost" href={`tel:${open.phone}`}><Phone size={15} /> {open.phone}</a><a className="a-btn-ghost" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${open.phone.replace(/\D/g, "")}`}><MessageCircle size={15} /> WhatsApp</a>{open.email && <a className="a-btn-ghost" href={`mailto:${open.email}`}>{open.email}</a>}</div>
            <p><b>Vehicle:</b> {open.vehicle?.title ?? "General"}<br /><b>When:</b> {formatDate(open.preferredDate)} {open.preferredTime}</p>
            {open.message && <p className="rounded bg-slate-50 p-3">{open.message}</p>}
            <div><label className="a-label">Status</label><select className="a-input" value={open.status} onChange={async (e) => { if (await patch(open.id, { status: e.target.value })) setOpen({ ...open, status: e.target.value }); }}>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></div>
            <div><label className="a-label">Internal notes</label><textarea rows={3} className="a-input" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <div className="flex justify-end"><button className="a-btn-primary" onClick={() => patch(open.id, { internalNotes: notes })}>Save notes</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
