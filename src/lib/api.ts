import "server-only";
import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { HttpError, requireUser, type SessionUser } from "./auth";
import type { Permission } from "./rbac";
import { rateLimit, clientIp } from "./ratelimit";

type Ctx<P> = { params: Promise<P> };

/** Wrap a route handler: auth + permission + CSRF origin check + uniform errors. */
export function adminRoute<P = Record<string, string>>(
  perm: Permission | null,
  fn: (req: Request, user: SessionUser, ctx: Ctx<P>) => Promise<unknown>,
) {
  return async (req: Request, ctx: Ctx<P>) => {
    try {
      checkOrigin(req);
      const user = await requireUser(perm ?? undefined);
      const out = await fn(req, user, ctx);
      return out instanceof Response ? out : NextResponse.json(out ?? { ok: true });
    } catch (e) {
      return errorResponse(e);
    }
  };
}

/** Public (unauthenticated) route with rate limiting. */
export function publicRoute(
  key: string,
  limit: number,
  fn: (req: Request) => Promise<unknown>,
) {
  return async (req: Request) => {
    try {
      if (req.method !== "GET") checkOrigin(req);
      const rl = rateLimit(`${key}:${clientIp(req)}`, limit, 60_000);
      if (!rl.ok) throw new HttpError(429, "Too many requests. Please try again shortly.");
      const out = await fn(req);
      return out instanceof Response ? out : NextResponse.json(out ?? { ok: true });
    } catch (e) {
      return errorResponse(e);
    }
  };
}

/** CSRF defence for cookie-authenticated mutations: Origin must match Host. */
export function checkOrigin(req: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;
  const origin = req.headers.get("origin");
  if (!origin) return; // non-browser clients; cookies are SameSite=Lax anyway
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (new URL(origin).host !== host) throw new HttpError(403, "Cross-origin request blocked");
}

export async function parse<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
  return schema.parse(body);
}

export function errorResponse(e: unknown) {
  if (e instanceof HttpError) return NextResponse.json({ error: e.message, details: e.details }, { status: e.status });
  if (e instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
      { status: 422 },
    );
  }
  const code = (e as { code?: string })?.code;
  if (code === "P2002") return NextResponse.json({ error: "A record with this value already exists" }, { status: 409 });
  if (code === "P2025") return NextResponse.json({ error: "Record not found" }, { status: 404 });
  if (code === "P2003") return NextResponse.json({ error: "This record is referenced by other data" }, { status: 409 });
  console.error(e);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
