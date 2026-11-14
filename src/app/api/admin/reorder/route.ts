import { z } from "zod";
import { adminRoute, parse } from "@/lib/api";
import { db } from "@/lib/db";
import { HttpError, requireUser } from "@/lib/auth";
import { RESOURCES } from "@/lib/resources";
import { logActivity } from "@/lib/activity";

const ORDERABLE = ["sections", "nav", "testimonials", "faqs", "brands", "categories"];

export const POST = adminRoute(null, async (req) => {
  const { resource, ids } = await parse(req, z.object({ resource: z.string(), ids: z.array(z.string()).min(1).max(500) }));
  const r = RESOURCES[resource];
  if (!r || !ORDERABLE.includes(resource)) throw new HttpError(400, "Resource is not orderable");
  const user = await requireUser(r.perm);
  await db.$transaction(ids.map((id, i) => r.model.update({ where: { id }, data: { sortOrder: i } }) as never));
  await logActivity(user, `${resource}.reorder`, resource);
  return { ok: true };
});
