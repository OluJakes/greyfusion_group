import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DIVISION_SUBDOMAINS = ["construction", "energy", "it", "real-estate", "realestate", "autos", "commerce", "store", "smart-home", "smarthome"];
const SUB_MAP: Record<string, string> = { realestate: "real-estate", store: "commerce", smarthome: "smart-home" };

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") ?? "";

  // Subdomain routing: energy.greyfusion.com.ng -> /divisions/energy
  const sub = host.split(".")[0]?.toLowerCase();
  if (sub && DIVISION_SUBDOMAINS.includes(sub) && !pathname.startsWith("/divisions/") && !pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
    const division = SUB_MAP[sub] ?? sub;
    const url = req.nextUrl.clone();
    url.pathname = `/divisions/${division}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // Admin protection (first layer — the admin layout and every admin API re-verify independently)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get("gf_admin_session")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp|ico)).*)"],
};
