import { publicRoute } from "@/lib/api";
import { destroySession } from "@/lib/auth";

export const POST = publicRoute("logout", 60, async () => {
  await destroySession();
  return { ok: true };
});
