import { db } from "@/lib/db";
import { guard } from "@/lib/guard";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/admin/Modal";

export default async function Page() {
  await guard("logs");
  const logs = await db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { user: { select: { name: true } } } });
  return (
    <div>
      <PageHeader title="Activity log" desc="Audit trail of the latest 200 admin actions." />
      <div className="a-card overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50"><tr><th className="a-th">When</th><th className="a-th">User</th><th className="a-th">Action</th><th className="a-th">Details</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 && <tr><td colSpan={4} className="a-td py-10 text-center text-slate-500">No activity yet.</td></tr>}
            {logs.map((l) => <tr key={l.id}><td className="a-td whitespace-nowrap text-xs">{formatDate(l.createdAt, true)}</td><td className="a-td">{l.user?.name ?? "System"}</td><td className="a-td font-mono text-xs">{l.action}</td><td className="a-td text-slate-500">{l.summary}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
