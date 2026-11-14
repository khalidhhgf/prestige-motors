import { z } from "zod";
import { adminRoute, parse } from "@/lib/api";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { plain } from "@/lib/text";

type P = { id: string };

export const GET = adminRoute<P>("leads", async (_req, _u, ctx) => {
  const { id } = await ctx.params;
  const item = await db.lead.findFirst({
    where: { id, deletedAt: null },
    include: {
      vehicle: { select: { id: true, title: true, slug: true } },
      assignee: { select: { id: true, name: true } },
      inquiries: { orderBy: { createdAt: "desc" } },
      notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } },
    },
  });
  if (!item) throw new HttpError(404, "Lead not found");
  return { item };
});

const patch = z.object({
  status: z.enum(["NEW", "CONTACTED", "FOLLOW_UP", "INTERESTED", "NEGOTIATION", "CONVERTED", "LOST"]).optional(),
  assigneeId: z.string().nullable().optional(),
  note: z.string().trim().min(1).max(3000).optional(),
});

export const PATCH = adminRoute<P>("leads", async (req, user, ctx) => {
  const { id } = await ctx.params;
  const d = await parse(req, patch);
  const data: Record<string, unknown> = {};
  if (d.status) data.status = d.status;
  if (d.assigneeId !== undefined) data.assigneeId = d.assigneeId || null;
  if (d.note) data.notes = { create: { body: plain(d.note), authorId: user.id } };
  const item = await db.lead.update({ where: { id }, data });
  await logActivity(user, "lead.update", "lead", id, d.status ? `status → ${d.status}` : d.note ? "note added" : "assignment");
  return { item };
});

export const DELETE = adminRoute<P>("leads", async (_req, user, ctx) => {
  const { id } = await ctx.params;
  await db.lead.update({ where: { id }, data: { deletedAt: new Date() } });
  await logActivity(user, "lead.delete", "lead", id);
  return { ok: true };
});
