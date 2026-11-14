import { adminRoute, parse } from "@/lib/api";
import { db } from "@/lib/db";
import { hashPassword, HttpError } from "@/lib/auth";
import { userSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";

type P = { id: string };
const select = { id: true, name: true, email: true, role: true, active: true } as const;

async function assertNotLastSuper(id: string) {
  const target = await db.user.findUnique({ where: { id } });
  if (target?.role === "SUPER_ADMIN") {
    const others = await db.user.count({ where: { role: "SUPER_ADMIN", active: true, deletedAt: null, id: { not: id } } });
    if (others === 0) throw new HttpError(409, "You cannot remove or demote the last active Super Admin");
  }
}

export const PUT = adminRoute<P>("users", async (req, actor, ctx) => {
  const { id } = await ctx.params;
  const d = await parse(req, userSchema);
  if (d.role !== "SUPER_ADMIN" || !d.active) await assertNotLastSuper(id);
  const item = await db.user.update({
    where: { id },
    data: { name: d.name, email: d.email, role: d.role, active: d.active, ...(d.password ? { passwordHash: await hashPassword(d.password) } : {}) },
    select,
  });
  await logActivity(actor, "user.update", "user", id, `${item.email} (${item.role})`);
  return { item };
});

export const DELETE = adminRoute<P>("users", async (_req, actor, ctx) => {
  const { id } = await ctx.params;
  if (id === actor.id) throw new HttpError(409, "You cannot delete your own account");
  await assertNotLastSuper(id);
  await db.user.update({ where: { id }, data: { deletedAt: new Date(), active: false, email: `deleted-${Date.now()}-${id}@deleted.local` } });
  await logActivity(actor, "user.delete", "user", id);
  return { ok: true };
});
