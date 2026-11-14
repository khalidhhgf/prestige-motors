import { adminRoute } from "@/lib/api";
import { db } from "@/lib/db";

// Minimal staff list for lead assignment (available to anyone who can manage leads).
export const GET = adminRoute("leads", async () => ({
  items: await db.user.findMany({ where: { active: true, deletedAt: null, role: { in: ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER"] } }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
}));
