import { NextResponse, type NextRequest } from "next/server";
import { findRedirect } from "@/lib/redirects";
import { SESSION_COOKIE } from "@/lib/auth/cookie";

/**
 * Next 16 proxy (eski adıyla middleware), Node çalışma zamanı.
 * 1) /admin: oturum çerezi yoksa girişe yönlendirir. Bu yalnızca kolaylıktır — asıl yetki kontrolü
 *    her sayfa ve server action'da requireAdmin() ile DB oturumuna karşı yapılır.
 * 2) Public yollar: Admin > SEO > Yönlendirmeler tablosundaki 301/302 kayıtları (tek adım, sorgu korunur).
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname !== "/admin/login" && !request.cookies.has(SESSION_COOKIE)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const entry = await findRedirect(pathname);
  if (entry) {
    const target = new URL(entry.destinationPath, request.nextUrl.origin);
    if (!target.search && search) target.search = search;
    return NextResponse.redirect(target, entry.statusCode);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|uploads|favicon.ico|icon.png|apple-icon.png|og/|sitemap.xml|robots.txt|llms.txt|api).*)"],
};
