import { NextRequest, NextResponse } from "next/server";
import { ACTIVE_VARIANTS, HERO_VARIANTS } from "@/lib/experiment";

const VAR_COOKIE = "slash_var";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Hero A/B: pick the arm server-side and serve the matching prerendered page, so the
  // headline never swaps after hydration. ?var= previews any defined arm.
  if (pathname === "/") {
    const override = req.nextUrl.searchParams.get("var");
    const cookie = req.cookies.get(VAR_COOKIE)?.value;
    const v =
      override && override in HERO_VARIANTS ? override
      : cookie && cookie in HERO_VARIANTS ? cookie
      : ACTIVE_VARIANTS[Math.floor(Math.random() * ACTIVE_VARIANTS.length)];
    const url = req.nextUrl.clone();
    url.pathname = `/v/${v}`;
    const res = NextResponse.rewrite(url);
    if (v !== cookie) {
      res.cookies.set(VAR_COOKIE, v, { path: "/slash", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    }
    return res;
  }

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login") && !pathname.startsWith("/api/admin")) {
    const token = req.cookies.get("admin_token")?.value;
    if (!token || token !== process.env.ADMIN_SECRET) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
