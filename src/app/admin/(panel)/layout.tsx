import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { permissionsFor } from "@/lib/rbac";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/admin/login");
  return <AdminShell user={user} perms={permissionsFor(user.role)}>{children}</AdminShell>;
}
