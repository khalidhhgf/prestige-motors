import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Edge gate: unauthenticated visitors never reach /admin pages. Fine-grained RBAC is re-checked
// server-side in layouts and API routes (this is defence in depth, not the only check).
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const token = req.cookies.get("admin_session")?.value;
  const secret = process.env.AUTH_SECRET;
  if (token && secret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
      const res = NextResponse.next();
      res.headers.set("Cache-Control", "no-store");
      return res;
    } catch {
      /* fall through */
    }
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*"] };
