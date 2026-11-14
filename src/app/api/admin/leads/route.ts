import { adminRoute } from "@/lib/api";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

function where(u: URL): Prisma.LeadWhereInput {
  const q = u.searchParams.get("q");
  const status = u.searchParams.get("status");
  const assignee = u.searchParams.get("assignee");
  const type = u.searchParams.get("type");
  return {
    deletedAt: null,
    ...(status ? { status: status as never } : {}),
    ...(type ? { type } : {}),
    ...(assignee ? { assigneeId: assignee === "none" ? null : assignee } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { email: { contains: q, mode: "insensitive" } }, { message: { contains: q, mode: "insensitive" } }] } : {}),
  };
}

const csvCell = (v: unknown) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // neutralise spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export const GET = adminRoute("leads", async (req) => {
  const u = new URL(req.url);
  const w = where(u);
  if (u.searchParams.get("export") === "csv") {
    const rows = await db.lead.findMany({ where: w, orderBy: { createdAt: "desc" }, include: { vehicle: { select: { title: true } }, assignee: { select: { name: true } } }, take: 10000 });
    const head = ["Date", "Name", "Phone", "Email", "Vehicle", "Type", "Source", "Status", "Assigned To", "Message"];
    const lines = [head.map(csvCell).join(",")].concat(
      rows.map((r) => [r.createdAt.toISOString(), r.name, r.phone, r.email, r.vehicle?.title, r.type, r.source, r.status, r.assignee?.name, r.message].map(csvCell).join(",")),
    );
    return new Response("﻿" + lines.join("\r\n"), {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"` },
    });
  }
  const page = Math.max(1, Number(u.searchParams.get("page") ?? 1));
  const [items, total] = await Promise.all([
    db.lead.findMany({
      where: w, orderBy: { createdAt: "desc" }, skip: (page - 1) * 25, take: 25,
      include: { vehicle: { select: { title: true, slug: true } }, assignee: { select: { id: true, name: true } } },
    }),
    db.lead.count({ where: w }),
  ]);
  return { items, total, pages: Math.ceil(total / 25) };
});
