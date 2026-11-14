import "server-only";
import { notFound, redirect } from "next/navigation";
import { getUser } from "./auth";
import { can, type Permission } from "./rbac";

/** Server-side page guard: redirect to login, or 404 if the role lacks the permission. */
export async function guard(perm: Permission) {
  const u = await getUser();
  if (!u) redirect("/admin/login");
  if (!can(u.role, perm)) notFound();
  return u;
}
