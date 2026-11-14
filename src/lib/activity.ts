import "server-only";
import { db } from "./db";
import type { SessionUser } from "./auth";

export async function logActivity(
  user: SessionUser | null,
  action: string,
  entity: string,
  entityId?: string | null,
  summary?: string,
) {
  try {
    await db.activityLog.create({
      data: { userId: user?.id ?? null, action, entity, entityId: entityId ?? null, summary: summary?.slice(0, 300) },
    });
  } catch (e) {
    console.error("audit log failed", e);
  }
}
