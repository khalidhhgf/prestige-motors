import { adminRoute, parse } from "@/lib/api";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { HttpError } from "@/lib/auth";
import { userSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";

const select = { id: true, name: true, email: true, role: true, active: true, lastLoginAt: true, createdAt: true } as const;

export const GET = adminRoute("users", async () => ({
  items: await db.user.findMany({ where: { deletedAt: null }, select, orderBy: { createdAt: "asc" } }),
}));

export const POST = adminRoute("users", async (req, actor) => {
  const d = await parse(req, userSchema);
  if (!d.password) throw new HttpError(422, "Password is required for new users");
  const item = await db.user.create({
    data: { name: d.name, email: d.email, role: d.role, active: d.active, passwordHash: await hashPassword(d.password) },
    select,
  });
  await logActivity(actor, "user.create", "user", item.id, `${item.email} (${item.role})`);
  return { item };
});
