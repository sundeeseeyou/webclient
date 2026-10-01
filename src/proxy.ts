import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { homePathFor } from "@/lib/rbac";

function isUnder(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

// Pemeriksaan cepat dari cookie session. Layout admin & portal tetap memeriksa ulang lewat requireAdmin/requireClient.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;
  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, req.nextUrl));

  if (!role) {
    return pathname === "/login" ? NextResponse.next() : redirectTo("/login");
  }

  const home = homePathFor(role);
  if (pathname === "/" || pathname === "/login") return redirectTo(home);
  if (isUnder(pathname, "/admin") && role !== "ADMIN") return redirectTo(home);
  if (isUnder(pathname, "/portal") && role !== "CLIENT") return redirectTo(home);
  return NextResponse.next();
});

export const config = {
  // File gambar statis (logo, favicon, ikon) harus bisa dimuat sebelum login, misalnya di halaman login.
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:ico|png|svg|jpg|jpeg|webp)$).*)"],
};
