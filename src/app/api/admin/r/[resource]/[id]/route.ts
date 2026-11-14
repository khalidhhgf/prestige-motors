import { adminRoute, parse } from "@/lib/api";
import { HttpError, requireUser } from "@/lib/auth";
import { RESOURCES } from "@/lib/resources";
import { logActivity } from "@/lib/activity";

type P = { resource: string; id: string };
function getRes(name: string) {
  const r = RESOURCES[name];
  if (!r) throw new HttpError(404, "Unknown resource");
  return r;
}

export const GET = adminRoute<P>(null, async (_req, _u, ctx) => {
  const { resource, id } = await ctx.params;
  const r = getRes(resource);
  await requireUser(r.perm);
  const item = await r.model.findUnique({ where: { id } });
  if (!item) throw new HttpError(404, "Not found");
  return { item };
});

export const PUT = adminRoute<P>(null, async (req, _u, ctx) => {
  const { resource, id } = await ctx.params;
  const r = getRes(resource);
  const user = await requireUser(r.perm);
  let data = await parse(req, r.schema);
  if (r.prepare) data = await r.prepare(data, false);
  const item = await r.model.update({ where: { id }, data });
  await logActivity(user, `${resource}.update`, resource, id);
  return { item };
});

export const DELETE = adminRoute<P>(null, async (_req, _u, ctx) => {
  const { resource, id } = await ctx.params;
  const r = getRes(resource);
  const user = await requireUser(r.perm);
  const block = r.protectDelete ? await r.protectDelete(id) : null;
  if (block) throw new HttpError(409, block);
  if (r.softDelete) await r.model.update({ where: { id }, data: { deletedAt: new Date() } });
  else await r.model.delete({ where: { id } });
  await logActivity(user, `${resource}.delete`, resource, id);
  return { ok: true };
});
