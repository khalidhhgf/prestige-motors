import { z } from "zod";
import { publicRoute, parse } from "@/lib/api";
import { db } from "@/lib/db";

export const POST = publicRoute("newsletter", 5, async (req) => {
  const { email } = await parse(req, z.object({ email: z.string().email().max(120) }));
  await db.subscriber.upsert({ where: { email: email.toLowerCase() }, update: {}, create: { email: email.toLowerCase() } });
  return { ok: true };
});
