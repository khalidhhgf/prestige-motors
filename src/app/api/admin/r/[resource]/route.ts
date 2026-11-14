import { adminRoute, parse } from "@/lib/api";
import { HttpError } from "@/lib/auth";
import { RESOURCES } from "@/lib/resources";
import { requireUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

function getRes(name: string) {
  const r = RESOURCES[name];
  if (!r) throw new HttpError(404, "Unknown resource");
  return r;
}

export const GET = adminRoute<{ resource: string }>(null, async (_req, _u, ctx) => {
  const { resource } = await ctx.params;
  const r = getRes(resource);
  await requireUser(r.perm);
  const items = await r.model.findMany({
    where: r.softDelete ? { deletedAt: null } : undefined,
    orderBy: r.orderBy,
    include: r.include,
    take: 500,
  });
  return { items };
});

export const POST = adminRoute<{ resource: string }>(null, async (req, _u, ctx) => {
  const { resource } = await ctx.params;
  const r = getRes(resource);
  const user = await requireUser(r.perm);
  let data = await parse(req, r.schema);
  if (r.prepare) data = await r.prepare(data, true);
  const item = (await r.model.create({ data })) as { id: string };
  await logActivity(user, `${resource}.create`, resource, item.id);
  return { item };
});
