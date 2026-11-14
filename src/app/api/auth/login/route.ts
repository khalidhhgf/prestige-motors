import { publicRoute, parse } from "@/lib/api";
import { db } from "@/lib/db";
import { createSession, verifyPassword, HttpError } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";
import { rateLimit, clientIp } from "@/lib/ratelimit";

// Constant-time-ish: always run a bcrypt compare so response time doesn't reveal valid emails.
const DUMMY = "$2a$12$C6UzMDM.H6dfI/f/IKcEeO8bq3VtQHvKJ5oZCq5V1H3lq0X1pD7nK";

export const POST = publicRoute("login", 20, async (req) => {
  const { email, password } = await parse(req, loginSchema);
  const lockKey = `login-fail:${email.toLowerCase()}:${clientIp(req)}`;
  const brute = rateLimit(lockKey, 8, 15 * 60_000);
  if (!brute.ok) throw new HttpError(429, "Too many failed attempts. Try again in a few minutes.");

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY);
  if (!user || !valid || !user.active || user.deletedAt) throw new HttpError(401, "Invalid email or password");

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  await logActivity({ id: user.id, name: user.name, email: user.email, role: user.role }, "auth.login", "user", user.id);
  return { ok: true };
});
