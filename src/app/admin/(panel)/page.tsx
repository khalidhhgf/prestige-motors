import Link from "next/link";
import { Car, CheckCircle2, BadgeCheck, Star, Users, Sparkles, CalendarClock, Inbox } from "lucide-react";
import { db } from "@/lib/db";
import { guard } from "@/lib/guard";
import { can } from "@/lib/rbac";
import { formatDate } from "@/lib/format";

export default async function Dashboard() {
  const user = await guard("dashboard");
  const showLeads = can(user.role, "leads");
  const showCars = can(user.role, "vehicles");
  const since = new Date(); since.setMonth(since.getMonth() - 5, 1); since.setHours(0, 0, 0, 0);

  const [total, available, sold, featured, leads, newLeads, pendingTD, logs, monthly, byBrand, byStatus] = await Promise.all([
    showCars ? db.vehicle.count({ where: { deletedAt: null } }) : 0,
    showCars ? db.vehicle.count({ where: { deletedAt: null, status: "AVAILABLE", published: true } }) : 0,
    showCars ? db.vehicle.count({ where: { deletedAt: null, status: "SOLD" } }) : 0,
    showCars ? db.vehicle.count({ where: { deletedAt: null, featured: true } }) : 0,
    showLeads ? db.lead.count({ where: { deletedAt: null } }) : 0,
    showLeads ? db.lead.count({ where: { deletedAt: null, status: "NEW" } }) : 0,
    showLeads ? db.testDrive.count({ where: { status: "PENDING" } }) : 0,
    db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: { select: { name: true } } } }),
    showLeads ? db.lead.findMany({ where: { deletedAt: null, createdAt: { gte: since } }, select: { createdAt: true } }) : [],
    showCars ? db.vehicle.groupBy({ by: ["brandId"], where: { deletedAt: null }, _count: true, orderBy: { _count: { brandId: "desc" } }, take: 6 }) : [],
    showCars ? db.vehicle.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }) : [],
  ]);
  const brandNames = await db.brand.findMany({ where: { id: { in: byBrand.map((b) => b.brandId) } }, select: { id: true, name: true } });

  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(since); d.setMonth(since.getMonth() + i); return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("en", { month: "short" }), n: 0 }; });
  for (const l of monthly) { const m = months.find((x) => x.key === `${l.createdAt.getFullYear()}-${l.createdAt.getMonth()}`); if (m) m.n++; }
  const maxM = Math.max(1, ...months.map((m) => m.n));
  const maxB = Math.max(1, ...byBrand.map((b) => b._count));

  const cards = [
    showCars && { label: "Total vehicles", v: total, icon: Car }, showCars && { label: "Available", v: available, icon: CheckCircle2 },
    showCars && { label: "Sold", v: sold, icon: BadgeCheck }, showCars && { label: "Featured", v: featured, icon: Star },
    showLeads && { label: "Total inquiries", v: leads, icon: Inbox }, showLeads && { label: "New leads", v: newLeads, icon: Sparkles },
    showLeads && { label: "Pending test drives", v: pendingTD, icon: CalendarClock },
  ].filter(Boolean) as { label: string; v: number; icon: React.ElementType }[];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold">Welcome back, {user.name.split(" ")[0]}</h1><p className="text-sm text-slate-500">Here&apos;s what&apos;s happening at the dealership.</p></div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map(({ label, v, icon: Icon }) => (
          <div key={label} className="a-card p-4"><div className="flex items-center justify-between text-slate-500"><span className="text-xs font-medium uppercase tracking-wide">{label}</span><Icon size={18} /></div><p className="mt-2 text-3xl font-semibold">{v}</p></div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {showLeads && (
          <div className="a-card p-5"><h2 className="mb-4 font-semibold">Inquiries – last 6 months</h2>
            <div className="flex h-44 items-end gap-3">{months.map((m) => (
              <div key={m.key} className="flex flex-1 flex-col items-center gap-1"><span className="text-xs text-slate-500">{m.n}</span><div className="w-full rounded-t bg-slate-900" style={{ height: `${(m.n / maxM) * 100}%`, minHeight: m.n ? 4 : 2, opacity: m.n ? 1 : 0.15 }} /><span className="text-xs">{m.label}</span></div>
            ))}</div></div>
        )}
        {showCars && (
          <div className="a-card p-5"><h2 className="mb-4 font-semibold">Inventory by brand</h2>
            <div className="space-y-3">{byBrand.length === 0 && <p className="text-sm text-slate-500">No vehicles yet.</p>}{byBrand.map((b) => (
              <div key={b.brandId} className="flex items-center gap-3 text-sm"><span className="w-28 truncate">{brandNames.find((x) => x.id === b.brandId)?.name}</span><div className="h-2.5 flex-1 rounded bg-slate-100"><div className="h-full rounded bg-slate-900" style={{ width: `${(b._count / maxB) * 100}%` }} /></div><span className="w-6 text-right text-slate-500">{b._count}</span></div>
            ))}</div>
            <div className="mt-5 flex gap-4 border-t pt-4 text-xs text-slate-600">{byStatus.map((s) => <span key={s.status}>{s.status[0] + s.status.slice(1).toLowerCase()}: <b>{s._count}</b></span>)}</div></div>
        )}
      </div>
      <div className="a-card p-5">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Recent activity</h2>{can(user.role, "logs") && <Link href="/admin/logs" className="text-sm text-slate-600 underline">View all</Link>}</div>
        {logs.length === 0 ? <p className="text-sm text-slate-500">No activity yet.</p> : (
          <ul className="divide-y">{logs.map((l) => (<li key={l.id} className="flex flex-wrap justify-between gap-2 py-2.5 text-sm"><span><b>{l.user?.name ?? "System"}</b> · {l.action}{l.summary ? ` — ${l.summary}` : ""}</span><span className="text-xs text-slate-500">{formatDate(l.createdAt, true)}</span></li>))}</ul>
        )}
      </div>
    </div>
  );
}
