import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { can, type Permission, type Role } from "./rbac";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET must be set (16+ chars)");
  return new TextEncoder().encode(s);
}

export type SessionUser = { id: string; name: string; email: string; role: Role };

export const hashPassword = (p: string) => bcrypt.hash(p, 12);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);

export async function createSession(u: SessionUser) {
  const token = await new SignJWT({ ...u })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Secure cookies whenever the public site URL is https (always the case in real production).
    secure: process.env.NODE_ENV === "production" && (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://"),
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** Returns the current user, re-validated against the DB (so deactivated users lose access immediately). */
export async function getUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const user = await db.user.findUnique({ where: { id: String(payload.id) } });
    if (!user || !user.active || user.deletedAt) return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role as Role };
  } catch {
    return null;
  }
}

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

export async function requireUser(perm?: Permission): Promise<SessionUser> {
  const u = await getUser();
  if (!u) throw new HttpError(401, "Not authenticated");
  if (perm && !can(u.role, perm)) throw new HttpError(403, "You do not have permission for this action");
  return u;
}
