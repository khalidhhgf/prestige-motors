import { z } from "zod";
import { adminRoute, parse } from "@/lib/api";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { plain } from "@/lib/text";

export const GET = adminRoute("testdrives", async (req) => {
  const status = new URL(req.url).searchParams.get("status");
  const items = await db.testDrive.findMany({
    where: status ? { status: status as never } : {},
    orderBy: { preferredDate: "asc" },
    include: { vehicle: { select: { title: true, slug: true } } },
    take: 300,
  });
  return { items };
});

const patch = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"]).optional(),
  internalNotes: z.string().max(3000).nullish(),
});

export const PATCH = adminRoute("testdrives", async (req, user) => {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) throw new Error("id required");
  const d = await parse(req, patch);
  const item = await db.testDrive.update({
    where: { id },
    data: { ...(d.status ? { status: d.status } : {}), ...(d.internalNotes !== undefined ? { internalNotes: d.internalNotes ? plain(d.internalNotes) : null } : {}) },
  });
  await logActivity(user, "testdrive.update", "testdrive", id, d.status ?? "notes");
  return { item };
});
