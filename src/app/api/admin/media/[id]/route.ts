import { z } from "zod";
import { adminRoute, parse } from "@/lib/api";
import { db } from "@/lib/db";
import { removeStored } from "@/lib/upload";
import { logActivity } from "@/lib/activity";

type P = { id: string };

export const PATCH = adminRoute<P>("media", async (req, _u, ctx) => {
  const { id } = await ctx.params;
  const d = await parse(req, z.object({ alt: z.string().max(200).nullish(), folder: z.string().max(40).optional() }));
  return { item: await db.media.update({ where: { id }, data: d }) };
});

export const DELETE = adminRoute<P>("media", async (_req, user, ctx) => {
  const { id } = await ctx.params;
  const m = await db.media.delete({ where: { id } });
  await removeStored(m.publicId, m.url);
  await logActivity(user, "media.delete", "media", id, m.filename);
  return { ok: true };
});
